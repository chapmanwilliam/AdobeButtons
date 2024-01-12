

 //*******************************************\\
 //This toggles legal numbering at the start of each bookmark

var pattern_legal_numbering=/\b([0-9]+(\.)?[0-9]*)+\:($| )/;

var leg_num_thm_count;

function RemoveLegalNum(Bm, nLevel, oDoc, n, count){
	leg_num_thm_count=leg_num_thm_count+1;
	if(n!=0){
		app.thermometer.value=count;
		app.thermometer.text="Removing legal numbering from " + count + " out of " + n + " bookmarks.";
	}

	 //Remove label
	Bm.name=RemoveLegalNumThis(Bm);	

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			RemoveLegalNum(Bm.children[i], nLevel + 1, oDoc, n, count);
		}
	}
	return true;
}

function RemoveLegalNumThisFromString(S){
	return S.replace(pattern_legal_numbering,"").trim();
}


function RemoveLegalNumThis(Bm){
	return Bm.name.replace(pattern_legal_numbering,"").trim();
}

function AddLegalNum(Bm, nLevel, oDoc, s, counter, nLvlMax, n){
	 //console.println("Level and Max: " + nLevel + ", " + nLvlMax);
	 //Add legal numbering

if (Bm.style!=1){  //skip italicised

	leg_num_thm_count=leg_num_thm_count+1;
	if(n!=0){
		app.thermometer.value=leg_num_thm_count;
		app.thermometer.text="Adding legal numbering to " + leg_num_thm_count + " out of " + n + " bookmarks.";
	}

	if(nLevel>0){
		s=s+(counter+1).toString()+".";
		Bm.name=s.slice(0,s.length-1) + ": "+ Bm.name.trim();	
	}

	 // process children
	 //console.println("Max : " + nLvlMax);
	if (nLevel<nLvlMax && Bm.children != null){
		var counter=0;	
		for (var i = 0; i < Bm.children.length; i++){	
			if(AddLegalNum(Bm.children[i], nLevel + 1, oDoc, s, counter, nLvlMax, n)) counter=counter+1;
		}
	}
	s="";  //reset string
	return true;
  }else{
  	return false;
  }
}

function GetLegalNumberFromString(S){
	 //returns a string of the legal numbering
	var a=S.match(pattern_legal_numbering);
	 //if (a.length==0) return null;
	if(a!=null){
		a[0]=a[0].replace(":","");
		a[0]=a[0].toString().trim();
		 //console.println(Bm.name + " legal no " + a[0]);
		return a[0];
	}
	return null;
}

function GetLegalNumber(Bm){
	 //returns a string of the legal numbering
	var a=Bm.name.match(pattern_legal_numbering);
	 //if (a.length==0) return null;
	if(a!=null){
		a[0]=a[0].replace(":","");
		a[0]=a[0].toString().trim();
		 //console.println(Bm.name + " legal no " + a[0]);
		return a[0];
	}
	return null;
}

function LegalNumPresent(Bm, nLevel, oDoc){
			
	 //see if there is match
	if(pattern_legal_numbering.test(Bm.name)) return true;

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			if(LegalNumPresent(Bm.children[i], nLevel + 1, oDoc)==true) return true;
		}
	}
	return false;	
}

function RefreshLegalNum(oDoc){
	 //Refreshes the legal numbering if present
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
	if (nDepth>0){
		if(LegalNumPresent(oDoc.bookmarkRoot,0,oDoc)){
			if(RemoveLegalNum(oDoc.bookmarkRoot, 0, oDoc, n)){
				oDoc.info.LegalNumExists=false;
				if(oDoc.info.TOCnLevel){ //keep persistent value within bounds
					if(oDoc.info.LNnLevel<1) oDoc.info.LNnLevel=1;
					if(oDoc.info.LNnLevel>nDepth) oDoc.info.LNnLevel=nDepth;
				}else{
					oDoc.info.TOCnLevel=nDepth;  //set to default if doesn't exist
				}			
				app.thermometer.duration=n;
				app.thermometer.begin();
				leg_num_thm_count=0;
				AddLegalNum(oDoc.bookmarkRoot,0,oDoc, "", 0, oDoc.info.LNnLevel, n);  //Add the legal numbering
				app.thermometer.end();
				oDoc.info.LegalNumExists=true;
			}
		}
	return true;
	}else{
		 //no bookmarks
	}
}
 // // // // // // // // // // // // ///
 //
 //  This is the main function for legal numbering
 //

