
var aTOCTextSizes = [15];
var nDefaultTextSize = 11;


//var Fnt;  //different font required for windows and mac

 // // //
 //  Function for finding the point width of a particular text string, 
 //  and set of text parameters
function getTextWidth(oDoc,nPage,nSize,cFont,bBold,cTxt)
{
        var oTstAnt = oDoc.addAnnot({page:nPage, type:"Line", points:[[100,200],[110,200]], 
                                     doCaption:true,rotate:oDoc.getPageRotation(nPage),
                            richContents:[{textSize:nSize,text:cTxt,
                                           fontFamily:cFont,fontWeight:bBold?700:400 }]
                                   });
         // Correct for page Rotation
        var bxRot = (new Matrix2D()).fromRotated(oDoc,nPage).invert().transform(oTstAnt.rect);
        var bxWdth = Math.abs(bxRot[2] - bxRot[0])-10;
		oTstAnt.destroy()
		return bxWdth;
}

nHelvReplacementScale = 10.8/1  // Helvetica 10.8 is reasonably equivelant to LucidaSans 11
nFillerWidth = 5.6  // Filler text is " ." at a size of 1

function PutBookmarkTOCLines(oDoc,rpt,nPgWdth,nPgHght,nIndent,nLvlMax,aSizes,bkmks,nLvl,aBkmkData,cParentPath)
{

   var Fnt=GetFont(0);

   var nNmLen,nFill,cTxt,aLnRct;
   if(typeof(arguments.callee.nLastPos) == "undefined")  {
      arguments.callee.nLastPos = nPgHght;
	  arguments.callee.nPage = 0;
   }	  
   	  
   if(aSizes[nLvl-1] == null)
      aSizes[nLvl-1] = 11;
	  
   var nRptSize = aSizes[nLvl-1]/11;
   rpt.size = nRptSize;

    // Scale report text size to measuring size (Helvetica replacment)
   var nRplcSize = nRptSize*nHelvReplacementScale;
   var nScaledFiller = nRptSize * nFillerWidth;
   
	for(var i=0;i<bkmks.length;i++)	{
			
		if (bkmks[i].style!=1){  //if this bookmark is not italicised, then include it.
		
			 //console.println(bkmks[i].name);
			
			arguments.callee.oProg.value++;
			arguments.callee.oProg.text = "Bookmark #" + arguments.callee.oProg.value;
			 //Remove [page number]
			cTxt = bkmks[i].name.replace(pattern_toggle_page_label,"").replace(pattern_toggle_braces_label,"");
			//console.println(cTxt);
			nNmLen =  getTextWidth(oDoc,oDoc.numPages-1,nRplcSize,Fnt,false,cTxt);
			nFill = (nPgWdth - nNmLen - 10)/nScaledFiller;
			for(var n=0;n<nFill;n++)
				cTxt += " .";

			rpt.size = nRptSize;
			if (nLvl==1){
				rpt.color=color.blue;
			}else{
				rpt.color=color.black;
			}
			aLnRct= rpt.writeText(cTxt);

		   // Detect Page Change
			if((aLnRct[3] > arguments.callee.nLastPos) || (aLnRct[3] == aLnRct[1]))
				arguments.callee.nPage++;
		
			 // Correct for missed line
			if(aLnRct[3] == aLnRct[1])
			{
				aLnRct[3] = nPgHght - 36;
				aLnRct[1] = nPgHght - 36 - aSizes[nLvl-1];
			}
		
			arguments.callee.nLastPos = aLnRct[3];
			
			//console.println("line rect: "+aLnRct);
		
			rpt.size = nRptSize/2;
			aSpRct = rpt.writeText(" "); //create a small line of spaces
			
			aBkmkData.push({cName:bkmks[i].name.replace(pattern_toggle_page_label,"").replace(pattern_toggle_braces_label,""),rect:aLnRct, nLevel:nLvl, nBkPg:arguments.callee.nPage, nTextSize:aSizes[nLvl-1]});
	  
	  		 //console.println(i);
			if((nLvl < nLvlMax) && (bkmks[i].children))
			{
				rpt.indent(nIndent);
				PutBookmarkTOCLines(oDoc,rpt,nPgWdth - nIndent,nPgHght,nIndent,nLvlMax,aSizes,bkmks[i].children,nLvl + 1, aBkmkData,cParentPath + ":"+i);
				rpt.outdent(nIndent);
				rpt.size = nRptSize;
			}
		}
   	}
   return aBkmkData;
}

