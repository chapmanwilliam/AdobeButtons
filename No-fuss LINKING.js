var pattern_link_label=/BLink/;




function WordStack(nDepth)
{
   this.aStack = []
   this.nDepth = nDepth;
   this.push = function(cIn)
   {
      this.aStack.push(cIn);
      if(this.aStack.length > this.nDepth)
        this.aStack.shift();
   }
   this.join = function(cLim)
   {
      return this.aStack.join(cLim);
   }
     
}

function QuadStack(nDepth)
{
   this.aStack = []
   this.nDepth = nDepth;
   this.push = function(aQdsIn)
   {
      this.aStack.push(aQdsIn);
      if(this.aStack.length > this.nDepth)
      {
        this.aStack.shift();
      }
   }

   this.MergeQuads = function()
   {
      var aRtn = [];
      for(var i=0;i<this.aStack.length;i++)
      {
         var aQds = this.aStack[i];
         for(var n=0;n<aQds.length;n++)
            aRtn.push(aQds[n]);
      }  
      return aRtn;
   }
     
}


var g_bDoPausePopup = false;
var g_nNumIncs = 0;
var g_nWrdInc = 0;
var g_nTotalWrds = 0;


var GetFilePath=app.trustedFunction(function(oDoc)
{
	 //Returns full file path if valid type
	app.beginPriv();

	 // Create the Text Field 
	var fld = oDoc.addField("tmpTxt","text",0,[0,0,0,0]); 
	 // Set up the Text field so the file dialog can be called 
	fld.fileSelect = true; 

	 // Display File Open Dialog 
	fld.browseForFileToSubmit(); 
	 // save the selected file path to a local variable 
	 // so it can be used later 
	var filePath = fld.value; 
	if (filePath=="") return "";  //i.e. user cancelled

	oDoc.removeField(fld.name);  //remove the temporary field 
	 //console.println(filePath);
	
	if(IsThisPDForDoc(filePath)){
		return filePath;
	} else {
		app.alert("Not a valid file type.");
		return "";
	}

	app.endPriv();
});


function GetPageNumberLastSubs(oDoc){
	 //returns the last page number of subs if it exists
	if(!ExistingSUBS(oDoc))return -1;
	 //Function returns true if existing TOC
	var d=[];
	var d=IdentifyPagesForDeletion(oDoc, /SUBS_/);
	if(d==null) return -1;
	if(d.length==0) return -1;
	var max_page=-1;
	for(var i=0;i<d.length;i++) if(d[i]>max_page)max_page=d[i];
	return max_page;
}

function IsThisPDForDoc(filePath){
	 //returns true if this pdf or doc
	var pat=/[.docx|.doc|.pdf]$/i;
	return pat.test(filePath);
}

function ExistingSUBS(oDoc){
	 //Function returns true if existing SUBS
	var pattern=/SUBS_/;
	var i=0;
	while(i<oDoc.numFields+1){
		var a=oDoc.getNthFieldName(i);
		 //console.println(a);
		if(pattern.test(a)){
			return true;	
		}			
		i++;
	}	
	return false;
}

function DeleteExistingSubmissions(oDoc){
	console.println("Deleting Submissions...");
	 //Delete old Front Sheet
	app.beginPriv();
	var d=[];
				
	var d=IdentifyPagesForDeletion(oDoc, /SUBS_/);
	DeletePages(oDoc, d);
	
	app.endPriv();
	return true;
	
}

function ExtensionPDF(path){
	m=path.match(/\.[^.]*$/);
	//console.println(m[0]);
	if(m[0]!=null){
	  return m[0]==".pdf" ? true : false;
	}
	return false;
}

function StripExtension(path){
		p=path.replace(/\.[^.]*$/,"");
		return p;
}

function StripName(p){
	//returns the path without the document name
	var pat=/\/[^\/.]+\.\w+$/
	var ret=p.replace(pat,"")+"/";
	//console.println(ret);
	return ret;
}

function GetNameFromPath(p){
	p=MakePathDeviceIndependent(p);

	var pat=/\/[^\/.]+\.\w+$/
	var ret=p.match(pat);
	
	if(ret!=null) {
			ret[0]=ret[0].substring(1,ret[0].length); //drop first /
		}else{
			console.println("Error getting name from path.");
			return null;
		}
	return ret[0];
}

