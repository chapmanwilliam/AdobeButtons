
 //Makes the dates into a uniform format
var Uni_Counter_thm=0;

function pad(n){return n<10 ? '0'+n : n}

function MakeUniform(Bm, nLevel, oDoc, n){
	console.println("MakeUniform");
	console.println(oDoc.path);
	var short_date=false; //i.e. long date
	Uni_Counter_thm +=1;
	app.thermometer.value=Uni_Counter_thm;
	app.thermometer.text="Working on bookmark " + Uni_Counter_thm + " out of " + n;
	 //Remove [page number]
	 //console.println("Name " + Bm.name);
	if(Bm.name!="Root") Bm.name=SwapDate(Bm, short_date, oDoc);	

	 // process children
	if (Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){
			MakeUniform(Bm.children[i], nLevel + 1, oDoc, n);
		}
	}
	
}

function GetNameMonth(m){
	 //returns name of month
	switch (m){
		case 1:
			return "Jan";
		break;
		case 2:
			return "Feb";
		break;
		case 3:
			return "Mar";
		break;
		case 4:
			return "Apr";
		break;
		case 5:
			return "May";
		break;
		case 6:
			return "Jun";
		break;
		case 7:
			return "Jul";
		break;
		case 8:
			return "Aug";
		break;
		case 9:
			return "Sep";
		break;
		case 10:
			return "Oct"
		break;
		case 11:
			return "Nov";
		break;
		case 12:
			return "Dec";
		break;
	}
}

function GetNumberMonth(MonthName){

	MonthName=MonthName.toUpperCase().trim();  //make CAPS and strip spaces
	//console.println(MonthName);
	
	 //returns the number of month with Jan being 0
		switch (MonthName){
			case "JAN":
			case "JANUARY":
				m=0;
				break;
			case "FEB":
			case "FEBRUARY":
				m=1;
				break;
			case "MAR":
			case "MARCH":
				m=2;
				break;
			case "APR":
			case "APRIL":
				m=3;
				break;
			case "MAY":
				m=4;
				break;
			case "JUN":
			case "JUNE":
				m=5;
				break;
			case "JUL":
			case "JULY":
				m=6;
				break;
			case "AUG":
			case "AUGUST":
				m=7;
				break;
			case "SEP":
			case "SEPTEMBER":
				m=8;
				break;
			case "OCT":
			case "OCTOBER":
				m=9;
				break;
			case "NOV":
			case "NOVEMBER":
				m=10;
				break;
			case "DEC":
			case "DECEMBER":
				m=11;
				break;
			default:
				 //shouldn't get here
				m=-1;
				console.println("Error in date");														
		}
		return m;
}

function GetDateFormatTypeFromString(S){
	var Nm=RemovePageLabelFromString(S);  //remove any []
	if (patL.test(Nm)) return "L";
	if (patK.test(Nm)) return "K";
	if (patA.test(Nm)) return "A";
	if (patB.test(Nm)) return "B";
	if (patC.test(Nm)) return "C";
	if (patD.test(Nm)) return "D";
	if (patE.test(Nm)) return "E";
	if (patF.test(Nm)) return "F";
	if (patG.test(Nm)) return "G";
	if (patH.test(Nm)) return "H";
	if (patI.test(Nm)) return "I";
	if (patJ.test(Nm)) return "J";
	
	 //console.println("No Match to date");
	return "NO MATCH";
}

function GetDateFormatType(Bm){
	return GetDateFormatTypeFromString(Bm.name);
}

