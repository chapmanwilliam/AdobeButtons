

 //*******************************************\\
 //This extracts pages from emboldened bookmarks

var ex_thm_count=0;
var ext_count=0;
var pattern_toggle_braces_label=/ ?\{[^\[^\]]*\}+/;
var pattern_toggle_brackets_label=/ ?\([^\[^\]]*\)$/;

function RemoveBrackets(Bm){
	return RemoveBracketsFromString (Bm.name);
}

function RemoveBracketsFromString(S){
	return S.replace(pattern_toggle_brackets_label,"").trim();
}


function RemoveBracesFromString(S){
	return S.replace(pattern_toggle_braces_label,"").trim();
}

function RemoveBraces(Bm){
	return RemoveBracesFromString(Bm.name);
}

function gettextinbrackets(str){
    //gets the text of the doc indicated in () at end of name
	const regexp = pattern_toggle_brackets_label;

	var array = str.match(regexp);

	if(array && array.length>0){
		var s=array[array.length-1]; //last element
		s=s.replace("(","").replace(")","").replace(" ", ""); //remove braces and spaces
		return s;
	}else{
	   return null;
	}
}

function getLengthDoc(str){
    //gets the length of the doc indicated in {} at end of name
	const regexp = /\{(.*?)\}/g;

	var array = str.match(regexp);
	
	if(array && array.length>0){
		var s=array[array.length-1]; //last element
		s=s.replace("{","").replace("}","").replace(" ", ""); //remove braces and spaces
		var res=null;
		!isNaN(s) ? res=parseInt(s) : res= null; //if a number
		(res>0) ?  res=res : res=null;
		//console.println(res);
		return res;
	}else{
	   return null;
	}
}

function GetNextBm(oDoc,i,p){
	//returns the page no of the next bookmark for this p[i] n
	//It's either the next bookmark in the same level or you have to keep going up the parent tree
	var page=-1;
	if(i>p.length || p.length==0){
		console.println("Error in getting next Bm");
		return -1;
	}

	var n=p[i].level; //level of this bm
	var j=i;
//	console.println("Length " + p.length);
//	console.println("i= " + i);

	if(i==p.length-1){page=oDoc.numPages-1; return page;}

	do{	j+=1;}while (p[j].level!=n && j<p.length-1);

//	console.println("j= " + j);

	(j==p.length-1 && p[j].level!=n) ? page=oDoc.numPages-1: page=p[j].start_page-1;
	
	return page;
}

function GetIndexNextBm(j,l){
	var res=-1;
	//if(j+1==BkMks.length-1) return res; //i.e. we have reached the end of the bookmarks
	for(var i=j+1;i<BkMks.length;i++){
		if(BkMks[i].Lvl<=l) {
			res=i;
			break;
		}
	}
	return res;
}

function BuildPageDataFromBookmarks(Bm, nLevel, oDoc, p, i, n){ //NB: doesn't seem to be used
	//zips thro bookmarks and adds page data
	var data={};
	var aPageMap=[]; MapPageLabelstoPages(oDoc,aPageMap);
	ex_thm_count=ex_thm_count+1;
	app.thermometer.value=ex_thm_count;
	app.thermometer.text="Building page data ["+ex_thm_count+"] of " + n + " bookmarks."

	
	if(Bm.name!="Root" /*&& Bm.style==3 /*i.e. in bold*/){
		Bm.execute();
		
		var old_name=Bm.name; //store the old name
		data.PageEnd=getLengthDoc(Bm.name);
		Bm.name=RemoveLegalNumThis(Bm);  //remove legal numbering
		Bm.name=RemovePageLabel(Bm);	 //strip []
		Bm.name=RemoveBraces(Bm);	 //strip {}
		console.println('hello');
		console.println(Bm.name);
		Bm.name=MoveDateToStart(Bm); //moves the date to the start
		data.bm_name=Bm.name;
		data.bm_name=data.bm_name.replace("/", "-");//replace forward slashes with - to avoid folder confusion
		Bm.name=old_name; //put the name back
		
		data.start_page=oDoc.pageNum;
		data.page_label=oDoc.getPageLabel(oDoc.pageNum);
		data.level=nLevel;
		data.OK=true;
		color.equal(Bm.color,color.black) ? data.extract=false : data.extract=true; //flags non-black bookmarks
		Bm.style==2 ? data.link =true: data.link=false; //flags bookmarks in bold for linking
		//console.println(Bm.color);
		
		//Add to collection
		p.push(data);
		//console.println(data.bm_name + " " + data.start_page + " Extract " + data.extract);
	}
	
	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			if(BuildPageDataFromBookmarks(Bm.children[i], nLevel + 1, oDoc, p, i, n)==true) return true;
		}
	}
	return false;	


}