function MakePathDeviceIndependent(path){
	//takes a string that is path and makes into device indepedent path i.e. forward slashes all the way
	var ret=path.replace(/[\\]/g,"/").replace(":",""); //replace backslashes with forward slash; delete colons
	if(ret.substring(0,1)!="/")ret="/"+ret; //add a leading forward slash if not there already
<<<<<<< HEAD
	//console.println("Original path: " + path);
	//console.println("Device i/p path: " + ret);
=======
	console.println("Original path: " + path);
	console.println("Device i/p path: " + ret);
>>>>>>> 9a8c3ab (first commit)
	return ret; 
}

function GetRelativePath(oDoc,f){
	//oDoc document object, f is string of path
	//Returns the relative path to f from oDoc 
	
	//First of all, find out if one path is within the other
	//Strip the names from both
	//console.println(f);
	//console.println(oDoc.path);
	f=MakePathDeviceIndependent(f);
	var f_stripped=StripName(f);
	var d_stripped=StripName(oDoc.path);
	f_stripped=f_stripped.substring(1,f_stripped.length-1); //drop first and last /
	d_stripped=d_stripped.substring(1,d_stripped.length-1); //drop first and last /
	
	//console.println("f: " + f_stripped + " " + f_stripped.length);
	//console.println("d: " + d_stripped + " " + d_stripped.length);
	
	var f_a=f_stripped.split("/"); //split into parts
	var d_a=d_stripped.split("/"); //split into parts

	//console.println("f: " + f_stripped + " " + f_a.length);
	//console.println("d: " + d_stripped + " " + d_a.length);

	
	var count=0; //because first one always matches two /
	for(var i=0;i<d_a.length;i++){
		if(f_a[i]==d_a[i])count++;
		//console.println(f_a[i] + " " + d_a[i] + " " + count);
	}
	//console.println("Count: " + count); 
	
	var rel_path="";
	var step_b=Math.max(d_a.length-count,0);	//How many do we need to step back
	//console.println("Step back: " + step_b); 
	for(var i=0; i<step_b;i++) rel_path+="../";
	for(var i=count;i<f_a.length;i++) rel_path+=f_a[i]+"/"; //step forward
	
	//add back the name
	var nm=GetNameFromPath(f);
	if(nm!=null){rel_path+=nm;} else {rel_path=f;} //add back name if found else return absolute path as received
	
	//console.println("Relative path: " + rel_path);
	return rel_path;
}

function BuildAbsolutePath(oDoc,f){
	//returns the absolute filepath based on the relative path
	//f=MakePathDeviceIndependent(f);
	var d_stripped=StripName(oDoc.path);
	var abs_path=d_stripped+f;
	return abs_path;
}

var mySaveAsPDF = app.trustedFunction(
   function(oDoc,cPath)
   {
   	app.beginPriv();
      try{
      	var m=StripExtension(cPath) + ".pdf";
      	//console.println(m);
         oDoc.saveAs(m);
      }catch(e){
         app.alert("Error During Save");
      }
    app.endPriv();
   }
);

