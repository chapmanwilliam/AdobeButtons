
 //*******************************************\\
 //This paginates the bundle according to page labels

var pattern_page_label=/PageLabel/;
var pattern_TOC=/TOC/;
var pattern_FS=/FS/;
var pattern_SUBS=/SUBS/;
var pattern_CHRONO=/CHRONO/;

function PaginationPresent(oDoc){

	for(i=0;i<oDoc.numFields;i++){
		var a=oDoc.getNthFieldName(i);
		if(pattern_page_label.test(a)){
			return true;
		}
	}
	return false;
}

function GetPaginateRect(oDoc, Pg, vert, nTxtSize, Fnt, MargX, MargY){
		var inch=72;
		//var wdth=getTextWidth(oDoc,i,nTxtSize,Fnt,true,oDoc.getPageLabel(i))+20;
		//console.println(MargY);

           var rcLabel = oDoc.getPageBox("Crop",i);
            rcLabel[0] += MargX * inch; //Left
            rcLabel[2] -= MargX * inch; //right
            switch(vert)
            {
               case "PosT":
                 rcLabel[1] -= MargY * inch; //top
                 rcLabel[3] = rcLabel[1] - nTxtSize - 4; //bottom
                 break;
               case "PosM":
                 mid = (rcLabel[1] + rcLabel[3])/2;
                 rcLabel[1] = mid + nTxtSize/2 + 2;
                 rcLabel[3] = mid - nTxtSize/2 - 2;
                 break;
               case "PosB":
                 rcLabel[3] += MargY * inch;
                 rcLabel[1] = rcLabel[3] + nTxtSize + 4;
                 break;
            }

	return rcLabel;
}




//function AddPagination(oDoc){
var AddPagination=app.trustedFunction(function(oDoc,override=undefined){
		app.beginPriv();
		var prefix="PageLabel"; //default prefix for field name
		var inch=72;
		var nTxtSize;
		if(typeof(oDoc.info.NFPGnTextSize)=="undefined" || oDoc.info.NFPGnTextSize=="") { oDoc.info.NFPGnTextSize=20; nTxtSize=oDoc.info.NFPGnTextSize;}else{nTxtSize=Number(oDoc.info.NFPGnTextSize);}
		//var Fnt=GetFont();
		var Fnt;
		if(typeof(oDoc.info.NFPGcFontName)=="undefined" || oDoc.info.NFPGcFontName==""){ oDoc.info.NFPGcFontName="Helvetica"; Fnt=GetFontType(oDoc.info.NFPGcFontName);}else{ Fnt=GetFontType(oDoc.info.NFPGcFontName);}

    	var bold;
    	if(typeof(oDoc.info.NFPGbBold)=="undefined" || oDoc.info.NFPGbBold=="") { oDoc.info.NFPGbBold=false; bold=oDoc.info.NFPGbBold; }else{ bold=oDoc.info.NFPGbBold;}
		if(bold)  Fnt += "-Bold";
		
		var italic;
		if(typeof(oDoc.info.NFPGbItalics)=="undefined" || oDoc.info.NFPGbItalics==""){ oDoc.info.NFPGbItalics=false; italic=oDoc.info.NFPGbItalics; }else{ italic=oDoc.info.NFPGbItalics;}

	    if(italic) 	{
	       if(!/\-/.test(Fnt))  Fnt += "-";
    	     //console.println(oDoc.info.NFPGcFontName);
    		//if(!typeof(oDoc.info.NFPGcFontName)=="undefined"){
		       if(oDoc.info.NFPGcFontName == "Times Roman"){
  		      	 Fnt += "Italic";
  		       }else{
   		    	  Fnt += "Oblique";
   		 		}
   		 	}
   		 //}
    	if(Fnt == "Times")
      		Fnt += "-Roman";
 
		var col;
		if(typeof(oDoc.info.NFPGstrTextCol)=="undefined" || oDoc.info.NFPGstrTextCol=="") { oDoc.info.NFPGstrTextCol="Black"; col=GetColor(oDoc.info.NFPGstrTextCol); }else{ col=GetColor(oDoc.info.NFPGstrTextCol);}
		
		var MargX;
		if(typeof(oDoc.info.NFPGnMarginX)=="undefined" || oDoc.info.NFPGnMarginX=="") { oDoc.info.NFPGnMarginX=0.5; MargX=oDoc.info.NFPGnMarginX;}else{ MargX=oDoc.info.NFPGnMarginX;}
		var MargY;
		if(typeof(oDoc.info.NFPGnMarginY)=="undefined" || oDoc.info.NFPGnMarginY==""){  oDoc.info.NFPGnMarginY=0.5; MargY=oDoc.info.NFPGnMarginY;}else{MargY=oDoc.info.NFPGnMarginY;}
		var vert;
		if(typeof(oDoc.info.NFPGstrVertPos)=="undefined" || oDoc.info.NFPGstrVertPos==""){  oDoc.info.NFPGstrVertPos="PosB"; vert=oDoc.info.NFPGstrVertPos;}else{ vert = oDoc.info.NFPGstrVertPos;}
		
		var horz;
		if(typeof(oDoc.info.NFPGstrHorzPos)=="undefined" || oDoc.info.NFPGstrHorzPos==""){ oDoc.info.NFPGstrHorzPos="PosR"; horz=GetAlignment(oDoc.info.NFPGstrHorzPos);}else{ horz=GetAlignment(oDoc.info.NFPGstrHorzPos);}
		
		 //var wdth=GetMaxWidth(oDoc,nTxtSize,Fnt);
		 if(typeof override!="undefined"){
			 prefix=override.prefix;
			 vert=override.vert;
			 col=GetColor(override.col);
		 }
		 console.println(override);
		 console.println('Log ' + prefix + ", " + vert);

		var t=app.thermometer;
		t.duration=oDoc.numPages;
		t.begin();
		for(i=0;i<oDoc.numPages;i++){
				t.value=i;
				t.text = "Adding pagination to page " + (i+1)+ " of " + oDoc.numPages + " pages";
				if (t.cancelled){
					break;
				}
				if(!pattern_CHRONO.test(oDoc.getPageLabel(i)) && !pattern_TOC.test(oDoc.getPageLabel(i)) && !pattern_FS.test(oDoc.getPageLabel(i)) && !pattern_SUBS.test(oDoc.getPageLabel(i))){  //skip table of contents, front sheet and subs
					
					var aRect=GetPaginateRect(oDoc, i, vert, nTxtSize, Fnt, MargX, MargY);
					oFld = oDoc.addField(prefix+i,"text", i, aRect);
					oFld.fillColor = color.transparent;
					oFld.width = 0;
		            oFld.alignment = horz;
					oFld.textSize = nTxtSize;
					oFld.textColor=col;
					try{oFld.textFont = Fnt;}catch(e){console.println("Error setting font for pagination");oFld.textFont="Helvetica";};	
					oFld.readonly=true;			
					oFld.value = oDoc.getPageLabel(i);
				}
			}
			t.end();
			 //console.println("Got to page " + i);
			if(i<oDoc.numPages){
				 //i.e. we've been interrupted
				t.end();
				RemovePagination(oDoc, true);
				return false;
			}else{
				 //oDoc.info.PaginationExists=true;
				return true;
			}
			app.endPriv();
});

