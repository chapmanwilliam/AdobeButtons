
 //********************************************************************* //
 //
 //  ****    Make chronology in a text file from bookmarks
 // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // ///
/*
Gather the bookmarks with dates in their name, sort, and write to a file.
*/

var MAX_FILE_PATHS=10;

var filepaths=new Array ();

var ChronoBkMks=new Array();		 //stores the bookmarks data


function clear_filepaths_array(){
	while(filepaths.length > 0) filepaths.pop(); //clear the array
}

function clear_chrono_array(){
	while(ChronoBkMks.length>0)ChronoBkMks.pop(); //clear the array
}

function clear_file_paths(oDoc){
	oDoc.info.filepath1="";
	oDoc.info.filepath2="";
	oDoc.info.filepath3="";
	oDoc.info.filepath4="";
	oDoc.info.filepath5="";
	oDoc.info.filepath6="";
	oDoc.info.filepath7="";
	oDoc.info.filepath8="";
	oDoc.info.filepath9="";
	oDoc.info.filepath10="";
}

function collect_file_paths(oDoc){
	clear_filepaths_array();
	if (typeof(oDoc.info.filepath1)!=undefined && oDoc.info.filepath1!="") {var fl={path: oDoc.info.filepath1, rect:null, nDepth:oDoc.info.nDepth1, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath2)!=undefined && oDoc.info.filepath2!="") {var fl={path: oDoc.info.filepath2, rect:null, nDepth:oDoc.info.nDepth2, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath3)!=undefined && oDoc.info.filepath3!="") {var fl={path: oDoc.info.filepath3, rect:null, nDepth:oDoc.info.nDepth3, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath4)!=undefined && oDoc.info.filepath4!="") {var fl={path: oDoc.info.filepath4, rect:null, nDepth:oDoc.info.nDepth4, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath5)!=undefined && oDoc.info.filepath5!="") {var fl={path: oDoc.info.filepath5, rect:null, nDepth:oDoc.info.nDepth5, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath6)!=undefined && oDoc.info.filepath6!="") {var fl={path: oDoc.info.filepath6, rect:null, nDepth:oDoc.info.nDepth6, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath7)!=undefined && oDoc.info.filepath7!="") {var fl={path: oDoc.info.filepath7, rect:null, nDepth:oDoc.info.nDepth7, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath8)!=undefined && oDoc.info.filepath8!="") {var fl={path: oDoc.info.filepath8, rect:null, nDepth:oDoc.info.nDepth8, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath9)!=undefined && oDoc.info.filepath9!="") {var fl={path: oDoc.info.filepath9, rect:null, nDepth:oDoc.info.nDepth9, MaxnDepth:1}; filepaths.push(fl);}
	if (typeof(oDoc.info.filepath10)!=undefined && oDoc.info.filepath10!="") {var fl={path: oDoc.info.filepath10, rect:null, nDepth:oDoc.info.nDepth10, MaxnDepth:10}; filepaths.push(fl);}
}

function set_file_paths(oDoc){
	var l=filepaths.length;
	if (l>0) {oDoc.info.filepath1=filepaths[0].path; oDoc.info.nDepth1=filepaths[0].nDepth;}else{oDoc.info.filepath1=""; oDoc.info.nDepth1=""};
	if (l>1) {oDoc.info.filepath2=filepaths[1].path; oDoc.info.nDepth2=filepaths[1].nDepth;}else{oDoc.info.filepath2=""; oDoc.info.nDepth2=""};
	if (l>2) {oDoc.info.filepath3=filepaths[2].path; oDoc.info.nDepth3=filepaths[2].nDepth;}else{oDoc.info.filepath3=""; oDoc.info.nDepth3=""};
	if (l>3) {oDoc.info.filepath4=filepaths[3].path; oDoc.info.nDepth4=filepaths[3].nDepth;}else{oDoc.info.filepath4=""; oDoc.info.nDepth4=""};
	if (l>4) {oDoc.info.filepath5=filepaths[4].path; oDoc.info.nDepth5=filepaths[4].nDepth;}else{oDoc.info.filepath5=""; oDoc.info.nDepth5=""};
	if (l>5) {oDoc.info.filepath6=filepaths[5].path; oDoc.info.nDepth6=filepaths[5].nDepth;}else{oDoc.info.filepath6=""; oDoc.info.nDepth6=""};
	if (l>6) {oDoc.info.filepath7=filepaths[6].path; oDoc.info.nDepth7=filepaths[6].nDepth;}else{oDoc.info.filepath7=""; oDoc.info.nDepth7=""};
	if (l>7) {oDoc.info.filepath8=filepaths[7].path; oDoc.info.nDepth8=filepaths[7].nDepth;}else{oDoc.info.filepath8=""; oDoc.info.nDepth8=""};
	if (l>8) {oDoc.info.filepath9=filepaths[8].path; oDoc.info.nDepth9=filepaths[8].nDepth;}else{oDoc.info.filepath9=""; oDoc.info.nDepth9=""};
	if (l>9) {oDoc.info.filepath10=filepaths[9].path; oDoc.info.nDepth10=filepaths[9].nDepth;}else{oDoc.info.filepath10=""; oDoc.info.nDepth10=""};
}

var No_FussMakeChronoMaker = app.trustedFunction(function(oDoc)
{
	if(!CheckPermitted())return;
		
   app.beginPriv();

	if (ExistingCHRONO(oDoc)) { 
		 //console.println("This place");	
		if(DeleteOldChrono(oDoc)) oDoc.info.CHRONOExists=false;  //i.e. set flag to false if we successfully delete TOC
		return;
	}

	var PgNow=oDoc.pageNum;	

	//dob_C=null;
	SetKeyDates(oDoc);
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	
	if(nDepth > 0 || filepaths.length>0)
	{
		ChronoDlg.strTitle = (oDoc.info.CHRONOTitle ? oDoc.info.CHRONOTitle : "Chronology: " + oDoc.documentFileName.replace(/\.pdf$/i,""));
		ChronoDlg.bDayofWeek= (typeof(oDoc.info.CHRONODayofWeek) != "undefined" ? oDoc.info.CHRONODayofWeek : true);		
		ChronoDlg.bSepFile= (typeof(oDoc.info.CHRONOSepFile) != "undefined" ? oDoc.info.CHRONOSepFile : true);
		ChronoDlg.bAge= (typeof(oDoc.info.CHRONOAge) != "undefined" ? oDoc.info.CHRONOAge : true);		
		ChronoDlg.nLvlMax = nDepth.toString();
		 //Keep the persistent nLevel within bounds
		if(oDoc.info.CHRONOnLevel){
			if(oDoc.info.CHRONOnLevel<1) oDoc.info.CHRONOnLevel=1;
			if(oDoc.info.CHRONOnLevel>nDepth) oDoc.info.CHRONOnLevel=nDepth;
		}

		ChronoDlg.nLevel = (oDoc.info.CHRONOnLevel ? oDoc.info.CHRONOnLevel.toString() : nDepth.toString());
		ChronoDlg.nPgMax = oDoc.numPages.toString();
		ChronoDlg.nInsertAt = "1";

		if("ok" == app.execDialog(ChronoDlg)){
			
			clear_chrono_array();
			oDoc.info.CHRONOTitle=ChronoDlg.strTitle;
			oDoc.info.CHRONOnLevel=parseInt(ChronoDlg.nLevel,10);
			oDoc.info.CHRONODayofWeek=ChronoDlg.bDayofWeek;
			oDoc.info.CHRONOSepFile=ChronoDlg.bSepFile;
			oDoc.info.CHRONOAge=ChronoDlg.bAge;
			
	        if(ChronoDlg.bSepFile){ //create chronology in separate file
	      		var rep=new Report();
				var oCHRONODoc = rep.open("CHRONO") //turns the rpt into a doc
				var chrono_path=oDoc.path.replace(/\/[^\/]+pdf$/,"/");

				//Add special linking script
				var LINKING_CODE='function NFPageOpenChrono(oDoc,f,p){try{var doc=app.openDoc(f, oDoc);doc.pageNum=p;}catch (e){app.alert("Unable to open " + f);}}';
				oCHRONODoc.addScript("LinkingScriptChrono", LINKING_CODE);
				oDoc.disclosed=true;
				oCHRONODoc.disclosed=true;
				oCHRONODoc.dirty=true; //to mark it for saving

				//Set the new file's info
				oCHRONODoc.info.CHRONOTitle=ChronoDlg.strTitle;
				oCHRONODoc.info.CHRONOnLevel=parseInt(ChronoDlg.nLevel,10);
				oCHRONODoc.info.CHRONODayofWeek=ChronoDlg.bDayofWeek;
				oCHRONODoc.info.CHRONOAge=ChronoDlg.bAge;
				oCHRONODoc.info.CHRONOSepFile=false;
				oCHRONODoc.info.date_of_birth=oDoc.info.date_of_birth;
				oCHRONODoc.info.date_of_injury=oDoc.info.date_of_injury;
				
				clear_file_paths(oCHRONODoc);
				//save the file
				mySaveAs(oCHRONODoc,chrono_path,"Chronology.pdf");
				oCHRONODoc.collect_file_paths(oCHRONODoc);
				console.println("Got here chrono1");
				oCHRONODoc.AddExternalFile(oDoc.path, oCHRONODoc); //add this file as the file to link to
				console.println("Got here chrono2");
				oCHRONODoc.CollectAllBookMarks(oCHRONODoc, ChronoDlg.nLevel);
				//if(dob_C!=null)DoAge();
	    	    oCHRONODoc.ChronoBkMks.sort(compare);
	    	    oCHRONODoc.set_file_paths(oCHRONODoc);
	        	PrintChrono(oCHRONODoc.ChronoBkMks, oDoc);
				PrintChronoOPML(ChronoBkMks, oDoc);
				oCHRONODoc.info.CHRONOExists=oCHRONODoc.WriteChronoReport(oCHRONODoc.ChronoBkMks, oCHRONODoc, ChronoDlg.strTitle, ChronoDlg.bDayofWeek, ChronoDlg.bAge);  //set flag to true if we successfully add CHRONO
					      		
	        }else{
	        	DoChronoThisFile(oDoc, nDepth);
			}
	         //Clear the array
	        clear_chrono_array();
		}
	}
	else {
		app.alert("Cannot create chronology because there are no Bookmarks",1);
	}

	//oDoc.pageNum=PgNow;		
		
   app.endPriv();
});