var InsertSubmissions=app.trustedFunction(function(oDoc, f){
	//f is the relative path
	app.beginPriv();
	 //console.println(f);
	if (f=="")  return false;
	
	oDoc.info.SubsExist=DeleteExistingSubmissions(oDoc);  //in case they exist
	
	console.println("Inserting submissions");
	
	//console.println(f);
	
	var plat=app.platform;
	switch(plat){
		case "WIN":
			Fnt="SegoeUI";
			 //console.println("Win path " + pth);
		break;
		case "MAC":
			Fnt="LucidaSans"
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


			 //PUT THE PAGES INTO THE MAIN BUNDLE. WE STILL NEED TO ADD THE PAGE REFERENCES
			var oSubmissionsDoc;
			try{
				this.disclosed = true ;
				oSubmissionsDoc = app.openDoc({cPath:f, bHidden:true, bUseConv:true, oDoc: oDoc});
				oSubmissionsDoc.disclosed=true;
			}catch(e){
				console.println("No Submissions file found.");
				return;
			}
			
			if(!ExtensionPDF(f)) {  //if this is not a pdf then save it locally
				console.println("Saving pdf version of file for inserting file");
				try{
					var m=StripExtension(BuildAbsolutePath(oDoc,f))+".pdf"; //f is a relative path
					mySaveAsPDF(oSubmissionsDoc,m);  //save the file to make it pdf for sure
				}catch(e){
					console.println("Problem saving " + e);
					return;
				}
			}else{
				//Remove any links on the subs file
				console.println("Deleting links from imported submissions file...");
				DeleteLinks(oSubmissionsDoc);
			}

			
			var nSubmissionsPages = oSubmissionsDoc.numPages;

									
 //			var nStartPage = Number(1) - 1;  //Keeping it simple - always put before first page
			var nStartPage; 
			if (ExistingFS(oDoc)) {
				nStartPage=1;
			}else{
				nStartPage=0;
			}
			
			var NumPages=oDoc.numPages;
	
			 //place pages at the end
			oDoc.insertPages ({
				nPage: NumPages-1,  //insert after last pages
				cPath: oSubmissionsDoc.path,
			});
	
			var NewNumPages=oDoc.numPages;	
	
			 //place dummy copy at the end - this stops re-page labelling everything else
			oDoc.insertPages ({
				nPage: oDoc.numPages-1,  //insert after last pages
				cPath: oSubmissionsDoc.path,
			});
	
			oDoc.setPageLabels(NumPages, ["r", "SUBS_", 1]);  //set the page labels

	
	
			 //Now move them to the right place
			for (var i =1;i<=NewNumPages-NumPages;i++){
				oDoc.movePage(NewNumPages-1,nStartPage-1);
			}
			
 //			 //console.println(oDoc.numPages-nSubmissionsPages);
 //			 //console.println(oDoc.numPages);
			 //Now delete the dummy pages
			for(var i=0;i<nSubmissionsPages;i++){
				oDoc.deletePages(oDoc.numPages-1);
			}
			
		 //add an invisible field to the page to identify it as SUBS
			var inch=72;
			var nTxtSize=20;
			var wdth=getTextWidth(oDoc,0,nTxtSize,Fnt,false,"SUBS_")
			for (i=nStartPage;i<nStartPage+oSubmissionsDoc.numPages;i++){
					var aRect = oDoc.getPageBox( {nPage: i} );
					aRect[0] = aRect[2]-wdth-0.5*inch; // from upper left hand corner of page, upper left x
					aRect[2] = aRect[0]+wdth; // Make it wdth wide, lower right x
					aRect[1] = aRect[3]+.5*inch;  // upper left y
					aRect[3] = aRect[1] - 24; // and 24 points high, lower right y

					oFld = oDoc.addField("SUBS_"+i,"text", i, aRect);
					oFld.fillColor = color.transparent;
					oFld.width = 0;
					oFld.alignment = "right";
					oFld.textSize = nTxtSize;
					oFld.textFont = Fnt;	
					oFld.readonly=true;			
					oFld.value = "SUBS_";
					oFld.display=display.hidden;
			}
			
			
			oSubmissionsDoc.closeDoc(true);
			
			//oSubmissionsDoc.bringToFront();
				
			//oDoc.info.SubsPath=BuildAbsolutePath(oDoc,f);  //save the abs path for refreshing
			//oDoc.info.SubsRelPath=f;  //save the rel path for refreshing
			
			
			oDoc.pageNum=nStartPage;
			app.endPriv();	
			return true;	

});


var OpenLinkingFile=app.trustedFunction(function (oDoc){
	app.beginPriv();
	//returns the linking file doc or null
	console.println("Opening up external file... " + oDoc.info.RelLinkingFile + " " + oDoc.path);
			try{
				oDoc.disclosed = true ;
				LinkingFileDoc = app.openDoc({cPath:oDoc.info.RelLinkingFile, bHidden:true, oDoc: oDoc});
				LinkingFileDoc.addScript("Disclosed", "this.disclosed = true;");
				LinkingFileDoc.saveAs(LinkingFileDoc.path);
				//LinkingFileDoc.closeDoc({bNoSave: true});
				console.println("Successfully opened up external file... "+ oDoc.info.RelLinkingFile);
				return LinkingFileDoc;
			}catch(e){
				console.println("No such file found: "  + oDoc.info.RelLinkingFile);
				app.alert("No such external file found:\n\n" + oDoc.info.RelLinkingFile);
				return null;
			}
	app.endPriv();	
});

function RefreshLinking(oDoc){ //this refreshes everything by re-importing the submissions file
	app.beginPriv();
	//console.println("Got here");
	if(!oDoc.info.LinkingExists) return false;
	if(!oDoc.info.SubPath || !oDoc.info.SubsExist){console.println("No submissions exist."); RefreshLinkingOnly(oDoc);return false;}  //just refresh links if path not defined or no subs already
	console.println("Refresh linking " + oDoc.info.RelLinkingFile);
	
	//oDoc.info.SubsExist=!DeleteExistingSubmissions(oDoc);  //delete the existing subs

	//Try inserting submissions
	if(!InsertSubmissions(oDoc, oDoc.info.SubRelPath)) { //insert the subs file. Exit if it is bad.
		app.alert("File not found:\n\n" + oDoc.info.SubRelPath);
		return false;
	} 
	oDoc.info.SubsExist=true;  //flag that we have submissions inserted

	var LinkingFileDoc=null;

	if(typeof(oDoc.info.bWhole)=="undefined" || typeof(oDoc.info.LinkingFile)=="undefined" || typeof(oDoc.info.bThisFile)=="undefined"){ //exit if these parameters not defined
		console.println("Error refreshing links: key variables undefined.");
		return false;
	} 
	
	if(!oDoc.info.bThisFile){ //open up the linked file and close it to see it exists
		LinkingFileDoc=OpenLinkingFile(oDoc);
		if(LinkingFileDoc==null) return false;
	}

//	var page_data=[];
//  	BuildPageData(oDoc,page_data, oDoc.info.bWhole);
//	oDoc.info.LinkingExists=Linking(oDoc, page_data,LinkingFileDoc);
	oDoc.info.LinkingExists=Linking(oDoc);
	
	console.println("Links refreshed");
	app.endPriv();
	return true;
}

function RefreshLinkingOnly(oDoc){ //this simply updates the links without re-importing the submissions file
	app.beginPriv();
	
	console.println("Refreshing links (without inserting subs)");
	
		var LinkingFileDoc=null;
	
		if(!oDoc.info.bThisFile){ //open up the linked file and close it to see it exists
			LinkingFileDoc=OpenLinkingFile(oDoc);
			if(LinkingFileDoc==null) return false;
		}


//	var page_data=[];
//  	BuildPageData(oDoc,page_data, oDoc.info.bWhole);
//	oDoc.info.LinkingExists=Linking(oDoc, page_data,LinkingFileDoc);
	oDoc.info.LinkingExists=Linking(oDoc);

	console.println("Finished refreshing links (without inserting subs)");

	app.endPriv();
}


var NF_DoLinking = app.trustedFunction(function(oDoc)
{
	app.beginPriv();
<<<<<<< HEAD
	if(!CheckPermitted())return false;
=======
	if(!CheckLicence())return false;
>>>>>>> 9a8c3ab (first commit)
	var PgNow=oDoc.pageNum;	
	
	//var page_data=[];
  	//BuildPageData(oDoc,page_data,false);
  	//console.println("Length page_data " + page_data.length);

   	if(ExistingSUBS(oDoc)){
   		oDoc.info.SubsExist=!DeleteExistingSubmissions(oDoc);
   		oDoc.info.LinkingExists=LinksExist(oDoc);
   		oDoc.pageNum=0;
   		app.endPriv();
   		console.println("Deleted subs");
   		return;
   	}
   	
	var f=GetFilePath(oDoc);  //get file path from user input
	if(f=="") return false;

	oDoc.info.SubPath=f;
	oDoc.info.SubRelPath=GetRelativePath(oDoc,f);

	if(!InsertSubmissions(oDoc, oDoc.info.SubRelPath)) return false;  //insert the file. Exit if it is bad.
	oDoc.info.SubsExist=true;  //flag that we have submissions inserted
	
	//Linking(oDoc, page_data, null);
	
	if (ExistingFS(oDoc)) { //set page to the page where inserts go depending on if there is a front-sheet
			oDoc.pageNum=1;
		}else{
			oDoc.pageNum=0;
	}
	
	//oDoc.pageNum=PgNow;
	
	return true;
	
   app.endPriv();
});

//function Linking(oDoc, page_data, LinkingFileDoc){
function Linking(oDoc){
	app.beginPriv();
	
     oDoc.info.LinkingExists=!DeleteLinks(oDoc);  //remove the existing links if any

     console.println("Linking submissions");
     
 	var LinkingFileDoc=null;
		
	if(!oDoc.info.bThisFile){ //open up the linked file and close it to see it exists
		LinkingFileDoc=OpenLinkingFile(oDoc);
		if(LinkingFileDoc==null) return false;
	}
	
	var page_data=[];
	   	
	BuildPageData(oDoc,page_data, oDoc.info.bWhole);

     
    var ret=FindAndMarkWords(oDoc,"(([\\d\\w]+\\-)?(\\w+)?\\d+(\\w+)?|(?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3}))",true,true, page_data, LinkingFileDoc);  //regular page labels
    
   	 if(!oDoc.info.bThisFile) LinkingFileDoc.closeDoc({bNoSave: true});
     
     oDoc.dirty=true; //to indicate file has changed
     
     app.endPriv();
     
     return ret;
}

function AnalyzePages(oDoc,page_data){
     var myThermem = app.thermometer;
     myThermem.duration = oDoc.numPages;
     myThermem.text = "Analyzing";
     myThermem.value = 0;
     myThermem.begin();
     
     g_nTotalWrds = 0;
     var page_count=0;
     for(var nPg=0;nPg<oDoc.numPages;nPg++){
	    myThermem.text = "Analyzing Page " + (nPg+1).toString();
    	myThermem.value = nPg+1;
     	if (page_data[nPg]){
     		//console.println("This page for linking " + nPg);
	       g_nTotalWrds += oDoc.getPageNumWords(nPg);
	       page_count++;
	    }
     }
     myThermem.end();
	
	return page_count;
}

function MapPageLabelstoPages(oDoc, aPageMap){
	 //This function fills an array with PageLabel and PageReference for all pages
	for (var i=0;i<oDoc.numPages;i++){
			var PgLabel=oDoc.getPageLabel(i).toString();
			 //console.println("Adding: Label: " + PgLabel + " Page " + i);
			aPageMap[PgLabel]=i;
	}
}

function MapLegalNum(Bm, nLevel, oDoc, aLNMap){
	 //iterate through the bookmarks and map
	if(typeof(Bm)=="undefined" || Bm==null)return;
	if(Bm.name!="Root"){
		var l=GetLegalNumber(Bm);
		if (l!=null) {
			oDoc.pageNum = 0;
			Bm.execute();
			Pg = oDoc.pageNum;
			 //console.println("Adding: Tab " + l + " Page " + Pg);
			aLNMap[l]=Pg;
		}
	}

	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			MapLegalNum(Bm.children[i], nLevel + 1, oDoc, aLNMap);
		}
	}
	return false;	
}

