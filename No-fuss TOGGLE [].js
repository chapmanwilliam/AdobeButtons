

 //*******************************************\\
 //This toggles [] page labels to end of bookmarks

 //var pattern_toggle_page_label=/ \[[\w-^\[]+\]$/;
 //var pattern_toggle_page_label=/ \[.\]+$/;
var pattern_toggle_page_label=/ ?\[[^\[^\]]*\]+$/;
var SqExists=false;
var sq_thm_count=0;

function RemovePageLabelFromString(S){
	return S.replace(pattern_toggle_page_label,"").trim();
}

function RemovePageLabel(Bm){
	return RemovePageLabelFromString(Bm.name);
}

function AddPageLabel(Bm,oDoc){
	return Bm.name.trim() + " ["+oDoc.getPageLabel(oDoc.pageNum)+"]";
}

function GetPageLabelFromString(S){
	 //returns the page label string
	var x=S.match(pattern_toggle_page_label);
	if(x==null)return "";
	return x[0];
}

function GetPageLabel(Bm){
	 //returns the page label string
	 return GetPageLabelFromString(Bm.name);
}

function RemovePageLabels(Bm, nLevel, oDoc,n){
	//removes page labels from all the bookmarks
	sq_thm_count=sq_thm_count+1;
	if(n!=0){
		app.thermometer.value=sq_thm_count;
		app.thermometer.text="Removing ["+sq_thm_count+"] of " + n + " bookmarks."
	}
	 //Remove label
	if(Bm.name!="Root") Bm.name=RemovePageLabel(Bm);	

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			RemovePageLabels(Bm.children[i], nLevel + 1, oDoc, n);
		}
	}

}

function AddPageLabels(Bm, nLevel, oDoc, n){

	Bm.execute();

	sq_thm_count=sq_thm_count+1;
	if(n!=0){
		app.thermometer.value=sq_thm_count;
		app.thermometer.text="Adding ["+sq_thm_count+"] of " + n + " bookmarks."
	}

	 //Add [page number]
	if(Bm.name!="Root")Bm.name=AddPageLabel(Bm,oDoc);	

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){
			AddPageLabels(Bm.children[i], nLevel + 1, oDoc, n);
		}
	}
	
}

 // Define the ES5 String.trim() method if one does not already exist.
 // This method returns a string with whitespace removed from the start and end.
String.prototype.trim = String.prototype.trim || function() {
if (!this) return this;  // Don't alter the empty string
return this.replace(/^\s+|\s+$/g, "");  // Regular expression magic
};


var TogPageLabels=app.trustedFunction(function(oDoc)
{

app.beginPriv();

	var PgNow=oDoc.pageNum;	

	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);

	var root = oDoc.bookmarkRoot;
	if(LabelsPresent(oDoc.bookmarkRoot,0,oDoc)==true){
		var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
		app.thermometer.duration=n;
		app.thermometer.begin();
		sq_thm_count=0;
		RemovePageLabels(oDoc.bookmarkRoot, 0, oDoc,n);  //Remove the page labels
		app.thermometer.end();
		oDoc.info.SqExists=false;		
	}else{
		var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
		app.thermometer.duration=n;
		app.thermometer.begin();
		sq_thm_count=0;
		AddPageLabels(oDoc.bookmarkRoot,0,oDoc,n);  //Add the page labels
		app.thermometer.end();
		oDoc.info.SqExists=true;
	}

	oDoc.pageNum=PgNow;		

app.endPriv();
		
});

function RefreshToggle(oDoc){
	app.beginPriv();
	 //This function refreshes the page toggles if they exist
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth)
	if (LabelsPresent(oDoc.bookmarkRoot,0,oDoc)){
		
		oDoc.info.SqExists=true;
		
		app.thermometer.duration=n;
		app.thermometer.begin();
		sq_thm_count=0;
		RemovePageLabels(oDoc.bookmarkRoot, 0, oDoc,n);
		app.thermometer.end();

		oDoc.info.SqExists=false;
		
		app.thermometer.duration=n;
		app.thermometer.begin();
		sq_thm_count=0;
		AddPageLabels(oDoc.bookmarkRoot, 0, oDoc,n);
		app.thermometer.end();

		oDoc.info.SqExists=true;
	}
	app.endPriv();
}


function LabelsPresent(Bm, nLevel, oDoc){
	 //Function returns true if there are existing [] at the end of bookmarks
	 //see if there is match
	if(pattern_toggle_page_label.test(Bm.name)==true) return true;

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			if(LabelsPresent(Bm.children[i], nLevel + 1, oDoc)==true) return true;
		}
	}
	return false;	
}


 // // // // // // // // // // // // ///
 //
 //  This is the main function for toggling
 //  page label info in [] to bookmarks
 //

var DoTOGGLE = app.trustedFunction(function(oDoc)
{
	if(!CheckLicence())return;

	var Pg=oDoc.pageNum;  //note page number

	TogPageLabels(oDoc); //toggle the page labels
	//console.println("Status " & oDoc.info.SqExists);

	oDoc.pageNum=Pg;  //reset page number to where it started
	
 //    return nFound;
    return 0;
  app.endPriv();
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7TOGGLE = 
"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000009f0000009f0000009f000000930000000000000000000000000000000000000000000000000000000000000000000000650000009f0000009f0000009f0000002e000000000000000000000000000000ff000000ff000000ff000000ec00000000000000000000000000000000000000000000000000000000000000000000009d000000f8000000fe000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000001c0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d2000000ff0000004a000000000000000000000000000000ff000000ff0000009a000000820000000000000000000000000000000000000000000000000000000000000000000000590000008d000000eb000000ff0000004a000000000000000000000000000000ff000000ff000000ff000000ec0000000000000000000000000000000000000000000000000000000000000000000000a2000000ff000000ff000000ff0000004a0000000000000000000000000000001400000014000000140000001200000000000000000000000000000000000000000000000000000000000000000000000c000000140000001400000014000000050000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconTOGGLE = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconTOGGLE = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7TOGGLE.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdTOGGLE = 
"DoTOGGLE(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjTOGGLE = 
{cName: "TOGG",
cExec: DoCmdTOGGLE,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
//cMarked: "event.rc = (app.doc != null) && LabelsPresent(app.doc.bookmarkRoot,0,app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.SqExists",
cTooltext: "Toggle page labels on Bookmarks",
cLabel: "Add [Pg] to bookmarks",
nPos: 4};
 //</JSCodeSnippet>
if(oIconTOGGLE != null)
    oButObjTOGGLE.oIcon = oIconTOGGLE;

try{app.removeToolButton("TOGG");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjTOGGLE);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["TOGGLE_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["TOGGLE_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjTOGGLE"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




