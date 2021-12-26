//This function refreshes all the others
var shift=145019218400;
var shift_lic_exp=180939;
var version="1.0";

Date.prototype.addDays = function (num) {
    var value = this.valueOf();
    value += 86400000 * num;
    return new Date(value);
}
Date.prototype.addSeconds = function (num) {
    var value = this.valueOf();
    value += 1000 * num;
    return new Date(value);
}
Date.prototype.addMinutes = function (num) {
    var value = this.valueOf();
    value += 60000 * num;
    return new Date(value);
}
Date.prototype.addHours = function (num) {
    var value = this.valueOf();
    value += 3600000 * num;
    return new Date(value);
}
Date.prototype.addMonths = function (num) {
    var value = new Date(this.valueOf());

    var mo = this.getMonth();
    var yr = this.getYear();

    mo = (mo + num) % 12;
    if (0 > mo) {
        yr += (this.getMonth() + num - mo - 12) / 12;
        mo += 12;
    }
    else
        yr += ((this.getMonth() + num - mo) / 12);

    value.setMonth(mo);
    value.setYear(yr);
    return value;
}
function daysBetween( date1, date2 ) {
  //Get 1 day in milliseconds
  var one_day=1000*60*60*24;

  // Convert both dates to milliseconds
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();

  // Calculate the difference in milliseconds
  var difference_ms = date2_ms - date1_ms;
    
  // Convert back to days and return
  return Math.round(difference_ms/one_day); 
}


function IsValidDate(dd, mm, yyyy){
   // Check the ranges of month and year
    if(yyyy < 1000 || yyyy > 3000 || mm == 0 || mm > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(yyyy % 400 == 0 || (yyyy % 100 != 0 && yyyy % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return dd > 0 && dd <= monthLength[mm - 1];
}


var DoREFRESH = app.trustedFunction(function(oDoc)
{
	if(!CheckLicence())return;

	app.beginPriv();
	var PgNow=oDoc.pageNum;	
	console.println("Refreshing...");
	RefreshPagination(oDoc);
	RefreshLegalNum(oDoc);
	RefreshFooter(oDoc);
	RefreshLinking(oDoc);
	RefreshTOC(oDoc);
	RefreshCHRONO(oDoc);
	RefreshToggle(oDoc);
	//if(ExistingSUBS(oDoc)) Linking(oDoc);
	
	console.println("Finished refreshing...");
	oDoc.pageNum=PgNow;		
	app.endPriv();
});

function DateToSixFigString(dt){
	var dd=dt.getDate();
	var mm=dt.getMonth()+1;
	var yyyy=dt.getFullYear();
	//console.println(dd+" " + mm+" "+ yyyy);
	if(!IsValidDate(Number(dd),Number(mm),Number(yyyy)))return null;
	var result="";
	result=pad(dd)+pad(mm)+pad(Number(yyyy.toString().slice(2,4)));
	return result;
}

function LicenceExpirytoSixFigString(){
	var result="";
	if(NeverLicenced() || NeverTrialled())return "10000001";
	var trial_date=null;
	var lic_date=null;
	var exp_date=null;
	if(!NeverTrialled())trial_date=GetTrialDate();
	if(!NeverLicenced())lic_date=GetLicenceDate();
	if(trial_date!=null & lic_date!=null){
		if(trial_date>=lic_date){
				exp_date=trial_date;
			}else{
				exp_date=lic_date;
			}
	}else{
		return "10000001"; //always returns a default
	}
	//console.println("T:"+trial_date.toString()+" L:"+lic_date.toString()+" E:" +exp_date.toString());
	var plain="1"+DateToSixFigString(exp_date)+"1";
	var gibberish=encrypt_lic_exp(parseInt(plain,10)).toString();
	return gibberish;
}

function encrypt(plain,y){
	var gibberish=plain+shift+y;
	return gibberish;
}

function decrypt(gibberish,y){
	var plain=(gibberish-shift)-y;
	return plain;
}

function encrypt_lic_exp(plain){
	var gibberish=plain+shift_lic_exp;
	return gibberish;
}

function decrypt_lic_exp(gibberish){
	var plain=gibberish-shift_lic_exp;
	return plain;
}

function CheckLicenceCode(plain){
	if(plain.length!=14) return false;
	//if(plain.slice(6,8)!="00") return false;
	var n=new Date();

	var days=parseInt(plain.slice(6,8),10); //the number of days to do the installation from date of purchase

	if(IsValidDate(Number(plain.slice(0,2)),Number(plain.slice(2,4)),Number("20"+plain.slice(4,6))) &&
	IsValidDate(Number(plain.slice(8,10)),Number(plain.slice(10,12)),Number("20"+plain.slice(12,14)))){
		//so we have two valid dates
		var license_bought=new Date("20"+plain.slice(4,6),(Number(plain.slice(2,4))-1).toString(),plain.slice(0,2));
		var expiration_date=license_bought.addDays(days);
		if(n>expiration_date){
			app.alert("This licence code is out of date.");
		}
		return true;
	}else{
		return false;
	}	
}



var GetEasyUniqueInstallationCode=app.trustedFunction(function(){
	app.beginPriv();
	console.println("Retrieving..." + global.no_fuss_Easy_Unique_Code);

	if(typeof(global.no_fuss_Easy_Unique_Code)=="undefined" || global.no_fuss_Easy_Unique_Code=="") {
		//SetEasyUniqueInstallationCode(license_str);
		console.println("Shouldn't get here - unique code undefined");
		return null; //returns null if undefined
	}else{
		return global.no_fuss_Easy_Unique_Code;
	}	
	app.endPriv();
});

var SetEasyUniqueInstallationCode=app.trustedFunction(function (license_str){
	//Unique code is made up of the date in milliseconds since 1/1/1970
	app.beginPriv();
	global.no_fuss_Easy_Unique_Code=license_str;
	global.setPersistent("no_fuss_Easy_Unique_Code", true);
	console.println("Setting.." + global.no_fuss_Easy_Unique_Code);
	app.endPriv();
});

var GetEasyActivation=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_licence_activated)=="undefined" ) {
		return null; //returns null if undefined
	}else{
		return global.no_fuss_licence_activated;
	}	
	app.endPriv();
});