function PrintChrono(ChronoBkMks, oDoc){
	var rep=new Report();
	var delimiter="-";/*String.fromCharCode(35)+String.fromCharCode(64);*/
	var endofline="";
	
	 //Heading
/*	rep.size=1.2;
	rep.writeText("\""+ ChronoDlg.strTitle+ "\"" +endofline);
	rep.divide();
	rep.writeText(" ");
	rep.writeText(" ");
	rep.size=1.0;
*/
	 //Chronology
	var Old_Date=new Date("10/10/1066");  //set the default to a very old date

	var oldNm="";

	for(var i=0;i<ChronoBkMks.length;i++){
	
			 //Make the date string
			 //console.println("Dates : " + Old_Date + ", " + ChronoBkMks[i].D);
			var DateStr="";
			if(ChronoBkMks[i].D){
				if(Number(ChronoBkMks[i].D)!=Number(Old_Date)){  //if this is a new date then write it, else don't
					DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);
					Old_Date=ChronoBkMks[i].D;
				}else{
					 //DateStr=delimiter;
					DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);;
				}
			}
			 //Make the page reference string
			ChronoBkMks[i].nPageLabel ? PageReference=/*(ChronoDlg.bPageLabeltrue)?*/ChronoBkMks[i].nPageLabel/*:(ChronoBkMks[i].nPage).toString()*/: PageReference="";
		
			var nm="";

			if(ChronoBkMks[i].name) nm=ChronoBkMks[i].name.replace(delimiter,"_");

//			console.println(nm);
//			console.println(oldNm);

			if(nm!=oldNm || !ChronoDlg.bAvReps){ //only print if different from last one
				//console.println("Printing this one " + nm);
				 //Concatenate
				var text_string="\""+DateStr+"\""+ delimiter + "\"" + nm + "\"" + delimiter +  "\""+ PageReference + "\""+endofline ;

				//console.println(text_string);
				 //console.println(text_string);
				rep.writeText(text_string);

		    }else{
				//console.println("Not printing " + nm);
			}
			oldNm=nm; //make a note of this nm
	}
	
	var chrono_path=oDoc.path.replace(/\/[^\/]+pdf$/,"/");
	 //console.println("This path :" + chrono_path);

	 //rep.save(chrono_path);
	var doc=rep.open("TEST");

	mySaveAs(doc,chrono_path, "chronology.txt");
	doc.closeDoc(true);
}

function PrintChronoOPML(ChronoBkMks, oDoc){
	var rep=new Report();
	var delimiter="-";/*String.fromCharCode(35)+String.fromCharCode(64);*/
	var endofline="";

	 //Heading
	rep.size=1.2;
	rep.writeText("<?xml version=\"1.0\"?>" + endofline);
	rep.writeText("<opml version=\"2.0\">" + endofline);
	rep.writeText("<head>" +endofline);
	rep.writeText("<ownerEmail>" +endofline);
	rep.writeText("wchapman10@gmail.com" +endofline);
	rep.writeText("</ownerEmail>" +endofline);
	rep.writeText("</head>" +endofline);
	rep.writeText("<body>" +endofline);
	rep.writeText("<outline text=\"Chrono\">" + endofline);
//	rep.divide();
//	rep.writeText(" ");
//	rep.writeText(" ");
//	rep.size=1.0;

		function findClosestColorRGB(r, g, b)
		{
		  var rgb = {r:r, g:g, b:b};
		  var delta = 3 * 256 * 256;
		  var temp = {r:0, g:0, b:0};
		  var nameFound = 'c-black';
		  var ColourTable = [
				{name:'c-black', hex: '#000000'},
				{name:'c-gray', hex: '#808080'},
				{name:'c-orange', hex: '#FFA500'},
				{name:'c-red', hex: '#FF0000'},
				{name:'c-purple', hex: '#800080'},
				{name:'c-pink', hex: '#FF00FF'},
				{name:'c-green', hex: '#008000'},
				{name:'c-yellow', hex: '#FFFF00'},
				{name:'c-blue', hex: '#0000FF'},
				{name:'c-teal', hex: '#008080'},
				{name:'c-sky', hex: '#00FFFF'}
		  ];

		  function Hex2RGB(hex) {
			  // Remove the # character from the beginning of the hex code
			  hex = hex.replace("#", "");

			  // Convert the red, green, and blue components from hex to decimal
			  // you can substring instead of slice as well
			  const r = parseInt(hex.slice(0, 2), 16);
			  const g = parseInt(hex.slice(2, 4), 16);
			  const b = parseInt(hex.slice(4, 6), 16);

			  // Return the RGB value as an object with properties r, g, and
			  return {r: r, g:g, b: b};
		  }

		  for(var i=0; i<ColourTable.length; i++)
		  {
			temp = Hex2RGB(ColourTable[i].hex);
			if(Math.pow(temp.r-rgb.r,2) + Math.pow(temp.g-rgb.g,2) + Math.pow(temp.b-rgb.b,2) < delta){
				delta = Math.pow(temp.r-rgb.r,2) + Math.pow(temp.g-rgb.g,2) + Math.pow(temp.b-rgb.b,2);
				nameFound = ColourTable[i].name;
			}
		  }
		  return nameFound;
		}


	 //Chronology
	var Old_Date=new Date("10/10/1066");  //set the default to a very old date

	var oldNm="";

	for(var i=0;i<ChronoBkMks.length;i++){

			 //Make the date string
			 //console.println("Dates : " + Old_Date + ", " + ChronoBkMks[i].D);
			var DateStr="";
			if(ChronoBkMks[i].D){
				if(Number(ChronoBkMks[i].D)!=Number(Old_Date)){  //if this is a new date then write it, else don't
					DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);
					Old_Date=ChronoBkMks[i].D;
				}else{
					 //DateStr=delimiter;
					DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);
				}
			}
			 //Make the page reference string
			ChronoBkMks[i].nPageLabel ? PageReference=/*(ChronoDlg.bPageLabeltrue)?*/ChronoBkMks[i].nPageLabel/*:(ChronoBkMks[i].nPage).toString()*/: PageReference="";

			var nm="";

			if(ChronoBkMks[i].name) nm=ChronoBkMks[i].name.replace(delimiter,"_");


			if(nm!=oldNm || !ChronoDlg.bAvReps){ //only print if different from last one
				var clean_nm=nm.replace("<","&lt;").replace(">","&gt;").replace("&"," &amp;").replace("'","&apos;").replace("\"","&quot;");
				var note=null;
				var m=clean_nm.match(/\{([^(^).]*)\}/g);
				if (m) note=m.join("; ");
				 //Concatenate
				//var text_string="\""+DateStr+"\""+ delimiter + "\"" + nm + "\"" + delimiter +  "\""+ PageReference + "\""+endofline ;
				var text_string="<outline "
				text_string+="text=\""
				if (ChronoBkMks[i].D) { //z
					text_string += "&lt;time startYear=&quot;" + ChronoBkMks[i].D.getFullYear().toString() + "&quot; ";
					text_string += "startMonth=&quot;" + (ChronoBkMks[i].D.getMonth()+1).toString() + "&quot; ";
					text_string += "startDay=&quot;" + (ChronoBkMks[i].D.getDate()).toString() + "&quot; ";
					text_string += "startHour=&quot;" +(ChronoBkMks[i].D.getHours()) + "&quot; ";
					text_string += "startMinute=&quot;" +(ChronoBkMks[i].D.getMinutes()) + "&quot; ";
//					text_string += "startSecond=&quot;" +(ChronoBkMks[i].D.getSeconds()) + "&quot; ";
					text_string += "&gt;" + ChronoBkMks[i].D.toLocaleString('default', {month: 'long'});
					text_string += "&lt;/time&gt;"
					var this_color=findClosestColorRGB(ChronoBkMks[i].color[1]*256,ChronoBkMks[i].color[2]*256,ChronoBkMks[i].color[3]*256);
					if (this_color!="c-black"){
						text_string += "&lt;span class=&quot;colored " + this_color + "&quot;&gt;"
						text_string += " " + clean_nm+ " [" + PageReference + "]&lt;/span&gt;"
					}else {
						text_string += " " + clean_nm + " [" + PageReference + "]";
					}
					text_string += "\""
					if(note){
						text_string +=" _note=\"" + note + "\"";
					}
					text_string += "/>";
				}
				rep.writeText(text_string +endofline);

		    }else{
				//console.println("Not printing " + nm);
			}
			oldNm=nm; //make a note of this nm
	}

	rep.writeText("</outline>" +endofline);
	rep.writeText("</body>" +endofline);
	rep.writeText("</opml>" +endofline);


	var chrono_path=oDoc.path.replace(/\/[^\/]+pdf$/,"/");
	 //console.println("This path :" + chrono_path);

	 //rep.save(chrono_path);
	var doc=rep.open("TEST");

	mySaveAs(doc,chrono_path, "chronology opml.txt");
	doc.closeDoc(true);
}