function FindBookmarkPages_s(oDoc,aBkmks,nLvlMax,nLvl,aData)
{
    console.println("Starting Finding Bookmarks");
   
   if(nLvl == 1)
      arguments.callee.nIdx = 0;
	  
   var nTgtPage1 = 0;
   for(var i=0;i<aBkmks.length;i++)
   {
	 if (aBkmks[i].style!=1){  //skip the italicised ones
        // Find Target Page for Bookmark
        console.println(aBkmks[i].name);
		oDoc.pageNum = 0;
		aBkmks[i].execute();
		nTgtPage1 = oDoc.pageNum;
	   
		oDoc.pageNum = oDoc.numPages-1;
		aBkmks[i].execute();
		nTgtPage2 = oDoc.pageNum;
		if((nTgtPage1 == nTgtPage2) || (nTgtPage1 && Math.abs(nTgtPage2 - nTgtPage1)<2))
		{
			aData[arguments.callee.nIdx].nTargetPg = nTgtPage2;
			aData[arguments.callee.nIdx].cView = oDoc.viewState.toSource();
			console.println("Target: " + nTgtPage2);
		}
		
		console.println("Argument index " + arguments.callee.nIdx)
		arguments.callee.nIdx++;

		if((nLvl < nLvlMax) && (aBkmks[i].children))
		{
			FindBookmarkPages_s(oDoc,aBkmks[i].children,nLvlMax,nLvl+1,aData)
		}
	 }
   }
   return arguments.callee.nIdx;
}

function FindNumBks(aBkmks,nLvlMax,nLvl)
{
   if((typeof(nLvl) == "undefined") || (nLvl == null)) nLvl = 1;
   if(aBkmks==null) return 0;
     
   var nCount = 0;
   for(var i=0;i<aBkmks.length;i++)
   {
		nCount++;
		if((nLvl < nLvlMax) && (aBkmks[i].children))
		{
			nCount += FindNumBks(aBkmks[i].children,nLvlMax,nLvl+1)
		}
   }
   return nCount;
}


function FindMaxBkDepth(oBkmk,nLvl)
{
    var nMax = 0, nRtn;
    if(typeof(nLvl) == "undefined")
        nMax = nLvl = 0;
	else 
		nMax = nLvl;
		
    if(oBkmk==null) return 0;
		
	if(oBkmk.children && oBkmk.children.length)
	{

		for(var i=0;i<oBkmk.children.length;i++)
		{
			nRtn = FindMaxBkDepth(oBkmk.children[i],nLvl+1);
			if(nRtn > nMax)
				nMax = nRtn;
		}
	}
	return nMax;
}


function GetFontForFields(sty){
	var plat=app.platform;
 //	 //console.println("Console: " + plat);	
	var f;
	switch(plat){
		case "WIN":
			switch (sty){
				case 0: //plain
					f=font.Helv;
				break;
				case 1: //italics
					f=font.HelvI;
				break;
				case 2: //bold
					f=font.HelvB;
				break;
				case 3: //italics & bold
					f=font.HelvBI;
				break;
				default:
					//shouldn't get here
					console.println("Style out of range");
					return font.Helv;
				break;
			}
		break;
		case "MAC":
			switch (sty){
				case 0: //plain
					f=font.Helv;
				break;
				case 1: //italics
					f=font.HelvI;
				break;
				case 2: //bold
					f=font.HelvB;
				break;
				case 3: //italics & bold
					f=font.HelvBI;
				break;
				default:
					//shouldn't get here
					console.println("Style out of range");
					return font.Helv;
				break;
			}
		break;
		case "UNIX":
			app.alert("Not designed for this platform.");
			return "";
		break;
		default:
			app.alert("Not designed for this platform.");
			return "";
		break;
	}	
	
	return f;

}