var SetEasyActivation=app.trustedFunction(function(value){
	app.beginPriv();
	//value=1 then activated; value=0 then deactivated, value =3 then no licence
	global.no_fuss_licence_activated=value;
	global.setPersistent("no_fuss_licence_activated", true);
	app.endPriv();
});

var GetEasyLicenseLimit=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_licence_limit)=="undefined") {
		return null; //returns null if undefined
	}else{
		return global.no_fuss_licence_limit;
	}	
	app.endPriv();
});

var SetEasyLicenseLimit=app.trustedFunction(function(value){
	app.beginPriv();
	global.no_fuss_licence_limit=value;
	global.setPersistent("no_fuss_licence_limit", true);	
	app.endPriv();
});

var GetEasyActivationsLeft=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_activations_left)=="undefined") {
		return null; //returns null if undefined
	}else{
		return global.no_fuss_activations_left;
	}	
	app.endPriv();
});

var SetEasyActivationsLeft=app.trustedFunction(function(value){
	app.beginPriv();
	global.no_fuss_activations_left=value;
	global.setPersistent("no_fuss_activations_left", true);	
	app.endPriv();
});

var GetEasyLicenseExpiry=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_licence_expiry_yy)=="undefined" || typeof(global.no_fuss_licence_expiry_mm)=="undefined" || typeof(global.no_fuss_licence_expiry_dd)=="undefined") {
		return null;
	}else{
		var dt=new Date(global.no_fuss_licence_expiry_yy, global.no_fuss_licence_expiry_mm,global.no_fuss_licence_expiry_dd);
		return dt;
	}
	app.endPriv();
});

var SetEasyLicenseExpiry=app.trustedFunction(function(value){
	app.beginPriv();
	var momentDate = moment(value);
	var license_expiry=momentDate.toDate();
	global.no_fuss_licence_expiry_yy=license_expiry.getFullYear();
	global.no_fuss_licence_expiry_mm=license_expiry.getMonth();
	global.no_fuss_licence_expiry_dd=license_expiry.getDate();
	global.setPersistent("no_fuss_licence_expiry_yy",true);
	global.setPersistent("no_fuss_licence_expiry_mm",true);
	global.setPersistent("no_fuss_licence_expiry_dd",true);
	app.endPriv();
});