var mySaveAs = app.trustedFunction(
   function(oDoc,cPath,cFlName)
   {
   	app.beginPriv();
    	// Ensure path has trailing "/"   	
      cPath = cPath.replace(/([^/])$/, "$1/");
      cPath=cPath.replace("'", "\'"); //escape the apostrophe
      cFlName=cFlName.replace("'", "\'"); //escape the apostrophe
      //console.println(cPath+cFlName);
      //Check if this is a .txt or .pdf file
      var pattern_txt=/.txt$/i;
      var pattern_pdf=/.pdf$/i;
      
      try{
      	 //console.println(cPath +cFlName);
         if(pattern_txt.test(cFlName)) oDoc.saveAs(cPath + cFlName, "com.adobe.acrobat.accesstext");
         if(pattern_pdf.test(cFlName)) oDoc.saveAs(cPath + cFlName);
      }catch(e){
         app.alert("Error During Save");
         return false;
      }
      return true;
    app.endPriv();
   }
);

function WriteChronoReport (ChronoBkMks, oDoc, title, DayofWeek, bAge) {

   app.beginPriv();

	var delimiter="-";/*String.fromCharCode(35)+String.fromCharCode(64);*/
	var endofline="";
//	var title="Chronology"
	var ind; //how far to indent
	
	var sw;
	var heading;
	if (!DayofWeek && !bAge)sw=1;
	if (DayofWeek && !bAge)sw=2;
	if (DayofWeek && bAge)sw=3;
	if (!DayofWeek && bAge)sw=4;
	switch(sw){
		case 1: //just the date
			ind=34;
			heading="";
		break;
		case 2: //the date and the day of week
			ind=47;
			heading="        Dy";
		break;
		case 3: //the date, day of week and age
			ind=80;
			heading="        Dy    Age";
		break;
		case 4: //the date and age
			ind=60;
			heading="         Age";
		break;
		default:
			console.println("Shouldn't get here, chrono line 274");
		break;
	}
	


	var pgRect=[];
	pgRect[0]=0;
	pgRect[1]=841.9199829101562;
	pgRect[2]=595.3200073242188;
	pgRect[3]=0;
			
	var pgWidth =  pgRect[2] - pgRect[0];
	var pgHeight =  pgRect[1] - pgRect[3];
	nPgWdth=pgWidth-72;
	oDoc.newPage(oDoc.numPages,pgWidth, pgHeight);  //add a page of fixed size to the end for comparison

	var rpt=new Report(pgRect);

   var nNmLen,nFill,cTxt,aLnRct, nPage, nLastPos;
   nPage=0;
   nLastPos=pgHeight;
	  
   var nRptSize = 11/11;
   rpt.size = nRptSize;
   
    // Scale report text size to measuring size (Helvetica replacment)
   var nRplcSize = nRptSize*nHelvReplacementScale;
   var nScaledFiller = nRptSize * nFillerWidth;
	
	//Do the title
	rpt.size=2.0;
	var title_rect=rpt.writeText("+ " + title);
	rpt.divide();
	//rpt.size=1.0;
	//rpt.writeText(" ");
	//Do the filepaths
	rpt.size=0.7;
	for (var i=0; i<filepaths.length;i++) {filepaths[i].rect=rpt.writeText("- " + filepaths[i].path); rpt.writeText(" ");}
	rpt.size=1.0;
	rpt.writeText(" ");
	rpt.color=color.blue;
	rpt.writeText(heading);
	rpt.size=0.7;
	rpt.writeText(" ");
	rpt.size=1.0;
	rpt.color=color.black;

	//Do the chronology

	var Old_Date=new Date("10/10/1066");  //set the default to a very old date
	
	var aBkmkData=[];
	
	rpt.indent(ind); //indent to allow for date
	var oTxt="";
	
	for(i=0;i<ChronoBkMks.length;i++){
			var Fnt=GetFont(ChronoBkMks[i].sty);

			 //Make the date string
			//console.println("Dates : " + Old_Date + ", " + ChronoBkMks[i].D);
			var DateStr="";
			
			if(oDoc.info.date_of_birth!=""){ //do the age calculation if dob_C not null
				var mom1=moment(ChronoBkMks[i].D).startOf('day');
				var mom2=moment(dob_C).startOf('day');
				//console.println("Mom1 " + mom1);
				//console.println("Mom2 " + mom2);
				//ChronoBkMks[i].age=moment.duration(ChronoBkMks[i].D-dob_C).years();
				ChronoBkMks[i].age=parseInt(mom1.diff(mom2, 'years', true),10);
				//console.println("Age " + ChronoBkMks[i].age);
			}
			
			Same_Date=SameDate(ChronoBkMks[i].D,Old_Date); //set flag
			if(Same_Date){  //if this is a new date then write it, else don't
				 DateStr="              ";
				//DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);;
			}else{
				if(ChronoBkMks[i].D){
					DateStr=util.printd("dd/mm/yy", ChronoBkMks[i].D);
					Old_Date=ChronoBkMks[i].D;
				}
			}
			 //Make the page reference string
			ChronoBkMks[i].nPageLabel ? PageReference=/*(ChronoDlg.bPageLabeltrue)?*/ChronoBkMks[i].nPageLabel/*:(ChronoBkMks[i].nPage).toString()*/: PageReference="";
		
			 //Concatenate
			//var text_string=DateStr+ delimiter + ChronoBkMks[i].name+ "\"" + delimiter +  "\""+ PageReference + "\""+endofline ;
			
//			var cTxt=DateStr + "     " + ChronoBkMks[i].name;
			var cTxt= ChronoBkMks[i].name ? ChronoBkMks[i].name: "";

			cTxt!=oTxt ? ChronoBkMks[i].inc=true: ChronoBkMks[i].inc=false;
			oTxt=cTxt;

			if(ChronoBkMks[i].inc || !ChronoDlg.bAvReps){

				nNmLen = getTextWidth(oDoc, oDoc.numPages - 1, nRplcSize, Fnt, false, cTxt);
				nFill = (nPgWdth - nNmLen - ind - 10) / nScaledFiller;
				for (var n = 0; n < nFill; n++)
					cTxt += " .";

				rpt.size = nRptSize;
				//console.println(cTxt);

				rpt.color = ChronoBkMks[i].color;
				rpt.style = "DefaultNoteText";
				if (ChronoBkMks[i].sty == 2) rpt.style = "NoteTitle";

				aLnRct = rpt.writeText(cTxt);
				rpt.style = "DefaultNoteText";
				rpt.size = nRptSize;

				// Detect Page Change
				if ((aLnRct[3] > nLastPos) || (aLnRct[3] == aLnRct[1]))
					nPage++;

				// Correct for missed line
				if (aLnRct[3] == aLnRct[1]) {
					aLnRct[3] = pgHeight - 36;
					aLnRct[1] = pgHeight - 36 - 11;
				}

				nLastPos = aLnRct[3];

				rpt.size = nRptSize / 2;
				aSpRct = rpt.writeText(" "); //create a small line of spaces

				ChronoBkMks[i].chrono_pg = nPage;
				ChronoBkMks[i].rect = aLnRct;
			}

			//aBkmkData.push({cName:ChronoBkMks[i].name,rect:aLnRct, nLevel:nLvl, nBkPg:arguments.callee.nPage, nTextSize:aSizes[nLvl-1]});
	}	

	//delete the last page we used for comparison
	oDoc.deletePages(oDoc.numPages-1);

	//PUT THE PAGES INTO THE MAIN BUNDLE. WE STILL NEED TO ADD THE PAGE REFERENCES
	var oCHRONODoc = rpt.open("CHRONO") //turns the rpt into a doc
	var nCHRONOPages = oCHRONODoc.numPages;

	var chrono_path=oDoc.path.replace(/\/[^\/]+pdf$/,"/");
		
						
	var nStartPage=-1;
	if (ExistingTOC(oDoc)){  //Slot the contents in the right place: Front Sheet, Subs, Contents, Chrono
		nStartPage=GetPageNumberLastTOC(oDoc)+1;
		//console.println("Page number for inserting chrono is: " + nStartPage);	
	}else{
		if(ExistingSUBS(oDoc)){
			nStartPage=GetPageNumberLastSubs(oDoc);
		}else{
			if(ExistingFS(oDoc)){
					nStartPage=1;
				}else{
					nStartPage=0;
				}
			}
		}
	
	if (nStartPage<0)  {
		console.println("Error in setting page for placing CHRONO.");
		nStartPage=0; //set to default
	}
					
	var NumPages=oDoc.numPages;
	
	var start_page_at_end=0;
	var NewNumPages=oDoc.numPages;
	start_page_at_end=NumPages;
	//place pages at the end
	oDoc.insertPages ({nPage: NumPages-1, cPath: oCHRONODoc.path,});
	NewNumPages=oDoc.numPages;	
	//place dummy copy at the end - this stops re-page labelling everything else
	oDoc.insertPages ({nPage: oDoc.numPages-1,cPath: oCHRONODoc.path,});
	oDoc.setPageLabels(NumPages, ["r", "CHRONO_", 1]);  //set the page labels
////////

	var fldRect; //for the page label
	var fldRectDate; //for the date
	var fldRectDay; //for the day
	// First Find longest Page Label
	var nMaxWdth=0, bxWdth, bxRot, oSpn;
 //			var mxRot = (new Matrix2D()).fromRotated(this,0).invert();
	var mxRot = (new Matrix2D()).fromRotated(oDoc,0).invert();
			
	var oTstAnt = oDoc.addAnnot({page:0, type:"Line", points:[[100,200],[110,200]], 
                                     doCaption:true,rotate:oDoc.getPageRotation(0)});
                                     
                                     
                                     

	for(var i=0;i<ChronoBkMks.length;i++)	{
		if(typeof(ChronoBkMks[i].nPage) != "undefined"){
			var bPageLb=true;
			oSpn = [{textSize:11,fontFamily:Fnt}]
			oSpn[0].text = ChronoBkMks[i].nPageLabel;
			oTstAnt.richContents = oSpn;
			// Correct for page Rotation
			var bxRot = mxRot.transform(oTstAnt.rect);
			bxWdth = Math.abs(bxRot[2] - bxRot[0]);
			if(bxWdth > nMaxWdth) {
				nMaxWdth = bxWdth;
			}
			if(nMaxWdth > 54) nMaxWdth = 54;
		}
	}

		oTstAnt.destroy();

		//ADD THE PAGE & DATE REFERENCE
		nMaxWdth += 5;
		Old_Date=new Date("10/10/1066");  //set the default to a very old date
	
		for(var i=0;i<ChronoBkMks.length;i++) {
			if (ChronoBkMks[i].inc || !ChronoDlg.bAvReps) {
				var Fnt = GetFontForFields(ChronoBkMks[i].sty);
				var ind = 0;

				//Page label
				fldRect = [pgRect[2] - 92, ChronoBkMks[i].rect[3], pgRect[2] - 92 + nMaxWdth + 25, ChronoBkMks[i].rect[1]];
				oFld = oDoc.addField("CHRONOPage" + i, "text", start_page_at_end + ChronoBkMks[i].chrono_pg, fldRect);
				oFld.fillColor = color.white
				oFld.width = 0;
				oFld.alignment = "right";
				oFld.textSize = 10; //make smaller for windows
				oFld.textFont = Fnt;
				if (ChronoBkMks[i].color) oFld.textColor = ChronoBkMks[i].color;
				if (ChronoBkMks[i].nPageLabel) oFld.value = ChronoBkMks[i].nPageLabel;

				//Date & Day & Age
				Same_Date = SameDate(ChronoBkMks[i].D, Old_Date); //set flag
				if (Same_Date == false) {  //if this is a new date then write it, else don't
					//check to see if any of the entries for this date are stylised
					//console.println("Big style for " + ChronoBkMks[i].name +": " + BiggestStyleInBlock(i));
					Fnt = GetFontForFields(BiggestStyleInBlock(i));

					//Date
					fldRectDate = [pgRect[0] + 10, ChronoBkMks[i].rect[3], pgRect[0] + 10 + 60, ChronoBkMks[i].rect[1]];
					oFldDt = oDoc.addField("CHRONODate" + i, "text", start_page_at_end + ChronoBkMks[i].chrono_pg, fldRectDate);
					oFldDt.fillColor = color.white;
					oFldDt.width = 0;
					oFldDt.alignment = "left";
					oFldDt.textSize = 10; //make smaller for windows
					oFldDt.textFont = Fnt;
					if (ChronoBkMks[i].color) oFldDt.textColor = ChronoBkMks[i].color;
					var DateStr = ChronoBkMks[i].DTxt;
					oFldDt.value = DateStr;
					ind = ind + 58;
					if (DayofWeek) {
						//Day
						fldRectDay = [pgRect[0] + ind, ChronoBkMks[i].rect[3], pgRect[0] + ind + 20, ChronoBkMks[i].rect[1]];
						oFldDay = oDoc.addField("CHRONODay" + i, "text", start_page_at_end + ChronoBkMks[i].chrono_pg, fldRectDay);
						oFldDay.fillColor = color.white;
						oFldDay.width = 0;
						oFldDay.alignment = "left";
						oFldDay.textSize = 10; //make smaller for windows
						oFldDay.textFont = Fnt;
						if (ChronoBkMks[i].color) oFldDay.textColor = ChronoBkMks[i].color;
						//var DayStr=GetDayStr(ChronoBkMks[i].D);
						oFldDay.value = ChronoBkMks[i].DyStr;
						ind = ind + 18;
					}
					if (bAge) {
						//Age
						fldRectDay = [pgRect[0] + ind, ChronoBkMks[i].rect[3], pgRect[0] + ind + 30, ChronoBkMks[i].rect[1]];
						oFldDay = oDoc.addField("CHRONOAge" + i, "text", start_page_at_end + ChronoBkMks[i].chrono_pg, fldRectDay);
						oFldDay.fillColor = color.white;
						oFldDay.width = 0;
						oFldDay.alignment = "center";
						oFldDay.textSize = 10; //make smaller for windows
						oFldDay.textFont = Fnt;
						if (ChronoBkMks[i].color) oFldDay.textColor = ChronoBkMks[i].color;
						//var DayStr=GetDayStr(ChronoBkMks[i].D);
						//if(ChronoBkMks[i].age!=null) oFldDay.value = ChronoBkMks[i].age;
						var age = Duration(ChronoBkMks[i].D, dob_C, 0, false);
						if (age) oFldDay.value = age;
					}

					Old_Date = ChronoBkMks[i].D;
				}
				ChronoBkMks[i].nRightExtent = pgRect[2] - 72 + nMaxWdth;
			}
		}
		oDoc.flattenPages(start_page_at_end,start_page_at_end + nCHRONOPages - 1);


		
		//add an invisible field to the page to identify it as CHRONO
		var inch=72;
		var nTxtSize=20;
		var wdth=getTextWidth(oDoc,0,nTxtSize,Fnt,false,"CHRONO_")
		Fnt=GetFontForFields(0);
		for (i=start_page_at_end;i<oCHRONODoc.numPages+start_page_at_end;i++){
			var aRect = oDoc.getPageBox( {nPage: i} );
			aRect[0] = aRect[2]-wdth-0.5*inch; // from upper left hand corner of page, upper left x
			aRect[2] = aRect[0]+wdth; // Make it wdth wide, lower right x
			aRect[1] = aRect[3]+.5*inch;  // upper left y
			aRect[3] = aRect[1] - 24; // and 24 points high, lower right y

			oFld = oDoc.addField("CHRONO_"+i,"text", i, aRect);
			oFld.fillColor = color.transparent;
			oFld.width = 0;
			oFld.alignment = "right";
			oFld.textSize = nTxtSize;
			oFld.textFont = Fnt;	
			oFld.readonly=true;			
			oFld.value = "CHRONO_";
			oFld.display=display.hidden;
		}

	oCHRONODoc.closeDoc(true);
	oDoc.bringToFront();

	// Add Links over Text
	var lnkRect,oLnk;
	for(var i=0;i<ChronoBkMks.length;i++){
		if(ChronoBkMks[i].inc || !ChronoDlg.bAvReps) {

			if (typeof (ChronoBkMks[i].nRightExtent) != "undefined" || ChronoBkMks[i].rect) {
				lnkRect = [ChronoBkMks[i].rect[0], ChronoBkMks[i].rect[1], ChronoBkMks[i].nRightExtent, ChronoBkMks[i].rect[3]];
				oLnk = oDoc.addLink(start_page_at_end + ChronoBkMks[i].chrono_pg, lnkRect);
				oLnk.borderWidth = 0;
				var p = ChronoBkMks[i].nPage + nCHRONOPages;
				var p2 = ChronoBkMks[i].nPage; //don't have to worry about additional chrono pages if this is external file

				var code = "";
				var q = String.fromCharCode(34);
				if (ChronoBkMks[i].fpath != "") {
					//code="NFPageOpenChrono_(this,"+rpath + ", "+p+");";
					//    			oLnk.setAction(code);
					var rpath = ChronoBkMks[i].fpath;
					oLnk.setAction("NFPageOpenChrono(this,'" + rpath + "'," + p2 + ")");
				} else {
					oLnk.setAction("this.pageNum =" + p + ";");
				}
			}
		}
	}
	
	//Add special link to the title
	var oTitleLnk;
	var new_title_rect=title_rect;
	new_title_rect[2]=new_title_rect[0]+getTextWidth(oDoc,0,22,Fnt,false,"+")
	oTitleLnk = oDoc.addLink(start_page_at_end, new_title_rect);
	oTitleLnk.borderWidth = 0;
	var act_str="var f=GetFilePath(app.doc); if(AddExternalFile(f, app.doc)) RefreshCHRONO(app.doc);";
	oTitleLnk.setAction(act_str);

	//Add special links and depthbox to the external files
	for (var i=0; i<filepaths.length;i++){
		
		//the link to external file
		var oPathLnk;
		var new_f_rect=filepaths[i].rect;
		new_f_rect[2]=new_f_rect[0]+getTextWidth(oDoc,0,7,Fnt,false,"-")
		oPathLnk = oDoc.addLink(start_page_at_end, new_f_rect);
		oPathLnk.borderWidth = 0;
		var act_str="DeleteExternalFile("+i.toString()+", app.doc); RefreshCHRONO(app.doc);";
		oPathLnk.setAction(act_str);
		
		//the depthbox
		fldRect = filepaths[i].rect;
		fldRect[2]=filepaths[i].rect[0]+getTextWidth(oDoc,0,7,Fnt,false,"-"+filepaths[i].path+"10")+20;
		fldRect[0]=filepaths[i].rect[0]+getTextWidth(oDoc,0,7,Fnt,false,"-"+filepaths[i].path)+10;			
		oFld = oDoc.addField("ndepth"+i,"combobox", start_page_at_end, fldRect);
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
		//console.println("ndepth: " + filepaths[i].nDepth);
		if(filepaths[i].nDepth>0) oFld.value = parseInt(filepaths[i].nDepth,10);

	}

			
	//Now delete the dummy pages
	for(var i=0;i<nCHRONOPages;i++){
		oDoc.deletePages(oDoc.numPages-1);
	}

	//Now move them to the right place
	for (var i =1;i<=NewNumPages-NumPages;i++){
		oDoc.movePage(NewNumPages-1,nStartPage-1);
	}
	
	//console.println("Start page " + nStartPage);
	oDoc.pageNum=nStartPage;
	
	app.endPriv();

	return true;

}