function IsThisSubmissionPage(oDoc, i, page_data){
	 //returns true if this is a submission page on page i
	 //console.println("Here " + i);
	 //console.println(page_data[i]);
	return pattern_SUBS.test(oDoc.getPageLabel(i)) || page_data[i];
}

function DeleteLinks(oDoc){
	console.println("Deleting any existing links on the submissions...");
			var t=app.thermometer;
			t.duration=oDoc.numFields;
			t.begin();
			var count=0;
			var flag=true;  //flag for success of function, true by default

			var i=0;
			while(i<oDoc.numFields){
				var a=oDoc.getNthFieldName(i);
				if(pattern_link_label.test(a)){
					oDoc.removeField(a);
					oDoc.dirty=true; //to indicate file has changed
					count++;
					t.value=count;
					t.text= "Deleting links from page " + (count+1) + " of " + oDoc.numFields + " fields";
					if (t.cancelled){
						flag=false;
						break;
					}
					i--;
				}			
				i++;
			}
			t.end();
			 //oDoc.info.PaginationExists=false;
			return flag;
}

function GetPageFromLabel(cWrd, aPageMap){
	 //Returns the page from the word. Returns -1 if there is no match
	var Pg=aPageMap[cWrd.trim()];
	 //console.println("Label : " + cWrd + " Page : " + Pg);
	if (typeof(Pg)!="undefined") {return Pg;} else {return -1;}
}