function GetFont(sty){
	var plat=app.platform;
 //	 //console.println("Console: " + plat);	
	var f="";
	switch(plat){
		case "WIN":
			f="SegoeUI";
		break;
		case "MAC":
			f="LucidaSans"
		break;
		case "UNIX":
			app.alert("Not designed for this platform.");
			return "";
		break;
		default:
			app.alert("Not designed for this platform.");
			return "";
		break;
	}	

	return f;
}

function GetFontType(f){
	var cFontType;
	cFontType=f;
    if(cFontType == "Times Roman")
       cFontType = "Times";
    return cFontType;
}


var No_FussMakeTableOfContents = app.trustedFunction(function(oDoc)
{
<<<<<<< HEAD
	if(!CheckPermitted())return;
=======
	if(!CheckLicence())return;
>>>>>>> 9a8c3ab (first commit)

   app.beginPriv();
	
	if (ExistingTOC(oDoc)) { 
		 //console.println("This place");	
		if(DeleteOldTable(oDoc)) oDoc.info.TOCExists=false;  //i.e. set flag to false if we successfully delete TOC
		return;
	}
		
	var Fnt=GetFont(0);


	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	
	if(nDepth > 0){
		var bPageLb=true;
		
		TOCBkDlg.strTitle = (oDoc.info.TOCTitle ? oDoc.info.TOCTitle : "Contents " + oDoc.documentFileName.replace(/\.pdf$/i,""));
		TOCBkDlg.bPageLabel=bPageLb;
		TOCBkDlg.bSepFile=(oDoc.info.SepFile ? oDoc.info.SepFile: false);
		TOCBkDlg.nLvlMax = nDepth.toString();
		 //Keep the persistent nLevel within bounds
		if(oDoc.info.TOCnLevel){
			if(oDoc.info.TOCnLevel<1) oDoc.info.TOCnLevel=1;
			if(oDoc.info.TOCnLevel>nDepth) oDoc.info.TOCnLevel=nDepth;
		}

		TOCBkDlg.nLevel = (oDoc.info.TOCnLevel ? oDoc.info.TOCnLevel.toString() : nDepth.toString());
		TOCBkDlg.nPgMax = oDoc.numPages.toString();
		TOCBkDlg.nInsertAt = "1";

		if("ok" == app.execDialog(TOCBkDlg)){
									
			oDoc.info.TOCTitle=TOCBkDlg.strTitle;
			oDoc.info.TOCnLevel=parseInt(TOCBkDlg.nLevel,10);
			oDoc.info.SepFile=TOCBkDlg.bSepFile;

			oDoc.info.TOCExists=AddTOC(oDoc);  //set flag to true if we successfully add TOC
			
			}

		}else{
			app.alert("Cannot Create Table of Contents because there are no Bookmarks",1);
		}
		
   	app.endPriv();
});

