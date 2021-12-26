var Trial_Days=14;
var item_id_Str="741";
    
var DoLICENCE = app.trustedFunction(function(oDoc)
{
	app.beginPriv();
	SetEasyUniqueInstallationCode(null);
	
	//ResetLicences(); //to reset the licence data as if new installation
	//return;

	var license_str=GetEasyUniqueInstallationCode();
	if(license_str!=null) license_str=license_str.toString();
	
	if (license_str!=null){ 
	    var fURL="https://www.nfschedule.com/?edd_action=check_license&item_id=" + item_id_Str + "&license=" + license_str;
		var ajaxCallback = {
			response:function(msg,uri,e){
				var stream = msg;
				var string = "";
				var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
				string = SOAP.stringFromStream( stream );
				oResult = JSON.parse(string);

				console.println("Checking for " & license_str);
				//Set the various things
				if(oResult.success==true){
					//Successful activation. Therefore set
					if(oResult.license=="valid") {
						SetEasyActivation(1);
						console.println("valid");
					}else{
						console.println("not valid");
						SetEasyActivation(0);
					}
					SetEasyLicenseLimit(oResult.license_limit);
					SetEasyActivationsLeft(oResult.activations_left);
					SetEasyLicenseExpiry(oResult.expires);
				}else{
					//failure of some sort	
					app.alert("Unable to check the licence");
				}
				RequestEasyLicence();
			}
		};
		ajax(fURL, ajaxCallback);
	}else{
		RequestEasyLicence();	
	}


app.endPriv();

});


// Make HTTP GET request
ajax = app.trustedFunction(function(fURL, ajaxCallback) {
    app.beginPriv();
    Net.HTTP.request({ cVerb:"GET", cURL:fURL,  oHandler: ajaxCallback});
    app.endPriv();
});


CheckEasyLicense = app.trustedFunction(function(license_str) {
    app.beginPriv();
//    var license_str="372728f82c6fba81a79d3b9269d88144";
	var license_str=GetEasyUniqueInstallationCode();
	if(license_str!=null) license_str=license_str.toString();
	if(license_str!=null){
		var fURL="https://www.nfschedule.com/?edd_action=check_license&item_id=" + item_id_Str + "&license=" + license_str;
		var ajaxCallback = {
			response:function(msg,uri,e){
				var stream = msg;
				var string = "";
				var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
				string = SOAP.stringFromStream( stream );
				oResult = JSON.parse(string);

				console.println("Checking for " & license_str);
				//Set the various things
				if(oResult.success==true){
					//Successful activation. Therefore set
					if(oResult.license=="valid") {
						SetEasyActivation(1);
						console.println("valid");
					}else{
						console.println("not valid");
						SetEasyActivation(0);
					}
					SetEasyLicenseLimit(oResult.license_limit);
					SetEasyActivationsLeft(oResult.activations_left);
					SetEasyLicenseExpiry(oResult.expires);
				}else{
					//failure of some sort	
				}
			}
		};
		ajax(fURL, ajaxCallback);
	}else{
		//null license
	}
    app.endPriv();
});

activatelicence = app.trustedFunction(function(license_str) {
    app.beginPriv();
    var fURL="https://www.nfschedule.com/?edd_action=activate_license&item_id=" + item_id_Str + "&license=" + license_str;

	// process the response
	var ajaxCallback = {
    	response:function(msg,uri,e){
			var stream = msg;
			var string = "";
			var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
			string = SOAP.stringFromStream( stream );
			oResult = JSON.parse(string);

			console.println("Activation attempted " & license_str);
			console.println(error);
			console.println(string);

			//Set the various things
			if(oResult.success==true){
				//Successful activation. Therefore set
				if(oResult.license=="valid") {
					SetEasyActivation(1);
				}else{
					SetEasyActivation(0);
				}
				SetEasyLicenseLimit(oResult.license_limit);
				SetEasyActivationsLeft(oResult.activations_left);
				SetEasyLicenseExpiry(oResult.expires);
				app.alert("Successfully activated on this computer.");
			}else{
				//failure of some sort	
				app.alert("Problem activating on this computer. Please check internet connection.");
			}
    	}
	};

	ajax(fURL, ajaxCallback);

    app.endPriv();
});

deactivatelicence = app.trustedFunction(function(license_str) {
    app.beginPriv();
    var fURL="https://www.nfschedule.com/?edd_action=deactivate_license&item_id=" + item_id_Str + "&license=" + license_str;
	// process the response
	var ajaxCallback = {
    	response:function(msg,uri,e){
			var stream = msg;
			var string = "";
			var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
			string = SOAP.stringFromStream( stream );
			oResult = JSON.parse(string);

			console.println("Deactivation attempted for " & license_str);
			console.println(error);
			console.println(string);

			//Set the various things
			if(oResult.success==true){
				//Successful activation. Therefore set
				if(oResult.license=="deactivated") {
					SetEasyActivation(0);
				}
				app.alert("Successfully deactivated on this computer.");
			}else{
				//failure of some sort	
				app.alert("Unable to deactivate on this computer. Please check internet connection.");
			}
    	}
	};

	ajax(fURL, ajaxCallback);
    app.endPriv();
});