function GetPageFromLNLabel(cWrd, aLNMap){
	 //returns the page from the word where the word refers to the label
	var Pg=aLNMap[cWrd.trim()];
	 //console.println("Tab : " + cWrd + " Page : " + Pg);
	if (typeof(Pg)!="undefined") {return Pg;} else {return -1;}
}

var FindAndMarkWords = app.trustedFunction(function(oDoc,cSearch,bRegExp,bCase, page_data, LinkingFileDoc)
{
   	console.println("Finding page references");
   	var no_pages=AnalyzePages(oDoc,page_data);
    console.println("No pages for linking is: " + no_pages + ". No words for linking is: " + g_nTotalWrds);
    if(no_pages==0){
     app.alert("No pages selected for hyperlinking.");
     return false;
    }
   var PgNow=oDoc.pageNum;	
   
   var aPageMap=[];
   (LinkingFileDoc==null || LinkingFileDoc=="") ? MapPageLabelstoPages(oDoc,aPageMap): MapPageLabelstoPages(LinkingFileDoc,aPageMap);
   var aLNMap=[];
   (LinkingFileDoc==null || LinkingFileDoc=="") ? MapLegalNum(oDoc.bookmarkRoot,0,oDoc,aLNMap):  MapLegalNum(LinkingFileDoc.bookmarkRoot,0,LinkingFileDoc,aLNMap); 
   oDoc.pageNum=PgNow;		

   
   var flag=0;  //0=no pages flagged, 1= one page flagged 2= several pages flagged
   var joined_words=false;
   var ref_type=0;
   var count_flag=0;
   var aSrchWrds = cSearch.split(/\s+/);
   
   var rgSrchExp;
   if(bRegExp)
   {
     var cRg = cSearch.replace(/^\/?/,"/").replace(/(\/[ig]?)?$/,"/");
     if(bCase)
       cRg+="i";
     rgSrchExp = eval(cRg);
   }
   else
     rgSrchExp = new RegExp(aSrchWrds.join("\\s*"),bCase?"":"i");
          
   var oWdStack = new WordStack(aSrchWrds.length);
   
   var nFound = 0;
   app.beginPriv();

   var myThermem = app.thermometer;
   myThermem.duration = g_nTotalWrds;
   myThermem.text = "Find & link";
   myThermem.value = 0;
   myThermem.begin();
   
    var nWrdCnt = 0;
    var nIncCnt = 0;
    var nTmpInc = 0;
    var nProg = 0;
    var Pg_ref_count=0; //for counting progress through pages we reference
    var nStartTime = (new Date()).getTime();
    var nNewTime = nStartTime;
   
    for(var nPg=0;nPg<oDoc.numPages;nPg++){
		if (page_data[nPg]){
			Pg_ref_count++;
	       var nWrds = oDoc.getPageNumWords(nPg);
    	   for(var nWd=0;nWd<nWrds;nWd++) {
    	    nWrdCnt++;
    	    if(!IsThisInFooter(oDoc,nPg,nWd)){
	        	var cWrd = oDoc.getPageNthWord(nPg,nWd, true);
    	    	var cWrdPlus = oDoc.getPageNthWord(nPg,nWd, false);
        	
        		if(TerminatingSlash(cWrd,cWrdPlus) && flag!=0){ //i.e. we are looking at pages and the word has a terminating /
        			//then join this word with the next word and change the slash to a -
        			var next_cWrd=oDoc.getPageNthWord(nPg,nWd+1, true);
        			var next_cWrdPlus=oDoc.getPageNthWord(nPg, nWd+1, false);
        			//combine
        			var res_cWrd=cWrd+"-"+next_cWrd;
        			var res_cWrdPlus=cWrdPlus+next_cWrdPlus;
        			//assign to cWrd and cWrdPlus
        			cWrd=res_cWrd;
        			cWrdPlus=res_cWrdPlus.replace("/","-");
        			//increment the word count
        			nWd++;
        			joined_words=true;
        		}
        		//console.println("Short word: " + cWrd);
        		//console.println("Full word: " + cWrdPlus);
        		//flag if this is the start of singular or plural references; set the count_flag to zero
        		if (cWrd.toUpperCase()=="PAGE" || cWrd.toUpperCase()=="TAB" || cWrd.toUpperCase()=="PG") {flag=1; count_flag=0;}
        		if (cWrd.toUpperCase()=="PAGES" || cWrd.toUpperCase()=="TABS" || cWrd.toUpperCase()=="PGS") {flag=2; count_flag=0;}

				//set the type of reference
   		     	if (cWrd.toUpperCase()=="PAGE" || cWrd.toUpperCase()=="PAGES") {ref_type=1;}
   		     	if (cWrd.toUpperCase()=="TAB" || cWrd.toUpperCase()=="TABS") {ref_type=2;}
   		     	if (cWrd.toUpperCase()=="PG" || cWrd.toUpperCase()=="PGS") {ref_type=3;}
    	    	//console.println("Flag " + flag + ", Ref_type " + ref_type);
    	      	oWdStack.push(cWrd);
 	         	if(rgSrchExp.test(oWdStack.join(" ")))
    	      	{
        	  		if(flag>0){  //i.e. we have a previous flag
	        	    	nFound++;
             			SetButton(oDoc,ref_type, cWrd,cWrdPlus, nPg,nWd, nFound, aPageMap,aLNMap,joined_words, LinkingFileDoc);
             			joined_words=false;
             			if (flag==1 || HasTerminatingCharacter(cWrd,cWrdPlus)) flag=0;  //i.e. we reset the flag if single page match
             		}
          		}else{
          			if(cWrd.toUpperCase()!="AND" || flag==1)count_flag=count_flag+1;
          			if(flag>0 && count_flag>1)flag=0; //reset the flag if intervening non-page word
          		}
          
        
				  	 // Update Progress
		   	         //if((++nIncCnt)>g_nWrdInc) 	      {
        		     myThermem.text = "Hyperlinking: Page " + (Pg_ref_count).toString() + "/" + no_pages+", Word " + nWrdCnt+ "/" + g_nTotalWrds;
            		 myThermem.value = nWrdCnt;
             		 //nIncCnt = 0;
          			//}
          	} //loop end for words not in the footer
       } //loop end for each word on the page
     } //loop end if this page is to be looked at
    } //loop end of each page
    
    
    myThermem.end();
    //myThermem.end();

   	console.println("Finished finding page references");
   app.endPriv();
   return true;
});

