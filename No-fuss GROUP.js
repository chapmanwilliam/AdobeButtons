

//

var bkmk_array=[];
var nCount=0;

function SearchBkMks(array_bkmkee, bkm, nLevel, nLevelMax, Other)
{
	nCount++; //counter for the thermometer
	app.thermometer.value=nCount;
	if(app.thermometer.cancelled) return false;

	var j=0; //position of insertion
	console.println("Name: " + bkm.name);
	if(bkm.name!="*GROUPS*"){ //if groups then we don't need to do a comparison or search children
		if(bkm.name!="Root"){ //i.e. not the root then don't need to do a comparison but need to search children
				var counter=0;
				for(var i=0;i<array_bkmkee.length;i++){ 	//compare bkmk with each word(s) in array_group
					var words=[];
					words=array_bkmkee[i].word.split(" OR "); // split into components
					if(WordsInBkMk(words, bkm)){ //there is a match and ?not already an offspring
							var bkmk_data={bkmk: bkm, bkmkee: array_bkmkee[i]};
							bkmk_array.push(bkmk_data); //so add it to the bkmk_array
					}else{ //if no match than counter+1 
						counter++;
					}
				}
				if(counter==array_bkmkee.length && Other!=null){ //i.e. none of the words(s) in array_group match && Other is flagged
					console.println("This is the bkmk being moved to Other: " + bkm.name + ", " + words[0]);
					var bkmk_data={bkmk:bkm, bkmkee: Other};
					bkmk_array.push(bkmk_data); //so add it to the bkmk_array
				}
			} //end of not root
			
			if(bkm.children!=null && nLevel<nLevelMax){ //search all the children too
				for(var k=0;k<bkm.children.length;k++){
					console.println("KName: " + bkm.children[k].name);
					SearchBkMks(array_bkmkee, bkm.children[k], nLevel+1, nLevelMax, Other);
				}
			}
	}//end of group

	return true;
}

function WordsInBkMk(words, bkm){
//return true if WordsinBkMk

var bk_name=bkm.name;
console.println("Bookmark: " + bk_name);
	for(var i=0; i<words.length; i++){
		words[i]=words[i].trim(); //strip any spaces
		if(!GROUPBkDlg.bMatchCase){ //if case insensitive then make all upper case
			words[i]=words[i].toUpperCase();
			bk_name=bk_name.toUpperCase();
		}
		console.println(words[i]);
		if(bk_name.indexOf(words[i])>-1) return true;
	}
	return false;
}


function searchBookmarks(bkm, nLevel, bkmName){
	if ( bkm.name == bkmName && bkm.children!==null) return bkm;
	if (bkm.children != null) {
		for (var i = 0; i < bkm.children.length; i++){
			var bkMark = searchBookmarks(
			bkm.children[i], nLevel + 1, bkmName);
			if ( bkMark != null ) break;
		}
		return bkMark;
	}
return null;
}