var RequestEasyLicence = app.trustedFunction(function(){
	app.beginPriv();
    LicenceEasyDlg.strCode= GetEasyUniqueInstallationCode();
    var Expiry=GetEasyLicenseExpiry();
    var ActivationsLeft=GetEasyActivationsLeft();
    var ActivationsLimit=GetEasyLicenseLimit();
    
    TitleStr="Licensed until " + Expiry + "\\n";
    TitleStr=TitleStr + ActivationsLeft + "/" + ActivationsLimit;
    console.println(TitleStr);
	LicenceEasyDlg.strTitle=TitleStr;

	if("ok" == app.execDialog(LicenceEasyDlg)){
								
		var user_code=LicenceEasyDlg.strCode;
		SetEasyUniqueInstallationCode(user_code);
	}
				
		/*var license_expiry=new Date("20"+plain.slice(12,14),(Number(plain.slice(10,12))-1).toString(),plain.slice(8,10));
		SetLicenceDate(license_expiry);

		//console.println(license_bought.toLocaleDateString());
		if(OutOfTime()) {
			return false;
		}else{
			app.alert("Licenced until " + GetDateString(GetLicenceDate()));
			return true;
		}
	
		return true;

	}else{
		//app.alert("Licenced until " + GetDateString(GetLicenceDate())+ "\n\nPlease go to www.nofussbundles.com to extend licence." ,1);
		return true;
	}
*/

	app.endPriv();

});




var GetLicenceDate = app.trustedFunction(function(){
	app.beginPriv();
	return new Date(global.no_fuss_licence_expiry_yy, global.no_fuss_licence_expiry_mm,global.no_fuss_licence_expiry_dd);
	app.endPriv();
});

var SetLicenceDate = app.trustedFunction(function(license_expiry){
	app.beginPriv();
	global.no_fuss_licence_expiry_yy=license_expiry.getFullYear();
	global.no_fuss_licence_expiry_mm=license_expiry.getMonth();
	global.no_fuss_licence_expiry_dd=license_expiry.getDate();
	global.setPersistent("no_fuss_licence_expiry_yy",true);
	global.setPersistent("no_fuss_licence_expiry_mm",true);
	global.setPersistent("no_fuss_licence_expiry_dd",true);
	app.endPriv();
});

var SetTrialStart = app.trustedFunction(function(n){
	app.beginPriv();
//	var t=n.addDays(Trial_Days);
	var t=n.addDays(14);
	//console.println("T Date " + t.toDateString());
	global.no_fuss_trial_expiry_yy=t.getFullYear();
	global.no_fuss_trial_expiry_mm=t.getMonth();
	global.no_fuss_trial_expiry_dd=t.getDate();
	global.setPersistent("no_fuss_trial_expiry_yy",true);
	global.setPersistent("no_fuss_trial_expiry_mm",true);
	global.setPersistent("no_fuss_trial_expiry_dd",true);
	SetLicenceDate(GetTrialDate()); //set licence date to same date
	//console.println("Trial date 1" + global.no_fuss_trial_expiry_dd + ", " + global.no_fuss_trial_expiry_mm + ", " + global.no_fuss_trial_expiry_yy);
	app.endPriv();
});

var GetUniqueInstallationCode=app.trustedFunction(function(){
	app.beginPriv();
	//console.println("Retrieving..." + global.no_fuss_Unique_Code);

	if(typeof(global.no_fuss_Unique_Code)=="undefined" || isNaN(global.no_fuss_Unique_Code)) {
		SetUniqueInstallationCode();
		return global.no_fuss_Unique_Code; //returns null if undefined
	}else{
		return global.no_fuss_Unique_Code;
	}	
	app.endPriv();
});

var SetUniqueInstallationCode=app.trustedFunction(function (){
	//Unique code is made up of the date in milliseconds since 1/1/1970
	app.beginPriv();
	var x=new Date();
	var y=x.getTime(); //the time in milliseconds
	global.no_fuss_Unique_Code=y;
	global.setPersistent("no_fuss_Unique_Code", true);
	//console.println("Setting.." + global.no_fuss_Unique_Code);
	app.endPriv();
});



var GetTrialDate = app.trustedFunction(function(){
	app.beginPriv();
	var n=new Date();
	if(!IsValidDate(global.no_fuss_trial_expiry_dd, global.no_fuss_trial_expiry_mm,global.no_fuss_trial_expiry_yy))SetTrialStart(n);
	var t=new Date(global.no_fuss_trial_expiry_yy, global.no_fuss_trial_expiry_mm,global.no_fuss_trial_expiry_dd);
	//console.println("Trial date 2 " + global.no_fuss_trial_expiry_dd + ", " + global.no_fuss_trial_expiry_mm + ", " + global.no_fuss_trial_expiry_yy);
	//console.println("Trial date " + t.toDateString());
	return t;
	app.endPriv();
});