function IsThisInFooter(oDoc,nPg,nWd){
	//returns true if word is in the footer
	//defined as top of rect being in bottom 10% of page
	var lrect=GetRect(oDoc,nPg,nWd);
	var pg_rect=oDoc.getPageBox({nPage:nPg});
	var height_pg=pg_rect[1]-pg_rect[3];
	var limit=0.1*height_pg;
	if(lrect[1]<limit)return true; //i.e. Top is less than 100
}

function GetPage(ref_type, cWrd, aPageMap, aLNMap){
	var P=-1;
	switch (ref_type){
       case 1:  //"Page" or "Pages"
       	P=GetPageFromLabel(cWrd, aPageMap);
       	//console.println("Page ref: " + cWrd + " Page " + P);
       break;
       case 2: //"Tab" or "Tabs"
       	P=GetPageFromLNLabel(cWrd, aLNMap);
       	//console.println("Tab: " + cWrd + " Page " + P);
       	break;
       case 3: //"Pg" or "Pgs"
       	P=GetPageFromLNLabel(cWrd, aPageMap);
       	//console.println("Page ref: " + cWrd + " Page " + P);
       	break;
       default:
        //shouldn't get here
       	console.println("Type reference error.");
       	P=-1;
       	break;
  	}
  	return P;
}