function SwapDateFromTextElement(S, short_date, oDoc){
	console.println("Swap Date from Text Element ")
	console.println(oDoc.path);

	var dt=GetDateFromString(S, oDoc);
	var f=GetLocaleDate(oDoc); //whether this is UK or US
	if(!dt || age_element.test(S) || ages_element.test(S))return S; //leave unchanged if no date
	//console.println("Date: " + S + "==>" + dt);
	var dd=dt.getDate();
	var mm=dt.getMonth()+1;
	var yyyy=dt.getFullYear();
	var yy;
	if(yyyy>2000){
		yy=yyyy-2000;
	}else{
		yy=yyyy-1900;
	}

	 //This function reformats the date for this bookmark and returns the new boookmark name as string
	if(file_date_pattern.test(S)==true) return S;  //don't bother with file dates
	var new_name=S;
	
	switch (GetDateFormatTypeFromString(S)){
		case "A": //20/6/10
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			if (f=='en-GB') var R=", "+ pad(dd)+ "/" + pad(mm)+"/"+ yyyy.toString();
			if (f=='en-US') var R=", "+ pad(mm)+ "/" + pad(dd)+"/"+ yyyy.toString();
			new_name=new_name.replace(patA,R);
			if(short_date) new_name=new_name.replace(/\d\d(\d\d)$/,"$1");
		break;
	
		case "B": //20/6/2010
			 //leave this one - it's in the correct format
			if (f=='en-GB')  var R=", "+ pad(dd)+ "/" + pad(mm)+"/"+ yyyy.toString();
			if (f=='en-US')  var R=", "+ pad(mm)+ "/" + pad(dd)+"/"+ yyyy.toString();
			new_name=new_name.replace(patB,R);
			if(short_date) new_name=new_name.replace(/\d\d(\d\d)$/,"$1");
		break;

		case "C": //6/10
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			var R=", " + GetNameMonth(mm)+" "+ yyyy.toString();
			new_name=new_name.replace(patC,R);		
		break;

		case "D": //6/2010
			
			var R=", "+ GetNameMonth(mm)+" "+ yyyy.toString();
			new_name=new_name.replace(patD,R);		
		break;

		case "E": //1 Jun 10
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			var R=", "+ pad(dd)+ "/" + pad(mm)+"/"+ yyyy.toString();
			new_name=new_name.replace(patE,R);		
			if(short_date) new_name=new_name.replace(/\d\d(\d\d)$/,"$1");
			break;

		case "F": //1 Jun 2010
			var R=", " + pad(dd)+ "/" + pad(mm)+"/"+ yyyy.toString();
			new_name=new_name.replace(patF,R);		
			if(short_date) new_name=new_name.replace(/\d\d(\d\d)$/,"$1");
		break;
		
		case "G": //Jun 10
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			var R=", " + GetNameMonth(mm)+" "+ yyyy.toString();
			new_name=new_name.replace(patG,R);		
			break;
			
		case "H": //Jun 2010
			var R=", " + GetNameMonth(mm)+" "+ yyyy.toString();
			new_name=new_name.replace(patH,R);		
		break;

		case "I": //2010
			var R=", " + yyyy.toString();
			new_name=new_name.replace(patI,R);		
		break;
		
		case "J": //10
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			var R=", " + yyyy.toString();
			new_name=new_name.replace(patJ,R);		
		break;
		//these are ages so do nothing 
		case "L":
		case "K":		
		break;
		default:
			 //No match, but it's a date, i.e with a time element. So do default
			if(yy<50){
				yyyy=yy+2000;
			}else{
				yyyy=yy+1900;
			}
			var T=MakeTimeElementUniform(GetTimePartFromString(new_name));
			if(!T)T="";
			new_name=delete_date_end_string(new_name, oDoc);
			var R="";
			if(!short_date) {
				if (f=='en-GB') R=", "+ pad(dd)+ "/" + pad(mm)+"/"+ yyyy.toString();
				if (f=='en-US') R=", "+ pad(mm)+ "/" + pad(dd)+"/"+ yyyy.toString();
			}else{
				if (f=='en-GB') R=", "+ pad(dd)+ "/" + pad(mm)+"/"+ pad(yy.toString());
				if (f=='en-US') R=", "+ pad(mm)+ "/" + pad(dd)+"/"+ pad(yy.toString());
			}			
			new_name=new_name+R+" " + T;
		break;
	}
	
	return new_name;		

}

function MakeTimeElementUniform(T){
	//takes time element and pads appropriately
	if(!T)return null;
	var p=T.split(":");
	var res="";
	for (var i=0;i<p.length;i++){
		res=res+pad(Number(p[i].trim()))+":";
	}	
	res=res.replace(/:$/,""); //delete last :
	return res;
}


function SwapDateFromText(Str, short_date, oDoc){
	//returns Str modified to be uniform

	var dt=GetDateFromString(RemovePgLbAndLegalNumbering(Str), oDoc);
	if(!dt || age_element.test(RemovePgLbAndLegalNumbering(Str)) || ages_element.test(RemovePgLbAndLegalNumbering(Str)))return Str; //leave unchanged if no date
	
	
	var Sqflag=false;
	var Pg;
	var com=/,?( )?/;
	if(pattern_toggle_page_label.test(Str)) {
		Pg=Str.match(pattern_toggle_page_label);
		Sqflag=true;  //flag if this has []
	}
	var LegNum=GetLegalNumberFromString(Str)!=null ? GetLegalNumberFromString(Str)+": ": "";
	S=RemovePgLbAndLegalNumbering(Str);

	var date_part=GetDatePartFromString(S, oDoc);
	var p=date_part.split("-"); //split by divider -
	var new_name=delete_date_end_string(S, oDoc)+", ";
	var a="";
	if(p){ //if there are parts
		for(var i=0;i<p.length;i++){ //for each part make uniform
			//console.println("P:" + p[i]);
			a=a+SwapDateFromTextElement(", "+p[i].trim(), short_date, oDoc).replace(", ", "")+"-";
			//console.println("A: ==>"+a);
		}
	}else{
		return Str;
	}
	a=a.replace(/-$/,"");//remove final partition
	new_name=new_name+ a; //add on the addition
	if (Sqflag) new_name=new_name + Pg[0];  //add back the square bracket
	if(new_name.match(/^\,/)) new_name=new_name.replace(", ",""); //remove leading comma if just a date with comma at start
	if(new_name.match(/^( )/)) new_name=new_name.replace(", ",""); //remove leading comma if just a date with space at start
	new_name=LegNum + new_name;
	return new_name;
}