function GenerateCode(x,y){
	//returns encrypted code release
	//x should be like this: **03071710 - which means licence until 3/7/17 with 10 days to install from today's date
	//y is the unique installation code
	if(y==null){ //check that there is an installation code
		app.alert("No installation code found");
		return "";
		}
	if(x.length!=10){
		console.println("X is wrong length: " + x);
		return "";
	}
	//console.println("X :" + x + " Y :"+ y);	
	var n=new Date();
	var pat=/(\/)/g;
	var s=GetDateString(n).replace(pat,""); //the installation date, today
	var m=x.slice(8,10); //i.e. the number of days to install
	var e=x.slice(2,8); //i.e. the expiry 	date
	var plain_result=parseInt("1"+s+m+e+"1",10);
	//console.println("S " + s);
	//console.println("Plain " + plain_result);
//	return plain_result;
	var gibberish=encrypt(plain_result,y); //encrypt
	return gibberish;
}

function getUniqueCodeBody(s){
  //Code is like NF234327430243Z3432432
 var a=s.match(/NF\d+Z/);
  if(a==null)return null;
  a[0]=a[0].replace(/[NFZ]/g,"");
  var result=parseInt(a[0],10);
  if(isNaN(result))return null;
  return result;
}

function getCurrentExpBody(s){
 //Code is like NF234327430243Z3432432
  //Returns date in date format of current expiry or null if fails
  var a=s.match(/Z\d+$/);
  if(a==null)return null;
  a[0]=a[0].replace("Z","");
  //console.println("Gib current exp:"+ a[0]);
  var gibberish=parseInt(a[0],10);
  var plain=decrypt_lic_exp(gibberish).toString();
  //console.println("Plain current exp:"+ plain);
  //Plain is 10303101
  if(gibberish=="10000001")return new Date(); //i.e. if no expiry date passed
  var dd=parseInt(plain.slice(1,3),10);
  var mm=parseInt(plain.slice(3,5),10)-1;
  var yy=parseInt(plain.slice(5,7),10);
  if(!IsValidDate(dd,mm,yy+2000))return null;
  var dt=new Date(yy+2000,mm,dd);
  return dt;
}

function getLicenceExpiry(d){
  //where d is the current licency expiry
  if (d==null)return null;
  var dd=pad(d.getDate());
  var mm=pad((d.getMonth()+1).toString());
  var yy=(d.getFullYear()+1).toString().substring(2,4); //adds one year
  if(!IsValidDate(parseInt(dd,10), parseInt(mm,10)-1, parseInt(yy,10)+2000))return null;
  var result="**"+dd+mm+yy+"10";
  return result;
}

var IssueReminder=app.trustedFunction(function(){
	app.beginPriv();
	var dt_now=new Date();
	var lic_expiry=GetLicenceDate();
	var trial_expiry=GetTrialDate();
	
	if(!NeverLicenced()){ //i.e. it has been licenced
		var time_to_expiry=daysBetween(dt_now,lic_expiry)+1;
		//console.println("Exp days " + time_to_expiry);
		if(time_to_expiry<0 && NoAlertToday()) {app.alert("Your licence has expired.\n\nPlease obtain a licence at www.nofussbundles.com"); SetAlert(); return;}
		if(time_to_expiry<7 && NoAlertToday()) {app.alert("Your licence expires in " + time_to_expiry+ " days.\n\n Extend your licence at www.nofussbundles.com"); SetAlert(); return;}
	}else{
		var time_to_expiry=daysBetween(dt_now,trial_expiry)+1;
		if(time_to_expiry<0 && NoAlertToday()) {app.alert("Your trial has expired.\n\nPlease obtain a licence at www.nofussbundles.com");SetAlert();return;}
		if(time_to_expiry<7 && NoAlertToday()) {app.alert("Your trial expires in " + time_to_expiry+ " days.\n\nExtend your licence at www.nofussbundles.com"); SetAlert(); return;}
	}
	app.endPriv();
});

