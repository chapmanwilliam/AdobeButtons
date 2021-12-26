

 //*******************************************\\
 //This toggles dates in bookmark names from yy-mm-dd to dd-mm-yy

var file_date_pattern=/^(\d{2,4})(?![\:\.])(-(\d{1,2})){0,2} ?(\d{2}(:\d{2}){0,3})?($| )/;

var leading_spaces=/^ *(.*)/;
var trailing_spaces=/(.*) *$/;

function FileDateToBookmarkDate(Bm, nLevel, oDoc){
    //console.println("File to Bookmark");
	if(Bm.style!=1){  //skip italicised bookmarks
		if(DoesThisHaveDateStart(Bm, oDoc)){
			Bm.name=MoveDateToEnd(Bm, oDoc);
		}

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			FileDateToBookmarkDate(Bm.children[i], nLevel + 1, oDoc);
		}
	}
  }
}

function BookmarkToFileDate(Bm, nLevel, oDoc){
    //console.println("Bookmark to file");

	if(Bm.style!=1){  //skip italicised
		if(GetDate(Bm, oDoc)){
			Bm.name=MoveDateToStart(Bm, oDoc);
		}
		 // process children
		if (Bm.children != null){	
			for (var i = 0; i < Bm.children.length; i++){	
				BookmarkToFileDate(Bm.children[i], nLevel + 1, oDoc);
			}
		}
  	}
}

function DoesThisHaveDateStartString(S, oDoc){
	if(!file_date_pattern.test(S)){ return false;} //not even a match
	var f=GetLocaleDate(oDoc); //whether this is UK or US
	var a=S.match(file_date_pattern);
	a[0]=a[0].trim().replace(time_element,"").trim();
	
	var p=a[0].split("-");  //this can be length 1,2 or 3
	
	var yyyy=-1;
	var mm=-1;
	var dd=-1;
	var x;
	
	yyyy=Number(p[0]);
	if(yyyy<100){
		if(yyyy<50) {x=yyyy+2000;} else {x=yyyy+1900;}
		yyyy=x;
	}
	if (f=='en-GB'){
		if(p.length>1) {mm=Number(p[1]);} else {mm=1;}
		if(p.length>2) {dd=Number(p[2]);} else {dd=1;}
	}
	if (f=='en-US'){
		if(p.length==1) {mm=1;dd=1;}
		if(p.length==2) {mm=Number(p[1]);dd=1;}
		if(p.length==3) {dd=Number(p[1]);mm=Number(p[2]);}
	}

//	console.println("Date start " + S + ": " + dd + "/" + mm + "/" + yyyy);
//	console.println(p);

	if(IsValidDate(dd,mm,yyyy)) {return true;} else {return false;}  //not valid date	
}

function DoesThisHaveDateStart(Bm, oDoc){
	return DoesThisHaveDateStartString(Bm.name, oDoc);		
}

function DoesThisHaveDateEndString(S,oDoc){
	if(GetDateFormatTypeFromString(S)=="NO MATCH"){
		 return false;
	}else{
		 return true;
	}
}

function DoesThisHaveDateEnd(Bm, oDoc){
	return DoesThisHaveDateEndString(Bm.name, oDoc);
}

function HowManyPartsToDateStart(Bm, oDoc){
	 //returns how long the date is 1,2 or 3
	var ret=-1;
	if(!DoesThisHaveDateStart(Bm, oDoc)) return -1;  //no date at all
	var a=Bm.name.match(file_date_pattern);
	var p=a[0].split("-");  //this can be length 1,2 or 3
	return p.length;	
}

function HowManyPartsToDateEndString(S, oDoc){
	 //returns how long the date at the end is, 1,2,3
	if(!GetDateFromString(S, oDoc) || patK.test(RemovePgLbAndLegalNumbering(S)) || patL.test(RemovePgLbAndLegalNumbering(S))) {
		console.println(S);
		return 0;  //quit if not valid
	}
	switch(GetDateFormatTypeFromString(S)){
		case "A":
			return 3;
		break;
		case "B":
			return 3;
		break;
		case "C":
			return 2;
		break;
		case "D":
			return 2;
		break;
		case "E":
			return 3;
		break;
		case "F":
			return 3;
		break;
		case "G":
			return 2;
		break;
		case "H":
			return 2;
		break;
		case "I":
			return 1;
		break;
		case "J":
			return 1;
		break;
		case "K":
		case "L":
			//age parts. Ignore
			return 0; 
		break;
		default:
			console.println(S + ": Error getting no parts to end date");
			return 0;
		break;		
	}
}