function BiggestStyleInBlock(i){
	//returns the highest style no in the block
	var j=i+1;
	var current_date=ChronoBkMks[i].D;
	var current_sty=ChronoBkMks[i].sty;
	
	do{
		if(j>=ChronoBkMks.length-1) break;
		if(ChronoBkMks[j].sty>current_sty)current_sty=ChronoBkMks[j].sty;
		j++;	
	}while (SameDate(current_date, ChronoBkMks[j].D));
	
	return current_sty;
}

function DepthFieldChange(){
	if(!event.willCommitt && (event.changeEx!="")){
		filepaths[parseInt(event.target.name.replace(/[^0-9\.]/g, ''), 10)].nDepth=event.changeEx;
	}
	set_file_paths(this);
	//RefreshCHRONO(this);
}

var NFPageOpenChrono_=app.trustedFunction(function(oDoc,f, p){
	app.beginPriv();
	try{
		var doc=app.openDoc(f, oDoc);
		doc.disclosed=true;
		doc.pageNum=p;
	}catch (e){
		app.alert("Error " + e);
	}
	app.endPriv();
});

function DeleteExternalFile(i, oDoc){
	if(i<0 || i>filepaths.length-1) return false; //check in line
	if(i<filepaths.length-1){
		for (var j=i;j<filepaths.length-1;j++){
			filepaths[j].path=filepaths[j+1].path; //shift the path down one
			filepaths[j].nDepth=filepaths[j+1].nDepth;
			filepaths[j].MaxnDepth=filepaths[j+1].MaxnDepth;
		}
	}
	filepaths.pop(); //delete the last one
	set_file_paths(oDoc);
	return true;
}

