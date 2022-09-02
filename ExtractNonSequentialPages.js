if (app.viewerVersion<10) {
	app.addMenuItem({ cName: "Extract Non-Sequential Pages", cParent: "Tools", cExec: "extractNonSequentialPages(event.target)", cEnable: "event.rc = (event.target != null);"});
} else {
	app.addToolButton({ cName: "Extract Non-Sequential Pages", cLabel: "Extract Non-Sequential Pages", cExec: "extractNonSequentialPages(event.target)", cEnable: "event.rc = (event.target != null);"});
}

var EXTRACTPgsDlg =
{
    strTitle:"",
	bDeletePages:false,
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "Titl": this.strTitle,
            "bDps": this.bDeletePages,
            "bPgL": this.bPageLabels,
        };
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strTitle = oRslt["Titl"];
        this.bDeletePages = oRslt["bDps"];
        this.bPageLabels=oRslt["bPgL"];
    },
	nlvl: function(dialog)
	{
        var oRslt = dialog.store();
	 	dialog.load();
	},
    description:
    {
        name: "Extract pages tool",
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
                                type: "static_text",
                                item_id: "stat",
                                name: "Enter list of pages to extract. Precede the list with a filename followed by a colon if not this file.",
                                char_width: 15,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Titl",
                                variable_Name: "strTitle",
                                char_width: 40,
                                multiline: true,
                                char_height: 40,
                                alignment: "align_fill",
                            },
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "bDps",
                                        name: "Delete extracted pages",
                                        variable_Name: "bDeletePages",
                                    },
                                ]
                            },							
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "bPgL",
                                        name: "Use page labels",
                                        variable_Name: "bPageLabels",
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



function extractNonSequentialPages(oDoc) {
	//resp = app.response("Enter the page ranges you want to extract from this file:\nFor example: 1, 2, 4-20, 23- (\"23-\" means p. 23 to the end)", "Extract Pages");
	//if (resp==null || resp=="") return;
	if(!CheckPermitted())return;
	EXTRACTPgsDlg.strTitle = "";
	EXTRACTPgsDlg.bDeletePages=false;
	if("ok" == app.execDialog(EXTRACTPgsDlg)){
		var array_lines=[];
		var list=EXTRACTPgsDlg.strTitle;
		var delete_pages=EXTRACTPgsDlg.bDeletePages;
		var pg_labels=EXTRACTPgsDlg.bPageLabels;
		var path_org_doc=oDoc.path;
		var path=oDoc.path.replace(oDoc.documentFileName,"");
		var page_count=0; //count of pages extract
		var page_maps=[];
//		console.println(path);
		var newDoc = myTrustedNewDoc(); //the new doc to take all the pages
		array_lines=list.split(/[\n\r]/); //split the list into an array of lines
		for(var i=0; i<array_lines.length;i++){ //for each line in the array
			var the_bookmark=GetBookmark(array_lines[i]); //enclosed in square brackets
			array_lines[i]=array_lines[i].replace(/\[.*\]/g,"");//remove any bookmark stuff
			var the_file=GetFile(array_lines[i],path); //preceded by a colon
			//console.println("The File: " + the_file);
			var array_pglbs=new Object; //to hold the associative array of pagelabels and page numbers for this document
			if(the_file==null){
				if(pg_labels){ //if we are using page labels
					createPageLabelMapping(oDoc,array_pglbs); //create pagelabel - page number mapping
					array_lines[i]=replacePgLbs(array_lines[i],array_pglbs);
				}
				page_count=page_count+process_this_line(array_lines[i],oDoc,newDoc,delete_pages, page_maps, page_count, the_bookmark);
			}else{
				array_lines[i]=array_lines[i].replace(/^.*\:/,"");    //remove file part
//				console.println("Here :"+ array_lines[i]);
				if(pg_labels){ //if we are using page labels
					createPageLabelMapping(the_file,array_pglbs); //create pagelabel - page number mapping
					array_lines[i]=replacePgLbs(array_lines[i],array_pglbs);
				}
				page_count=page_count+process_this_line(array_lines[i],the_file,newDoc,delete_pages, page_maps,page_count,the_bookmark);
//				console.println("The file path: "+ the_file.path);
//				console.println("Org path: " + path_org_doc);
				if(the_file.path!=path_org_doc){
//					console.println("Don't match");
					the_file.closeDoc(true);
				}
			}	
		}
		newDoc.deletePages(); //deletes the first blank page
		if (newDoc.numPages!=page_count) {
			app.alert("There was an error while running the script.\nCan't extract all the specified pages.");
			newDoc.closeDoc(true);
			return;
		}else{
			app.alert(page_count + " pages extracted");
			print_page_map(page_maps, path);
		}

	}else{
		return;
	}


}