var PDFS_MakeBkmkGROUP = app.trustedFunction(function(oDoc)
{
		

   	app.beginPriv();


	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
			

	if(nDepth > 0){
		GROUPBkDlg.strTitle = "";
		GROUPBkDlg.bPageLabel=true;
		GROUPBkDlg.nLevel = GROUPBkDlg.nLvlMax = nDepth.toString();
		GROUPBkDlg.nPgMax = oDoc.numPages.toString();
		GROUPBkDlg.nInsertAt = "1";
		GROUPBkDlg.bMatchCase=false;
		GROUPBkDlg.bOtherFolder=false;
		if("ok" == app.execDialog(GROUPBkDlg)){
		
			var nNumBks = FindNumBks(oDoc.bookmarkRoot.children,GROUPBkDlg.nLevel);
		
			var thm = app.thermometer;
			thm.duration = nNumBks;
			thm.begin();
			thm.text = "Grouping......";
			thm.value = 0;
		
			var Other=null;
			//Create array of groups
			var comma_list=GROUPBkDlg.strTitle;
			if(comma_list){ //if there is a string
				var array_groups=[];
				array_groups=comma_list.split(/[\n\r]/);
					//remove spaces from ends and add asteriks
					for(i=0; i<array_groups.length;i++){
						array_groups[i]=array_groups[i].trim();
						if(array_groups[i].length<2){
							//then remove it
							array_groups.splice(i,1);
						}
						//console.println(array_groups[i]);
					}
			
					
				//For each grouping-word 
				var array_bkmkee=[]; //to store the special bookmarks
				oDoc.bookmarkRoot.createChild({cName: "*GROUPS*", nIndex:0}); //create a top level GROUPS bookmark
				var group_bkmk=oDoc.bookmarkRoot.children[0];
	
				for(var i=0;i<array_groups.length;i++){
				//create a top-level bookmark at the start
					var first_word=[];
					first_word=array_groups[i].split(" OR ");
					matching_bm=searchBookmarks(oDoc.bookmarkRoot, 0, first_word[0]);
					var bm;
					if(matching_bm==null){
						group_bkmk.createChild({cName:first_word[0],nIndex:0}); //no match so create one
						bm=group_bkmk.children[0];
					}else{
						//move the matching_bm to the root level otherwise it gets buried inside another bookmark
						group_bkmk.insertChild(matching_bm);
						//we have a match
						bm=matching_bm;
					}
					var b={bkmk: bm, word: array_groups[i]};
					array_bkmkee.push(b);
				}
				if(GROUPBkDlg.bOtherFolder) {
//					app.alert("Other ticked");
					group_bkmk.createChild({cName: "{Other}", nIndex:0});
					Other={bkmk: group_bkmk.children[0], word: "{Other}"};
					console.println("Other name : " + Other.bkmk.name);
				}

				
				
					//console.println(bm.name);
				//Search all the bookmarks (except the parent) to see if it contains group-word
				//and move it to the GROUP bookmark if it does
					nCount=0;
					if(SearchBkMks(array_bkmkee, oDoc.bookmarkRoot, 0, GROUPBkDlg.nLevel, Other)){
						//Now move the bkmks in the array to the end of special bkmk
						console.println("bkmk_array.length :" + bkmk_array.length);
						for(var k=0; k<bkmk_array.length;k++){
							var j=0; //position
							if(bkmk_array[k].bkmkee.bkmk.children==null){ //check the position
								j=0;
							}else{
								j=bkmk_array[k].bkmkee.bkmk.children.length;
							}
							bkmk_array[k].bkmkee.bkmk.insertChild(bkmk_array[k].bkmk,j); //insert at the end
						}
						
						//reset the array
						while(bkmk_array.length > 0) {
   							 bkmk_array.pop();
						}
						
						for(var k=0; k<array_bkmkee.length;k++){
							console.println(array_bkmkee[k].bkmk.name);
							array_bkmkee[k].bkmk.open=false; //closes the bookmark
							//set the bookmark to point to the first child's page
							if(array_bkmkee[k].bkmk.children!=null){
								array_bkmkee[k].bkmk.children[0].execute();
								var pg=oDoc.pageNum.toString();
								array_bkmkee[k].bkmk.setAction("this.pageNum=" + pg);
							}
						}
						
						//Move the special folders to the top level
						if(group_bkmk.children!=null){
							var j=group_bkmk.children.length;
							for(var k=0; k<j; k++){
								oDoc.bookmarkRoot.insertChild(group_bkmk.children[0]);		
							}
						}
						group_bkmk.remove(); //delete the group_bkmk
					}else{
						alert.app("Cancelled....");
						//reset the array
						while(bkmk_array.length > 0) {
   							 bkmk_array.pop();
						}
						//delete the head bookmarks added
						for(var k=0; k<array_bkmkee.length;k++){
							array_bkmkee[k].bkmk.remove();
						}
					}
			
									
			
			

			}else{
				app.alert("No string entered.",1);
			}
		}
	}else{
		app.alert("Cannot group bookmarks because there are no Bookmarks",1);
	}
	
		app.thermometer.end();
	
   app.endPriv();
});





var GROUPBkDlg =
{
    strTitle:"",
    bPageLabel:false,
    nLevel:"1",
	nLvlMax:"1",
	nPgMax:"2",
	nInsertAt:"2",
	bMatchCase:false,
	bOtherFolder:false,
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "nlvl": this.nLevel,
            "Titl": this.strTitle,
            "bMcs": this.bMatchCase,
            "bOcs": this.bOtherFolder,
        };
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strTitle = oRslt["Titl"];
        this.nLevel = oRslt["nlvl"];
        this.bMatchCase = oRslt["bMcs"];
        this.bOtherFolder = oRslt["bOcs"];
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
        name: "Group bookmarks tool",
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
                                name: "Enter list of words to group bookmarks under.",
                                char_width: 15,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Titl",
                                variable_Name: "strTitle",
                                char_width: 8,
                                multiline: true,
                                char_height: 20,
                                alignment: "align_fill",
                            },
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta1",
                                        name: "Number of Bookmark Levels to Include in Grouping:",
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
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "bMcs",
                                        name: "Match case",
                                        variable_Name: "bMatchCase",
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
                                        group_id: "LbTx",
                                        item_id: "bOcs",
                                        name: "Residual folder 'Other'",
                                        variable_Name: "bOtherFolder",
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