var NoAlertToday=app.trustedFunction(function(){
	//returns true if there has been no alert today
	app.beginPriv();
	if(typeof(global.no_fuss_licence_alert_yy)=="undefined" || (global.no_fuss_licence_alert_mm)=="undefined" || (global.no_fuss_licence_alert_dd)=="undefined" || !IsValidDate(global.no_fuss_licence_alert_dd, global.no_fuss_licence_alert_mm,global.no_fuss_licence_alert_yy)) return true; //i.e. no alert ever
	var last_alert=new Date(global.no_fuss_licence_alert_yy, global.no_fuss_licence_alert_mm,global.no_fuss_licence_alert_dd);
	var dt_now=new Date();
	var diff=daysBetween(dt_now,last_alert);
	if(diff<=0){return false;}else{return true;}
	app.endPriv();
});

var SetAlert=app.trustedFunction(function(){
	app.beginPriv();
	var dt_now=new Date();
	global.no_fuss_licence_alert_yy=dt_now.getFullYear();
	global.no_fuss_licence_alert_mm=dt_now.getMonth();
	global.no_fuss_licence_alert_dd=dt_now.getDate();
	global.setPersistent("no_fuss_licence_alert_yy",true);
	global.setPersistent("no_fuss_licence_alert_mm",true);
	global.setPersistent("no_fuss_licence_alert_dd",true);
	app.endPriv();
});

var RequestLicence = app.trustedFunction(function(){
	app.beginPriv();
    LicenceDlg.strCode= "NF"+parseInt(GetUniqueInstallationCode(),10).toString()+"Z"+LicenceExpirytoSixFigString(),
	LicenceDlg.strTitle="";
		if("ok" == app.execDialog(LicenceDlg)){							
			var licence_code=LicenceDlg.strTitle;
			var user_code=LicenceDlg.strCode;
			
			if(licence_code.slice(0,2)=="**"){ //this sets the licence expiry manually on THIS computer
				//should be **12101710   which means expires 12 October 2017 with 10 days to install
				app.alert(GenerateCode(licence_code, parseInt(GetUniqueInstallationCode(),10)));
				return;
			}
			if(licence_code.slice(0,2)=="??"){ //this generates release code from the text in the box
				var unique_code=getUniqueCodeBody(user_code);
				var current_expiry=getCurrentExpBody(user_code);
				var licence_expiry=getLicenceExpiry(current_expiry);
				//console.println("User code: " + user_code + "Current exp: " + current_expiry + "Licence exp: " + licence_expiry);
				if(unique_code!=null && current_expiry!=null && licence_expiry!=null){
						app.alert(GenerateCode(licence_expiry, parseInt(unique_code,10)));
					}else{
						app.alert("Error");
					}
				return;
			}

			//licence code is a 16 digit number. The first and last numbers are 1. The central two numbers are the number of days to install.
			var plain=decrypt(parseInt(licence_code,10),GetUniqueInstallationCode()).toString();
			//console.println("Plain on entry " + plain);
			plain=plain.slice(1,15); //drop the first and last numbers
			if(!CheckLicenceCode(plain)){
				app.alert("Not a valid licence code.");
				return false;
			}
			var license_expiry=new Date("20"+plain.slice(12,14),(Number(plain.slice(10,12))-1).toString(),plain.slice(8,10));
			SetLicenceDate(license_expiry);
			//console.println(license_bought.toLocaleDateString());
			if(OutOfTime()) {
					return false;
				}else{
					app.alert("Licenced until " + GetDateString(GetLicenceDate()));
					return true;
				}
			return true;
		}else{
			//app.alert("Licenced until " + GetDateString(GetLicenceDate())+ "\n\nPlease go to www.nofussbundles.com to extend licence." ,1);
			return true;
		}

	
	return true;
	app.endPriv();

});

var OutOfTime = app.trustedFunction(function(){
	app.beginPriv();

	var now_time = new Date();
	var l_expiry=GetLicenceDate();

	if(now_time>l_expiry)return true;
	
	return false;
	app.endPriv();

});

var OutOfEasyTime = app.trustedFunction(function(){
	app.beginPriv();

	var now_time = new Date();
	var l_expiry=GetEasyLicenseExpiry();
	
	if (l_expiry==null) return false;

	if(now_time>l_expiry)return true;
	
	return false;
	app.endPriv();

});

var OutOfTrial = app.trustedFunction(function(){
	app.beginPriv();

	var now_time = new Date();
	var l_expiry=GetTrialDate();

	if(now_time>l_expiry)return true;
	
	return false;
	app.endPriv();

});

var NeverLicenced=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_licence_expiry_yy) == "undefined" || typeof(global.no_fuss_licence_expiry_mm) == "undefined" || typeof(global.no_fuss_licence_expiry_dd) == "undefined") {
		return true;
	}else{
		return false;
	}
	app.endPriv();
});