function SetButton(oDoc, ref_type, cWrd,cWrdPlus, nPg,nWd,nFound, aPageMap,aLNMap,joined_words, LinkingFileDoc){
	var P=GetPage(ref_type,cWrd,aPageMap,aLNMap);
    //console.println("Ref_type " + ref_type+ ": The Page is " + P);
 
	if(P==-1)return;
	console.println("This word " + cWrd);
	var lrect=GetRect(oDoc,nPg,nWd);
    if(joined_words){lrect=MergeRects(lrect,GetRect(oDoc,nPg,nWd-1));}
   	
	//var cWrd = oDoc.getPageNthWord(nPg,nWd, true);
    //var cWrdPlus = oDoc.getPageNthWord(nPg,nWd, false);
   	var w1=getTextWidth(oDoc,nPg,12,GetFont(),false,cWrd);
   	var w2=getTextWidth(oDoc,nPg,12,GetFont(),false,cWrdPlus);
   	var w3=getTextWidth(oDoc,nPg,12,GetFont(),false,"-");
   	var w_ratio=w1/w2;
   	console.println("Words now: " + cWrd + " " + cWrdPlus);
	console.println("Before: L " + lrect[0] + " R " + lrect[2]);
   	console.println("Ratio " + w_ratio);
	var width=lrect[2]-lrect[0];
	var r_width=width*w_ratio;
	console.println("Width " + width + " Revised width " +r_width)
	lrect[2]=lrect[0]+r_width;
	console.println("After: L " + lrect[0] + " R " + lrect[2]);
   	
   	
   	

	var nm="BLink_"+nPg.toString()+"_"+nFound.toString();
	var button_field=oDoc.addField(nm,"button",nPg,lrect);
    button_field.borderStyle=border.u;
	button_field.borderWidth=1;
    button_field.display=display.noPrint;
    button_field.strokeColor=color.red;
    var code="";
    var q=String.fromCharCode(34);
    if(LinkingFileDoc!=null) code="NFPageOpen(this, "+P.toString()+");";
    (LinkingFileDoc==null) ? button_field.setAction("MouseDown","this.pageNum= " + P.toString()+";") : button_field.setAction("MouseDown",code);
}


function GetRect(oDoc, nPg,nWd){
    //gets rectangle for nWd on nPg for this oDoc
    var Qds = oDoc.getPageNthWordQuads(nPg,nWd);
    var q=Qds.toString().split(",");
	//Left, Top, Right, Bottom
	var lrect=[parseInt(q[0],10), parseInt(q[1],10), parseInt(q[2],10),  parseInt(q[5],10)];



	return lrect;
}

function MergeRects(rect_1, rect_2){
	//Left, Top, Right, Bottom
    //var lrect=[parseInt(q[0],10), parseInt(q[1],10), parseInt(q[2],10),  parseInt(q[5],10)];
	var l=Math.min(rect_1[0],rect_2[0]); //Left
	var t=Math.max(rect_1[1],rect_2[1]); //Top
	var r=Math.max(rect_1[2],rect_2[2]); //Right
	var b=Math.min(rect_1[3],rect_2[3]); //Bottom
	var res_rect=[l,t,r,b];
	return res_rect;
}

