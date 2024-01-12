




var MakeFrontSheet = app.trustedFunction(function(oDoc)
{
<<<<<<< HEAD
	if(!CheckPermitted())return;
=======
	if(!CheckLicence())return;
>>>>>>> 9a8c3ab (first commit)

   app.beginPriv();
	
	 //console.println("This place first");	
	if (ExistingFS(oDoc)) { 
		 //console.println("This place");	
		DeleteOldFrontSheet(oDoc);
		oDoc.info.FSExists=false;
		return;
	}
													
	var plat=app.platform;
 //	 //console.println("Console: " + plat);	
	var pth;
	switch(plat){
		case "WIN":
			Fnt="SegoeUI";
			pth=app.getPath("app","javascript")+"/FrontSheet.pdf";
			 //console.println("Win path " + pth);
		break;
		case "MAC":
			Fnt="LucidaSans"
			pth=app.getPath("app","javascript")+"FrontSheet.pdf";
			 //console.println("Mac path " + pth);
		break;
		case "UNIX":
			app.alert("Not designed for this platform.");
		break;
		default:
			app.alert("Not designed for this platform.");
			return;
		break;
	}	
					
			
		var pgRect = oDoc.getPageBox("Crop",0);
		var pgWidth =  pgRect[2] - pgRect[0];
		var pgHeight =  pgRect[1] - pgRect[3];
			
			
			
			 //PUT THE PAGES INTO THE MAIN BUNDLE. WE STILL NEED TO ADD THE PAGE REFERENCES
			 //try{app.addToolButton(oButObjMakeFS);}catch(e){}
			var oFrontSheetDoc;
			try{
				oFrontSheetDoc = app.openDoc({cPath:pth,bHidden:true});
			}catch(e){
				console.println("No FrontSheet.pdf file found in javascripts folder.");
				return;
			}
			
			var nFrontSheetPages = oFrontSheetDoc.numPages;
									
			var nStartPage = Number(1) - 1;  //Keeping it simple - always put before first page
			
			var NumPages=oDoc.numPages;
	
			 //place pages at the end
			//console.println(oFrontSheetDoc.path);
			oDoc.insertPages ({
				nPage: NumPages-1,  //insert after last pages
				cPath: oFrontSheetDoc.path,
			});
	
			var NewNumPages=oDoc.numPages;	
	
			 //place dummy copy at the end - this stops re-page labelling everything else
			oDoc.insertPages ({
				nPage: oDoc.numPages-1,  //insert after last pages
				cPath: oFrontSheetDoc.path,
			});
	
			oDoc.setPageLabels(NumPages, ["r", "FS_", 1]);  //set the page labels

	
	
			 //Now move them to the right place
			for (var i =1;i<=NewNumPages-NumPages;i++){
				oDoc.movePage(NewNumPages-1,nStartPage-1);
			}
			
 //			 //console.println(oDoc.numPages-nFrontSheetPages);
 //			 //console.println(oDoc.numPages);
			 //Now delete the dummy pages
			for(var i=0;i<nFrontSheetPages;i++){
				oDoc.deletePages(oDoc.numPages-1);
			}
			
		 //add an invisible field to the page to identify it as FrontSheet
			var inch=72;
			var nTxtSize=20;
			var wdth=getTextWidth(oDoc,0,nTxtSize,Fnt,false,"FS_")
			for (i=nStartPage;i<oFrontSheetDoc.numPages;i++){
					var aRect = oDoc.getPageBox( {nPage: i} );
					aRect[0] = aRect[2]-wdth-0.5*inch; // from upper left hand corner of page, upper left x
					aRect[2] = aRect[0]+wdth; // Make it wdth wide, lower right x
					aRect[1] = aRect[3]+.5*inch;  // upper left y
					aRect[3] = aRect[1] - 24; // and 24 points high, lower right y

					oFld = oDoc.addField("FS_"+i,"text", i, aRect);
					oFld.fillColor = color.transparent;
					oFld.width = 0;
					oFld.alignment = "right";
					oFld.textSize = nTxtSize;
					oFld.textFont = Fnt;	
					oFld.readonly=true;			
					oFld.value = "FS_";
					oFld.display=display.hidden;
			}
			
			
			oFrontSheetDoc.closeDoc(true);
			
			oFrontSheetDoc.bringToFront();
						
			FillDefaultsFrontSheet(oDoc);
			
			if(ExistingSUBS(oDoc))RefreshLinkingOnly(oDoc);

			oDoc.info.FSExists=true;	
		 //}
		
   oDoc.pageNum=nStartPage-1;
   app.endPriv();
});


