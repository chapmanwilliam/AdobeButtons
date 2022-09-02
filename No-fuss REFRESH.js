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
	if(!CheckPermitted())return;

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

var CheckLicence = app.trustedFunction(function() {
	app.beginPriv();
	var expires=GetLicenseExpiry();
	if (expires!=null) {
		if (Date.now() > expires) {
			return false;
		} else {
			return true;
		}
	}
	return false;
	app.endPriv();
});

var CheckPermitted = app.trustedFunction(function() {
	app.beginPriv();
	if(CheckLicence() || DaysLeftTrial()>0)return true;
	return false;
	app.endPriv();
});

var GetLicenseExpiry=app.trustedFunction(function(){
	app.beginPriv();
	if(typeof(global.no_fuss_licence_expiry_yy)=="undefined" || typeof(global.no_fuss_licence_expiry_mm)=="undefined" || typeof(global.no_fuss_licence_expiry_dd)=="undefined") {
		return null;
	}else{
		var dt=new Date(global.no_fuss_licence_expiry_yy, global.no_fuss_licence_expiry_mm,global.no_fuss_licence_expiry_dd);
		return dt;
	}
	app.endPriv();
});

var SetLicenseExpiry=app.trustedFunction(function(m){
	//m is moment of expiry
	app.beginPriv();
	var license_expiry=m.toDate();
	global.no_fuss_licence_expiry_yy=license_expiry.getFullYear();
	global.no_fuss_licence_expiry_mm=license_expiry.getMonth();
	global.no_fuss_licence_expiry_dd=license_expiry.getDate();
	global.setPersistent("no_fuss_licence_expiry_yy",true);
	global.setPersistent("no_fuss_licence_expiry_mm",true);
	global.setPersistent("no_fuss_licence_expiry_dd",true);
	app.endPriv();
});

var RequestLicence = app.trustedFunction(function(oDoc){
	app.beginPriv();
    LicenceDlg.strCode= "";

	//ClearLicence(); //for testing
	//ClearTrial(); //for testing
	//SetLicenseExpiry(moment().add(-10,'days')); //for testing

    var Expiry=GetLicenseExpiry();

	TitleStr="Version " + version + "\n\n";
	if(CheckLicence()) {
		console.println('got here');
		TitleStr =TitleStr+ "Licensed until " + moment(Expiry).format('DD/MM/YYYY') + "\n\n";
		TitleStr =TitleStr+ "You can add a year by entering another release code.\n\n";
	}else if(DaysLeftTrial()>0){
			TitleStr=TitleStr+DaysLeftTrial().toString() + " days of Trial left.\n\n";
			TitleStr =TitleStr+ "Extend the trial a year by entering a release code.\n\n";
	}else{
		TitleStr=TitleStr+"Licence expired " + moment(Expiry).format('DD/MM/YYYY') + "\n\n";
	}
	TitleStr=TitleStr+"Go to www.nofussbundles.com for licensing."

	LicenceDlg.strText=TitleStr;

	if("ok" == app.execDialog(LicenceDlg)){
								
		var user_code=LicenceDlg.strCode;

		if (user_code!=null){
			var fURL="https://europe-west2-ogden8.cloudfunctions.net/LICENCE?unique_code="+user_code;
			var ajaxCallback = {
				response:function(msg,uri,e){
					var stream = msg;
					var msgString = "";
					var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
					msgString = SOAP.stringFromStream( stream );
					if (e==undefined) {
						if (msgString == "True") {
							//Successful activation. Therefore set
							//Set the date one year from now or from date of Expiry
							m=moment();
							if(moment(Expiry)>m) m=moment(Expiry);
							new_expiry=m.add(1, 'years');
							new_expiry=m.add(DaysLeftTrial(),'days');
							SetLicenseExpiry(new_expiry);
							SetTrialStart(moment().toDate(),0);//end trial period
							app.alert('Installed. Expires ' + new_expiry.format("DD/MM/YYYY"));
						} else {
							//failure of some sort
							app.alert("Bad code / already used.");
						}
					}else{
						app.alert('Failed to make connection: ' + error);
					}
				}
			};
			ajax(fURL, ajaxCallback);
		}else {
			app.alert('Enter code')
		}
	}

	app.endPriv();

});

var ClearTrial = app.trustedFunction(function(){
	app.beginPriv();
	if (global.no_fuss_trial_expiry_yy) delete global.no_fuss_trial_expiry_yy;
	if (global.no_fuss_trial_expiry_mm) delete global.no_fuss_trial_expiry_mm;
	if (global.no_fuss_trial_expiry_dd) delete global.no_fuss_trial_expiry_dd;
	app.endPriv();
});

var ClearLicence = app.trustedFunction(function(){
	app.beginPriv();
	if(global.no_fuss_licence_expiry_yy) delete global.no_fuss_licence_expiry_yy;
	if(global.no_fuss_licence_expiry_mm) delete global.no_fuss_licence_expiry_mm;
	if(global.no_fuss_licence_expiry_dd) delete global.no_fuss_licence_expiry_dd;
	app.endPriv();
});


var GetLicenceDate = app.trustedFunction(function(){
	app.beginPriv();
	return new Date(global.no_fuss_licence_expiry_yy, global.no_fuss_licence_expiry_mm,global.no_fuss_licence_expiry_dd);
	app.endPriv();
});

var SetTrialStart = app.trustedFunction(function(n,dys=14){
	app.beginPriv();
//	var t=n.addDays(Trial_Days);
	var t=n.addDays(dys);
	//console.println("T Date " + t.toDateString());
	global.no_fuss_trial_expiry_yy=t.getFullYear();
	global.no_fuss_trial_expiry_mm=t.getMonth();
	global.no_fuss_trial_expiry_dd=t.getDate();
	global.setPersistent("no_fuss_trial_expiry_yy",true);
	global.setPersistent("no_fuss_trial_expiry_mm",true);
	global.setPersistent("no_fuss_trial_expiry_dd",true);
	console.println("Trial date " + global.no_fuss_trial_expiry_dd + ", " + global.no_fuss_trial_expiry_mm + ", " + global.no_fuss_trial_expiry_yy);
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

var DaysLeftTrial=app.trustedFunction(function() {
	TrialDate=moment(GetTrialDate());
	Today=moment();
	var dys=TrialDate.diff(Today,'days');
	if (dys<0) return 0;
	return dys;
});



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

var LicenceDlg =
{

    strCode:"",
	strText:"",
    initialize: function(dialog)
    {
        var dlgInit =
        {
            "sta2": this.strText,
            "Code": this.strCode,
        };
		if (CheckLicence()) {
			//licence ok so no need to enter another
			dialog.enable({'Code': true});
		}else{
			dialog.enable({'Code':true});
		}
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strCode = oRslt["Code"];
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
								variable_Name: "strTxt",
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
                                name: "Enter release code:",
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