function AddTOC(oDoc){

	app.beginPriv();

			var nLevel= (oDoc.info.TOCnLevel ? oDoc.info.TOCnLevel : FindMaxBkDepth(oDoc.bookmarkRoot));
			if (nLevel<1)  return false;  //exit false if no bookmarks
			//console.println(nLevel);
			var nNumBks = FindNumBks(oDoc.bookmarkRoot.children, nLevel);
			 var pgRect = oDoc.getPageBox("Crop",0);
			 //console.println("Rect 1: " + pgRect);
			//var pgRect=[];
			pgRect[0]=0;
			pgRect[1]=841.9199829101562;
			pgRect[2]=595.3200073242188;
			pgRect[3]=0;
			
			var pgWidth =  pgRect[2] - pgRect[0];
			var pgHeight =  pgRect[1] - pgRect[3];
			
			oDoc.newPage(oDoc.numPages,pgWidth, pgHeight);  //add a page of fixed size to the end for comparison

			 //console.println("Rect 2" + pgRect);
			 //oDoc.info.TOCTitle=TOCBkDlg.strTitle;
			 //oDoc.info.TOCnLevel=parseInt(nLevel,10);

			 //Write the report
			var rpt = new Report(pgRect);
			rpt.size = 2;
			var title_rect=rpt.writeText(oDoc.info.TOCTitle ? "+ "+ oDoc.info.TOCTitle: "+ Contents");
			//rpt.size = 1;
			rpt.divide();
			//file paths
			rpt.size=0.7;
			for (var i=0; i<filepaths.length;i++) {filepaths[i].rect=rpt.writeText("- " + filepaths[i].path); rpt.writeText(" ");}
			rpt.size=1.0;
			rpt.writeText(" ");
			var aData = [];
			PutBookmarkTOCLines.nLastPos = pgHeight;
      
			app.thermometer.duration = nNumBks;
			app.thermometer.text = "Bookmark #1";
			app.thermometer.value = 0;
			app.thermometer.begin();
			PutBookmarkTOCLines.oProg = app.thermometer;
			PutBookmarkTOCLines.nPage = 0;
			 //console.println("Got here first")
			var aTOCData = PutBookmarkTOCLines(oDoc,rpt,pgWidth-72,pgHeight,10,nLevel,[15], oDoc.bookmarkRoot.children,1,  aData,"");
			app.thermometer.end();
			
			var err="";
			//Then for the linked files
			for(var i=0;i<filepaths.length;i++){
				var abs_path=BuildAbsolutePath(oDoc,filepaths[i].path);
				console.println("Abs path: " + abs_path);
				console.println("Rel path: " + filepaths[i].path);
				file_open=IsPDFAlreadyOpen(abs_path); //boolean flag. True if file is already open
				try{
					//var doc=app.openDoc({cPath:filepaths[i].path, oDoc: oDoc, bHidden:true});
					var doc=app.openDoc({cPath:filepaths[i].path, oDoc: oDoc, bHidden:true});
					doc.addScript("", "this.disclosed = true;");
					doc.saveAs(doc.path);
				}catch(e){
					err+="Unable to open " + filepaths[i].path + "\n Error code" + e;
					app.alert(err);
					return;
				}
				var cur_page=doc.pageNum; //store page for later reset
				//console.println("Relative path: "+ rel_path + " Actual path: " + filepaths[i].path);
		
				var mx_dp=FindMaxBkDepth(doc.bookmarkRoot);
				filepaths[i].MaxnDepth=mx_dp.toString();
				if (doc.info.TOCnLevel>mx_dp)doc.info.TOCnLevel=mx_dp; //keep in bounds
				if(filepaths[i].nDepth==undefined || filepaths[i].nDepth==""){
					console.println("File path here: " + filepaths[i].nDepth);
					filepaths[i].nDepth=(doc.info.TOCnLevel ? doc.info.TOCnLevel : filepaths[i].MaxnDepth); //if max depth defined in linked pdf then use it if nothing better; else set to max
				}
				
				if(doc.bookmarkRoot.children){
					aTOCData = PutBookmarkTOCLines(doc,rpt,pgWidth-72,pgHeight,10,filepaths[i].nDepth,[15], doc.bookmarkRoot.children,1,  aData,"");
					//FindBookmarkPages_s(doc,doc.bookmarkRoot.children,doc.info.TOCnLevel,1,aTOCData);
				}
		
				doc.pageNum=cur_page;
		
				if(!file_open){ //close the file if it is not already open
					try{
						doc.closeDoc(true); //close
					}catch(e){
						err+="Unable to close " + filepaths[i].path + "\n Error code" + e;
						app.alert(err);
						return;			
					}
				}
		
			}
			if(err!="") {
				app.alert(err);
				return false;
			}else{
				//return true;
			}			
			
			
			
			 //Done writing the report
			//console.println(aTOCData.length);
			console.println("Finished getting TOC data");
			
			 //delete the last page we used for comparison
			oDoc.deletePages(oDoc.numPages-1);

			 //PUT THE PAGES INTO THE MAIN BUNDLE. WE STILL NEED TO ADD THE PAGE REFERENCES
			var oTOCDoc = rpt.open("TOC")
			var nTOCPages = oTOCDoc.numPages;
						
			 //var nStartPage = Number(TOCBkDlg.nInsertAt) - 1;
			
			 //var nStartPage = Number(1) - 1;  //Keeping it simple - always put before first page
			 //var nStartPage=(ExistingFS(oDoc) ? 1 : 0);  //Start page at the front unless there is Front Sheet
			var nStartPage;
			if (ExistingSUBS(oDoc)) {  //Slot the contents in the right place: Front Sheet, Subs, Contents
				nStartPage=GetPageNumberLastSubs(oDoc)+1;
				console.println("Page number for inserting subs is: " + nStartPage);	
			}else{
				if(ExistingFS(oDoc)){
					nStartPage=1;
				}else{
					nStartPage=0;
				}
			}
			if (nStartPage<0)  {
				console.println("Error in setting page for placing TOC.");
				nStartPage=0; //set to default
			}
			
			
			var NumPages=oDoc.numPages;
	
			 //place pages at the end
			oDoc.insertPages ({
				nPage: NumPages-1,  //insert after last pages
				cPath: oTOCDoc.path,
			});
	
			var NewNumPages=oDoc.numPages;	
	
			 //place dummy copy at the end - this stops re-page labelling everything else
			oDoc.insertPages ({
				nPage: oDoc.numPages-1,  //insert after last pages
				cPath: oTOCDoc.path,
			});
	
			oDoc.setPageLabels(NumPages, ["r", "TOC_", 1]);  //set the page labels

	
			 //Now move them to the right place
			for (var i =1;i<=NewNumPages-NumPages;i++){
				oDoc.movePage(NewNumPages-1,nStartPage-1);
			}
			
 //			 //console.println(oDoc.numPages-nTOCPages);
 //			 //console.println(oDoc.numPages);
			 //Now delete the dummy pages
			for(var i=0;i<nTOCPages;i++){
				oDoc.deletePages(oDoc.numPages-1);
			}
					
			 // Find pages to match bookmark data
			var curView = oDoc.viewState.toSource();
			console.println("About to find pages for bookmarks");
			FindBookmarkPages_s(oDoc,oDoc.bookmarkRoot.children,oDoc.info.TOCnLevel,1,aTOCData);
			
			
			
			console.println("Done finding pages for bookmarks");
			oDoc.viewState = eval(curView);
			
			
			var fldRect
			 // First Find longest Page Label
			var nMaxWdth=0, bxWdth, bxRot, oSpn;
 //			var mxRot = (new Matrix2D()).fromRotated(this,0).invert();
			var mxRot = (new Matrix2D()).fromRotated(oDoc,0).invert();
			
			var oTstAnt = oDoc.addAnnot({page:0, type:"Line", points:[[100,200],[110,200]], 
                                     doCaption:true,rotate:oDoc.getPageRotation(0)});

			for(var i=0;i<aTOCData.length;i++)
			{
				var Fnt=GetFont(0);
				if(typeof(aTOCData[i].nTargetPg) != "undefined")
				{
					var bPageLb=true;
					oSpn = [{textSize:aTOCData[i].nTextSize,fontFamily:Fnt}]
					oSpn[0].text = (bPageLb)?oDoc.getPageLabel(aTOCData[i].nTargetPg):(Number(aTOCData[i].nTargetPg)+1).toString();

					oTstAnt.richContents = oSpn;
					 // Correct for page Rotation
					var bxRot = mxRot.transform(oTstAnt.rect);
					bxWdth = Math.abs(bxRot[2] - bxRot[0]);
					if(bxWdth > nMaxWdth)
					{
						nMaxWdth = bxWdth;
					}
					if(nMaxWdth > 54)
					   nMaxWdth = 54;
				}
			}
			oTstAnt.destroy();
		
		
			nMaxWdth += 5;
			for(var i=0;i<aTOCData.length;i++)
			{
			    fldRect = [pgRect[2]-72,aTOCData[i].rect[3],pgRect[2]-72 + nMaxWdth ,aTOCData[i].rect[1]];
				oFld = oDoc.addField("TOCPage"+i,"text", nStartPage + aTOCData[i].nBkPg, fldRect);
				oFld.fillColor = color.white
				oFld.width = 0;
				oFld.alignment = "right";
				oFld.textSize = aTOCData[i].nTextSize-1; //make the text size a little smaller to make it work on a Windows
				oFld.textFont = Fnt;				
				if(typeof(aTOCData[i].nTargetPg) != "undefined")
				{
					if(bPageLb){
						oFld.value = oDoc.getPageLabel(aTOCData[i].nTargetPg);
					aTOCData[i].nRightExtent = pgRect[2]-72 + nMaxWdth;
					}else{
						oFld.value = aTOCData[i].nTargetPg+1;
					aTOCData[i].nRightExtent = pgRect[2]-72 + nMaxWdth;
					}
				}
			}
			oDoc.flattenPages(nStartPage,nStartPage + nTOCPages - 1);



			 //add an invisible field to the page to identify it as TOC
			var inch=72;
			var nTxtSize=20;
			var wdth=getTextWidth(oDoc,0,nTxtSize,Fnt,false,"TOC_")
			for (i=nStartPage;i<oTOCDoc.numPages+nStartPage;i++){
					var aRect = oDoc.getPageBox( {nPage: i} );
					aRect[0] = aRect[2]-wdth-0.5*inch; // from upper left hand corner of page, upper left x
					aRect[2] = aRect[0]+wdth; // Make it wdth wide, lower right x
					aRect[1] = aRect[3]+.5*inch;  // upper left y
					aRect[3] = aRect[1] - 24; // and 24 points high, lower right y

					oFld = oDoc.addField("TOC_"+i,"text", i, aRect);
					oFld.fillColor = color.transparent;
					oFld.width = 0;
					oFld.alignment = "right";
					oFld.textSize = nTxtSize;
					oFld.textFont = Fnt;	
					oFld.readonly=true;			
					oFld.value = "TOC_";
					oFld.display=display.hidden;
			}
			
 //			 //console.println("After " + oDoc.numFields);
			
			//Add special link to the title
			var oTitleLnk;
			oTitleLnk = oDoc.addLink(nStartPage, title_rect);
			oTitleLnk.borderWidth = 0;
			var act_str="var f=GetFilePath(app.doc); if(AddExternalFile(f, app.doc)) RefreshTOC(app.doc);";
			oTitleLnk.setAction(act_str);

			//Add special links to the external files and depth box
			for (var i=0; i<filepaths.length;i++){
				var oPathLnk;
				oPathLnk = oDoc.addLink(nStartPage, filepaths[i].rect);
				oPathLnk.borderWidth = 0;
				var act_str="DeleteExternalFile("+i.toString()+", app.doc); RefreshTOC(app.doc);";
				oPathLnk.setAction(act_str);

				//the depthbox
				fldRect = filepaths[i].rect;
				fldRect[2]=filepaths[i].rect[0]+getTextWidth(oDoc,0,7,Fnt,false,"-"+filepaths[i].path+"10")+20;
				fldRect[0]=filepaths[i].rect[0]+getTextWidth(oDoc,0,7,Fnt,false,"-"+filepaths[i].path)+10;			
				oFld = oDoc.addField("ndepth"+i,"combobox", nStartPage, fldRect);
				//load array with numbers for filling combobox
				var a=new Array();
				for (var x=0;x<=filepaths[i].MaxnDepth;x++) a.push(x);
				if(a.length>0)oFld.setItems(a);
				oFld.setAction("Keystroke","DepthFieldChange();");			
				oFld.fillColor = color.white;
				oFld.width = 0;
				oFld.textSize = 6; //make smaller for windows
				oFld.textFont = Fnt;				
				oFld.textColor=["RGB",0,0,1 ];	
				console.println("ndepth: " + filepaths[i].nDepth);
				if(filepaths[i].nDepth>0) oFld.value = parseInt(filepaths[i].nDepth,10);
			}




			oTOCDoc.closeDoc(true);
			
			oDoc.bringToFront();

			 // Add Links over Text
			var lnkRect,oLnk;
			for(var i=0;i<aTOCData.length;i++)
			{
				if(typeof(aTOCData[i].nRightExtent) != "undefined")
				{
					lnkRect = [aTOCData[i].rect[0], aTOCData[i].rect[1], aTOCData[i].nRightExtent, aTOCData[i].rect[3]];
					oLnk = oDoc.addLink(nStartPage + aTOCData[i].nBkPg, lnkRect);
					oLnk.borderWidth = 0;
					oLnk.setAction("this.viewState = eval(\"" + aTOCData[i].cView + "\");");
 //					oLnk.setAction("this.pageNum=10;");
				}
			}


	   	oDoc.pageNum=nStartPage;
	   
 	app.endPriv();
 	return true;
}