function HowManyPartsToDateEnd(Bm, oDoc){
	return HowManyPartsToDateEndString(Bm.name, oDoc);
}

function MoveDateToStart(Bm, oDoc){
	 //returns string with date at start
	var dt=GetDate(Bm,oDoc);	 //Get the date from bookmark
	var f=GetLocaleDate(oDoc); //whether this is UK or US
	var S=RemovePgLbAndLegalNumbering(Bm.name);
	if(!dt || patK.test(S) || patL.test(S) || GetDatePartFromString(S,oDoc).match("-")) return Bm.name;  //quit if no valid date

	 //convert to strings
	var d=dt.getDate().toString();
	var m=(dt.getMonth()+1).toString();
	var y=dt.getFullYear().toString();
	var hh=dt.getHours().toString();
	var mn=dt.getMinutes().toString();
	var ss=dt.getSeconds().toString();
	var ms=dt.getMilliseconds().toString();

	//time element
	var t=GetTimePartFromString(S);
	if(t){t=" " + t;}else{t="";}
	
	S=S.replace(time_element,"");
		
	d=util.printf("%02d",d);  //pad with any extra zeros
	m=util.printf("%02d",m);  //pad with any extra zeros
	var res_date="";


	switch(HowManyPartsToDateEndString(S, oDoc)){
		case 1:
			res_date=y;
			break;
		case 2:
			res_date=y + "-" + m;
			break;
		case 3:
			if (f=='en-GB') res_date=(y + "-" + m + "-" + d + t).trim();
			if (f=='en-US') res_date=(y + "-" + d + "-" + m + t).trim();
			break;
		default:
			console.println("Error in move to start date");
		break;
	}

	var Bname=Bm.name;
	var PgLb=GetPageLabel(Bm);
	var LegNum=GetLegalNumber(Bm)!=null ? " " + GetLegalNumber(Bm)+":": "";
	Bm.name=RemovePageLabel(Bm);  //remove page label []
	Bm.name=delete_date_end(Bm, oDoc);  //remove date
	Bm.name=RemoveLegalNumThis(Bm);  //remove legal numbering
	
	var new_name;
	//console.println(Bm.name);
	if(Bm.name=="Root"){
		new_name=res_date+LegNum+PgLb;
	}else{
		new_name=res_date + LegNum+ " " + Bm.name+PgLb;
	}
	return new_name;
}

function MoveDateToEnd(Bm, oDoc){
	//if(!DoesThisHaveDateStart(Bm)) return Bm.name;  //quit if no valid date
	var dt=GetDateStart(Bm, oDoc);	 //Get the date from bookmark
	var f=GetLocaleDate(oDoc); //whether this is UK or US
	if(!dt)return Bm.name; //quit if not valid
	var d=dt.getDate().toString();
	var m=(dt.getMonth()+1).toString();
	var y=dt.getFullYear().toString();
	var hh=dt.getHours().toString();
	var mn=dt.getMinutes().toString();
	var ss=dt.getSeconds().toString();
	var ms=dt.getMilliseconds().toString();
	 //console.println(dd + " " + mm + " " + yyyy);
	var t="";
	var ts=Bm.name.match(/ \d+((:\d+){0,3}) /);
	if(ts){t=" "+ ts[0].trim();}
	
	 //convert to strings
	d=util.printf("%02d",d);  //pad with any extra zeros
	m=util.printf("%02d",m);  //pad with any extra zeros
	var res_date;
	switch(HowManyPartsToDateStart(Bm, oDoc)){
		case 1:
			res_date=y;
		break;
		case 2:
			res_date=GetNameMonth(dt.getMonth()+1)+ " " + y;
		break;
		case 3:
			if (f=='en-GB') res_date=d+"/"+m+"/"+y + t;
			if (f=='en-US') res_date=m+"/"+d+"/"+y + t;
		break;
		default:
			console.println("Error moving date to end");
			return "";
		break;
	}
	
	var Bname=Bm.name;
	var PgLb=GetPageLabel(Bm);
	var LegNum=GetLegalNumber(Bm)!=null ? GetLegalNumber(Bm)+": ": "";
	Bm.name=RemovePageLabel(Bm);  //remove page label []
	Bm.name=delete_date_start(Bm, oDoc);  //remove date
	Bm.name=RemoveLegalNumThis(Bm);  //remove legal numbering
	
	var new_name;
	
	if(Bm.name=="Root"){
			new_name=LegNum+res_date+PgLb;
		}else{
			new_name=LegNum+Bm.name+", " + res_date+PgLb;
		}
	
	//console.println("New name " + new_name);
	return new_name;
}