var AddExternalFile=app.trustedFunction(function(f, oDoc){
	app.beginPriv()
	if(f=="")return false;
	if(filepaths.length>=MAX_FILE_PATHS){
		app.alert("You have reached maximum number of external files");
		return false;
	}
	var fl={path: GetRelativePath(oDoc,f), rect: null, nDepth:"", MaxnDepth:1};
	filepaths.push(fl);
	set_file_paths(oDoc);
	app.endPriv();
	return true;
});

function ExistingCHRONO(oDoc){
	 //Function returns true if existing TOC
	var pattern=/CHRONO_/;
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

function DeleteOldChrono(oDoc){
	console.println("Deleting Chrono...");
	 //Delete old Chronology
	app.beginPriv();

	var d=IdentifyPagesForDeletion(oDoc, /CHRONO_/);
	DeletePages(oDoc, d);
	
	clear_chrono_array();

	//while(filepaths.length > 0) filepaths.pop();

	app.endPriv();
	return true;
}

var DoChronoThisFile=app.trustedFunction(function(oDoc, nDepth){
			oDoc.info.CHRONOExists=false;  //set flag to false if we delete TOC
			collect_file_paths(oDoc);
			 //Keep the persistent nLevel within bounds
			if(oDoc.info.CHRONOnLevel){
				if(oDoc.info.CHRONOnLevel<1) oDoc.info.CHRONOnLevel=1;
				if(oDoc.info.CHRONOnLevel>nDepth) oDoc.info.CHRONOnLevel=nDepth;
			}
			clear_chrono_array();
			SetKeyDates(oDoc);
			CollectAllBookMarks(oDoc, oDoc.info.CHRONOnLevel);
			//console.println("Dob_C " + dob_C);
	        ChronoBkMks.sort(compare);
			set_file_paths(oDoc);
	        PrintChrono(ChronoBkMks, oDoc);
			PrintChronoOPML(ChronoBkMks, oDoc);
			oDoc.info.CHRONOExists=WriteChronoReport(ChronoBkMks,oDoc, oDoc.info.CHRONOTitle, oDoc.info.CHRONODayofWeek, oDoc.info.CHRONOAge);  //set flag if we successfully add TOC
	         //Clear the array
	        clear_chrono_array();
});

var RefreshCHRONO = app.trustedFunction (function(oDoc){
	app.beginPriv();
	var plat=app.platform;
 //	 //console.println("Console: " + plat);	

	 //Updates the CHRONO if it exists
	if (ExistingCHRONO(oDoc)){
		var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
		if(DeleteOldChrono(oDoc)) {
			oDoc.info.CHRONOExists=false;  //set flag to false if we delete TOC
			DoChronoThisFile(oDoc,nDepth);			
		}
	}
	app.endPriv();
});

function IsPDFAlreadyOpen(file_path){
	//returns true if the file_path is open
	var result=false; //flag. by default is false
	var d=app.activeDocs;
	for (var i=0;i<d.length; i++){
		path=d[i].path;
		if (path==file_path) result=true;
	}
	return result;
}

function AddKeyDateToArray(str,dt_string, oDoc){
	//adds a key date named str
	console.println("AddKeyDateArray");
	console.println(oDoc.path);
	var BM=new ChronoBkMk();
	var nm=str + ", "+ dt_string;
	var DayStr=GetDayStrBkFromString(nm, oDoc);
	console.println("AddKeyDateArray2");
	var DtTxt=GetDateTextFromString(nm, oDoc).replace(time_element, "").trim(); //and remove any time element
	var TimeStr=GetTimePartFromString(nm); //Get any time element
	TimeStr ? TimeStr=TimeStr+" " : TimeStr="";
		
	//BM={fpath: "", name: TimeStr + "d.o.b. C", D: dob_C, DTxt: DtTxt, DyStr: DayStr, T: TimeStr, nPage: null, nPageLabel: null, rect: null, chrono_pg: null, cView:null, nRightExtent: 0, color: color.red, age: null, sty: 0};  //assign values to the object
	BM.name=TimeStr+str;
	BM.DyStr=DayStr;
	BM.DTxt=DtTxt;
	BM.D=GetDateFromString(nm, oDoc);
	BM.T=TimeStr;
	BM.sty=0;
	BM.color=color.red;
	ChronoBkMks.push(BM);  //add it to the array
}


var CollectAllBookMarks=app.trustedFunction(function(oDoc, nLvl){
	var err="";
	app.beginPriv();
	//console.println("collect all bookmarks");
	//console.println(oDoc.path);

	//Add key dates
	if(oDoc.info.date_of_birth!=""){
		AddKeyDateToArray("d.o.b. C", oDoc.info.date_of_birth, oDoc)
	}
	if(oDoc.info.date_of_injury!=""){
		AddKeyDateToArray("date of injury", oDoc.info.date_of_injury, oDoc);
	}
	
	//console.println("collect all bookmarks2");

	//First for this file
	CollectBookMarks(oDoc.bookmarkRoot,0,oDoc, nLvl,"");	
	
	//Then for the linked files
	for(var i=0;i<filepaths.length;i++){
		var abs_path=BuildAbsolutePath(oDoc,filepaths[i].path);
		//console.println("Abs path: " + abs_path);
		//console.println("Rel path: " + filepaths[i].path);
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
		if (doc.info.CHRONOnLevel>mx_dp)doc.info.CHRONOnLevel=mx_dp; //keep in bounds
		if(filepaths[i].nDepth==undefined || filepaths[i].nDepth==""){
			//console.println("File path here: " + filepaths[i].nDepth);
			filepaths[i].nDepth=(doc.info.CHRONOnLevel ? doc.info.CHRONOnLevel : filepaths[i].MaxnDepth); //if max depth defined in linked pdf then use it if nothing better; else set to max
		}
				
		CollectBookMarks(doc.bookmarkRoot,0,doc, filepaths[i].nDepth, filepaths[i].path);
		
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
		return true;
	}
	app.endPriv();
});

function CollectBookMarks(Bm, nLevel, oDoc, nLvlMax, filepath){

	 //Iterate through the bookmark tree, get the name and date for each date stamped bookmark and push it to the array
	 //console.println("Collect1");
	
	if(GetDate(Bm,oDoc) && Bm.style!=1){  //i.e. there is a date in this bookmark and it is not italicised
		 //get the date from the bookmark name
		var Dt=GetDate(Bm, oDoc);
		var DtTxt=GetDateText(Bm, oDoc).replace(time_element, "").trim(); //and remove any time element
		var DayStr=GetDayStrBk(Bm, oDoc);
		//console.println(dob_C + ": " + Bm.name + " " + Dt);
		 // Find Target Page for Bookmark
		oDoc.pageNum = 0;
		Bm.execute();
		nTgtPage1 = oDoc.pageNum;
		oDoc.pageNum = oDoc.numPages;
		Bm.execute();
		nTgtPage2 = oDoc.pageNum;
		var Pg;	
		var PgLabel;	
		if(nTgtPage1==nTgtPage2){
			Pg=nTgtPage2;
			PgLabel=oDoc.getPageLabel(Pg);
		}
				
		var BName=Bm.name;  //store the name
		var TimeStr=GetTimePartFromString(BName); //Get any time element
		//console.println(BName + " " + TimeStr);
		var Tm=GetTimePartFromString(Bm.name);
		BName=RemovePageLabelFromString(BName);  //remove page label []
		BName=delete_date_end_string(BName, oDoc);  //remove date
		//if (TimeStr!=null) {
		//	BName=RemoveTimeString(BName); //remove time
		//}
		//console.println("Collect1.5");
		BName=RemoveLegalNumThisFromString(BName);  //remove legal numbering
		 //what you are left with is the name for the chrono entry
		
		if(BName=="Root"){  //get parents name if this is just a date
			var parentNm=Bm.parent.name;
			TimeStr=GetTime(parentNm);
			parentNm=RemovePageLabelFromString(parentNm);
			parentNm=delete_date_end_string(Bm.parent, oDoc);
			//console.println("Collect3");
			if(TimeStr!=null){
				//console.println("Collect3.25");
				parentNm=RemoveTimeString(parentNm);
			}
			//console.println("Collect3.5");
			parentNm=RemoveLegalNumThis(parentNm);
			BName=parentNm;
			//Bm.parent.name=parentNm;
		}
		if (TimeStr!=null){			
			BName=TimeStr+" " + BName;
		}
		
		//console.println("Collect4");
		var a_rect=[];
		var a_pg=0;
		var a_View=oDoc.viewState.toSource();
		
		var bld=false;
		if(Bm.style==2) bld=true;
		//console.println("Name: " + Bm.name + " style: " + Bm.style + " result: " + bld);
				
		var BM=new ChronoBkMk();
		BM={fpath: filepath, name: BName, D: Dt, DTxt: DtTxt, DyStr: DayStr, T: Tm, nPage: Pg, nPageLabel: PgLabel, rect: a_rect, chrono_pg: a_pg, cView:a_View, nRightExtent: 0, color: Bm.color, age: null, sty: Bm.style};  //assign values to the object
		ChronoBkMks.push(BM);  //add it to the array
		
		//Modify BM if this is a age 10 type situation
		if(patK.test(RemovePgLbAndLegalNumbering(Bm.name))){
			BM.age=GetAgeFromString(Bm.name);
			BM.name="age "+BM.age.toString()+" " + delete_date_end_string(RemovePgLbAndLegalNumbering(Bm.name),oDoc);
			BM.DTxt=SwapDateFromText(", "+BM.D.getDate().toString()+"/"+(BM.D.getMonth()+1).toString()+ "/"+BM.D.getFullYear().toString(), true, oDoc);
		}
		
		//console.println("Collect5");
		//Add another BM if this is an age 10-20 type situation
		if(patL.test(RemovePgLbAndLegalNumbering(Bm.name))){
				var clone_BM=new ChronoBkMk();
				clone_BM={fpath: BM.fpath, name: Bm.name, D: BM.D, DTxt: BM.DTxt, DyStr: BM.DyStr, T: BM.T, nPage: BM.nPage, nPageLabel: PgLabel, rect: BM.rect, chrono_pg: BM.chrono_pg, cView:BM.cView, nRightExtent: 0, color: BM.color, age: BM.age, sty: Bm.style};
//				var ages=GetDateTextFromString(RemovePgLbAndLegalNumbering(Bm.name)).match(/\d+(\.\d+)?/g);
				var ages=GetAgesFromAgeSpan(RemovePgLbAndLegalNumbering(Bm.name),oDoc);
				if(ages!=null){
					var age1=Number(ages[0]);
					var age2=Number(ages[1]);
					//console.println("Age1: " + ages [0]);
					//console.println("Age2: " + ages [1]);
					var Dt1=GetDateFromAge(age1);
					var Dt2=GetDateFromAge(age2);
					//Move D2 to the end of the month (if part year) or the end of the year (if whole age)
					if(Dt2){
						if(frac(age2)>0){
							//move to end of month
							//Dt2=moment(Dt2).endOf('month').toDate();
						}else{
							//add a year, less a millisecond
							Dt2=moment(Dt2).add(1,'y').subtract(1,'ms').toDate();					
						}
					}
					//console.println("Dt1: " + Dt1);
					//console.println("Dt2: " + Dt2);
					
					if(Dt1){
						Bm.age=age1;
						BM.DTxt=SwapDateFromText(", "+BM.D.getDate().toString()+"/"+(BM.D.getMonth()+1).toString()+ "/"+BM.D.getFullYear().toString(), true, oDoc);
						BM.name="<age "+age1.toString()+" " + delete_date_end_string(RemovePgLbAndLegalNumbering(Bm.name),oDoc);
					}
					if(!Dt1 && Dt2){
						Bm.age=age2;
						BM.D=Dt2;
						BM.DTxt=SwapDateFromText(", "+BM.D.getDate().toString()+"/"+(BM.D.getMonth()+1).toString()+ "/"+BM.D.getFullYear().toString(), true, oDoc);
						BM.name="age "+age2.toString()+" " + delete_date_end_string(RemovePgLbAndLegalNumbering(Bm.name),oDoc) + ">";
					}
					if(Dt2 && Dt1){
						clone_BM.age=age2;
						clone_BM.D=Dt2;
						var dur_str=Duration(clone_BM.D,BM.D,0,true);
						if(dur_str)BM.name=BM.name+" ("+dur_str+")";
						clone_BM.DTxt=SwapDateFromText(", "+clone_BM.D.getDate().toString()+"/"+(clone_BM.D.getMonth()+1).toString()+ "/"+clone_BM.D.getFullYear().toString(), true, oDoc);
						clone_BM.name="age "+age2.toString() + " " + delete_date_end_string(RemovePgLbAndLegalNumbering(clone_BM.name),oDoc);
						if(dur_str)clone_BM.name=clone_BM.name+" ("+dur_str+")";
						clone_BM.name=clone_BM.name+">";				
						if(clone_BM.D)ChronoBkMks.push(clone_BM);
					}
				}			
		}
		//console.println("Collect6");
		
		//Date spans
		var date_part=GetDatePartFromString(RemovePgLbAndLegalNumbering(Bm.name),oDoc);
		//console.println("Collect6.1");
		if(!age_element.test(date_part) && !ages_element.test(date_part) && date_part.match("-")){ //i.e. not an age span, therefore a date span
			var p=date_part.split("-"); //split by divider -
		 //console.println("Collect6.2");
			if(p[0]){
				var clone_BM=new ChronoBkMk();
				clone_BM={fpath: BM.fpath, name: Bm.name, D: BM.D, DTxt: BM.DTxt, DyStr: BM.DyStr, T: BM.T, nPage: BM.nPage, nPageLabel: PgLabel, rect: BM.rect, chrono_pg: BM.chrono_pg, cView:BM.cView, nRightExtent: 0, color: BM.color, age: BM.age, sty: Bm.style};
				BM.name=delete_date_end_string(Bm.name, oDoc);
				BM.name=GetTimePartFromString(", "+ p[0])!=null ? "<"+GetTimePartFromString(", "+ p[0])+ " "+ RemovePgLbAndLegalNumbering(BM.name): "<"+RemovePgLbAndLegalNumbering(BM.name);
				BM.D=MoveToStartPeriodString(", " + p[0], BM.D);
				BM.D=GetDateFromString(", " + p[0], oDoc);
				//console.println("Collect6.3");
				//console.println(dob_C + " " + BM.name + " ==> "+ BM.D);
				BM.DTxt=SwapDateFromText(", "+BM.D.getDate().toString()+"/"+(BM.D.getMonth()+1).toString()+ "/"+BM.D.getFullYear().toString(), true, oDoc);		
				clone_BM.D=GetDateFromString(", " + p[1], oDoc);
				clone_BM.D=MoveToEndPeriodString(", " + p[1], clone_BM.D);
				//console.println("Collect6.4");
				if(clone_BM.D){
					var dur_str=Duration(clone_BM.D, BM.D,0,true);
					if(dur_str)BM.name=BM.name+" ("+dur_str+")";
					clone_BM.DTxt=SwapDateFromText(", "+clone_BM.D.getDate().toString()+"/"+(clone_BM.D.getMonth()+1).toString()+ "/"+clone_BM.D.getFullYear().toString(), true, oDoc);
					clone_BM.name=delete_date_end_string(clone_BM.name, oDoc);
					clone_BM.name=GetTimePartFromString(', '+ p[1])!=null ? GetTimePartFromString(', '+p[1])+ " " + RemovePgLbAndLegalNumbering(clone_BM.name) : RemovePgLbAndLegalNumbering(clone_BM.name);
					if(dur_str)clone_BM.name=clone_BM.name+" ("+dur_str+")";
					clone_BM.name=clone_BM.name + ">";
					clone_BM.DyStr=GetDayStrBkFromString(", " + clone_BM.DTxt, oDoc);
					ChronoBkMks.push(clone_BM);
				}
		 //console.println("Collect6.5");
			}else{
				BM.DTxt=SwapDateFromText(", "+BM.D.getDate().toString()+"/"+(BM.D.getMonth()+1).toString()+ "/"+BM.D.getFullYear().toString(), true, oDoc);		
				BM.name=delete_date_end_string(Bm.name, oDoc);
				BM.name=GetTimePartFromString(", "+ p[1])!=null ? GetTimePartFromString(", "+ p[1])+ " "+ RemovePgLbAndLegalNumbering(BM.name) + ">": RemovePgLbAndLegalNumbering(BM.name) +">";
		 //console.println("Collect6.6");
			}
		}
	}

		 //console.println("Collect7");
	 //console.println("Level, Max level: " + nLevel + ", " + nLvlMax);

	 // process children
	if (nLevel<nLvlMax && Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			CollectBookMarks(Bm.children[i], nLevel + 1, oDoc, nLvlMax, filepath);
		}
	}

};