/*function GetFieldDoc(cName, oDoc) {
 // return the field object for cName or return a null value;
	app.beginPriv();
	console.println("4 " + oDoc.path);

	if(typeof(oDoc)=="undefined")return null;
	var oField = oDoc.getField(cName);
	if(oField == null) console.println("Error accessing field " + cName);
	app.endPriv();
return oField;
}  // end GetFieldDoc function;
*/

function DeletePages(oDoc, d){
	 //delete the pages in array d
	app.beginPriv();
	var j=0;
	d.sort(function(a,b){return b-a;}); //sort in reverse order
	var old_page=-1;
	while (j<d.length){
		if(d[j]!=old_page)oDoc.deletePages(d[j]);
		old_page=d[j];
		j++;
	}  //delete pages in reverse order
	app.endPriv();
}

function IdentifyPagesForDeletion(oDoc, pattern){
	 //returns array of pages for deletion
	app.beginPriv();
	var d=[];		
		var i=0;
		while(i<oDoc.numFields+1){
			var a=oDoc.getNthFieldName(i);
				//console.println("Name " + a);
				if(pattern.test(a)){
					var pg=oDoc.getField(a).page;
					if (pg>=0 && pg<oDoc.numPages){  //check page is within range
						 //console.println("This page of the field :" + a + ", " + pg);
						d.push(pg);
					}
	
			}			
		i++;
	}
	return d;
	app.endPriv();
}

var SolPersist = app.trustedFunction(function(oDoc){
	 //This function sets global variables for Sol data
	app.beginPriv();
	 //console.println("Sol Persist " + this.getField("cSol").value);
	if(oDoc.getField("cSol").value=="Yes"){
		 //console.println("Sol Persist got here " + this.getField("cSol").value);
	
		if(typeof(global.strFS_SolPersist) == "undefined")
	  	{
	    	global.strFS_SolPersist = true;
	    	global.setPersistent("strFS_SolPersist",true);
	  	}
	    global.strFS_SolPersist = true;


		if(typeof(global.strFS_SolName) == "undefined")
	  	{
	    	global.strFS_SolName = this.getField("tSolName").value;
	    	global.setPersistent("strFS_SolName",true);
	  	}
	   	global.strFS_SolName = this.getField("tSolName").value;
	  	
		if(typeof(global.strFS_SolAddress) == "undefined")
	  	{
	    	global.strFS_SolAddress = this.getField("tSolAddress").value;
	    	global.setPersistent("strFS_SolAddress",true);
	  	}
    	global.strFS_SolAddress = this.getField("tSolAddress").value;

		if(typeof(global.strFS_SolEmail) == "undefined")
	  	{
	    	global.strFS_SolEmail = this.getField("tSolEmail").value;
	    	global.setPersistent("strFS_SolEmail",true);
	  	}
    	global.strFS_SolEmail = this.getField("tSolEmail").value;

		if(typeof(global.strFS_SolTel) == "undefined")
	  	{
	    	global.strFS_SolTel = this.getField("tSolTel").value;
	    	global.setPersistent("strFS_SolTel",true);
	  	}
	   	global.strFS_SolTel = this.getField("tSolTel").value;

  	}else{
  		global.strFS_SolPersist = false;

		if(typeof(global.strFS_SolName) == "undefined")
	  	{
	    	global.strFS_SolName = "";
	    	global.setPersistent("strFS_SolName",true);
	  	}
		global.strFS_SolName = "";

		if(typeof(global.strFS_SolAddress) == "undefined")
	  	{
	    	global.strFS_SolAddress = "";
	    	global.setPersistent("strFS_SolAddress",true);
	  	}
	    global.strFS_SolAddress = "";
	    	
		if(typeof(global.strFS_SolEmail) == "undefined")
	  	{
	    	global.strFS_SolEmail = "";
	    	global.setPersistent("strFS_SolEmail",true);
	  	}
		global.strFS_SolEmail = "";

		if(typeof(global.strFS_SolTel) == "undefined")
	  	{
	    	global.strFS_SolTel = "";
	    	global.setPersistent("strFS_SolTel",true);
	  	}  	
		global.strFS_SolTel = "";
  	}
	app.endPriv();	
});