var NeverTrialled=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_trial_expiry_yy) == "undefined" || typeof(global.no_fuss_trial_expiry_mm) == "undefined" || typeof(global.no_fuss_trial_expiry_dd) == "undefined") {
		return true;
	}else{
		return false;
	}
	app.endPriv();
});

var CheckLicence = app.trustedFunction(function(){
	return true;
	//returns true if the licence is good, otherwise false
	console.println("Checking license");
	app.beginPriv();
	//IssueReminder();
	if(GetEasyUniqueInstallationCode()==null){ //no license entered
		//SetUniqueInstallationCode();
		//console.println("Here " + GetUniqueInstallationCode());
		app.alert("Unlicenced. \n\nPlease go to www.nofussbundles.com to get licence." ,1);
		return false;
	}

	if(GetEasyActivation()!=1){ //no license entered
		//SetUniqueInstallationCode();
		//console.println("Here " + GetUniqueInstallationCode());
		app.alert("Licence not activated on this computer. \n\nClick on Licence button to activate." ,1);
		return false;
	}


	//RequestLicence();
//	if(NeverTrialled() /*&& NeverLicenced()*/){
//		var n=new Date();
//		if(GetUniqueInstallationCode()==null)SetUniqueInstallationCode();
//		SetTrialStart(n);
		//console.println("Trial lasts until " + GetDateString(GetTrialDate()));
//	}
	
/*	if(NeverLicenced())
  	{
  		if(OutOfTrial()){ //never installed so set unique installation code
			if(!GetUniqueInstallationCode()==null)SetUniqueInstallationCode();
			 return false; 
		}
  	}else{
  		if(OutOfTime() && OutOfTrial())	{
			app.alert("Licenced until " + GetDateString(GetLicenceDate())+ "\n\nPlease go to www.nofussbundles.com to extend licence." ,1);
  			return false; //out of time for both licence & trial
  		}
  	}
*/

	if(OutOfEasyTime())	{
		app.alert("Licenced until " + moment(GetEasyLicenseExpiry()).format('DD/MM/YY') + "\n\nPlease go to www.nofussbundles.com to extend licence." ,1);
		//return false; //out of time for both licence & trial
		return false; //out of time for both licence & trial
	}

	return true;
	app.endPriv();
});

var ResetLicences=app.trustedFunction(function(){
	app.beginPriv();
	console.println("Deleting licence data");
	delete global.no_fuss_trial_expiry_yy;
	delete global.no_fuss_trial_expiry_mm;
	delete global.no_fuss_trial_expiry_dd;

	delete global.no_fuss_licence_expiry_yy;
	delete global.no_fuss_licence_expiry_mm;
	delete global.no_fuss_licence_expiry_dd;
	
//	delete global.no_fuss_Unique_Code;
	delete global.no_fuss_Easy_Unique_Code;
	app.endPriv();
});

var LicenceDlg =
{

    strTitle:"",
    strCode: "NF"+parseInt(GetUniqueInstallationCode(),10).toString()+"Z"+LicenceExpirytoSixFigString(),
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "sta2": "Version " + version + "\n\nLicenced until " + GetDateString(GetLicenceDate())+ "\n\nPlease go to www.nofussbundles.com to extend licence.",
            "Titl": this.strTitle,
            "Code": this.strCode,
        };
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strTitle = oRslt["Titl"];
        this.strCode=oRslt["Code"];
    },
    description:
    {
        name: "Licence",
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
                                name: "Licence expires",
                                width: 200,
                                height: 61,
                                char_width: 20,
                                alignment: "align_fill",
                                font: "palette",
                                bold: true,
                            },
                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "Copy this ID code:",
                                char_width: 30,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Code",
                                variable_Name: "strCode",
                                char_width: 30,
                                alignment: "align_fill",
                            },

                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "Enter release code:",
                                char_width: 30,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Titl",
                                variable_Name: "strTitle",
                                char_width: 30,
                                alignment: "align_fill",
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