function frac(f) {
    return f % 1;
}

function GetAgesFromAgeSpan(S, oDoc){
	//returns array of ages
	var date_part=GetDatePartFromString(S, oDoc);
	if(!ages_element.test(date_part))return null; //quit if not ages element
	var S=date_part.replace(/^age( )?/, ''); //remove age part
	S=S.replace(" ",""); //remove spaces
	var p=S.split("-");
	return p;
}


function MoveToStartPeriodString(S, Dt){
	//returns date shifted to the end of the period
	var mom=moment(Dt);
	if(mom.isValid()){
		var period=GetPeriodFromString(S);
		if(period!="NO MATCH") {
			return mom.startOf(period).toDate();
		}else{
			return Dt;
		}
	}else{
		return null;
	}
}


function MoveToEndPeriodString(S, Dt){
	//returns date shifted to the end of the period
	var mom=moment(Dt);
	if(mom.isValid()){
		var period=GetPeriodFromString(S);
		if(period!="NO MATCH") {
			return mom.endOf(period).toDate();
		}else{
			return Dt;
		}
	}else{
		return null;
	}
}


function MoveToEndPeriod(Bm, Dt){
	return MoveToEndPeriodString(Bm.name,Dt);
}

function GetPeriodFromString(S){
	//Returns 'year', 'month', 'day' depending =
	switch(GetDateFormatTypeFromString(S)){
		case "A":
			return "day";
		break;
		case "B":
			return "day";
		break;
		case "C":
			return "month";
		break;
		case "D":
			return "month";
		break;
		case "E":
			return "day";
		break;
		case "F":
			return "day";
		break;
		case "G":
			return "month";
		break;
		case "H":
			return "month";
		break;
		case "I":
			return "year";
		break;
		case "J":
			return "year";
		break;
		case "K":
			return "year";
		break;
		case "L":
			return "year";
		break;
		default:
			//no match
			//console.println("GetPeriodFromString: Shouldn't get here.");
			return "NO MATCH";
		break;
	}
}