var BarPersist = app.trustedFunction(function(oDoc){
	 //This function sets global variables for Bar data
	app.beginPriv();
	 //console.println("Bar Persist " + this.getField("cBar").value);
	if(oDoc.getField("cBar").value=="Yes"){
		 //console.println("Bar Persist got here " + this.getField("cBar").value);
	
		if(typeof(global.strFS_BarPersist) == "undefined")
	  	{
	    	global.strFS_BarPersist = true;
	    	global.setPersistent("strFS_BarPersist",true);
	  	}
	    global.strFS_BarPersist = true;


		if(typeof(global.strFS_BarName) == "undefined")
	  	{
	    	global.strFS_BarName = this.getField("tBarName").value;
	    	global.setPersistent("strFS_BarName",true);
	  	}
	    global.strFS_BarName = this.getField("tBarName").value;
		
		if(typeof(global.strFS_BarAddress) == "undefined")
	  	{
	    	global.strFS_BarAddress = this.getField("tBarAddress").value;
	    	global.setPersistent("strFS_BarAddress",true);
	  	}
	    global.strFS_BarAddress = this.getField("tBarAddress").value;

		if(typeof(global.strFS_BarEmail) == "undefined")
	  	{
	    	global.strFS_BarEmail = this.getField("tBarEmail").value;
	    	global.setPersistent("strFS_BarEmail",true);
	  	}
	    global.strFS_BarEmail = this.getField("tBarEmail").value;
		
		if(typeof(global.strFS_BarTel) == "undefined")
	  	{
	    	global.strFS_BarTel = this.getField("tBarTel").value;
	    	global.setPersistent("strFS_BarTel",true);
	  	}
	   	global.strFS_BarTel = this.getField("tBarTel").value;
  	
  	}else{
  		global.strFS_BarPersist = false;

		if(typeof(global.strFS_BarName) == "undefined")
	  	{
	    	global.strFS_BarName = "";
	    	global.setPersistent("strFS_BarName",true);
	  	}
	    global.strFS_BarName = "";

		if(typeof(global.strFS_BarAddress) == "undefined")
	  	{
	    	global.strFS_BarAddress = "";
	    	global.setPersistent("strFS_BarAddress",true);
	  	}
	    global.strFS_BarAddress = "";

		if(typeof(global.strFS_BarEmail) == "undefined")
	  	{
	    	global.strFS_BarEmail = "";
	    	global.setPersistent("strFS_BarEmail",true);
	  	}
	  	global.strFS_BarEmail = "";
		if(typeof(global.strFS_BarTel) == "undefined")
	  	{
	    	global.strFS_BarTel = "";
	    	global.setPersistent("strFS_BarTel",true);
	  	}  	
	    global.strFS_BarTel = "";
  	}
	app.endPriv();	
});