function ExistingTOC(oDoc){
	 //Function returns true if existing TOC
	var pattern=/TOC_/;
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

function DeleteOldTable(oDoc){
	console.println("Deleting TOC...");
	 //Delete old Table of Contents
	app.beginPriv();

	var d=IdentifyPagesForDeletion(oDoc, /TOC_/);
	DeletePages(oDoc, d);

	app.endPriv();
	return true;
}

function GetPageNumberLastTOC(oDoc){
	 //returns the last page number of subs if it exists
	if(!ExistingTOC(oDoc))return -1;
	 //Function returns true if existing TOC
	var d=[];
	var d=IdentifyPagesForDeletion(oDoc, /TOC_/);
	if(d==null) return -1;
	if(d.length==0) return -1;
	var max_page=-1;
	for(var i=0;i<d.length;i++) if(d[i]>max_page)max_page=d[i];
	return max_page;
}

var RefreshTOC=app.trustedFunction(function(oDoc){
	app.beginPriv();
	
	var plat=app.platform;
 //	 //console.println("Console: " + plat);	
	
/*	switch(plat){
		case "WIN":
			Fnt="SegoeUI";
		break;
		case "MAC":
			Fnt="LucidaSans"
		break;
		case "UNIX":
			app.alert("Not designed for this platform.");
		break;
		default:
			app.alert("Not designed for this platform.");
			return false;
		break;
	}	
*/
		
	 //Updates the TOC if it exists
	if (ExistingTOC(oDoc)){
		if(DeleteOldTable(oDoc)) {
			oDoc.info.TOCExists=false;  //set flag to false if we delete TOC
			oDoc.info.TOCExists=AddTOC(oDoc);  //set flag if we successfully add TOC
		}
	}
	app.endPriv();
});

var TOCBkDlg =
{
    strTitle:"",
    bPageLabel:false,
    bSepFile:false,
    nLevel:"1",
	nLvlMax:"1",
	nPgMax:"2",
	nInsertAt:"2",
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "nIns": this.nInsertAt,
            "nlvl": this.nLevel,
            "Titl": this.strTitle,
            "SpFl": this.bSepFile,
        };
		dlgInit[this.bPageLabel?"PgLb":"PgNm"] = true;
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
		this.bPageLabel = oRslt["PgLb"];
		this.bSepFile = oRslt["SpFl"];
        this.strTitle = oRslt["Titl"];
        this.nLevel = oRslt["nlvl"];
        this.nInsertAt = oRslt["nIns"];
    },
	nlvl: function(dialog)
	{
        var oRslt = dialog.store();
	    if (oRslt.nlvl < 1)
		   dialog.load({nlvl:"1"});
		else if (oRslt.nlvl > this.nLvlMax)
		   dialog.load({nlvl:this.nLvlMax});
	},
	nIns: function(dialog)
	{
        var nVal = Number(dialog.store().nIns);
	    if (nVal < 1)
		   dialog.load({nIns:"1"});
		else if (nVal > Number(this.nPgMax))
		   dialog.load({nIns:this.nPgMax});
	},
    description:
    {
        name: "Bookmark to Table of Contents Tool",
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
                                name: "Title (appears at top of first TOC Page):",
                                char_width: 15,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Titl",
                                variable_Name: "strTitle",
                                char_width: 8,
                                alignment: "align_fill",
                            },
