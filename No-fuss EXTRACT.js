console.println("No-fuss EXTRACT (rebuilt) LOADED at " + (new Date()));

// =====================================================
//  Namespace
// =====================================================
if (!global.NFEX) {
    global.NFEX = {};
}

// =====================================================
// Timing utilities (Acrobat-safe)
// =====================================================
global.NFEX._ensureTimers = function () {
    if (!global.NFEX) global.NFEX = {};
    if (!global.NFEX._timers) global.NFEX._timers = {};
};

global.NFEX.TStart = function (label) {
    global.NFEX._ensureTimers();
    global.NFEX._timers[label] = (new Date()).getTime();
    console.println("[TIMER START] " + label);
};

global.NFEX.TEnd = function (label) {
    global.NFEX._ensureTimers();
    var t0 = global.NFEX._timers[label];
    if (t0) {
        var dt = (new Date()).getTime() - t0;
        console.println("[TIMER END]   " + label + " : " + dt + " ms");
        try { delete global.NFEX._timers[label]; } catch (eDel) {}
    } else {
        console.println("[TIMER END]   " + label + " : (no start)");
    }
};

//global.NFEX.global.NFEX = {};
global.NFEX.JOB = null;
global.NFEX.DEBUG = false;

// =====================================================
//  Helpers
// =====================================================
global.NFEX.SafeFileName = function (s) {
    s = (s || "").toString().trim();
    s = s.replace(/[\/\\:\*\?"<>\|]/g, "-");
    s = s.replace(/\s+/g, " ").trim();
    if (!s) s = "Extract";
    return s;
};

global.NFEX.GetDestPage = function (bm, oDoc) {
    // Returns 0-based page index, or null
    try {
        var a = bm.action;

        // 1) GoTo action array
        if (a && typeof a === "object" && a.length >= 2 && a[0] === "GoTo") {
            var d = a[1];
            if (typeof d === "number") return d;
            if (d && typeof d === "object") {
                if (typeof d.page === "number") return d.page;
                if (typeof d.nPage === "number") return d.nPage;
            }
        }

        // 2) JavaScript action string like "this.pageNum = 64"
        if (typeof a === "string") {
            var m = a.match(/pageNum\s*=\s*(\d+)/i);
            if (m && m[1]) return parseInt(m[1], 10);
        }
    } catch (e1) {}

    // 3) Fallback: execute bookmark and read pageNum (most reliable)
    if (oDoc) {
        var old = oDoc.pageNum;
        try {
            bm.execute();
            var pg = oDoc.pageNum;
            try { oDoc.pageNum = old; } catch (eR) {}
            if (typeof pg === "number" && pg >= 0) return pg;
        } catch (e2) {
            try { oDoc.pageNum = old; } catch (e3) {}
        }
    }

    return null;
};

global.NFEX.IsNonBlack = function (bm) {
    var c = bm && bm.color;
    if (!c) return false;

    // RGB array form: ["RGB", r, g, b]
    if (c instanceof Array && c.length >= 4 && c[0] === "RGB") {
        var r = c[1], g = c[2], b = c[3];
        return !(r === 0 && g === 0 && b === 0);
    }

    // Named color objects (best effort)
    try {
        return !color.equal(c, color.black);
    } catch (e) {
        return false;
    }
};

global.NFEX.MergeRanges = function (ranges) {
    if (!ranges || !ranges.length) return [];
    ranges.sort(function (a, b) { return a.s - b.s; });
    var out = [];
    var cur = { s: ranges[0].s, e: ranges[0].e };
    for (var i = 1; i < ranges.length; i++) {
        var n = ranges[i];
        if (n.s <= cur.e + 1) cur.e = Math.max(cur.e, n.e);
        else { out.push(cur); cur = { s: n.s, e: n.e }; }
    }
    out.push(cur);
    return out;
};

global.NFEX.ComplementRanges = function (numPages, keepRanges) {
    var del = [];
    if (!keepRanges || !keepRanges.length) return [{ s: 0, e: numPages - 1 }];
    if (keepRanges[0].s > 0) del.push({ s: 0, e: keepRanges[0].s - 1 });
    for (var i = 0; i < keepRanges.length - 1; i++) {
        var s = keepRanges[i].e + 1;
        var e = keepRanges[i + 1].s - 1;
        if (s <= e) del.push({ s: s, e: e });
    }
    if (keepRanges[keepRanges.length - 1].e < numPages - 1) {
        del.push({ s: keepRanges[keepRanges.length - 1].e + 1, e: numPages - 1 });
    }
    return del;
};

global.NFEX.DeleteRangesBackward = function (doc, delRanges, labelPrefix) {
    if (!delRanges || !delRanges.length) return;
    var total = 0;
    for (var i = 0; i < delRanges.length; i++) total += (delRanges[i].e - delRanges[i].s + 1);

    try { app.thermometer.end(); } catch (e0) {}
    app.thermometer.value = 0;
    app.thermometer.duration = Math.max(1, total);
    app.thermometer.increment = 1;
    app.thermometer.begin();

    for (var k = delRanges.length - 1; k >= 0; k--) {
        var rs = delRanges[k].s, re = delRanges[k].e;
        var cnt = (re - rs + 1);
        app.thermometer.value += cnt;
        app.thermometer.text = (labelPrefix || "Deleting") + " " + (rs + 1) + "–" + (re + 1);
        doc.deletePages({ nStart: rs, nEnd: re });
    }
    app.thermometer.end();
};

global.NFEX.ScanBookmarks = function (oDoc, alsoBold) {
    var out = [];
    var kids = oDoc.bookmarkRoot.children || [];
    if (global.NFEX.DEBUG) console.println("Top-level bookmarks: " + kids.length);
    var stack = [];
    for (var i = kids.length - 1; i >= 0; i--) stack.push({ bm: kids[i], lvl: 1 });

    while (stack.length) {
        var it = stack.pop();
        var bm = it.bm;
        var lvl = it.lvl;

        var pg = global.NFEX.GetDestPage(bm, oDoc);
        if (pg !== null) {
            out.push({
                bm: bm,
                Name: bm.name,
                PageRef: pg,
                Lvl: lvl,
                extract: (global.NFEX.IsNonBlack(bm) || (alsoBold && bm.style === 2))
            });
        }

        if (bm.children && bm.children.length) {
            for (var j = bm.children.length - 1; j >= 0; j--) {
                stack.push({ bm: bm.children[j], lvl: lvl + 1 });
            }
        }
    }
    if (global.NFEX.DEBUG) console.println("Bookmarks with resolved destinations: " + out.length);
    return out;
};

global.NFEX.BuildKeepRanges = function (oDoc, records) {
    var allStarts = [];
    for (var i = 0; i < records.length; i++) allStarts.push(records[i].PageRef);
    allStarts.sort(function (a, b) { return a - b; });

    function nextStartAfter(x) {
        for (var k = 0; k < allStarts.length; k++) if (allStarts[k] > x) return allStarts[k];
        return null;
    }

    var keepRanges = [];
    for (var j = 0; j < records.length; j++) {
        if (!records[j].extract) continue;
        var s = records[j].PageRef;
        var nxt = nextStartAfter(s);
        var e = (nxt === null) ? (oDoc.numPages - 1) : (nxt - 1);

        s = Math.max(0, Math.min(s, oDoc.numPages - 1));
        e = Math.max(0, Math.min(e, oDoc.numPages - 1));
        if (e < s) e = s;

        keepRanges.push({ s: s, e: e, name: records[j].Name });
    }

    keepRanges.sort(function (a, b) { return a.s - b.s; });

    var mergedKeep = global.NFEX.MergeRanges(keepRanges.map(function (r) { return { s: r.s, e: r.e }; }));
    return { keepRanges: keepRanges, mergedKeep: mergedKeep };
};

// =====================================================
//  UI Dialog
// =====================================================
global.NFEX.Dlg = {
    strTitle: "Extract by coloured bookmarks",
    bCombine: true,
    bDeleteOriginalNonRelated: false,
    bAlsoBold: false,

    initialize: function (dialog) {
        dialog.load({
            "Titl": this.strTitle,
            "byCM": this.bCombine,
            "bySP": !this.bCombine,
            "byDB": this.bDeleteOriginalNonRelated,
            "byBD": this.bAlsoBold,
            "stat": "Keeps pages from each selected bookmark up to the next bookmark (any colour/level).\nSelected = non-black colour (and optionally bold).\nDeletes everything else."
        });
    },
    commit: function (dialog) {
        var r = dialog.store();
        this.bCombine = !!r["byCM"];
        this.bDeleteOriginalNonRelated = !!r["byDB"];
        this.bAlsoBold = !!r["byBD"];
    },
    description: {
        name: "No-fuss EXTRACT",
        elements: [{
            type: "view",
            elements: [
                { type: "static_text", item_id: "stat", name: "", width: 300, height: 50, alignment: "align_fill", bold: true },
                {
                    type: "view",
                    align_children: "align_row",
                    elements: [
                        { type: "static_text", name: "Output:", width: 50 },
                        { type: "radio", group_id: "out", item_id: "byCM", name: "Single file" },
                        { type: "radio", group_id: "out", item_id: "bySP", name: "Separate files" }
                    ]
                },
                {
                    type: "view",
                    align_children: "align_row",
                    elements: [
                        { type: "check_box", item_id: "byDB", name: "Delete non-related pages from original after extraction" },
                        { type: "check_box", item_id: "byBD", name: "Also treat BOLD bookmarks as selected" }
                    ]
                },
                { type: "ok_cancel" }
            ]
        }]
    }
};

// =====================================================
//  Extraction job (async)
// =====================================================
global.NFEX.StartJob = app.trustedFunction(function (oDoc, combine, deleteOriginal) {
    app.beginPriv();
    try {
        var recs = global.NFEX.ScanBookmarks(oDoc, global.NFEX.Dlg.bAlsoBold);
        global.NFEX.TStart("BuildKeepRanges");
        var built = global.NFEX.BuildKeepRanges(oDoc, recs);
        global.NFEX.TEnd("BuildKeepRanges");
        if (!built.keepRanges.length) {
            app.alert("No selected bookmarks found.\n\nSelect bookmarks by right-click → Properties → Appearance → Color (anything except black).\nOptionally tick 'Also treat BOLD bookmarks as selected'.");
            return;
        }

        var p = oDoc.path.replace(/\/[^\/]+pdf$/i, "/");
        var docName = oDoc.documentFileName.replace(/\.pdf$/i, "");

        global.NFEX.JOB = {
            oDoc: oDoc,
            combine: combine,
            deleteOriginal: deleteOriginal,
            basePath: p,
            docName: docName,
            keepRanges: built.keepRanges,
            mergedKeep: built.mergedKeep,
            i: 0,
            pendingPath: null,
            pendingRange: null,
            report: ""
        };

        if (combine) {
            global.NFEX.JOB.combPath = p + docName + " (extracted).pdf";
            oDoc.saveAs({ cPath: global.NFEX.JOB.combPath, bCopy: true });
            app.setTimeOut("NFEX_OpenCombinedCopy();", 100);
        } else {
            try { app.thermometer.end(); } catch (e0) {}
            app.thermometer.value = 0;
            app.thermometer.duration = Math.max(1, global.NFEX.JOB.keepRanges.length);
            app.thermometer.increment = 1;
            app.thermometer.begin();
            app.setTimeOut("NFEX_SeparateStep();", 1);
        }

    } catch (e) {
        app.alert("Extract failed:\n" + e);
        global.NFEX.JOB = null;
    } finally {
        app.endPriv();
    }
});

global.NFEX.SeparateStep = app.trustedFunction(function () {
    app.beginPriv();
    try {
        var job = global.NFEX.JOB;
        if (!job) return;

        if (job.i >= job.keepRanges.length) {
            app.thermometer.end();
            global.NFEX.AfterExtraction();
            return;
        }

        var r = job.keepRanges[job.i];

        var __tag = "FILE " + (job.i + 1) + " : " + r.name;
        global.NFEX.TStart(__tag);
        app.thermometer.value = job.i + 1;
        app.thermometer.text = "Saving " + (job.i + 1) + " of " + job.keepRanges.length + ": " + r.name;

        var outPath = job.basePath + global.NFEX.SafeFileName(r.name) + ".pdf";
        global.NFEX.TStart("saveAs FULL (copy)");
        job.oDoc.saveAs({ cPath: outPath, bCopy: true });
        global.NFEX.TEnd("saveAs FULL (copy)");

        job.pendingPath = outPath;
        job.pendingRange = { s: r.s, e: r.e, name: r.name, __tag: __tag };
        console.println("Scheduling OpenAndTrimSeparateCopy...");
        app.setTimeOut("NFEX_OpenAndTrimSeparateCopy();", 100);

    } finally {
        app.endPriv();
    }
});

global.NFEX.OpenAndTrimSeparateCopy = app.trustedFunction(function () {
    console.println("Entered OpenAndTrimSeparateCopy");
    app.beginPriv();
    try {
        var job = global.NFEX.JOB;
        if (!job || !job.pendingPath) return;

        var path = job.pendingPath;
        var range = job.pendingRange;
        job.pendingPath = null;
        job.pendingRange = null;

        global.NFEX.TStart("openDoc (copy)");
        var newDoc = app.openDoc({ cPath: path, bHidden: false });
        global.NFEX.TEnd("openDoc (copy)");

        // Trim to [s..e]
        var s = range.s, e = range.e;
        global.NFEX.TStart("deletePages (trim)");
        if (e < newDoc.numPages - 1) newDoc.deletePages({ nStart: e + 1, nEnd: newDoc.numPages - 1 });
        if (s > 0) newDoc.deletePages({ nStart: 0, nEnd: s - 1 });
        global.NFEX.TEnd("deletePages (trim)");

        // Replace bookmarks with a single top bookmark
// Prune bookmarks: keep only the subtree for this selected bookmark (and all descendants)
global.NFEX.TStart("prune bookmarks");

// After trimming, the selected root should land on dest page ~0
var keepBm = null;

if (global.NFEX.FindBookmarkByNameClosestPage) {
    keepBm = global.NFEX.FindBookmarkByNameClosestPage(
        newDoc.bookmarkRoot,
        newDoc,
        range.name,
        0
    );
}

if (!keepBm) {
    console.println(
        "Prune: could not find bookmark '" + range.name +
        "' in copy; falling back to combined-style pruning."
    );
    if (global.NFEX.PruneKeepSelectedSubtrees) {
        global.NFEX.PruneKeepSelectedSubtrees(newDoc.bookmarkRoot, false);
    }
} else {
    global.NFEX.KeepOnlyBookmarkSubtree(newDoc, keepBm);
}

global.NFEX.TEnd("prune bookmarks");

        global.NFEX.TStart("saveAs FINAL (copy)");
        newDoc.saveAs({ cPath: path });
        global.NFEX.TEnd("saveAs FINAL (copy)");
        global.NFEX.TStart("closeDoc (copy)");
        newDoc.closeDoc({ bNoSave: true });
        global.NFEX.TEnd("closeDoc (copy)");
                if (range && range.__tag) global.NFEX.TEnd(range.__tag);
job.report += "Saved: " + range.name + ".pdf\n\n";
        job.i++;
        app.setTimeOut("NFEX_SeparateStep();", 1);

    } finally {
        app.endPriv();
    }
});

global.NFEX.OpenCombinedCopy = app.trustedFunction(function () {
    app.beginPriv();
    try {
        var job = global.NFEX.JOB;
        if (!job) return;

        var combDoc = app.openDoc({ cPath: job.combPath, bHidden: false });

        // Delete non-related pages
        var del = global.NFEX.ComplementRanges(combDoc.numPages, job.mergedKeep);
        global.NFEX.DeleteRangesBackward(combDoc, del, "Deleting non-related pages");

        // Clear bookmarks
        try {
            while (combDoc.bookmarkRoot.children && combDoc.bookmarkRoot.children.length) {
                combDoc.bookmarkRoot.children[combDoc.bookmarkRoot.children.length - 1].remove();
            }
        } catch (e0) {}

        // Map old page -> new page after compaction
        var offsets = [];
        var cum = 0;
        for (var m = 0; m < job.mergedKeep.length; m++) {
            offsets.push({ s: job.mergedKeep[m].s, e: job.mergedKeep[m].e, newS: cum });
            cum += (job.mergedKeep[m].e - job.mergedKeep[m].s + 1);
        }
        function mapPage(oldPage) {
            for (var z = 0; z < offsets.length; z++) {
                var r = offsets[z];
                if (oldPage >= r.s && oldPage <= r.e) return r.newS + (oldPage - r.s);
            }
            return null;
        }

        // Create bookmarks for each coloured range in order
        for (var i = 0; i < job.keepRanges.length; i++) {
            var kr = job.keepRanges[i];
            var ns = mapPage(kr.s);
            if (ns === null) continue;
            var b = null;
            try {
                b = combDoc.bookmarkRoot.createChild(kr.name);
                if (b) b.action = ["GoTo", ns];
                else console.println("Warning: createChild returned null for bookmark  + kr.name + ");
} catch (eBk) {
    console.println("Warning: failed to create bookmark  + kr.name + : " + eBk);
}
        }

        combDoc.saveAs({ cPath: job.combPath });
        combDoc.closeDoc({ bNoSave: true });

        job.report += "Saved combined file:\n" + job.combPath + "\n\n";
        global.NFEX.AfterExtraction();

    } finally {
        app.endPriv();
    }
});

global.NFEX.AfterExtraction = app.trustedFunction(function () {
    app.beginPriv();
    try {
        var job = global.NFEX.JOB;
        if (!job) return;

        if (job.deleteOriginal) {
            var keepMerged = global.NFEX.MergeRanges(job.keepRanges.map(function (r) { return { s: r.s, e: r.e }; }));
            var del = global.NFEX.ComplementRanges(job.oDoc.numPages, keepMerged);
            global.NFEX.DeleteRangesBackward(job.oDoc, del, "Deleting from original");
            job.report += "Deleted non-related pages from original.\n\n";
        }

        app.alert(job.report || "Done.");

    } finally {
        global.NFEX.JOB = null;
        app.endPriv();
    }
});

global.NFEX.DoEXTRACT = app.trustedFunction(function (oDoc) {
    app.beginPriv();
    try {
        if (!oDoc || !oDoc.bookmarkRoot || !oDoc.bookmarkRoot.children || oDoc.bookmarkRoot.children.length === 0) {
            app.alert("No bookmarks found.");
            return;
        }

        global.NFEX.Dlg.bCombine = true;
        global.NFEX.Dlg.bDeleteOriginalNonRelated = false;
        global.NFEX.Dlg.bAlsoBold = false;

        if ("ok" === app.execDialog(global.NFEX.Dlg)) {
            global.NFEX.StartJob(oDoc, global.NFEX.Dlg.bCombine, global.NFEX.Dlg.bDeleteOriginalNonRelated);
        }
    } finally {
        app.endPriv();
    }
});

// =====================================================
//  Button + Icon
// =====================================================
//<JSCodeSnippet name="ImageData7">
var strData7EXTRACT =
"ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000f0000000800000004000000040000000400000004000000040000000400000004000000040000000a0000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000c00000004000000000000000000000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000c0000000300000000000000000000000000000000000000080000000c0000000000000000a00000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c000000000000000d50000002a000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000008000000000000000000000000000000000000000000000000000000000000000ff000000f5000000600000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000c0000000c0000000c0000000c0000000c0000000ff000000ff000000ff000000a00000000a000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000aa000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000c0000000c0000000c0000000c0000000c0000000ff000000ff000000ff0000009f0000000a000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000008000000000000000000000000000000000000000000000000000000000000000ff000000f50000005f0000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c000000000000000d40000002a000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000a00000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000c000000000000000000000000000000000000000000000000000000080000000f0000000ff000000ff000000ff000000ff000000ff000000a0000000400000004000000040000000400000004000000030000000000000000000000000000000000000000000000000000000000000001000000080000000f0000000ff000000ff000000ff000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000080000000f0000000ff000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000008000000070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"; //</JSCodeSnippet>

// Icon Generic Stream Object
var oIconEXTRACT = null;
oIconEXTRACT = {
    count: 0, width: 20, height: 20,
    read: function (nBytes) { return strData7EXTRACT.slice(this.count, this.count += nBytes); }
};

// If icon block wasn't found above, the script still works (button without icon).
var DoCmdEXTRACT = "global.NFEX.DoEXTRACT(event.target);";

var oButObjEXTRACT = {
    cName: "EXTR",
    cExec: DoCmdEXTRACT,
    cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
    cTooltext: "Extracts pages from coloured bookmarks (keep span to next bookmark)",
    cLabel: "Extract pages",
    nPos: 4
};

try {
    if (typeof oIconEXTRACT !== "undefined" && oIconEXTRACT != null) oButObjEXTRACT.oIcon = oIconEXTRACT;
} catch (e0) {}

try { app.removeToolButton("EXTR"); } catch (e1) {}
try { app.addToolButton(oButObjEXTRACT); } catch (e2) {}
// =====================================================
// setTimeOut wrappers (Acrobat-safe global functions)
// =====================================================
// Acrobat's setTimeOut string eval does not reliably resolve "global" in all contexts,
// so we call plain global functions that delegate into global.NFEX.
function NFEX_OpenCombinedCopy() {
    try { global.NFEX.OpenCombinedCopy(); } catch (e) { console.println("NFEX_OpenCombinedCopy failed: " + e); }
}
function NFEX_SeparateStep() {
    try { global.NFEX.SeparateStep(); } catch (e) { console.println("NFEX_SeparateStep failed: " + e); }
}
function NFEX_OpenAndTrimSeparateCopy() {
    try { global.NFEX.OpenAndTrimSeparateCopy(); } catch (e) { console.println("NFEX_OpenAndTrimSeparateCopy failed: " + e); }
}