function replacePgLbs(str, array_pglbs){
	//goes through string and replaces pagelabels with pagenumbers
	m=str.match(/\w+/g); //creates array of pagelabels
	if(m==null)app.alert("ERROR! No pages to find.");
	console.println("Line before :" + str);
	done_str="ThisOnesDone" //to mark labels that have been changed
	for(var i=0;i<m.length;i++){
		p=array_pglbs[m[i]]; //get the page of the page label
		if(p==null) app.alert("ERROR! No such page label found.");
		console.println("Page label: " + m[i] + " Page: " + p);
		var re=new RegExp("\\b"+m[i]+"\\b","g"); //create the regex expression
		str=str.replace(re,p.toString()+done_str); //replace label with page & marker
	}
	var done_re=new RegExp(done_str,"g");
	str=str.replace(done_re,""); //remove indicator string
	console.println("Line after :" +str);
	return str;
}

function createPageLabelMapping(oDoc, array_pglbs){
	//For each page in the document, get its page label
	for(var i=0;i<oDoc.numPages;i++){
		var lab=oDoc.getPageLabel(i);
		array_pglbs[lab]=i+1;
	}
}

GetBookmark=app.trustedFunction(function(str) {
	app.beginPriv();
	var bkm=[];
	var bkmk = str.match(/\[.*\]/); //extract text in square brackets
	if (bkmk!=null) bkmk[0]=bkmk[0].replace(/[\[\]]/g,""); //delete square brackets
	if (bkmk!=null)console.println(bkmk[0]);
	if (bkmk==null)return null;
	return bkmk[0];
	app.endPriv();
});

GetFile=app.trustedFunction(function(str,path) {
	app.beginPriv();
	var file = str.split(":"); //split according to colons
	console.println("File name: " + file);
	if(file.length==1) return null;
//	console.println(path+file[0]);
	return app.openDoc(path+file[0]);
	app.endPriv();
});

GetFile=app.trustedFunction(function(str,path) {
	app.beginPriv();
	var file = str.split(":"); //split according to colons
	console.println(file);
	if(file.length==1) return null;
//	console.println(path+file[0]);
	return app.openDoc(path+file[0]);
	app.endPriv();
});

function print_page_map(page_maps, path){

	var rep=new Report();
	var delimiter=",";
	var endofline="\r";
	
	//Heading
/*	rep.size=1.2;
	rep.writeText("\""+ ChronoDlg.strTitle+ "\"" +endofline);
	rep.divide();
	rep.writeText(" ");
	rep.writeText(" ");
	rep.size=1.0;
*/

	var text_string="\""+"File" +"\""+ delimiter + "\""+"Pg" +"\""+ delimiter + "\""+"NewPg" +"\"";
	rep.writeText(text_string);
	
	for(i=0;i<page_maps.length;i++){
		//Make the string
		
		//Concatenate
		text_string="\""+page_maps[i].file+"\""+ delimiter + page_maps[i].page+  delimiter +   page_maps[i].new_page;


		//console.println(text_string);
		rep.writeText(text_string);
//		rep.writeText(" ");
//		rep.writeText(" ");
		//console.println("Here ");
	}
	

	var doc=rep.open("TEST");

	mySaveAsPageMaps(doc,path, "page_maps.txt");
	doc.closeDoc(true);


	console.println(page_maps.length);
	for(i=0;i<page_maps.length;i++){
		console.println(page_maps[i].file + "," + page_maps[i].page + "," + page_maps[i].new_page);
	}

}

var mySaveAsPageMaps = app.trustedFunction(
   function(oDoc,cPath,cFlName)
   {
   	app.beginPriv();
      // Ensure path has trailing "/"
      cPath = cPath.replace(/([^/])$/, "$1/");
      try{
      	//console.println(cPath +cFlName);
         oDoc.saveAs(cPath + cFlName, "com.adobe.acrobat.accesstext");
      }catch(e){
         app.alert("Error During Save");
      }
    app.endPriv();
   }
);