var DoLEGAL_NUM = app.trustedFunction(function(oDoc,oDlg)
{
<<<<<<< HEAD
	if(!CheckPermitted())return;
=======
	if(!CheckLicence())return;
>>>>>>> 9a8c3ab (first commit)

	app.beginPriv();

	var Pg=oDoc.pageNum;  //note page number

	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
			
	if(nDepth > 0){
		
		if(LegalNumPresent(oDoc.bookmarkRoot,0,oDoc)){
			var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
			 //console.println("Num remove " + n);
			app.thermometer.duration=n;
			app.thermometer.begin();
			leg_num_thm_count=0;
			RemoveLegalNum(oDoc.bookmarkRoot, 0, oDoc, n);  //Remove the legal numbering
			app.thermometer.end();
			oDoc.info.LegalNumExists=false;
		}else{		
	
			LegalNoDlg.strTitle = "";		
			LegalNoDlg.nLvlMax = nDepth.toString();
			 //Keep the persistent nLevel within bounds
			if(oDoc.info.TOCnLevel){
				if(oDoc.info.LNnLevel<1) oDoc.info.LNnLevel=1;
				if(oDoc.info.LNnLevel>nDepth) oDoc.info.LNnLevel=nDepth;
			}			
			LegalNoDlg.nLevel = (oDoc.info.LNnLevel ? oDoc.info.LNnLevel.toString() : nDepth.toString());
			if("ok" == app.execDialog(LegalNoDlg)){
				 //console.println("Max " + LegalNoDlg.nLvlMax);
				oDoc.info.LNnLevel=parseInt(LegalNoDlg.nLevel,10);
				var n=FindNumBks(oDoc.bookmarkRoot.children,LegalNoDlg.nLevel)
				 //console.println("Num add " + n);
				app.thermometer.duration=n;
				app.thermometer.begin();
				leg_num_thm_count=0;
				AddLegalNum(oDoc.bookmarkRoot,0,oDoc, "", 0, LegalNoDlg.nLevel, n);  //Add the legal numbering
				app.thermometer.end();
				oDoc.info.LegalNumExists=true;
			}
		}
	}

	oDoc.pageNum=Pg;  //reset page number to where it started
	
 //    return nFound;
    return 0;
  app.endPriv();
});
 //</CodeAbove>

var LegalNoDlg =
{
    strTitle:"",
    nLevel:"1",
	nLvlMax:"1",
	nPgMax:"2",
	nInsertAt:"2",
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "nlvl": this.nLevel,
            "Titl": this.strTitle,
        };
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strTitle = oRslt["Titl"];
        this.nLevel = oRslt["nlvl"];
    },
	nlvl: function(dialog)
	{
        var oRslt = dialog.store();
	    if (oRslt.nlvl < 1)
		   dialog.load({nlvl:"1"});
		else if (oRslt.nlvl > this.nLvlMax)
		   dialog.load({nlvl:this.nLvlMax});
	},
    description:
    {
        name: "Legal numbering tool",
        elements:
        [
            {
                type: "view",
                elements:
                [
                    {
                        type: "view",
                        alignment: "align_fill",
                        elements:
                        [
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta1",
                                        name: "Number of bookmark levels to number:",
                                    },
                                    {
                                        type: "edit_text",
                                        item_id: "nlvl",
                                        variable_Name: "nLevel",
                                        char_width: 3,
                                        SpinEdit: "true",
                                    },
                                ]
                            },
                        ]
                    },
                    {
                        type: "ok_cancel",
                    },
                ]
            },
        ]
    }
};



 //<JSCodeSnippet name="ImageData7">
var strData7LEGAL_NUM = 
"000000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000cf000000ff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000030000000bf000000ff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000000000000000000010000000af000000bf000000bf000000bf000000bf000000bf000000bf000000bf000000bf000000bf000000bf000000bf000000af000000100000000000000040000000ff000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000080000000000000002000000080000000000000000000000040000000ef000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ef0000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000040000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000df000000df000000ef00000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000020000000ff000000200000000000000000000000700000008000000080000000800000008000000080000000800000008000000080000000800000008000000080000000700000000000000010000000cf0000009f000000000000000000000070000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000070000000cf000000ef00000080000000200000000000000050000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000050000000800000008000000080000000200000000000000000000000300000004000000040000000400000004000000040000000400000004000000040000000400000004000000040000000300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cf000000ff000000ef00000010000000000000000000000030000000400000004000000040000000400000004000000040000000400000004000000040000000400000004000000030000000000000003000000050000000ff000000200000000000000060000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000006000000030000000bf000000ef000000200000000000000070000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000700000007000000050000000ff00000040000000000000000000000070000000800000008000000080000000800000008000000080000000800000008000000080000000800000008000000070000000000000009f000000bf000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconLEGAL_NUM = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconLEGAL_NUM = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7LEGAL_NUM.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdLEGAL_NUM = 
"DoLEGAL_NUM(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjLEGAL_NUM = 
{cName: "LEGAL_NUM",
cExec: DoCmdLEGAL_NUM,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
 //cMarked: "event.rc = LegalNumPresent(app.doc.bookmarkRoot,0,app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.LegalNumExists",
cTooltext: "Toggle legal numbering labels on Bookmarks",
cLabel: "Legal numbering",
nPos: 0};
 //</JSCodeSnippet>
if(oIconLEGAL_NUM != null)
    oButObjLEGAL_NUM.oIcon = oIconLEGAL_NUM;

try{app.removeToolButton("LEGAL_NUM");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjLEGAL_NUM);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["LEGAL_NUM_InDoc"] = "1:17:2011:17:55:45";
//else
//    global["LEGAL_NUM_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjLEGAL_NUM"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