deletelicence = app.trustedFunction(function(license_str) {
    app.beginPriv();
    var fURL="https://www.nfschedule.com/?edd_action=deactivate_license&item_id=" + item_id_Str + "&license=" + license_str;
	// process the response
	var ajaxCallback = {
    	response:function(msg,uri,e){
			var stream = msg;
			var string = "";
			var error = e == undefined? 'No HTTP errors' : "ERROR: " + e;
			string = SOAP.stringFromStream( stream );
			oResult = JSON.parse(string);

			console.println("Deactivation attempted for " & license_str);
			console.println(error);
			console.println(string);

			//Set the various things
			if(oResult.success==true){
				//Successful activation. Therefore set
				if(oResult.license=="deactivated") {
					SetEasyActivation(0);
					ResetLicences();
				}
				app.alert("Successfully deleted on this computer.");
			}else{
				//failure of some sort	
				app.alert("Unable to delete on this computer. Please check internet connection.");
			}
    	}
	};

	ajax(fURL, ajaxCallback);
    app.endPriv();
});




 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7LICENCE = 
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d181818651a1a1aa8252525c9282828c9282828a8252525632525250c2020200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000601a1a1aed262626ff262626ff1f1f1fff222222ff212121ff1f1f1fff232323eb2626265d18181800000000000000000000000000000000000000000000000000000000000000000000000087171717ff252525f62222228b1b1b1b3122222207232323071f1f1f321c1c1c8d222222f8292929ff262626831c1c1c00000000000000000000000000000000000000000000000000000000601b1b1bff252525e1232323291111110000000000000000000000000203030300000000000000002c151515e31f1f1fff2626265c13131300000000000000000000000000000000000000000d181818ed272727f62424242916161600000000121111119d212121f21f1f1ffe212121db21212160171717000000002d171717f8262626eb2020200b14141400000000000000000000000000000000651b1b1bff2626268b1b1b1b0000000003070707cb242424ff1f1f1fd41f1f1fb3252525ea2727275a1616160000000000000000921c1c1cff282828621a1a1a00000000000000000000000000000000a8202020ff23232331272727000000004a262626ff1f1f1fb4212121010303030000000001000000000000000000000000000000371e1e1eff212121a62b2b2b00000000000000000000000000000000c9202020ff23232307252525000000007f242424ff2121215a1c1c1c0000000000000000000000000000000000000000000000000d232323ff1c1c1cc827272700000000000000000000000000000000c9222222ff212121071f1f1f00000000821f1f1fff212121592727270000000000000000000000000000000000000000000000000d272727ff1b1b1bc823232300000000000000000000000000000000a8212121ff1d1d1d321b1b1b00000000511f1f1fff282828af20202000000000000000000000000000000000000000000000000038252525ff202020a523232300000000000000000000000000000000631f1f1fff1e1e1e8d2121210000000005202020d7272727ff282828d51e1e1eb6272727db292929571b1b1b0000000000000000941b1b1bff26262660222222000000000000000000000000000000000c1e1e1eeb1f1f1ff82828282c1a1a1a000000001b151515ab212121f21e1e1ef9232323d6202020361616160000000030131313fa242424e92121210b1a1a1a00000000000000000000000000000000000000005d151515ff252525e32222222d13131300000000000000000000000000000000000000000000000030151515e5242424ff2e2e2e5912121200000000000000000000000000000000000000000000000000000000831f1f1fff2a2a2af81f1f1f921d1d1d372424240d2626260d222222381d1d1d94222222fa282828ff232323801616160000000000000000000000000000000000000000000000000000000000000000000000005c131313eb202020ff282828ff232323ff1e1e1eff1d1d1dff222222ff282828e92323235914141400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b141414621a1a1aa6282828c8242424c8202020a5202020601f1f1f0b17171700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconLICENCE = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconLICENCE = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7LICENCE.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdLICENCE = 
"DoLICENCE(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjLICENCE = 
{cName: "LICENCE",
cExec: DoCmdLICENCE,
cEnable: "event.rc = (app.doc != null)",
 //cMarked: "event.rc = PaginationPresent(app.doc)",
 //cMarked: "event.rc = app.doc.info.PaginationExists",
cTooltext: "Request a licence",
cLabel: "LICENCE",
nPos: 0};
 //</JSCodeSnippet>
if(oIconLICENCE != null)
    oButObjLICENCE.oIcon = oIconLICENCE;

try{app.removeToolButton("LICENCE");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
	 //if (app.doc!=null) PaginationExists=PaginationPresent(app.doc);
    app.addToolButton(oButObjLICENCE);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["LICENCE_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["LICENCE_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjLICENCE"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>