function CheckPageData(BkMks){
	//returns true if the page data ok
	//ok means that the bookmarks are in page order
	var ErrorReport="";
	if(BkMks==null || BkMks.length==0) return "Nothing to extract\n\n";
	var s=BkMks[0].PageRef;
	
	app.thermometer.duration=BkMks.length;
	app.thermometer.begin();

	for(var i=1;i<BkMks.length;i++){
		app.thermometer.value=i;
		app.thermometer.text="Checking page data "+i+" of " + BkMks.length + " bookmarks."

		if(BkMks[i].PageRef<s && BkMks[i].extract) {
			console.println(BkMks[i].Name + " page " + BkMks[i].page_label);
			ErrorReport+="Bookmark " + page_data[i].bm_name + " at page " + BkMks[i].page_label + " not in page order."; 
		}
		s=BkMks[i].PageRef;
	}
	
	app.thermometer.end();
	return ErrorReport;
}

function FindBookmark(Bm, nLevel, new_doc, i){
	if(ext_count==i)return Bm;
	if(Bm.name!="Root")ext_count+=1;
			
	if(Bm.children!=null){
		for(var j=0;j<Bm.children.length; j++){
			var res=FindBookmark(Bm.children[j], nLevel+1, new_doc, i);
			if(res!=null)return res;
		}
	}
	return null;	
}

function NameExists(name, i,BkMks){
	//Searches the names and returns true if already exists
	for(var j=0;j<BkMks.length;j++){
		if(i!=j && BkMks[j].extract){ //if not the same one and included then compare
			if(name==BkMks[j].Name) return true;
		}
	}
	return false;
}

function MakeFileNamesUnique(BkMks){
	//Checks each filename is unique. Adds an incremental number if it is not - until it is
	for(var i=0;i<BkMks.length;i++){
		var inc=0;
		name=BkMks[i].Name;
		while(NameExists(name, i, BkMks)){inc+=1; name=BkMks[i].Name + " (" + inc.toString() + ")"};
		if(inc!=0)BkMks[i].Name=name;
		
	}
}

function NumExtractions(BkMks){
	//returns the number of extractions
	var num=0;
	for(var i=0;i<BkMks.length;i++){
		//console.println(BkMks[i].Name + ", " + BkMks[i].PageRef + "-" + BkMks[i].PageEnd + ", " + BkMks[i].Chunk);
		if(BkMks[i].extract)  num+=1;
	}
	return num;
}

function NumSuccessfulExtractions(BkMks){
	//returns the number of extractions
	var num=0;
	for(var i=0;i<BkMks.length;i++){
		if(BkMks[i].extract && BkMks[i].OK)  num+=1;
	}
	return num;
}

function Normalise(Bm, nLevel, new_doc){ //make all the bookmarks in the new doc black and plain
		
	if(Bm.name!="Root"){
		Bm.style=0;
		Bm.color=color.black;
	}
	
	if(Bm.children!=null){
		for(var i=0;i<Bm.children.length;i++){
			Normalise(Bm.children[i], nLevel+1, new_doc);
		}
	}
	new_doc.info.SubsExist=false;
	new_doc.info.SubPath="";
	new_doc.info.LinkingExists=false;
	return false;	
}