function GetPeriod(Bm){
	return GetPeriodFromString(Bm.name);
}

function RemovePgLbAndLegalNumbering(S){
	return RemoveLegalNumThisFromString(RemovePageLabelFromString(S));
}

var ChronoBkMk=function (fpath,name,D,DTxt,DyStr,T,nPage,nPageLabel,rect,chrono_pg,cView,nRightExtent,colour,age,sty){
	this.fpath=fpath;
	this.name=name;
	this.D=D;
	this.DTxt=DTxt;
	this.DyStr=DyStr;
	this.T=T;
	this.nPage=nPage;
	this.nPageLabel=nPageLabel;
	this.rect=rect;
	this.chrono_pg=chrono_pg;
	this.cView=cView;
	this.nRightExtent=0;
	this.colour=colour;
	this.age=null;
	this.sty=sty;	
};

/*
function DoAge(){
	console.println("Doing age...");
	for(var i=0;i<ChronoBkMks.length;i++){
		var age=GetAgeFromString(ChronoBkMks[i].name);
		var dt=GetDateFromAgeString(ChronoBkMks[i].name);
		if (dt!=null){
			//add the age to the dob_C
			ChronoBkMks[i].D=dt;
			//add age to the name string			
			ChronoBkMks[i].DTxt=SwapDateFromText(", "+dt.getDate().toString()+"/"+(dt.getMonth()+1).toString()+ "/"+dt.getFullYear().toString(), true);
		}
	}
}*/