function process_this_line(resp, the_file, newDoc, delete_pages, page_maps, page_count, the_bookmark) {
	console.println("THIS LINE for processing: " + resp);
	var ranges = getRange(resp);
	var openEndedRange = findOpenEndedRange(resp);
//	console.println(ranges);

	if (ranges[ranges.length-1]>the_file.numPages || (openEndedRange!=null && openEndedRange>the_file.numPages)) {
		app.alert("ERROR! You entered a page number that is higher than the number of pages in this file ("+the_file.numPages+").");
		return;
	}

	if (openEndedRange!=null) {
		for (var i=openEndedRange; i<=the_file.numPages; i++) {
			ranges.push(i);
		}
	}
	if (ranges.length==0) {
		app.alert("ERROR! No pages to extract.");
		return;
	}
//	console.println(ranges);
	
	//console.println("Here1");
	for (var i=0; i<ranges.length; i++) {
		var page_map={file:the_file.documentFileName, page: ranges[i], new_page: i+1+page_count};
		page_maps.push(page_map);
		myTrustedInsertPages2(newDoc, newDoc.numPages-1, the_file.path, ranges[i]-1);
		if(the_bookmark!=null && i==0){ //add a bookmark on adding first page
			if(newDoc.bookmarkRoot.children==null){
				newDoc.bookmarkRoot.createChild(the_bookmark,"this.pageNum="+ (newDoc.numPages-2).toString());
			}else{
				newDoc.bookmarkRoot.createChild(the_bookmark,"this.pageNum="+ (newDoc.numPages-2).toString(),newDoc.bookmarkRoot.children.length);
			}
		}
	}
	

//	var del = app.alert("Done! " + ranges.length +  " pages were extracted.\nDo you want to delete the extracted pages from the original file?\n(Notice: this can't be undone!)",2,2);
	if (delete_pages) {
		for (var i=ranges.length-1; i>=0; i--) {
			the_file.deletePages(ranges[i]-1);
		}
//		app.alert("Done!",3);
	}
	return ranges.length;
	
}

function findOpenEndedRange(str) {
	str = str.replace(/\s/g,"");
	var ranges = str.split(",");
	for (var i=0; i<ranges.length; i++) {
		range = ranges[i].split("-");
		if (range.length==2 && range[1]=="" && !isNaN(range[0])) {
			return Number(range[0]);
		}
	}
	return;
}

function getRange(str) {
	str = str.replace(/\s/g,""); //remove spaces
	var ranges = str.split(","); //split according to commas
//	console.println(str);
//	console.println(ranges);
	rangesLoop:
		for (var i=0; i<ranges.length; i++) {
			if (isNaN(ranges[i])) { 
				var range = ranges[i].split("-");
				if (range.length!=2) continue rangesLoop;
				for (var j in range) {
					range[j] = Number(range[j]);
					if (isNaN(range[j])) continue rangesLoop;
				}
				if (range[0]>range[1]) continue rangesLoop;
				
				for (var j=range[0]; j<=range[1]; j++) {
					ranges.push(j);
				}
				ranges.splice(i,1);
				i--;
			}
		}
	
	for (var j=ranges.length-1; j>=0; j--) {
		if (ranges[j]==="" || isNaN(ranges[j])) {
			ranges.splice(j,1);
		} else {
			ranges[j] = Number(ranges[j]);
		}
	}
	
	ranges.sort(numericSort);
	ranges = removeDoubleEntries(ranges);
	return ranges;
}

function removeDoubleEntries(arr) {
	for (var i=arr.length-1; i>0; i--) {
		if (arr[i]==arr[i-1]) {
			arr.splice(i,1);
		}
	}
	return arr;
}

function numericSort(a,b) {
	return Number(a) - Number(b);
}

myNewDoc = app.trustPropagatorFunction(function(){
	app.beginPriv();
	return app.newDoc();
	app.endPriv();
});
myTrustedNewDoc = app.trustedFunction(function() {
	app.beginPriv();
	return myNewDoc();
	app.endPriv();
});

myInsertPages2 = app.trustPropagatorFunction(function(doc, vPage, vPath, vStart){
	app.beginPriv();
	doc.insertPages({nPage: vPage, cPath: vPath, nStart: vStart});
	app.endPriv();
});
myTrustedInsertPages2 = app.trustedFunction(function(doc, vPage, vPath, vStart) {
	app.beginPriv();
//	console.println("vPage: ",vPage);
//	console.println("vPath: ",vPath);
//	console.println("vStart: ",vStart);
	myInsertPages2(doc, vPage, vPath, vStart);
	app.endPriv();
});

// Single License. All Rights Reserved to Gilad Denneboom. Distribution without permission is not allowed.
// You can contact me at try6767@gmail.com or via my website: http://try67.blogspot.com