function delete_date_start(Bm, oDoc){
	 //returns string with date deleted from start
	if(!DoesThisHaveDateStart(Bm,oDoc))return Bm.name;  //leave alone if this not date at start
	var new_name=Bm.name;
	new_name=new_name.replace(file_date_pattern,"");
	return new_name;
}

function delete_date_end_string(S, oDoc){
	 //returns name of Bm without the date
	var short_date=false; //i.e. long date
	if(!GetDateFromString(S, oDoc)) return S;  //leave name unchanged if no date found
	//console.println("N1: " + S);
	var sq=GetPageLabelFromString(S);
	//console.println("Sq: " + sq);
	new_name=RemovePageLabelFromString(S);
	//console.println("N2: " + new_name);
	new_name=(S.replace(date_part, "")+" "+sq).trim();  //deletes it while retaining any squares
	//console.println("N3: " + new_name);
	return new_name;
}

function delete_date_end(Bm, oDoc){
	return delete_date_end_string(Bm.name, oDoc);
}

function GetDateStartString(S, oDoc){
	 //returns a date from the start
	if(!DoesThisHaveDateStartString(S, oDoc)) return null;
	var f=GetLocaleDate(oDoc); //whether this is UK or US
	
	var t="";
	var ts=S.match(/ \d+((:\d+){0,3}) /);
	var HH=0;
	var MM=0;
	var SS=0;
	var ML=0;
	if(ts){
		t=ts[0].trim();
		var time_parts=t.split(":");
		time_parts[0] ? HH=Number(time_parts[0]): HH=0;
		time_parts[1] ? MM=Number(time_parts[1]): MM=0;
		time_parts[2] ? SS=Number(time_parts[2]): SS=0;
		time_parts[3] ? ML=Number(time_parts[3]): ML=0;
	}
	
	S=S.replace(/ \d{2}((:\d{2}){0,3}) /," ").trim();
	var a=S.match(file_date_pattern);
	var p=a[0].split("-");  //this can be length 1,2 or 3
	
	var yyyy=-1;
	var mm=-1;
	var dd=-1;
	var x;
	
	yyyy=Number(p[0]);
	if(yyyy<100){
		if(yyyy<50) {x=yyyy+2000;} else {x=yyyy+1900;}
		yyyy=x;
	}
	if (f=="en-GB"){
		if(p.length>1) {mm=Number(p[1]);} else {mm=1;}
		if(p.length>2) {dd=Number(p[2]);} else {dd=1;}
	}
	if (f=='en-US'){
		if(p.length==1) {mm=1;dd=1;}
		if(p.length==2) {mm=Number(p[1]);dd=1;}
		if(p.length==3) {dd=Number(p[1]);mm=Number(p[2]);}
	}
	
	if (IsValidDate(dd,mm,yyyy)){
		 //console.println("Start date " + dd + " " + mm + " " + yyyy);
		var Dt=new Date(yyyy, mm-1, dd, HH, MM, SS, ML);
		return Dt;
	}else{
		return null;
	}		
}

function GetDateStart(Bm, oDoc){
	return GetDateStartString(Bm.name, oDoc);
}

var TogDateLabels=app.trustedFunction(function(oDoc)
{

app.beginPriv();

	var root = oDoc.bookmarkRoot;
	if(RemoveFileDates(oDoc.bookmarkRoot,0,oDoc)==true){
		FileDateToBookmarkDate(oDoc.bookmarkRoot, 0, oDoc);  //Turn to bookmark date		
	}else{
		BookmarkToFileDate(oDoc.bookmarkRoot,0,oDoc);  //Return to file date
	}
		
app.endPriv();
		
});

function RemoveFileDates(Bm, nLevel, oDoc){
	 //see if there is match
	if(file_date_pattern.test(Bm.name)==true) return true;

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			if(RemoveFileDates(Bm.children[i], nLevel + 1, oDoc)==true) return true;
		}
	}
	return false;	
}


 // // // // // // // // // // // // ///
 //
 //  This is the main function for switching
 //  dates in bookmarks
 //