function FillDefaultsFrontSheet(oDoc){

		app.beginPriv();
		if (!ExistingFS(oDoc)) return false;

		
		oDoc.getField("tTitle").value = (oDoc.info.FSTitle ? oDoc.info.FSTitle : "");
		oDoc.getField("tCaseName").value = (oDoc.info.FSCaseName ? oDoc.info.FSCaseName : "");
		oDoc.getField("tCaseNumber").value = (oDoc.info.FSCaseNumber ? oDoc.info.FSCaseNumber : "");
	
		//console.println("Sol Persist: " + global.strFS_SolPersist);
		oDoc.getField("cSol").value = (oDoc.info.FSSolPersist ? (oDoc.info.FSSolPersist==true ? "Yes": "Off") : (global.strFS_SolPersist ? "Yes" : "Off"));
		oDoc.getField("tSolName").value = (oDoc.info.FSSolName ? oDoc.info.FSSolName : (global.strFS_SolPersist ? global.strFS_SolName:""));
		oDoc.getField("tSolAddress").value = (oDoc.info.FSSolAddress ? oDoc.info.FSSolAddress : (global.strFS_SolPersist ? global.strFS_SolAddress:""));
		oDoc.getField("tSolRef").value = (oDoc.info.FSSolRef ? oDoc.info.FSSolRef : "");
		oDoc.getField("tSolEmail").value = (oDoc.info.FSSolEmail ? oDoc.info.FSSolEmail : (global.strFS_SolPersist ? global.strFS_SolEmail:""));
		oDoc.getField("tSolTel").value = (oDoc.info.FSSolTel ? oDoc.info.FSSolTel : (global.strFS_SolPersist ? global.strFS_SolTel:""));

		oDoc.getField("cBar").value =(oDoc.info.FSBarPersist ? (oDoc.info.FSBarPersist==true ? "Yes": "Off") : (global.strFS_BarPersist ? "Yes" : "Off"));
		oDoc.getField("tBarName").value = (oDoc.info.FSBarName ? oDoc.info.FSBarName : (global.strFS_BarPersist ? global.strFS_BarName:""));
		//console.println(global.strFS_BarName);
		oDoc.getField("tBarAddress").value = (oDoc.info.FSBarAddress ? oDoc.info.FSBarAddress : (global.strFS_BarPersist ? global.strFS_BarAddress:""));
		//console.println(global.strFS_BarAddress);
		oDoc.getField("tBarRef").value = (oDoc.info.FSBarRef ? oDoc.info.FSBarRef : "");
		oDoc.getField("tBarEmail").value = (oDoc.info.FSBarEmail ? oDoc.info.FSBarEmail : (global.strFS_BarPersist ? global.strFS_BarEmail:""));
		oDoc.getField("tBarTel").value = (oDoc.info.FSBarTel ? oDoc.info.FSBarTel : (global.strFS_BarPersist ? global.strFS_BarTel:""));
		
		BuildBarCodeText(oDoc);
		app.endPriv();
}

var BuildBarCodeText = app.trustedFunction(function(oDoc){
 // Build V-Card String
	var strStart = "BEGIN:No-Fuss FrontSheet\nVERSION:1.0\r\n";

	var p=[];
	p.push(strStart); 
	if(oDoc.getField("tTitle")!=null) p.push("tTitle\t" + oDoc.getField("tTitle").value + "\r\n"); 
	if(oDoc.getField("tCaseName")!=null) p.push("tCaseName\t"+oDoc.getField("tCaseName").value + "\r\n");
	if(oDoc.getField("tCaseNumber")!=null) p.push("tCaseNumber\t"+oDoc.getField("tCaseNumber").value + "\r\n");
	
	if(oDoc.getField("tSolName")!=null) p.push("tSolName\t" + oDoc.getField("tSolName").value + "\r\n");
	if(oDoc.getField("tSolAddress")!=null) p.push("tSolAddress\t" + oDoc.getField("tSolAddress").value + "\r\n");
	if(oDoc.getField("tSolRef")!=null) p.push("tSolRef\t" + oDoc.getField("tSolRef").value + "\r\n");
	if(oDoc.getField("tSolEmail")!=null) p.push("tSolEmail\t" + oDoc.getField("tSolEmail").value + "\r\n");
	if(oDoc.getField("tSolTel")!=null) p.push("tSolTel\t" + oDoc.getField("tSolTel").value + "\r\n");
	
	if(oDoc.getField("tBarName")!=null) p.push("tBarName\t" + oDoc.getField("tBarName").value + "\r\n");
	if(oDoc.getField("tBarAddress")!=null) p.push("tBarAddress\t" + oDoc.getField("tBarAddress").value + "\r\n");
	if(oDoc.getField("tBarRef")!=null) p.push("tBarRef\t" + oDoc.getField("tBarRef").value + "\r\n"); 
	if(oDoc.getField("tBarEmail")!=null) p.push("tBarEmail\t" + oDoc.getField("tBarEmail").value + "\r\n"); 
	if(oDoc.getField("tBarTel")!=null) p.push("tBarTel\t" + oDoc.getField("tBarTel").value + "\r\n");
	
	strEnd = "END:No-Fuss FrontSheet";
	p.push(strEnd); 
	
	var st="";
	for (var i=0;i<p.length;i++){
		st += p[i];
	}
	
	 //console.println(st);
	
	oDoc.getField("FS_BarCode", oDoc).value = st;
});

