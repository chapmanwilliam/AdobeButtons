var pattern_link_label=/BLink/;


function RefreshLinkingExisting(oDoc){
	app.beginPriv();
	if(!oDoc.info.SubPath || !oDoc.info.SubsExist)return false;  //exist if path not defined or no subs already
	oDoc.info.SubsExist=!DeleteExistingSubmissions(oDoc);  //delete the existing subs

	if(!InsertSubmissions(oDoc, oDoc.info.SubPath)) { //insert the file. Exit if it is bad.
		app.alert("File not found:\n\n" + oDoc.info.SubPath);
		return false;
	} 

	oDoc.info.SubsExist=true;  //flag that we have submissions inserted
	
	Linking(oDoc);
	
	console.println("Links refreshed");
	app.endPriv();
	return true;
}


function BuildPageData(oDoc, page_data, whole_doc){
	//Build bk data	
	/*var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
	app.thermometer.duration=n;
	app.thermometer.begin();
	ex_thm_count=0;
	var bk_data=[];
	BuildPageDataFromBookmarks(oDoc.bookmarkRoot,0,oDoc,bk_data,0,n);
	app.thermometer.end();*/
	
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


	if(whole_doc) {for(var i=0;i<=oDoc.numPages;i++)page_data[i]=true; return;} //set all to true if whole doc
	
	for(var i=0;i<=oDoc.numPages;i++)page_data[i]=false; //set to false by default

	//Add pages associated with bookmarks in bold
	for(var i=0;i<BkMks.length;i++){
			//console.println(BkMks[i].Name + ", " + BkMks[i].Link);
		if(BkMks[i].Link){
			var s=BkMks[i].PageRef;
			var e=BkMks[i].PageEnd;
			console.println(BkMks[i].Name + " for linking: from " + s + " to " + e);
			for(j=s;j<=e;j++)page_data[j]=true;
		}
	}
	//Add pages of submissions pages
	var d=[];
	var d=IdentifyPagesForDeletion(oDoc, /SUBS_/);
	for(var i=0;i<d.length;i++)page_data[d[i]]=true;

}

var NF_DoLinkingExisting = app.trustedFunction(function(oDoc)
{
   	app.beginPriv();

<<<<<<< HEAD
	if(!CheckPermitted())return false;
=======
	if(!CheckLicence())return false;
>>>>>>> 9a8c3ab (first commit)

	var PgNow=oDoc.pageNum;	

	if(oDoc.info.LinkingExists){
		oDoc.info.LinkingExists=!DeleteLinks(oDoc);
		return false;
	}

	//console.println(oDoc.info.LinkingFile + " " + oDoc.info.bThisFile + " " + oDoc.info.bWhole);
	
	typeof(oDoc.info.RelLinkingFile)=="undefined" ? "": LINKEXISTINGBkDlg.strFile=BuildAbsolutePath(oDoc,oDoc.info.RelLinkingFile);
	typeof(oDoc.info.bThisFile)=="undefined" ? true: LINKEXISTINGBkDlg.bThisFile=oDoc.info.bThisFile;
	typeof(oDoc.info.bWhole)=="undefined" ? true: LINKEXISTINGBkDlg.bWhole=oDoc.info.bWhole;

	//console.println(LINKEXISTINGBkDlg.strFile + " " + LINKEXISTINGBkDlg.bThisFile + " " + LINKEXISTINGBkDlg.bWhole);

	if(LINKEXISTINGBkDlg.bThisFile)LINKEXISTINGBkDlg.strFile="";

	if("ok" == doLinkExistingDlg(LINKEXISTINGBkDlg, oDoc)){

		oDoc.info.bThisFile=LINKEXISTINGBkDlg.bThisFile;
		if(LINKEXISTINGBkDlg.strFile==oDoc.path){
			app.alert("You've chosen to link to an external file that is this file.\n\nWill link to this file."); 
			oDoc.info.bThisFile=true;
		}
		if(oDoc.info.bThisFile){
			oDoc.info.LinkingFile="";
			oDoc.info.RelLinkingFile="";
		}else{
			oDoc.info.LinkingFile = MakePathDeviceIndependent(LINKEXISTINGBkDlg.strFile);
			oDoc.info.RelLinkingFile=GetRelativePath(oDoc,LINKEXISTINGBkDlg.strFile);
		}
		oDoc.info.bWhole=LINKEXISTINGBkDlg.bWhole;
		
		var q=String.fromCharCode(34);
	   	oDoc.addScript("LinkingScript", "var ExternalFile=null; function NFPageOpen(oDoc,p){if(oDoc.ExternalFile==null){try{oDoc.ExternalFile=app.openDoc(oDoc.info.RelLinkingFile,oDoc);oDoc.ExternalFile.layout="+q+"SinglePage"+q+";	oDoc.ExternalFile.zoomType=zoomtype.fitP;}catch(e){app.alert("+q+"Link broken. Please re-hyperlink."+q+");console.println("+q+"Failed to open "+q+" + this.info.RelLinkingFile); oDoc.ExternalFile=null;return;}}try{var dirty_flag=oDoc.ExternalFile.dirty;oDoc.ExternalFile.pageNum=p;var aRect = oDoc.ExternalFile.getPageBox( {nPage: p} );var fld=oDoc.ExternalFile.addField({cName: "+q+"Testasdfdsf"+q+", cFieldType: "+q+"button"+q+",nPageNum: p, oCoords: aRect }); oDoc.ExternalFile.removeField("+q+"Testasdfdsf"+q+");oDoc.ExternalFile.dirty=dirty_flag;	}catch(e){	console.println("+q+"Error on linking to external file."+q+");	oDoc.ExternalFile=null;	NFPageOpen(oDoc,p); }}");
		oDoc.dirty=true; //to mark it for saving
	
		oDoc.info.LinkingExists=Linking(oDoc);

		oDoc.pageNum=PgNow;
	

	}



	
	app.endPriv();
	
	return true;
	
});