function TerminatingSlash(cWrd,cWrdPlus){
	//returns true if the word w has a terminating /
	//a terminating character is:
	//	- anything but a comma or a dash
	
	//First substract the short version CWrd from CWrdPlus to leave the terminating character(s)
	var res=cWrdPlus.replace(cWrd,"").trim();
	if(res=="/") {
		return true;
	}else{
		return false;
	}
}


function HasTerminatingCharacter(cWrd,cWrdPlus){
	//returns true if the word w has a terminating character(s)
	//a terminating character is:
	//	- anything but a comma or a dash
	
	//First substract the short version CWrd from CWrdPlus to leave the terminating character(s)
	var res=cWrdPlus.replace(cWrd,"").trim();
	//console.println("Short " + cWrd + " Long " + cWrdPlus + " Terminating " + res);
	if(res!="," && res!="-") {
			//console.println("Therefore terminating");
			return true;
		}else{
			//console.println("Therefore NOT terminating");
			return false;
		} 
}

function LinksExist(oDoc){
	//returns true if there are hyperlinks
	for(var i=0;i<oDoc.numFields;i++){
		var a=oDoc.getNthFieldName(i);
		if(pattern_link_label.test(a)) return true;
	}
	return false;
}








 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7AddLinking = 
"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001a000000d3000000d8000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b000000da000000ff000000ff000000e000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001b000000db000000ff000000f8000000f7000000ff000000e00000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c000000db000000ff000000f80000004b00000044000000f6000000ff000000e0000000200000000000000000000000000000000000000000000000000000000000000000000000000000001c000000db000000ff000000f80000004b000000000000000000000043000000f6000000ff000000e0000000200000000000000000000000000000000000000000000000000000000000000000000000cd000000ff000000f80000004b0000000000000000000000000000000000000042000000f6000000ff000000d70000000000000000000000000000000000000000000000000000000000000000000000c3000000f80000004b0000002d000000850000001700000000000000000000004e000000fa000000ff000000cc0000000000000000000000000000000000000000000000000000000000000000000000130000004200000032000000ee000000ff00000081000000000000004f000000fa000000ff000000d500000016000000000000000000000000000000000000001c000000cd000000c3000000130000000000000032000000ee000000ff000000ea0000002800000050000000fa000000ff000000d500000017000000000000000000000000000000000000001b000000db000000ff000000f80000004200000032000000ee000000ff000000ea0000002d00000051000000fa000000ff000000d600000017000000000000000000000000000000000000001b000000db000000ff000000f80000004b00000032000000ee000000ff000000ea0000002d00000046000000fa000000ff000000d600000017000000000000000000000000000000000000001b000000da000000ff000000f80000004b0000002d000000ee000000ff000000ea0000002d0000000000000013000000c2000000c700000018000000000000000000000000000000000000001a000000da000000ff000000f80000004b0000000000000085000000ff000000ea0000002d00000046000000130000000000000000000000000000000000000000000000000000000000000000000000d3000000ff000000f80000004b000000000000000000000017000000810000002800000050000000fa000000c20000000000000000000000000000000000000000000000000000000000000000000000d8000000ff000000f7000000440000000000000000000000000000000000000050000000fa000000ff000000c7000000000000000000000000000000000000000000000000000000000000000000000020000000e0000000ff000000f60000004300000000000000000000004f000000fa000000ff000000d60000001800000000000000000000000000000000000000000000000000000000000000000000000000000020000000e0000000ff000000f6000000420000004f000000fa000000ff000000d600000017000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000e0000000ff000000f6000000fa000000ff000000d5000000170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000e0000000ff000000ff000000d50000001600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000d7000000cc00000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconAddLinking = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconAddLinking = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7AddLinking.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdAddLinking = 
"NF_DoLinking(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjLinking = 
{cName: "Linking",
cExec: DoCmdAddLinking,
cEnable: "event.rc = (app.doc != null)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.SubsExist",
cTooltext: "Insert document for hyperlinking page references",
cLabel: "Insert doc for linking",
nPos: -1};
 //</JSCodeSnippet>
if(oIconAddLinking != null)
    oButObjLinking.oIcon = oIconAddLinking;

try{app.removeToolButton("Linking");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjLinking);
}catch(e)
{
}
 //</JSCodeSnippet>
 
 //</AcroButtons>