var ExtractPages=app.trustedFunction(function(oDoc, BkMks, Combine, DeleteExisting, OldPagination)
{
	//Extracts bookmarks in colour into separate file
	//Returns true if all ok
	var ErrorReport="";
	app.beginPriv();
	
	var override={vert: "PosT", prefix: "OldPage_Label", col:"Green", nTxtSize:12}; //for override pagination
	var num_ext=NumExtractions(BkMks);
	//console.println("Num matches " + num_ext);
	app.thermometer.end();
	app.thermometer.value=0;
	app.thermometer.duration=num_ext;
	app.thermometer.begin();

	if(BkMks==null || BkMks.length==0) return false;

	if(OldPagination) {
		//Add page source to bookmark file names
		BkMks.forEach(function(part, index, BkMks) {
			BkMks[index].Name = BkMks[index].Name + " (" + BkMks[index].page_label + ")";
		});
		var n = FindNumBks(oDoc.bookmarkRoot.children, 10);
		RemovePageLabels(oDoc.bookmarkRoot, 0, oDoc, n);  //Remove the page labels
		AddPageLabels(oDoc.bookmarkRoot, 0, oDoc, n);  //Add the page labels
		SearchReplace(oDoc.bookmarkRoot, 0, 10, oDoc, "[", "<");
		SearchReplace(oDoc.bookmarkRoot, 0, 10, oDoc, "]", ">");
	}


	var p=oDoc.path.replace(/\/[^\/]+pdf$/,"/");
	var doc_name=oDoc.documentFileName.replace(/\.pdf$/i,"");
	var comb_path=p+ doc_name + " (extracted).pdf";
	if(Combine){ //if we're doing a single file
		//Save a copy of the entire current document for use with the combined extracted file
		try{
			oDoc.saveAs({
			cPath: comb_path,
			bCopy: true
			});
		}catch (e){
			console.println("Problem saving extracted file " + comb_path);
			ErrorReport+="Problem saving extracted file " + comb_path + "\n\n";
		}
	
		//Open the saved copy and delete the non-required pages & bookmarks
		try{
		var comb_doc=app.openDoc({
			cPath: comb_path,
			bHidden: true
			});
			//Add old pages to top right
			if(OldPagination) {
				AddPagination(comb_doc, override);
			}
		}catch (e){
			console.println("Problem opening extracted file " + comb_path);
			ErrorReport+="Problem opening extracted file " + comb_path + "\n\n";	
		}
	}
	
	
	
	var comb_del_pages=new Array(oDoc.numPages); //for storing which pages need deleting
	for(var i=0;i<comb_del_pages.length;i++) comb_del_pages[i]=true; //i.e. set each page to true to delete by default

	//Add old pages to top right on existing doc to save time
	if(OldPagination && !Combine) {
		AddPagination(oDoc, override);
	}


	for(var i=0;i<BkMks.length;i++){
		//app.thermometer.text="Extracting page data from "+ i +" of " + app.thermometer.duration + " bookmarks."
		
		if(BkMks[i].extract){ //if this is one to extract
		
			app.thermometer.value=i;
			//console.println(app.thermometer.value);
			app.thermometer.text="Extracting page data from "+ i +" of " + num_ext + " bookmarks."
			//console.println(app.thermometer.value + " " + app.thermometer.duration);
		
			var s=BkMks[i].PageRef;
			//console.println("Index " +i+ " length " + page_data.length);
			//var e=GetNextBm(oDoc,i,page_data);
			var e=BkMks[i].PageEnd;
			//i>=page_data.length-1 ?	e=oDoc.numPages-1: e=page_data[i+1].start_page-1;
			//pages to keep for combined file
			for(var j=s;j<=e;j++) comb_del_pages[j]=false;
			
			
			
			
			if(!Combine){
				path=p+BkMks[i].Name + ".pdf";
				//console.println("Path " + path + " Start " + s + " End " + e);				
				//Save a copy of the entire current document
				try{
					oDoc.saveAs({
						cPath: path,
						bCopy: true
					});
					ErrorReport+="Saved: " + BkMks[i].Name + ".pdf" + "\n\n";
				}catch (e){
					console.println("Problem saving extracted file " + path);
					ErrorReport+="\n"+"Problem saving extracted file " + path + "\n\n";
					BkMks[i].OK=false; //flag this one as a problem
				}
			
				//Open the saved copy and delete the non-required pages & bookmarks
				try{
					var new_doc=app.openDoc({
						cPath: path,
						bHidden: true
				});


					//delete the non-required pages (do the end pages first to keep the numbering correct)
					if(e<oDoc.numPages-1) new_doc.deletePages({nStart: e+1, nEnd: new_doc.numPages-1}); //from the page after the end to the end of the document
					if(s>0) new_doc.deletePages({nStart: 0, nEnd:s-1}); //from the beginning of doc to page before start


					//delete the non_required bookmarks
					//move the index bookmark to the start; delete the rest
					ext_count=0;
					//console.println("Finding " + i);
					var index_bm=FindBookmark(new_doc.bookmarkRoot, 0, new_doc, i);
					if(index_bm==null){
							console.println("Error: index_bm is null");
						}else{
							//console.println("Index bookmark " + index_bm.name);
							new_doc.bookmarkRoot.insertChild(index_bm);
					}
					//Delete the other bookmarks
					var l=new_doc.bookmarkRoot.children.length;
					for(var j=1;j<l;j++) new_doc.bookmarkRoot.children[new_doc.bookmarkRoot.children.length-1].remove();
					//Now move any children of the top bookmark to the top (starting from the last
					var top_bm=new_doc.bookmarkRoot.children[0];
					if(top_bm!=null){
						if(top_bm.children!=null){
							var l=top_bm.children.length;
							for(var j=0;j<l;j++) new_doc.bookmarkRoot.insertChild(top_bm.children[top_bm.children.length-1]);
						}else{
							//console.println("Top bm children is null");
						}
					}else{
						console.println("Error: Top bm is null");
					}
					//delete the last bookmark (now empty parent)
					new_doc.bookmarkRoot.children[new_doc.bookmarkRoot.children.length-1].remove();

					//Remove [], legal numbering and pagination
					//Remove []
					RemovePageLabels(new_doc.bookmarkRoot, 0, new_doc,0);  //Remove the page labels
					new_doc.info.SqExists=false;

					//Remove legal numbering
					RemoveLegalNum(new_doc.bookmarkRoot, 0, new_doc, 0);  //Remove the legal numbering
					new_doc.info.LegalNumExists=false;

					//Remove pagination
					RemovePagination(new_doc, false);
					new_doc.info.PaginationExists=false;

					//Normalise the style and colour
					Normalise(new_doc.bookmarkRoot,0,new_doc);

					//Save the new_doc
					new_doc.saveAs({cPath: path});
					//Close the new_doc
					new_doc.closeDoc({bNoSave:true});
					//Add doc to comb_doc
					//comb_doc.insertPages({cPath: path, nPage:-1});
			}catch(e){
					console.println("Problem opening copy extracted file " + path + " " + e);
					ErrorReport+="Problem opening copy extracted file " + path + "\n\n";
					BkMks[i].OK=false; //flag this one as a problem file
			}
		  }
		
		}
	}
	app.thermometer.end();
	app.thermometer.value=0;
	app.thermometer.duration=comb_del_pages.length;
	app.thermometer.begin();

	if(Combine){ //Deal with the combined file if chosen
		//Delete the pages from the combined file
		try{
			for(var i=comb_del_pages.length-1;i>=0;i--){
					//console.println(i + " " + comb_del_pages[i]);
					app.thermometer.value++;
					app.thermometer.text="Extracting page data from "+ i +" of " + comb_del_pages.length + " bookmarks."
					if(comb_del_pages[i]) comb_doc.deletePages({nStart:i});
				}
			ErrorReport+="Saved pages to single file in the same folder as the original.\n\n";
		}catch(e){
			console.println("Problem removing pages from combined file.");
			ErrorReport+="Problem removing pages from combined file\n\n";
		}

		app.thermometer.end();

		//Insert folder bookmark
		comb_doc.bookmarkRoot.createChild("Folder_BM");
		var Folder_BM=comb_doc.bookmarkRoot.children[0];
		//Delete unwanted bookmarks
		DeleteUnwantedBookmarksCombinedFile(comb_doc.bookmarkRoot, 0,comb_doc, Folder_BM);
		if(comb_doc.bookmarkRoot.children!=null) for(var i=comb_doc.bookmarkRoot.children.length-1;i>0;i--)comb_doc.bookmarkRoot.children[i].remove(); //delete surplus Bms
		if(Folder_BM.children!=null) for(var i=Folder_BM.children.length-1;i>=0;i--)comb_doc.bookmarkRoot.insertChild(Folder_BM.children[i]);//move the children of folder out
		Folder_BM.remove(); //remove folder
		//Normalise the style and colour
		Normalise(comb_doc.bookmarkRoot,0,comb_doc);
		DoREFRESH(comb_doc);
		SearchReplace(comb_doc.bookmarkRoot, 0, 10, oDoc, "<", "(");
		SearchReplace(comb_doc.bookmarkRoot, 0, 10, oDoc, ">", ")");

		//save the combined file and close it	
		try{
			comb_doc.saveAs({cPath: comb_path});
			comb_doc.closeDoc({bNoSave: true});
		}catch(e){
			console.println("Failed to save combined file.");
			ErrorReport+="Failed to save the combined file " + comb_path + "\n\n";
		}
	}


	if(OldPagination && !Combine){ //Remove old pagination from old doc
		RemovePagination(oDoc,false,true);
	}

	if(DeleteExisting) ErrorReport+=DeleteExtractedPages(oDoc, BkMks);
	SearchReplace(oDoc.bookmarkRoot, 0, 10, oDoc, "<", "[");
	SearchReplace(oDoc.bookmarkRoot, 0, 10, oDoc, ">", "]");
	oDoc.dirty=false;

		
	app.endPriv();
	return ErrorReport;
});