var strDataMakeGROUPIcon = 
"FFFF0000FFF70000FFFF0C00FFFF0400FFFF0400FFE75D5A00C6C3C6FFDE7573FFF72021FFEF0000" +
"FFFF0408FFF73439FFCE9E9C00C6C3C600C6C3C600C6C3C6FFE7696BFFFF0C08FFD61018FFD61421" +
"00C6C3C6FFEF4D4AFFFF0400FFCEB6BD00C6C3C600C6C3C6FFDE7573FFFF0400FFDE4D4A00C6C3C6" +
"FFCEB6BDFFE73431FFFF2421FFCEB6BD00C6C3C6FFE7696BFFFF0000FFDE797B00C6C3C6FFC6868C" +
"00C6C3C6FFEF4542FFF70000FFCEB6BD00C6C3C600C6C3C6FFF71818FFF71C2100C6C3C600C6C3C6" +
"00C6C3C6FFD69694FFF70000FFE75D6300C6C3C6FFF70C08FFBD555A00C6C3C600C6C3C600C6C3C6" +
"00C6C3C6FFEF4542FFFF0808FFCEB6BD00C6C3C6FFCEBABDFFF70000FFEF454200C6C3C600C6C3C6" +
"00C6C3C600C6C3C6FFFF1818FFF73439FFD68E94FFFF0400FFBD797B00C6C3C600C6C3C600C6C3C6" +
"00C6C3C6FFEF4142FFF71008FFC6B6BD00C6C3C6FFFF5552FFC61C31FFCE284AFF31554AFF183831" +
"FF183029FF424142FFD60031FFE70839FFC62431FFAD3031FFC6656B00C6C3C600C6C3C600C6C3C6" +
"00C6C3C6FFE74142FFF70C08FFC6B6BD00C6C3C6FFEF494AFFE73C4AFFD62C52FFCEEFE7FFC6E7DE" +
"FFDEEFEFFFBDB6BDFFDE0839FFFF3063FFFF6973FFA52C29FFB5555A00C6C3C600C6C3C600C6C3C6" +
"00C6C3C6FFEF4142FFFF0010FFCEB6BD00C6C3C6FF94344AFFC6828CFF945163FFE7617BFFFFA2BD" +
"FFFF9EB5FFDE617BFF6B3C63FF8482ADFF6BA6E7FF5A96D6FFEF0410FFD6868C00C6C3C6FFCE8A8C" +
"00C6C3C6FFE75D5AFFEF182100C6C3C600C6C3C6FF8C2C42FFFFC7D6FFC6828CFFCE4D63FF7B2039" +
"FF842439FFCE516BFF7B496BFF73759CFF639EDEFF6BAAE7FFF70C18FFEF0C10FF521010FFD60C08" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF52495AFFA5DBE7FF84DBEFFF6BD7EFFF7BE3FF" +
"FF84D3FFFF94DBFFFF00458CFF429AE7FF399EFFFF429EFFFF424D5200C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF52495AFFA5DBE7FF84DBEFFF73DFF7FF7BE3FF" +
"FF84CFFFFF94DBFFFF004184FF3992DEFF429EFFFF52B2FFFF394D5200C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF39517BFF8CDBFFFF7BD3FFFF63C3FFFF6BCBFF" +
"FF7BCBFFFFA5E3FFFF184173FF638EBDFF6396CEFF84B6E7FF4A515200C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF395173FF84DBFFFF73CFFFFF73CFFFFF73CFFF" +
"FF73C7FFFF8CCBE7FF00184AFF315584FF10457BFF184D84FF848A9400C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF42514AFF94D3DEFF7BC7EFFF73C3FFFF7BC7FF" +
"FF7BCBFFFF8CDFFFFF424D73FFBDC7DEFFC6CFCEFFCED7CEFFDEDBDE00C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF42514AFF94CFDEFF7BBEE7FF73BEFFFF73C3FF" +
"FF73BEF7FF7BCBEFFF42517300C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF394D73FF7BD3FFFF6BBEFFFF6BBEFFFF6BC3FF" +
"FF73BEFFFF84C3EFFF42517300C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF394D73FF7BCFFFFF6BBAFFFF6BBEFFFF6BC3FF" +
"FF73BEF7FF84C3EFFF39516B00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF394963FF7BBEF7FF7BBEF7FF84B6E7FF8CB6E7" +
"FF84BEFFFF7BBAFFFF39597300C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF31415AFF9CDFFFFF6BAADEFF31618CFF184D7B" +
"FF6BAEEFFF8CCBFFFF395D7300C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF6B657BFF7396BDFF39597BFF848A94FF9496A5" +
"FF31496BFF94B2D6FF52656300C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6" +
"00C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6FF9C9AB5FF395D84FF739ABD00C6C3C600C6C3C6" +
"FF7B96B5FF39557BFF94A6A500C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C600C6C3C6";

var oIconMakeGROUP = {count: 0, width: 20, height: 20,
read: function(nBytes){return strDataMakeGROUPIcon.slice(this.count, this.count += nBytes);}};

var oButObjMakeGROUP = 
{cName: "PDFS_MakeBkmkGROUPTool",
cExec: "PDFS_MakeBkmkGROUP(event.target)",
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
cMarked: "event.rc = false",
cTooltext: "Group Bookmarks",
cLabel: "Group Bookmarks",
oIcon: oIconMakeGROUP
}

try{app.removeToolButton("PDFS_MakeBkmkGROUPTool");}catch(e){}
try{app.addToolButton(oButObjMakeGROUP);}catch(e){}