function SwapDate(Bm, short_date, oDoc){
	 //This function reformats the date for this bookmark and returns the new bookmark name as string
	 return SwapDateFromText(Bm.name, short_date, oDoc);
}

function GetDateTextFromString(S, oDoc){
	//returns the text of date element (having been made uniform)
	var short_date=true; //i.e. short date
	//remove age part if exists
	S=SwapDateFromText(S, short_date, oDoc); //make uniform
	S=RemovePageLabelFromString(S); //remove []
	
	var a;
	a=S.match(date_part);
	if(a!=null){
		var com=/,?( )?/;
		S=a[0].replace(com, ""); //remove comma
	}
	return S;	
}

function GetDateText(Bm, oDoc){
	//returns the text of date element (having been made uniform)
	return GetDateTextFromString(Bm.name, oDoc);
}


var DoUNIFORM = app.trustedFunction(function(oDoc)
{
	console.println("Make dates uniform");
	if(!CheckLicence())return;
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth);
	Uni_Counter_thm=0;
	app.thermometer.duration=n;
	app.thermometer.begin();
	MakeUniform(oDoc.bookmarkRoot,0,oDoc,n);
	app.thermometer.end();
});



 //<JSCodeSnippet name="ImageData7">
var strData7UNIFORMDATES = 
"120000002c0000002c0000002c0000002c000000e0000000940000002c0000002c0000002c0000002c0000002c0000002c0000009a000000da0000002c0000002c0000002c0000002c00000013000000e8000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000e6000000ff000000d20000007c0000007c0000007e000000ff000000d20000007c0000007c0000007c0000007c0000007c0000007c000000d4000000fd0000007c0000007c0000007c000000d4000000fc000000ff000000a8000000000000000000000001000000f2000000970000000000000000000000000000000000000000000000000000009d000000eb000000000000000000000000000000ac000000fc000000ff000000a800000000000000000000000000000014000000070000000000000000000000000000000000000000000000000000000700000013000000000000000000000000000000ac000000fc000000ff000000b70000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c0000002c000000ba000000fc000000ff000000e1000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000a8000000e3000000fc000000ff000000a800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a8000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b0000000000000000000000000000000000000000000000ac000000fc000000ff000000a80000000000000000000000000000000000000000000000000000000000000000000000000000005c000000fc0000004b00000000000000000000000000000000000000ac000000fc000000ff000000a8000000000000000000000000000000000000000800000047000000010000000000000055000000fc000000dd0000001900000000000000000000000000000000000000ac000000fc000000ff000000a8000000000000000000000000000000000000005d000000ff000000950000004f000000fa000000dd0000001e0000000000000000000000000000000000000000000000ac000000fc000000ff000000a80000000000000000000000000000000000000007000000b3000000ff000000fe000000dd0000001e000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a8000000000000000000000000000000000000000000000005000000a5000000d80000001e00000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000a800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ac000000fc000000ff000000e3000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000e4000000fc000000ce000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000fc000000c9000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconUNIFORMDATES = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconUNIFORMDATES = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7UNIFORMDATES.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdUNIFORM = 
"DoUNIFORM(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjUNIFORM = 
{cName: "UNIFORM",
cExec: DoCmdUNIFORM,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
 //cMarked: "event.rc = LabelsPresent(app.doc.bookmarkRoot,0,app.doc)",
cTooltext: "Makes dates uniform format",
cLabel: "Make dates uniform",
nPos: 4};
 //</JSCodeSnippet>
if(oIconUNIFORMDATES != null)
    oButObjUNIFORM.oIcon = oIconUNIFORMDATES;

try{app.removeToolButton("UNIFORM");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjUNIFORM);
 //</JSCodeSnippet>
//if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["UNIFORM_InDoc"] = "1:17:2011:17:55:45";
//else
//    global["UNIFORM_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjUNIFORM"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>