function DeleteExtractedPages(oDoc,BkMks){
	console.println("Deleting extracted pages...");
	var dur=0;
	var ErrorReport="";
	var comb_del_pages=new Array(oDoc.numPages); //for storing which pages need deleting
	for(var i=0;i<comb_del_pages.length;i++) comb_del_pages[i]=false; //i.e. set each page to false to keep by default

	for(var i=0;i<BkMks.length;i++){
		if(BkMks[i].extract /*&& BkMks[i].OK*/){ //i.e. this was successfully extracted
			var s=BkMks[i].PageRef;
			var e=BkMks[i].PageEnd;
			console.println("Proposing to delete from " + s + " to " + e + " inclusive.");
			for(var j=s;j<=e;j++) {
				comb_del_pages[j]=true;
				dur++; //to count the number of proposed deletions for thermometer
				}
		}
	}

	app.thermometer.value=0;
	app.thermometer.duration=dur;
	app.thermometer.begin();
	var delete_pages=new Array();

	try{
		for(var i=comb_del_pages.length-1;i>=0;i--){ //delete pages backwards
			
			if(comb_del_pages[i]) {
				app.thermometer.value++;	
				app.thermometer.text="Deleting extracted page "+ app.thermometer.value +" of " + app.thermometer.duration + " pages."
				console.println("Deleting page " + i);
				delete_pages.push(i);
				oDoc.deletePages({nStart:i});
			}
		}
		delete_pages.sort(function(a, b){return a-b});
		var del_str="";
		for(var j=0;j<delete_pages.length;j++)del_str+=delete_pages[j].toString()+", ";
		del_str=del_str.substring(0,del_str.length-2); //deletes the final comma and space
		console.println(del_str);
		ErrorReport+="Deleted pages: " + del_str + "\n\n";
	}catch(e){
		console.println("Problem deleting extracted pages from original file.");
		ErrorReport+="Problem deleting extracted pages from original file\n\n.";
	}
	app.thermometer.end();
	
	//Delete the marked bookmarks
	oDoc.bookmarkRoot.createChild("Folder_BM");
	var Folder_BM=oDoc.bookmarkRoot.children[0];
	DeleteUnwantedBookmarksCombinedFile(oDoc.bookmarkRoot, 0,oDoc, Folder_BM);
	Folder_BM.remove(); //remove folder

	return ErrorReport;	
}