var DoDATE_TOGGLE = app.trustedFunction(function(oDoc,oDlg)
{
	if(!CheckLicence())return;

	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth);
	Uni_Counter_thm=0;
	app.thermometer.duration=n;
	app.thermometer.begin();
	MakeUniform(oDoc.bookmarkRoot,0,oDoc,n);
	app.thermometer.end();
	
	 //console.println("Made uniform");

	
	var Pg=oDoc.pageNum;  //note page number

	TogDateLabels(oDoc); //toggle the page labels

	oDoc.pageNum=Pg;  //reset page number to where it started
	
 //    return nFound;
    return 0;
  app.endPriv();
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7DATE_TOGGLE = 
"00000000000000000000000000000000ab00000090000000000000000000000000000000000000000000000000000000000000000000000071000000c80000000200000000000000000000000000000050000000500000005000000041000000e8000000cc0000004900000050000000500000005000000050000000500000005000000050000000ad000000ff00000041000000500000005000000050000000ff000000ff000000ff000000ba000000e8000000cc000000d7000000ff000000ff000000ff000000ff000000ff000000ff000000f1000000b1000000ff000000a3000000ff000000ff000000ff000000ff000000ff000000ff0000004c000000e8000000cc00000069000000ff000000ff000000ff000000ff000000ff000000ff0000008c000000a8000000ff00000035000000ff000000ff000000ff000000ff000000ff000000ff000000640000009f0000008500000082000000ff000000ff000000ff000000ff000000ff000000ff000000a300000068000000bb00000043000000ff000000ff000000ff000000ff000000ff000000ff000000f2000000830000008e000000fa000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000009b0000007a000000e6000000ff000000ff000000ff000000ff000000f1000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000b0000000f2000000ff000000ff000000d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4000000ff000000ff000000d000000000000000000000000000000000000000110000001400000003000000130000001400000003000000140000001300000003000000140000001100000000000000d4000000ff000000ff000000d000000000000000000000000000000000000000e0000000ff0000002c000000fc000000ff0000002c000000ff000000f800000030000000ff000000dc00000000000000d4000000ff000000ff000000d000000000000000000000000000000000000000dc000000fc0000002b000000f8000000fc0000002b000000fc000000f40000002f000000fc000000d800000000000000d4000000ff000000ff000000d00000000000000040000000540000001700000049000000540000000e00000052000000540000000e00000054000000510000000f000000540000004800000000000000d4000000ff000000ff000000d000000000000000c4000000ff00000048000000e0000000ff0000002c000000fc000000ff0000002c000000ff000000f800000030000000ff000000dc00000000000000d4000000ff000000ff000000d0000000000000008f000000bc00000034000000a4000000bc00000020000000b9000000bc00000020000000bc000000b600000023000000bc000000a100000000000000d4000000ff000000ff000000d000000000000000710000009400000029000000810000009400000019000000910000009400000019000000940000008f00000000000000000000000000000000000000d4000000ff000000ff000000d000000000000000c4000000ff00000048000000e0000000ff0000002c000000fc000000ff0000002c000000ff000000f800000000000000000000000000000000000000d4000000ff000000ff000000d0000000000000005e0000007c000000220000006c0000007c000000150000007a0000007c000000150000007c0000007800000000000000000000000000000000000000d4000000ff000000ff000000d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4000000ff000000ff000000fd000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000f0000000fd000000ff000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000e4000000";
 //</JSCodeSnippet>

 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconTOGGLE = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconTOGGLE = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7DATE_TOGGLE.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdDATE_TOGGLE = 
"DoDATE_TOGGLE(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjDATE_TOGGLE = 
{cName: "DATE_TOGG",
cExec: DoCmdDATE_TOGGLE,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
cMarked: "event.rc = false",
cTooltext: "Toggle dates yy-mm--dd to dd-mm-yy",
cLabel: "yy-mm-dd to dd-mm-yy",
nPos: -1};
 //</JSCodeSnippet>
if(oIconTOGGLE != null){
	 //console.println("Valid icon");
    oButObjDATE_TOGGLE.oIcon = oIconTOGGLE;
}
try{app.removeToolButton("DATE_TOGG");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjDATE_TOGGLE);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["DATE_TOGG_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["DATE_TOGG_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjDATE_TOGGLE"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