function Duration(a,b, precision, rnd){
	//returns a string being the duration between dates a and b in the most convenient unit
	//precision (int) ==> no of decimal places
	//round (bool) ==> round to nearest unit
	 
	var mom_a=moment(a);
	var mom_b=moment(b);
	
	var diff_yrs=mom_a.diff(mom_b, 'years', true);
	var diff_mms=mom_a.diff(mom_b, 'months', true);
	var diff_wks=mom_a.diff(mom_b, 'weeks', true);
	var diff_dds=mom_a.diff(mom_b, 'days', true);
	var diff_hrs=mom_a.diff(mom_b, 'hours', true);
	var diff_mins=mom_a.diff(mom_b, 'minutes',true);
	var diff_secs=mom_a.diff(mom_b, 'seconds',true);
	var diff_m_s=mom_a.diff(mom_b, 'milliseconds',true);
	
	
	if(rnd){
		diff_yrs=round(diff_yrs,precision);
		diff_mms=round(diff_mms,precision);
		diff_wks=round(diff_wks,precision);
		diff_dds=round(diff_dds,precision);
		diff_hrs=round(diff_hrs,precision);
		diff_mins=round(diff_mins,precision);
		diff_secs=round(diff_secs,precision);
		diff_m_s=round(diff_m_s,precision);
	}else{
		diff_yrs=no_round(diff_yrs,precision);
		diff_mms=no_round(diff_mms,precision);
		diff_wks=no_round(diff_wks,precision);
		diff_dds=no_round(diff_dds,precision);
		diff_hrs=no_round(diff_hrs,precision);
		diff_mins=no_round(diff_mins,precision);
		diff_secs=no_round(diff_secs,precision);
		diff_m_s=no_round(diff_m_s,precision);		
	}
	

	var res;
	var str="";
	
	if(Math.abs(diff_yrs)>1){res=diff_yrs;str="yrs"; if(res==1)str=str.substring(0,str.length-1); return res.toString()+" " + str;};
	if(Math.abs(diff_mms)>1){res=diff_mms;str='ms'; if(res==1)str=str.substring(0,str.length-1); return res.toString()+" " + str;};
	if(Math.abs(diff_wks)>1){res=diff_wks;str='wks'; if(res==1)str=str.substring(0,str.length-1); return res.toString()+" " + str;};
	if(Math.abs(diff_dds)>1){res=diff_dds;str='dys'; if(res==1)str=str.substring(0,str.length-1);return res.toString()+" " + str;};
	if(Math.abs(diff_hrs)>1){res=diff_hrs;str='hrs'; if(res==1)str=str.substring(0,str.length-1);return res.toString()+" " + str;};
	if(Math.abs(diff_mins)>1){res=diff_mins;str='mins'; if(res==1)str=str.substring(0,str.length-1);return res.toString()+" " + str;};
	if(Math.abs(diff_secs)>1){res=diff_secs;str='secs'; if(res==1)str=str.substring(0,str.length-1);return res.toString()+" " + str;};
	if(Math.abs(diff_m_s)>1){res=diff_m_s;str='m/s'; if(res==1)str=str.substring(0,str.length);return res.toString()+" " + str;};
	
	console.println("Shouldn't get here (Duration/Chrono.js)");
	return null;
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function no_round(value, precision){
    var multiplier = Math.pow(10, precision || 0);
	return parseInt(value*multiplier,10)/multiplier;	
}


function compare(a,b){
	if(a.D<b.D){
		return -1;
	}
	if(a.D>b.D){
		return 1;
	}
	//If the dates are the same, compare the page references
	if(a.nPage<b.nPage){
		return -1;
	}
	if(a.nPage>b.nPage){
		return 1;
	}
	return 0;
}

var ChronoDlg =
{
    strTitle:"",
    bDayofWeek:true,
    bAge:true,
    bSepFile:true,
	bAvReps: false,
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
            "DyWk": this.bDayofWeek,
            "nAge": this.bAge,
            "SpFl": this.bSepFile,
			"AvRp": this.bAvReps,
        };
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
		this.bDayofWeek = oRslt["DyWk"];
		this.bAge=oRslt["nAge"];
		this.bAvReps = oRslt["AvRp"];
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
        name: "Chronology maker tool",
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
                                name: "Title (appears at top of first page):",
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
/*                          {
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
  */                        {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta1",
                                        name: "Number of Bookmark Levels to Include in chrono:",
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
/*                                    {
                                        type: "static_text",
                                        item_id: "sta2",
                                        name: "Day of the week: ",
                                    },
*/                                   {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "DyWk",
                                        name: "Include day of the week",
                                        variable_Name: "bDayofWeek",
                                    },
                                   {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "nAge",
                                        name: "Create Age",
                                        variable_Name: "bAge",
                                    },
/*                              {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "DyWk",
                                        name: "Page Label",
                                    },
        */                       ]
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
										{
											type: "check_box",
											group_id: "LbTy",
											item_id: "AvRp",
											name: "Avoid repeats",
											variable_Name: "bAvReps",
										},
									]
							}
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


var strDataMakeChronoIcon = 
"0000000000000000000000000000000000000000070000005e000000ae000000e2000000fa000000fa000000e0000000ac0000005a0000000600000000000000000000000000000000000000000000000000000000000000000000000000000058000000e5000000ff000000fb000000cc000000ae000000ae000000ce000000fc000000ff000000e2000000520000000000000000000000000000000000000000000000000000000200000096000000ff000000e90000006f00000010000000000000004f0000004b000000000000001200000072000000eb000000ff0000008e000000010000000000000000000000000000000000000095000000ff000000b800000012000000000000000000000000000000d6000000d200000000000000000000000000000014000000bd000000ff0000008e00000000000000000000000000000058000000ff000000b80000003a0000007d000000010000000000000000000000d8000000d40000000000000000000000020000008000000038000000bd000000ff000000510000000000000007000000e5000000e9000000120000007d000000f0000000090000000000000000000000d8000000d400000000000000000000000c000000f20000007800000015000000ed000000e0000000050000005e000000ff0000006f000000000000000100000009000000000000000000000000000000d8000000d400000000000000000000000000000009000000010000000000000075000000ff00000057000000ae000000fb00000010000000000000000000000000000000000000000000000000000000d8000000d400000000000000000000000000000000000000000000000000000014000000fd000000a7000000e2000000cc00000000000000000000000000000000000000000000000000000010000000e7000000e40000000e000000000000000000000000000000000000000000000000000000d2000000db000000fa000000ae0000004c000000c50000000e000000000000000000000000000000920000006a0000006f0000008c00000000000000000000000000000011000000c700000046000000b3000000f5000000fa000000ae00000049000000bf0000000d0000000000000000000000000000008f0000006f00000075000000c00000000300000000000000000000000f000000c100000042000000b4000000f4000000e0000000ce0000000000000000000000000000000000000000000000000000000e0000008c000000c2000000ff000000a80000000300000000000000000000000000000000000000d3000000da000000ac000000fc000000120000000000000000000000000000000000000000000000000000000000000003000000a8000000ff0000004300000000000000000000000000000017000000fe000000a50000005a000000ff0000007200000000000000020000000c00000000000000000000000000000000000000000000000300000043000000020000000c000000020000000000000078000000ff0000005300000006000000e2000000eb0000001400000080000000f2000000090000000000000000000000000000000000000000000000000000000c000000f40000007a00000018000000ef000000dd000000040000000000000052000000ff000000bd0000003800000078000000010000000000000000000000110000000f0000000000000000000000020000007a00000036000000c2000000ff0000004b0000000000000000000000000000008e000000ff000000bd00000015000000000000000000000000000000c7000000c100000000000000000000000000000018000000c2000000ff0000008700000000000000000000000000000000000000010000008e000000ff000000ed0000007500000014000000000000004600000042000000000000001700000078000000ef000000ff000000870000000100000000000000000000000000000000000000000000000000000051000000e0000000ff000000fd000000d2000000b3000000b4000000d3000000fe000000ff000000dd0000004b0000000000000000000000000000000000000000000000000000000000000000000000000000000500000057000000a7000000db000000f5000000f4000000da000000a500000053000000040000000000000000000000000000000000000000000000";

var oIconMakeTOC = {count: 0, width: 20, height: 20,
read: function(nBytes){return strDataMakeChronoIcon.slice(this.count, this.count += nBytes);}};

var oButObjMakeTOC = 
{cName: "No_FussMakeChronoMakerTool",
cExec: "No_FussMakeChronoMaker(event.target)",
cEnable: "event.rc = (app.doc != null) &&  (((app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)) || filepaths.length>0)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.CHRONOExists",
cTooltext: "Make chronology",
cLabel: "Chronology maker",
oIcon: oIconMakeTOC,
nPos: 2
}

try{app.removeToolButton("No_FussMakeChronoMakerTool");}catch(e){}
try{app.addToolButton(oButObjMakeTOC);}catch(e){}