var EXTRACTBkDlg =
{
    strTitle:"",
    bCombine:true,
    bDelete:false,

    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "Titl": this.strTitle,
            "byDB": this.bDelete,
			"byAP": this.bOldPagination,
            "stat": "Extracts pages from coloured bookmarks.",
        };
		dlgInit[this.bCombine?"byCM":"bySP"] = true;
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
		this.bCombine = oRslt["byCM"];
		this.bDelete=oRslt["byDB"];
		this.bOldPagination=oRslt["byAP"];
    },
    description:
    {
        name: "Extracting Tool",
        elements:
        [
            {
                type: "view",
                elements:
                [
                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "This tool scans the bookmarks for the first ",
                                width: 200,
                                height: 41,
                                char_width: 15,
                                alignment: "align_fill",
                                font: "palette",
                                bold: true,
                            },
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
                                        item_id: "sta2",
                                        name: "Extract: ",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "byCM",
                                        name: "Single file",
                                        variable_Name: "bCombine",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "bySP",
                                        name: "Separate files",
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
                                        item_id: "byDB",
                                        name: "Delete pages after extraction",
                                        variable_Name: "bDelete",
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
                                        item_id: "byAP", //old pagination
                                        name: "Add old pagination",
                                        variable_Name: "bOldPagination",
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


function DeleteUnwantedBookmarksCombinedFile(Bm, nLevel, comb_doc, Folder_BM){
	
		if(Bm.name!="Root" && !color.equal(Bm.color,color.black)){	//if coloured bookmark then move to front
			//console.println("Inserting " +Bm.name);
			Folder_BM.insertChild(Bm); //inserts at the beginning of folder
			return true;
		}else{
		 // only process children if there isn't a match
		if (Bm.children != null && Bm.name!="Folder_BM"){	
			for (var i = Bm.children.length-1; i >=0; i--){
					DeleteUnwantedBookmarksCombinedFile(Bm.children[i],nLevel+1, comb_doc, Folder_BM);	
				}
			}
		}
	
	return false;	
	
}

function CalculateChunkSizes(oDoc){
		BkMks.sort(function(a,b){return a.PageRef-b.PageRef}) //sort the bookmarks in order of page number

		 //Now calculate the chunk sizes
		for (var i=0;i<BkMks.length; i++){
		    //console.println(BkMks[i].Name + ": " + BkMks[i].PageEnd);
			if(BkMks[i].PageEnd){ //i.e. the size of the chunk is specified in braces {P100-P202}
				BkMks[i].Chunk=BkMks[i].PageEnd-BkMks[i].PageRef;
			}else{
				if(i<BkMks.length-1){
					BkMks[i].Chunk=BkMks[i+1].PageRef-BkMks[i].PageRef
					var ind=GetIndexNextBm(i,BkMks[i].Lvl);
					ind!=-1 ? BkMks[i].PageEnd=BkMks[ind].PageRef-1 : BkMks[i].PageEnd=oDoc.numPages-1;
				}else{  //this is the last bookmark
					BkMks[i].Chunk=oDoc.numPages-BkMks[i].PageRef	
					BkMks[i].PageEnd=oDoc.numPages-1;
				}
			}
			//console.println(BkMks[i].Name + " from " + BkMks[i].PageRef + " to " + BkMks[i].PageEnd); 
		}
}

 // // // // // // // // // // // // ///
 //
 //  This is the main function for extracting pages from bookmarks
 //

var DoEXTRACT = app.trustedFunction(function(oDoc)
{
	app.beginPriv();
	if(!CheckPermitted())return;

	var Pg=oDoc.pageNum;  //note page number
	
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
	EXTRACTBkDlg.bCombine=true;	
	EXTRACTBkDlg.bDelete=false;	
	EXTRACTBkDlg.bOldPagination=false;

	if("ok" == app.execDialog(EXTRACTBkDlg)){

		var Combine=EXTRACTBkDlg.bCombine;
		var DeleteExisting=EXTRACTBkDlg.bDelete;
		var OldPagination=EXTRACTBkDlg.bOldPagination;
		//console.println(Combine);

		//Use same routines to order the pages
		BkMks.length=0;  //Clear the array
		var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
		var n = FindNumBks(oDoc.bookmarkRoot.children,nDepth);
		app.thermometer.duration=n;
		app.thermometer.begin();
		counter_order_thm=0;
		FillArray(oDoc, oDoc.bookmarkRoot, 0, n);  //Fill it with bookmarks info
		app.thermometer.end();
		CalculateChunkSizes(oDoc);	

		if(NumExtractions(BkMks)==0){
			app.alert("No bookmarks for extraction found.\n\nTo select a bookmark, change to any colour from black by right-clicking, 'Properties', click on 'Color'.");
			return;	
		}
	
		MakeFileNamesUnique(BkMks);

		//Check bookmarks are sorted in order of pages
		var ErrorReport=CheckPageData(BkMks);
		ErrorReport+=ExtractPages(oDoc,BkMks,Combine, DeleteExisting, OldPagination);
	
/*		if(!Combine)app.alert(NumSuccessfulExtractions(BkMks) + " successfully extracted files.\n\nThey are saved in the same folder as the main file.\n\n" + ErrorReport);
		if(Combine){
			if(ErrorReport==""){
					app.alert("Extracted successfully to single file.\n\nSaved in the same folder as the main file.\n\n");
				}else{
					app.alert("Problem extracting to single file.\n\n" + ErrorReport);
				}
			}
*/
		app.alert(ErrorReport);	
	
		oDoc.pageNum=Pg;  //reset page number to where it started
		
	}
	
	  app.endPriv();
    return 0;
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7EXTRACT = 
"ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000f0000000800000004000000040000000400000004000000040000000400000004000000040000000a0000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000c00000004000000000000000000000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000c0000000300000000000000000000000000000000000000080000000c0000000000000000a00000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c000000000000000d50000002a000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000008000000000000000000000000000000000000000000000000000000000000000ff000000f5000000600000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000c0000000c0000000c0000000c0000000c0000000ff000000ff000000ff000000a00000000a000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000aa000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000c0000000c0000000c0000000c0000000c0000000ff000000ff000000ff0000009f0000000a000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000008000000000000000000000000000000000000000000000000000000000000000ff000000f50000005f0000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c000000000000000d40000002a000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000a00000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000800000000000000000000000000000000000000080000000c0000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000c000000000000000000000000000000000000000000000000000000080000000f0000000ff000000ff000000ff000000ff000000ff000000a0000000400000004000000040000000400000004000000030000000000000000000000000000000000000000000000000000000000000001000000080000000f0000000ff000000ff000000ff000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000080000000f0000000ff000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000008000000070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"; //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconEXTRACT = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconEXTRACT = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7EXTRACT.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdEXTRACT = 
"DoEXTRACT(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjEXTRACT = 
{cName: "EXTR",
cExec: DoCmdEXTRACT,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
//cMarked: "event.rc = (app.doc != null) && LabelsPresent(app.doc.bookmarkRoot,0,app.doc)",
//cMarked: "event.rc = (app.doc != null) && app.doc.info.SqExists",
cTooltext: "Extracts pages from coloured bookmarks",
cLabel: "Extract pages",
nPos: 4};
 //</JSCodeSnippet>
if(oIconEXTRACT != null)
    oButObjEXTRACT.oIcon = oIconEXTRACT;

try{app.removeToolButton("EXTR");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjEXTRACT);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["EXTRACT_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["EXTRACT_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjEXTRACT"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>