function GetLastPageNumberFrontSheet(oDoc){
	if(!ExistingFS(oDoc))return -1;
	 //Function returns true if existing TOC
	var pattern=/FS_/;
	var i=0;
	while(i<oDoc.numFields+1){
		var a=oDoc.getNthFieldName(i);
		if(pattern.test(a)){
			return oDoc.getField(a).page;	
		}			
		i++;
	}	
	return -1;
	
}

function ExistingFS(oDoc){
	 //Function returns true if existing TOC
	var pattern=/FS_/;
	var i=0;
	while(i<oDoc.numFields+1){
		var a=oDoc.getNthFieldName(i);
		if(pattern.test(a)){
			return true;	
		}			
		i++;
	}	
	return false;
}

function DeleteOldFrontSheet(oDoc){
	console.println("Deleting Front Sheet...");
	 //Delete old Front Sheet
	app.beginPriv();
	
	var d=IdentifyPagesForDeletion(oDoc, /FS_/);

	DeletePages(oDoc, d);
	
	app.endPriv();
}


var strDataMakeFSIcon = 
"00000000000000001f00000063000000640000006400000064000000640000006400000064000000640000006400000064000000640000006400000064000000630000001c0000000000000000000000000000000000000083000000f6000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000dc000000f70000007a0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000084000000bc0000000000000070000000cc0000000d0000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000009d000000fc000000190000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000084000000bc00000002000000f6000000ff000000700000001a00000064000000640000006400000064000000640000006200000000000000c40000007c0000000000000000000000000000000000000084000000bc00000003000000dc000000dc0000006a0000003a000000dc000000dc000000dc000000dc000000dc000000d800000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000084000000bc00000003000000e4000000e40000006e0000003c000000e4000000e4000000e4000000e4000000e4000000e000000000000000c40000007c0000000000000000000000000000000000000084000000bc000000010000005c0000005c0000002c000000180000005c0000005c0000005c0000005c0000005c0000005a00000000000000c40000007c0000000000000000000000000000000000000084000000bc000000010000006400000064000000300000001a00000064000000640000006400000064000000640000006200000000000000c40000007c0000000000000000000000000000000000000084000000bc00000003000000dc000000dc0000006a0000003a000000dc000000dc000000dc000000dc000000dc000000d800000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000003c000000e4000000e4000000e4000000e4000000e4000000e000000000000000c40000007c0000000000000000000000000000000000000084000000bc00000000000000000000000000000000000000180000005c0000005c0000005c0000005c0000005c0000005a00000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000001a00000064000000640000006400000064000000640000006200000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000003a000000dc000000dc000000dc000000dc000000dc000000d800000000000000c40000007c0000000000000000000000000000000000000084000000bc000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c40000007c0000000000000000000000000000000000000082000000f8000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000f90000007a000000000000000000000000000000000000001b0000005b0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005c0000005b000000180000000000000000000000";

var oIconMakeFS = {count: 0, width: 20, height: 20,
read: function(nBytes){return strDataMakeFSIcon.slice(this.count, this.count += nBytes);}};

var oButObjMakeFS = 
{cName: "MakeFrontSheetTool",
cExec: "MakeFrontSheet(event.target)",
cEnable: "event.rc = (app.doc != null)",
 //cMarked: "event.rc = ExistingFS(app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.FSExists",
cTooltext: "Make front sheet",
cLabel: "Front Sheet",
oIcon: oIconMakeFS,
nPos: 0
}

try{app.removeToolButton("MakeFrontSheetTool");}catch(e){}
try{app.addToolButton(oButObjMakeFS);}catch(e){}