function doLinkExistingDlg(dialog, doc){
	app.beginPriv();
	dialog.doc=doc;
	return app.execDialog(dialog);
	app.endPriv();
}


var LINKEXISTINGBkDlg =
{
    strFile:"",
    bThisFile:true,
    bWhole:true,

    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "File": this.strFile,
            "sta2": "This will hyperlink page references on pages associated with bookmarks in bold.\n\nThe links will be to pages in this pdf or another pdf of your choosing.",
            "WhoD": this.bWhole,
        };
		dlgInit[this.bThisFile?"byTF":"byEF"] = true;
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
		this.bThisFile = oRslt["byTF"];
		this.bWhole=oRslt["WhoD"];
		console.println(this.bThisFile);
		this.strFile=oRslt["File"];
    },
 
    butn: function(dialog)
    {
    	//app.alert(this.doc.path);
    	var f=GetFilePath(this.doc);
    	if(f!=""){
    		this.strFile=f;
    		this.bThisFile=false;
    		dialog.load({"File": this.strFile});
    		dialog.load({"byTF": false});
    		dialog.load({"byEF": true});
    	}
    },
    
    byTF: function (dialog)
    {
        var oRslt = dialog.store();
		this.bThisFile = oRslt["byTF"];
		if(this.bThisFile){
			dialog.load({"File":""});
		}
    },
    
    byEF: function (dialog)
    {
        var oRslt = dialog.store();
		this.bThisFile = oRslt["byTF"];
		if(!this.bThisFile){
			dialog.load({"File": this.strFile});
		}
    }, 
     
    
    description:
    {
        name: "Hyperlinking tool",
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
                                item_id: "sta2",
                                name: "Hyperlinking",
                                width: 200,
                                height: 61,
                                char_width: 20,
                                alignment: "align_fill",
                                font: "palette",
                                bold: true,
                            },
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta2",
                                        name: "File to link to: ",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "byTF",
                                        name: "This file",
                                        variable_Name: "bThisFile",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "byEF",
                                        name: "External file",
                                    },
                                ]
                            },
                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "External file:",
                                char_width: 15,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "File",
                                variable_Name: "strFile",
                                char_width: 100,
                                alignment: "align_fill",
                            },
                            {
                              type: "check_box",
                               item_id: "WhoD",
                               name: "Whole document",
                             variable_Name: "bWhole",
                            },
                            {
                            	type: "button",
                            	item_id: "butn",
                            	char_width: 40,
                            	alighment: "align_center",
                            	name: "Choose file",
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



 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7AddLinkingExisting = 
"0000000000000000000000000000000000000000000000000000000011000000a0000000f1000000f30000009f000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000c3000000ff000000c1000000c4000000ff000000bf0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037000000ff0000009500000000000000000000009b000000ff0000003400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000056000000ff00000054000000000000000000000059000000ff0000005300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000058000000ff00000054000000000000000000000058000000ff0000005400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000057000000ff00000054000000110000001000000058000000ff0000005300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042000000ff00000054000000ca000000c500000058000000ff0000003900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005000000d900000054000000d8000000d400000058000000cb0000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210000002e000000d8000000d40000002f0000001900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d8000000d4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d8000000d4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001f00000030000000d8000000d400000032000000220000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000d600000054000000d8000000d400000058000000d90000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000043000000ff00000054000000c9000000c300000058000000ff0000003e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000058000000ff000000540000000e0000000d00000058000000ff0000005300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000058000000ff00000054000000000000000000000058000000ff0000005400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000057000000ff00000055000000000000000000000059000000ff0000005300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038000000ff000000990000000000000000000000a4000000ff0000002e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000c2000000ff000000c7000000cc000000ff000000af0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000009c000000ee000000eb0000008f0000000900000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconAddLinkingExisting = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconAddLinkingExisting = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7AddLinkingExisting.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdAddLinkingExisting = 
"NF_DoLinkingExisting(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjLinkingExisting = 
{cName: "Linking Existing",
cExec: DoCmdAddLinkingExisting,
cEnable: "event.rc = (app.doc != null)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.LinkingExists",
cTooltext: "Hyperlink page references in highlighted bookmarks",
cLabel: "Hyperlink page refs",
nPos: -1};
 //</JSCodeSnippet>
if(oIconAddLinkingExisting != null)
    oButObjLinkingExisting.oIcon = oIconAddLinkingExisting;

try{app.removeToolButton("Linking Existing");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjLinkingExisting);
}catch(e)
{
}
 //</JSCodeSnippet>
 
 //</AcroButtons>