var LicenceEasyDlg =
{

    strTitle:"",
    strCode: GetEasyUniqueInstallationCode(),
    initialize: function(dialog)
    {
    	var ver="";
    	ver="Version " + version;
    	var activations="";
    	if (GetEasyActivationsLeft()!=null){
	    	activations= GetEasyActivationsLeft().toString() + " activations left out of " + GetEasyLicenseLimit().toString();
	    }
    	var activated="";
    	if (GetEasyActivation()==1) {
    		activated="ACTIVATED on this computer";
    	}else{
    		activated="NOT activated on this computer";
    	}
    	var license_expiry="";
    	if (GetEasyLicenseExpiry()!=null){
    		license_expiry=moment(GetEasyLicenseExpiry()).format('DD/MM/YY');
    	}else{
    		license_expiry="";
    	}
    	var text_for_license="";
    	text_for_license=text_for_license + ver;
    	if (GetEasyUniqueInstallationCode()!=null){
    		text_for_license=text_for_license + "\n\nLicenced until " + license_expiry  + "\n\n" + activated + " with " + activations + "\n\nPlease go to www.nofussbundles.com to extend licence.";
    	}
    	console.println(activations);
        var dlgInit = 
        {
            "sta2": text_for_license,
            "Titl": this.strTitle,
            "Code": this.strCode,
        };
        
    	if (GetEasyActivation()==1) {
    			dialog.enable({"but1":false});
    			dialog.enable({"but2":true});
    		}else{
 		   		dialog.enable({"but1":true});
    			dialog.enable({"but2":false});
    		}
    	if (GetEasyUniqueInstallationCode()==null){
    			dialog.enable({"but3":false});    		
    			dialog.enable({"Code":true});
	    	}else{
    			dialog.enable({"but3":true});
    			dialog.enable({"Code":false});
    		}
 
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strTitle = oRslt["Titl"];
        this.strCode=oRslt["Code"];
    },
    "but1": function(dialog) //activate button
    {
        var oRslt = dialog.store();
    	this.strCode=oRslt["Code"]; //get the licence from the text box
    	if(GetEasyActivation()==1){
//    		app.alert("This license is already activated");
	    	SetEasyUniqueInstallationCode(this.strCode);
    		activatelicence(this.strCode);
    	}else{
	    	SetEasyUniqueInstallationCode(this.strCode);
    		activatelicence(this.strCode);
    		dialog.end();
    	}
    },
    "but2": function(dialog) //de-activate button
    {
        var oRslt = dialog.store();
    	this.strCode=oRslt["Code"]; //get the licence from the text box
    	if(GetEasyActivation()==1){
	    	deactivatelicence(this.strCode);
	    	dialog.end();
    	}else{
    		app.alert("This license is not activated on this computer.");
    	}
    },
    "but3": function(dialog) //delete button
    {
        var oRslt = dialog.store();
    	this.strCode=oRslt["Code"]; //get the licence from the text box
	    deletelicence(this.strCode);
    	this.strCode="Enter License Here";
    	oRslt["Code"]="";
    	SetEasyActivation(0);
		ResetLicences();
    	//initialize(dialog);
    	dialog.end();
		
    },
    description:
    {
        name: "Licence",
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
                                name: "Licence expires",
                                width: 200,
                                height: 61,
                                char_width: 20,
                                alignment: "align_fill",
                                font: "palette",
                                bold: true,
                            },
                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "Licence:",
                                char_width: 30,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Code",
                                variable_Name: "strCode",
                                char_width: 30,
                                alignment: "align_center",
                            },
                            
                            /*ACTIVATE, DE-ACTIVATE AND DELETE BUTTONS HERE*/
                            {
							type: "view",
							align_children: "align_row",
							elements:
								[
									{
										type: "button",
										item_id: "but1",
										char_width: 40,
										alighment: "align_center",
										name: "Activate",
									},
								]
							},                                    
							{
								type: "view",
								align_children: "align_row",
								elements:
								[
									{
										type: "button",
										item_id: "but2",
										char_width: 40,
										alighment: "align_center",
										name: "Deactivate",
									},
								]
							},                                    
							{
								type: "view",
								align_children: "align_row",
								elements:
								[
									{
										type: "button",
										item_id: "but3",
										char_width: 40,
										alighment: "align_center",
										name: "Delete license",
									},
								]
							},                                    


/*                          {
                                type: "static_text",
                                item_id: "stat",
                                name: "Enter release code:",
                                char_width: 30,
                                alignment: "align_fill",
                                font: "dialog",
                            },
                            {
                                type: "edit_text",
                                item_id: "Titl",
                                variable_Name: "strTitle",
                                char_width: 30,
                                alignment: "align_fill",
                            },
*/
                        ]
                    },
                    {
                        type: "ok",
                    },
                ]
            },
        ]
    }
};