function RemovePagination(oDoc, thermON){

			var t=app.thermometer;
			if(thermON){
				t.duration=oDoc.numFields;
				t.begin();
			}
			var count=0;
			var flag=true;  //flag for success of function, true by default

			var i=0;
			while(i<oDoc.numFields){
				var a=oDoc.getNthFieldName(i);
				if(pattern_page_label.test(a)){
					oDoc.removeField(a);
					count++;
					if(thermON){
						t.value=count;
						t.text= "Removing pagination from page " + (count+1) + " of " + oDoc.numFields + " pages";
						if (t.cancelled){
							flag=false;
							break;
						}
					}
					i--;
				}			
				i++;
			}
			if(thermON)t.end();
			 //oDoc.info.PaginationExists=false;
			return flag;
}

function RefreshPagination(oDoc){
	 //Refreshes the pagination if present
	if(PaginationPresent(oDoc)){
		if(RemovePagination(oDoc, true)){
			oDoc.info.PaginationExists=false;
			oDoc.info.PaginationExists=AddPagination(oDoc);
		}
	}
}

var PaginateNow=app.trustedFunction(function(oDoc)
{

 //	app.beginPriv();

	if(!PaginationPresent(oDoc)){  //add pagination
			oDoc.info.PaginationExists=AddPagination(oDoc);
		}else{  //remove pagination
			oDoc.info.PaginationExists=!RemovePagination(oDoc, true);
		}

 //app.endPriv();
		
});


 // // // // // // // // // // // // ///
 //
 //  This is the main (toggle) function for adding
 //  pagination according to page labels 
 //

var DoPAGELABELS = app.trustedFunction(function(oDoc)
{
	if(!CheckLicence())return;

 //	app.beginPriv();
	var PgNow=oDoc.pageNum;	
	PaginateNow(oDoc);
	oDoc.pageNum=PgNow;		
 //	app.endPriv();

});



function GetMaxWidth(oDoc, nTxtSize, Fnt){

			 // First Find longest Page Label
			var nMaxWdth=0, bxWdth;
			for(var i=0;i<oDoc.numPages;i++){
					bxWdth = getTextWidth(oDoc,0,nTxtSize,Fnt,false,oDoc.getPageLabel(i));
					if(bxWdth > nMaxWdth){
						nMaxWdth = bxWdth;
					}
			}
	 //				if(nMaxWdth > 54) nMaxWdth = 54;
			nMaxWdth += 5;
	return nMaxWdth;	
}



 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7PAGELABELS = 
"0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046000000f8000000b600000027000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007f000000ff000000ff000000fa0000008f00000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ea000000670000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000d000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ac0000002000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000f7000000840000000b0000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000e40000005c00000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000050000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ed0000002b000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000fb000000930000001200000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000bb0000002b000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000dc0000004f0000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000ff000000ff000000f20000007700000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000ff000000ff000000ff000000fe0000009e00000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007c000000ff000000ff000000c5000000340000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c0000009e00000059000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconPAGELABELS = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconPAGELABELS = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7PAGELABELS.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdPAGELABELS = 
"DoPAGELABELS(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjPAGELABELS = 
{cName: "PAGELABELS",
cExec: DoCmdPAGELABELS,
cEnable: "event.rc = (app.doc != null)",
 //cMarked: "event.rc = PaginationPresent(app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.PaginationExists",
cTooltext: "Paginate pdf",
cLabel: "Paginate",
nPos: 0};
 //</JSCodeSnippet>
if(oIconPAGELABELS != null)
    oButObjPAGELABELS.oIcon = oIconPAGELABELS;

try{app.removeToolButton("PAGELABELS");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
	if (app.doc!=null) PaginationExists=PaginationPresent(app.doc);
    app.addToolButton(oButObjPAGELABELS);
 //</JSCodeSnippet>
//if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["PAGELABELS_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["PAGELABELS_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjPAGELABELS"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