/*                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta3",
                                        name: "Insert TOC Before Page:",
                                    },
                                    {
                                        type: "edit_text",
                                        item_id: "nIns",
                                        variable_Name: "nInsertAt",
                                        char_width: 3,
                                        SpinEdit: "true",
                                    },
                                ]
                            },
*/
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta1",
                                        name: "Number of Bookmark Levels to Include in TOC:",
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
                                        item_id: "SpFl",
                                        name: "Create in a separate file",
                                        variable_Name: "bSepFile",
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

var strDataMakeTOCIcon = 
"0000000000000000123a4045ab30363bef30353a482d333800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ae32383dff31373ba0353a3f9e353b3f2330363b4731373c502c323750383e435033393d50282d32502c32375031373c5030363b4a313a3e0f1f2c2e000000000000000000000000000000000000000088272c3170363c41b93d42475531373cc2393f446b31363bff2e3338ff353b3fff2f353aff2a3034ff363b40ff3e4448ff373d41ff2b3438ea3644462a232b2b0000000000000000000000000000000009272d32ce2f34395432383dc42b31367330353a8231373c893a3f44b433393eb430353ab433383db434393eb42f3539c130363afd353f42ff354244a72b33340000000000000000000000000000000068373d4247353a3fcc383e43793c41469a2b3136493c42470000000000000000000000000000000000000000000000000000000052212b2eff2e3c3dc32d3536000000000000000000000000000000007c3a4044c633393d6931363b902e3439010d13182f21262b1e2d33384c343a3f4c373c414c2e34384c2b31364c33383d29272d3100000000ed2f3d3ec4313839000000000000000000000000000000007c33393dff353b4018363c411433383d342b3136853e44493d373d418c353b3f8c353b408c343a3f8c3c41468c444a4f52292f3400000000e82f3d3fc4323a3b000000000000000000000000000000007c2a3034ff363b4018292e330000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e82a383ac4303838000000000000000000000000000000007c363c40ff343a3e18373d414730353ad832383cd8373c41d8363b40d82f3539d82f3539d82f353ad8383e43d833393d7b2e343900000000e82e3c3ec4323a3a000000000000000000000000000000007c383d42ff30353a18252b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e82e3c3ec4323a3a000000000000000000000000000000007c33383dff30363a18343a3e2f2f35398833393e883a3f4488353b408830353a8831373b8832383d883c414688353a3f502e343800000000e82e3c3ec4323a3a000000000000000000000000000000007c383d42ff353b3f18373d41182f35395030363b50353b3f50353b3f5030363a5031373b5031373b50393f435033393d2b30363a00000000e82e3c3ec4323a3a000000000000000000000000000000007c383d42ff353b3f18373d41082f35392430363b24353b3f24353b3f2430363a2431373b2431373b24393f432433393d1130363a00000000e82e3c3ec4323a3a000000000000000000000000000000007c33383dff30363a18343a3e3e2f3539b433393eb43a3f44b4353b40b430353ab431373bb432383db43c4146b4353a3f6a2e343800000000e82e3c3ec4323a3a000000000000000000000000000000007c383d42ff30353a18252b300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e82e3c3ec4323a3a000000000000000000000000000000007c363c40ff343a3e18373d414330353ac432383cc4373c41c4363b40c42f3539c42f3539c42f353ac4383e43c433393d732e343900000000e82e3c3ec4323a3a000000000000000000000000000000007c373c3eff2a31322528313304404c4d142c393b14394648142b393c14334044143a464a1438434814333d4314343d43083e464d034b4f53f3353535c436363600000000000000000000000000000000793b4041ff3d4446aa313a3c0b2732340000000000000000000000000000000000000000000000000000000000000000042931398644484cff353535c136363600000000000000000000000000000000411f2426ff363d3fff374142f9364142ec2e3b3cec303d3fec2b393cec2e3b3fec303c40ec2f3a40ec2d373dec2c353cf62e363dff34383bff353535883636360000000000000000000000000000000000000000732c3335ea30393afc273234fc2c393afc2d3a3cfc263436fc283539fc2c383cfc2f3a3ffc313b41fc2f383ffc2d353cf52e3235a33535350a3636360000000000000000";

var oIconMakeTOC = {count: 0, width: 20, height: 20,
read: function(nBytes){return strDataMakeTOCIcon.slice(this.count, this.count += nBytes);}};

var oButObjMakeTOC = 
{cName: "No_FussTableOfContents",
cExec: "No_FussMakeTableOfContents(event.target)",
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
 //cMarked: "event.rc = ExistingTOC(app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.TOCExists",
cTooltext: "Make Table of Contents from Bookmarks",
cLabel: "Table of Contents",
oIcon: oIconMakeTOC,
nPos: 0
}

try{app.removeToolButton("No_FussTableOfContents");}catch(e){}
try{app.addToolButton(oButObjMakeTOC);}catch(e){}