//</CodeAbove>

//<JSCodeSnippet name="ImageData7">
var strData7REFRESH = 
"00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010f0f0f4118181886212121a81d1d1da8272727852222223f1c1c1c01131313071f1f1f7f242424251e1e1e00000000000000000000000000000000000000000000000000000000000000003a151515d2202020ff272727ff282828ff202020ff252525ff282828ff212121d01b1b1b6d242424ff2828288f282828000000000000000000000000000000000000000000000000000000005c181818fb222222ff242424ff232323fc272727dc1a1a1adb1a1a1afc272727ff262626ff252525ff262626ff272727b82626260000000000000000000000000000000000000000000000003a131313fb242424ff2a2a2af72222227c191919121616160000000000000000121f1f1f7e202020f8242424ff1f1f1fff202020e02121210000000000000000000000000000000000000000010c0c0cd31d1d1dff282828f82525253d1717170000000000000000000000000000000013222222db212121f5252525ff212121ff262626fe2121210a1414140000000000000000000000000000000042181818ff252525ff2525257b181818000000000000000000000000000000000000000010252525cb1f1f1fef222222ff202020ff2b2b2bfb24242415232323000000000000000000000000000000000f222222562222229d212121122121210000000000000000000000000000000000000000000000000000000000000000081a1a1a20202020212626260000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000026171717252323230c252525000000000000000000000000000000000000000000000000000000000000000018171717a0232323591a1a1a101a1a1a000000000000000000000000000000001a232323fd2b2b2bff262626ff1f1f1ff31a1a1ace2626260f1919190000000000000000000000000000000000000000841b1b1bff252525ff2929293a191919000000000000000000000000000000000d191919ff262626ff252525ff202020f41e1e1ed42929291023232300000000000000000000000000000000441b1b1bfa202020ff1b1b1bcb212121000000000000000000000000000000000000000000000000e51d1d1dff2c2c2cff282828f91e1e1e801b1b1b15202020000000000000000017121212821f1f1ffa252525ff252525f91f1f1f34121212000000000000000000000000000000000000000000000000bc1a1a1aff222222fe1f1f1fff212121ff292929fe262626e11c1c1ce2202020fe292929ff242424ff1c1c1cf91f1f1f5423232300000000000000000000000000000000000000000000000000000000932a2a2aff24242467292929ce191919ff292929ff1e1e1eff212121ff252525ff262626ff242424cc1d1d1d341515150000000000000000000000000000000000000000000000000000000000000000252121217a1a1a1a05202020000000003b1c1c1c80242424a2232323a3222222811d1d1d3a1414140000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
//</JSCodeSnippet>


// Icon Generic Stream Object
//<JSCodeSnippet name="ButtonIconDef">
var oIconREFRESH = null;
//if(app.viewerVersion < 7){
//}else{
oIconREFRESH = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7REFRESH.slice(this.count, this.count += nBytes);}};
//}
//</JSCodeSnippet>

//<JSCodeSnippet name="EventCode">
var DoCmdREFRESH = 
"DoREFRESH(event.target);"
//</JSCodeSnippet>

//<JSCodeSnippet name="ButtonObjDef">
var oButObjREFRESH = 
{cName: "REFRESH",
cExec: DoCmdREFRESH,
cEnable: "event.rc = (app.doc != null) && (app.doc.info.PaginationExists || app.doc.info.SqExists || app.doc.info.TOCExists || app.doc.info.LegalNumExists || app.doc.info.HeaderExists || app.doc.info.SubsExist || app.doc.info.LinkingExists || app.doc.info.CHRONOExists)",
cTooltext: "Refresh",
cLabel: "Refresh",
nPos: 0};
//</JSCodeSnippet>
if(oIconREFRESH != null)
    oButObjREFRESH.oIcon = oIconREFRESH;

try{app.removeToolButton("REFRESH");}catch(e){}

//<JSCodeSnippet name="TryAddBut">
try
{
//</JSCodeSnippet>
//<JSCodeSnippet name="AddButtonfn">
	//if (app.doc!=null) PaginationExists=PaginationPresent(app.doc);
    app.addToolButton(oButObjREFRESH);
//</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["REFRESH_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["REFRESH_InDoc"] = "1:17:2011:17:55:45";
//<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjREFRESH"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
//</JSCodeSnippet>
 
//</AcroButtons>




