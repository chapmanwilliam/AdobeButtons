

 //*******************************************\\
 //This creates preferences

var dothePrefDialog=app.trustedFunction(function (dialog,oDoc){
	app.beginPriv();
	dialog.doc=oDoc;
	dialog.dirty=false;
	dialog.dirty_key_dates=false;
	var retn=app.execDialog(dialog);
	return retn;
	app.endPriv();
});
 
var PreferencesDlg =
{
    NFPGstrDtFormat:"DtUK",
    NFPGstrHorzPos:"PosR",
    NFPGnMarginX:"0.5",
    NFPGstrVertPos:"PosB",
    NFPGnMarginY:"0.5",
    NFPGcFontName:"Helvetica",
    NFPGnTextSize:"20",
    NFPGbBold:false,
    NFPGbItalics:false,
    NFPGstrTextCol:["Black"],
    NFPGstrRange:"rAll",
    NFPGstrStrtPg:"",
    NFPGstrEndPg:"",
    date_of_birth:null,
    date_of_injury:null,

    GetRadioSel:function(oRslts,aCtrls){
      for(var strRtn=aCtrls[0];aCtrls.length>0;strRtn=aCtrls.pop()){
        if(oRslts[strRtn] == true)
          return strRtn;
      }
      return "";
    },
    SetListSel:function(list,path){if(path.length == 0) return;
    eval("list[\""+ ((typeof path.join != "function")?path:path.join("\"][\"")) + "\"] = 1")},
    GetListSel:function(oLstRslts,path){
       for(var item in oLstRslts){
          if( ((typeof oLstRslts[item]=="number")&&(oLstRslts[item]>0))
             || this.GetListSel(oLstRslts[item],path) )
           {path.push(item);return true;}
       }
       return false;
    },
    bHidden:false,
    nNumPages:0,
    nCurPage:0,

    initialize: function(dialog)
    {
        var listFont = 
        {
            "Courier": -1,
            "Helvetica": -1,
            "Times Roman": -1,
        };
 
        this.SetListSel(listFont, this.NFPGcFontName);

        this.SetListSel(listFCol, this.NFPGstrTextCol);

        var dlgInit = 
        {
            "stat": "This allows you to set various preferences.",
            "MrgH": this.NFPGnMarginX,
            "MrgV": this.NFPGnMarginY,
            "Font": listFont,
            "Tsiz": this.NFPGnTextSize,
            "FCol": listFCol,
            "Bold": this.NFPGbBold,
            "Ital": this.NFPGbItalics,
            "tFPg": this.NFPGstrStrtPg,
            "tTPg": this.NFPGstrEndPg,
            "dobC": this.date_of_birth,
            "inju": this.date_of_injury,
        };
        dlgInit[this.NFPGstrHorzPos] = true;
        dlgInit[this.NFPGstrVertPos] = true;
        dlgInit[this.NFPGstrDtFormat]=true;
        dlgInit[this.NFPGstrRange] = true;
        dialog.load(dlgInit);
        dialog.enable(
            {
                "tTPg": false,
                "tFPg": false,
            }
    );
        
        if( (this.NFPGstrStrtPg == "")|| isNaN(this.NFPGstrStrtPg) || (Number(this.NFPGstrStrtPg) > this.nNumPages) )
        {
           if(this.bHidden)
               this.NFPGstrStrtPg = "1";
           else
               this.NFPGstrStrtPg = (this.nCurPage+1).toString();
        }
        
        if((this.NFPGstrEndPg == "") || isNaN(this.NFPGstrEndPg) || (Number(this.NFPGstrEndPg) > this.nNumPages) )
           this.NFPGstrEndPg = this.nNumPages.toString();
        
        
        var exInit ={"tFPg": this.NFPGstrStrtPg,"tTPg":this.NFPGstrEndPg, "sOfN":"of (" + this.nNumPages+")"};
        if(this.bHidden && this.strPgRangeSel == "rCur")
        {   
              this.strPgRangeSel = "rAll";
              exInit["rCur"] = false;
              exInit[this.strPgRangeSel] = true;
        }
         
        dialog.load(exInit);
        
        var exInit = {"ExPg":this.strPgRangeSel =="rFro", "MrgH":this.NFPGstrHorzPos!="PosC", "MrgV":this.NFPGstrVertPos!="PosM",
                                "tFPg":this.strPgRangeSel =="rFro", "tTPg":this.strPgRangeSel == "rFro", "rCur":!this.bHidden};
        
        dialog.enable(exInit);
    },
    validate: function(dialog)
    {
    	console.println("Validating preferences...");
        var oRslt = dialog.store();
        if(oRslt["rFro"])
        {
           if( (oRslt["tFPg"] == "")  || isNaN(oRslt["tFPg"])  || (oRslt["tTPg"] == "")  || isNaN(oRslt["tTPg"]) )
           {
              app.alert("If selected, the Page range values must be filled out with valid integers");
              return false;
           }
           if(Number(oRslt["tFPg"])  > Number(oRslt["tTPg"]) )
           {
             app.alert("If selected, the From page number must be less than the To page Number");
             return false;
           }
           if( (Number(oRslt["tFPg"])  > this.nNumPages) || (Number(oRslt["tTPg"])  > this.nNumPages)  )
           {
             app.alert("If selected, the From and To page numbers must be less than the number of pages");
             return false;
           }
        
        }

    	//if(bDate){    	
			if(!oRslt["dobC"]=="" && NoDateFromString(", " + oRslt["dobC"],this.doc)){
				app.alert("No valid date of birth.");
				return false;
			}
    	//if(bDate){    	
			if(!oRslt["inju"]=="" && NoDateFromString(", " + oRslt["inju"], this.doc)){
				app.alert("No valid injury date.");
				return false;
			}

        
        return true;
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.NFPGstrDtFormat=this.GetRadioSel(oRslt,["DtUK","DtUS"]);
        this.NFPGstrHorzPos = this.GetRadioSel(oRslt,["PosL","PosC","PosR"]);
        this.NFPGnMarginX = oRslt["MrgH"];
        this.NFPGstrVertPos = this.GetRadioSel(oRslt,["PosT","PosM","PosB"]);
        this.NFPGnMarginY = oRslt["MrgV"];
        var path = new Array();
        this.NFPGcFontName = ((this.GetListSel(oRslt["Font"],path))?path.reverse():"").toString();
        this.NFPGnTextSize = oRslt["Tsiz"];
        this.NFPGbBold = oRslt["Bold"];
        this.NFPGbItalics = oRslt["Ital"];
        var path = new Array();
        this.NFPGstrTextCol = ((this.GetListSel(oRslt["FCol"],path))?path.reverse():"").toString();
        this.NFPGstrRange = this.GetRadioSel(oRslt,["rAll","rCur","rFro"]);
        this.NFPGstrStrtPg = oRslt["tFPg"];
        this.NFPGstrEndPg = oRslt["tTPg"];
        this.date_of_birth=oRslt["dobC"];
        this.date_of_injury=oRslt["inju"];
    },  
    "but1": function(dialog) //reset button
    {
        var listFont = 
        {
            "Courier": -1,
            "Helvetica": -1,
            "Times Roman": -1,
        };
 

    	//Reset defaults
            this.NFPGstrDtFormat="DtUK"
    		this.NFPGstrHorzPos="PosR";
    		this.NFPGstrVertPos="PosB";
            this.NFPGnMarginX="0.5";
            this.NFPGnMarginY="0.5";
            this.NFPGnTextSize="20";
            this.NFPGbBold=false;
            this.NFPGbItalics=false;
            this.NFPGstrStrtPg="";
            this.NFPGstrEndPg="";
            this.NFPGcFontName="Helvetica";
            this.NFPGstrTextCol="Black";
            this.SetListSel(listFont, this.NFPGcFontName);
            this.SetListSel(listFCol, this.NFPGstrTextCol);

        var dlgInit = 
        {
            "stat": "This allows you to set various preferences.",
            "MrgH": this.NFPGnMarginX,
            "MrgV": this.NFPGnMarginY,
            "Font": listFont,
            "Tsiz": this.NFPGnTextSize,
            "FCol": listFCol,
            "Bold": this.NFPGbBold,
            "Ital": this.NFPGbItalics,
            "tFPg": this.NFPGstrStrtPg,
            "tTPg": this.NFPGstrEndPg,
            "dobC": this.date_of_birth,
            "inju": this.date_of_injury,
        };
        dlgInit[this.NFPGstrHorzPos] = true;
	    dlgInit[this.NFPGstrVertPos] = true;
        dlgInit[this.NFPGstrRange] = true;
        dlgInit[this.NFPGstrDtFormat]=true;
        dialog.load(dlgInit);
        dialog.enable(
            {
                "tTPg": false,
                "tFPg": false,
            }
        );
          
    },
    "but2": function (dialog) //apply button
    {	//Applies pagination
        var oRslt = dialog.store();
        this.NFPGstrDtFormat=this.GetRadioSel(oRslt,["DtUK","DtUS"]);
        this.NFPGstrHorzPos = this.GetRadioSel(oRslt,["PosL","PosC","PosR"]);
        this.NFPGnMarginX = oRslt["MrgH"];
        this.NFPGstrVertPos = this.GetRadioSel(oRslt,["PosT","PosM","PosB"]);
        this.NFPGnMarginY = oRslt["MrgV"];
        var path = new Array();
        this.NFPGcFontName = ((this.GetListSel(oRslt["Font"],path))?path.reverse():"").toString();
        this.NFPGnTextSize = oRslt["Tsiz"];
        this.NFPGbBold = oRslt["Bold"];
        this.NFPGbItalics = oRslt["Ital"];
        var path = new Array();
        this.NFPGstrTextCol = ((this.GetListSel(oRslt["FCol"],path))?path.reverse():"").toString();
        this.NFPGstrRange = this.GetRadioSel(oRslt,["rAll","rCur","rFro"]);
        this.NFPGstrStrtPg = oRslt["tFPg"];
        this.NFPGstrEndPg = oRslt["tTPg"];
		DownloadPrefDialog(this);
		console.println("Dirty flag " + this.dirty);
		if(this.dirty){
			if(RemovePagination(this.doc, true)){
				this.doc.info.PaginationExists=false;
				this.doc.info.PaginationExists=AddPagination(this.doc);
				this.dirty=false;
			}
		}
    },
    
    "dobC": function(dialog){
    	var oRslt = dialog.store();
    	this.date_of_birth=oRslt["dobC"];    	
    	//if(bDate){    	
		if(this.date_of_birth=="") return; 
		if(NoDateFromString(", " + this.date_of_birth)){
			app.alert("No valid date of birth.");
			return;
		}
		dialog.load({"dobC":SwapDateFromText(", "+ this.date_of_birth,false, this.doc)});
    },
    
    "inju": function(dialog){
    	var oRslt = dialog.store();
    	this.date_of_injury=oRslt["inju"];    	
    	console.println(":"+ this.date_of_injury+":");
    	//if(bDate){
    	if(this.date_of_injury=="") return;    	
		if(NoDateFromString(", " + this.date_of_injury)){
			app.alert("No valid injury date.");
			return;
		}
		dialog.load({"inju":SwapDateFromText(", "+ this.date_of_injury,false, this.doc)});
    },
    
    
    
    "tTPg": function(dialog)
    {
        var x;
        
        
    },
    "rFro": function(dialog)
    {
        dialog.enable({tFPg:true, tTPg:true});
        
        
    },
    "rCur": function(dialog)
    {
        dialog.enable({tFPg:false, tTPg:false});
        
        
    },
    "rAll": function(dialog)
    {
        dialog.enable({tFPg:false, tTPg:false});
        
        
    },
    "PosB": function(dialog)
    {
        dialog.enable({"MrgV":true});
    },
    "PosM": function(dialog)
    {
        dialog.enable({"MrgV":false});
    },
    "PosT": function(dialog)
    {
        dialog.enable({"MrgV":true});
    },
    "PosR": function(dialog)
    {
        dialog.enable({"MrgH":true});
    },
    "PosC": function(dialog)
    {
        dialog.enable({"MrgH":false});
    },
    "PosL": function(dialog)
    {
        dialog.enable({"MrgH":true});
    },
    description:
    {
        name: "Preferences",
        elements:
        [
            {
                type: "view",
                elements:
                [
                    {
                        type: "view",
                        elements:
                        [
                            {
                                type: "static_text",
                                item_id: "stat",
                                name: "This allows you to set various preferences.",
                                width: 200,
                                height: 41,
                                char_width: 15,
                                alignment: "align_fill",
                                font: "palette",
                                bold: true,
                            },
                            {
                                type: "cluster",
                                item_id: "cls1",
                                name: "Pagination",
                                elements:
                                [
                                    {
                                        type: "view",
                                        align_children: "align_top",
                                        elements:
                                        [
                                            {
                                                type: "radio",
                                                item_id: "PosL",
                                                group_id: "PosH",
                                                name: "Left",
                                                variable_Name: "NFPGstrHorzPos",
                                            },
                                            {
                                                type: "radio",
                                                item_id: "PosC",
                                                group_id: "PosH",
                                                name: "Center",
                                            },
                                            {
                                                type: "radio",
                                                item_id: "PosR",
                                                group_id: "PosH",
                                                name: "Right ",
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta2",
                                                name: " Margin (inches):",
                                            },
                                            {
                                                type: "edit_text",
                                                item_id: "MrgH",
                                                variable_Name: "NFPGnMarginX",
                                                char_width: 8,
                                            },
                                        ]
                                    },
                                    {
                                        type: "view",
                                        align_children: "align_top",
                                        elements:
                                        [
                                            {
                                                type: "radio",
                                                item_id: "PosT",
                                                group_id: "PosV",
                                                name: "Top ",
                                                variable_Name: "NFPGstrVertPos",
                                            },
                                            {
                                                type: "radio",
                                                item_id: "PosM",
                                                group_id: "PosV",
                                                name: "Middle",
                                            },

/*                                            {
                                                type: "gap",
                                                item_id: "gap2",
                                                char_width: 6,
                                                char_height: 1,
                                            },
*/
                                            {
                                                type: "radio",
                                                item_id: "PosB",
                                                group_id: "PosV",
                                                name: "Bottom",
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta1",
                                                name: "Margin (inches):",
                                            },
                                            {
                                                type: "edit_text",
                                                item_id: "MrgV",
                                                variable_Name: "NFPGnMarginY",
                                                char_width: 8,
                                            },
                                        ]
                                    },
                                    {
                                    	type: "view",
                                    	align_children: "align_row",
                                    	elements:
                                    	[
                                            {
                                                type: "static_text",
                                                item_id: "sta1",
                                                name: "Font",
                                            },
                                            {
                                                type: "popup",
                                                item_id: "Font",
                                                variable_Name: "NFPGcFontName",
                                                width: 87,
                                                height: 23,
                                                char_width: 8,
                                            },
                                            {
                                                type: "gap",
                                                item_id: "gap2",
                                                char_width: 1,
                                                char_height: 1,
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta2",
                                                name: "Size",
                                            },
                                            {
                                                type: "edit_text",
                                                item_id: "Tsiz",
                                                variable_Name: "NFPGnTextSize",
                                                width: 35,
                                                height: 23,
                                                char_width: 8,
                                                SpinEdit: "true",
                                            },
                                    	]
                                    },
                                    {
                                    	type: "view",
                                    	align_children: "align_row",
                                    	elements:
                                    	[
                                            {
                                                type: "check_box",
                                                item_id: "Bold",
                                                name: "Bold",
                                                variable_Name: "NFPGbBold",
                                            },
                                            {
                                                type: "check_box",
                                                item_id: "Ital",
                                                name: "Italics",
                                                variable_Name: "NFPGbItalics",
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta1",
                                                name: "Colour:",
                                            },
                                            {
                                                type: "popup",
                                                item_id: "FCol",
                                                variable_Name: "NFPGstrTextCol",
                                                width: 86,
                                                height: 23,
                                                char_width: 8,
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
                            					item_id: "but1",
                            					char_width: 40,
                            					alighment: "align_center",
                            					name: "Reset defaults",
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
                            					name: "Apply",
                            				},
                                    	]
                                    },                                    
                                ]
                            }, 
                            {
                                type: "cluster",
                                item_id: "cls2",
                                name: "Key dates",
                                elements:
                                [
	                                {
		                                type: "view",
										alignment: "align_fill",
										align_children: "align_row",
            		                    elements:
                		                [
                    		                {
                        		                type: "static_text",
                            		            item_id: "sta4",
                                		        name: "Date of Birth",
                                    		},
                                    		{
                                        		type: "edit_text",
                                        		item_id: "dobC",
                                        		variable_Name: "date_of_birth",
                                        		char_width: 10,
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
                        		                type: "static_text",
                            		            item_id: "sta4",
                                		        name: "Date of Injury",
                                    		},
                                    		{
                                        		type: "edit_text",
                                        		item_id: "inju",
                                        		variable_Name: "date_of_injury",
                                        		char_width: 10,
                                    		},
                                    	]
                                    },
                                ]
                            },
{
                                type: "cluster",
                                item_id: "cls3",
                                name: "Date format",
                                elements:
                                [
                                            {
                                                type: "radio",
                                                item_id: "DtUK",
                                                group_id: "DtFo",
                                                name: "UK - dd/mm/yy",
                                                variable_Name: "NFPGstrDtFormat",
                                            },
                                            {
                                                type: "radio",
                                                item_id: "DtUS",
                                                group_id: "DtFo",
                                                name: "US - mm/dd/yy",
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

function SetKeyDates(oDoc){
    console.println("sset key dates");
    console.println(oDoc.path);
	if(moment(oDoc.info.date_of_birth).isValid()){
		//console.println("DOB: " + oDoc.info.date_of_birth);
		var f=GetLocaleDate(oDoc)
		if (f=='en-GB') dob_C=moment(oDoc.info.date_of_birth, date_formatsUK).toDate();
		if (f=='en-US') dob_C=moment(oDoc.info.date_of_birth, date_formatsUS).toDate();
		//console.println("DOB: " + dob_C);
	}else{
		dob_C=null;
	}
	
}


var DownloadPrefDialog=app.trustedFunction(function(PreferencesDlg){
	app.beginPriv();
			//any changes flag dirty flag
			console.println(PreferencesDlg.doc.info.NFPGnMarginX);
			console.println(Number(PreferencesDlg.NFPGnMarginX,10));
      		if( PreferencesDlg.doc.info.NFPGstrDtFormat != PreferencesDlg.NFPGstrDtFormat ||
                PreferencesDlg.doc.info.NFPGstrHorzPos != PreferencesDlg.NFPGstrHorzPos ||
  	 	   		PreferencesDlg.doc.info.NFPGnMarginX !=   Number(PreferencesDlg.NFPGnMarginX) ||
    	  		PreferencesDlg.doc.info.NFPGstrVertPos != PreferencesDlg.NFPGstrVertPos ||
      			PreferencesDlg.doc.info.NFPGnMarginY !=   Number(PreferencesDlg.NFPGnMarginY) ||
      			PreferencesDlg.doc.info.NFPGcFontName !=  PreferencesDlg.NFPGcFontName ||
      			PreferencesDlg.doc.info.NFPGnTextSize !=  parseInt(PreferencesDlg.NFPGnTextSize,10) ||
      			PreferencesDlg.doc.info.NFPGbBold !=      PreferencesDlg.NFPGbBold ||
      			PreferencesDlg.doc.info.NFPGbItalics !=   PreferencesDlg.NFPGbItalics ||
      			PreferencesDlg.doc.info.NFPGstrTextCol != PreferencesDlg.NFPGstrTextCol //||
      			//PreferencesDlg.doc.info.NFPGstrRange !=   PreferencesDlg.NFPGstrRange ||
      			//PreferencesDlg.doc.info.NFPGstrStrtPg !=  PreferencesDlg.NFPGstrStrtPg ||
      			//PreferencesDlg.doc.info.NFPGstrEndPg !=   PreferencesDlg.NFPGstrEndPg
      			) {
	      			PreferencesDlg.dirty=true;
    	  			//console.println("There's been a change: dirty flag is: " + PreferencesDlg.dirty);
      			}	

     			if( PreferencesDlg.doc.info.date_of_birth != PreferencesDlg.date_of_birth ||
      				PreferencesDlg.doc.info.date_of_injury != PreferencesDlg.date_of_injury //||
      			){
      				PreferencesDlg.dirty_key_dates=true;
      			}
 
	
	        console.println(PreferencesDlg.NFPGstrDtFormat);
            PreferencesDlg.doc.info.NFPGstrDtFormat = PreferencesDlg.NFPGstrDtFormat;
      		PreferencesDlg.doc.info.NFPGstrHorzPos = PreferencesDlg.NFPGstrHorzPos;
      		PreferencesDlg.doc.info.NFPGnMarginX =   Number(PreferencesDlg.NFPGnMarginX); //convert from text to number
      		PreferencesDlg.doc.info.NFPGstrVertPos = PreferencesDlg.NFPGstrVertPos;
      		PreferencesDlg.doc.info.NFPGnMarginY =   Number(PreferencesDlg.NFPGnMarginY); //convert from text to number
      		PreferencesDlg.doc.info.NFPGcFontName =  PreferencesDlg.NFPGcFontName;
      		PreferencesDlg.doc.info.NFPGnTextSize =  parseInt(PreferencesDlg.NFPGnTextSize,10); //convert from text to number
      		PreferencesDlg.doc.info.NFPGbBold =      PreferencesDlg.NFPGbBold;
      		PreferencesDlg.doc.info.NFPGbItalics =   PreferencesDlg.NFPGbItalics;
      		PreferencesDlg.doc.info.NFPGstrTextCol = PreferencesDlg.NFPGstrTextCol;
      		//PreferencesDlg.doc.info.NFPGstrRange =   PreferencesDlg.NFPGstrRange;
      		//PreferencesDlg.doc.info.NFPGstrStrtPg =  PreferencesDlg.NFPGstrStrtPg;
      		//PreferencesDlg.doc.info.NFPGstrEndPg =   PreferencesDlg.NFPGstrEndPg;
      		
      		PreferencesDlg.doc.info.date_of_birth = PreferencesDlg.date_of_birth;
      		if(PreferencesDlg.date_of_birth=="") PreferencesDlg.doc.info.date_of_birth=undefined;
      		//console.println("DOB" + PreferencesDlg.date_of_birth);
      		PreferencesDlg.doc.info.date_of_injury = PreferencesDlg.date_of_injury;
      		SetKeyDates(PreferencesDlg.doc);

      app.endPriv();
});

//Initial function on clicking button
var NFSetupPreferences = app.trustedFunction(function(oDoc)
{
<<<<<<< HEAD
	if(!CheckPermitted())return;
=======
	if(!CheckLicence())return;
>>>>>>> 9a8c3ab (first commit)

	app.beginPriv();

	//console.println("This " + oDoc.info.NFPGstrHorzPos); 
	
  //Set the dialog box to the global values
  if(typeof(oDoc.info.NFPGstrDtFormat) == "undefined" || oDoc.info.NFPGstrDtFormat=="")
  {
    oDoc.info.NFPGstrDtFormat = "DtUK";
    //oDoc.info.setPersistent("NFPGstrHorzPos",true);
  }
  PreferencesDlg.NFPGstrDtFormat = oDoc.info.NFPGstrDtFormat;
  
  if(typeof(oDoc.info.NFPGstrHorzPos) == "undefined" || oDoc.info.NFPGstrHorzPos=="")
  {
    oDoc.info.NFPGstrHorzPos = "PosR";
    //oDoc.info.setPersistent("NFPGstrHorzPos",true);
  }
  PreferencesDlg.NFPGstrHorzPos = oDoc.info.NFPGstrHorzPos;

  if(typeof(oDoc.info.NFPGnMarginX) == "undefined" || oDoc.info.NFPGnMarginX=="")
  {
    oDoc.info.NFPGnMarginX = 0.5;
    //oDoc.info.setPersistent("NFPGnMarginX",true);
  }
  PreferencesDlg.NFPGnMarginX = oDoc.info.NFPGnMarginX.toString(); //convert from number to string

  if(typeof(oDoc.info.NFPGstrVertPos) == "undefined" || oDoc.info.NFPGstrVertPos=="")
  {
    oDoc.info.NFPGstrVertPos = "PosB";
    //oDoc.info.setPersistent("NFPGstrVertPos",true);
  }
  PreferencesDlg.NFPGstrVertPos = oDoc.info.NFPGstrVertPos;

  if(typeof(oDoc.info.NFPGnMarginY) == "undefined" || oDoc.info.NFPGnMarginY=="")
  {
    oDoc.info.NFPGnMarginY = 0.5;
    //oDoc.info.setPersistent("NFPGnMarginY",true);
  }
  PreferencesDlg.NFPGnMarginY = oDoc.info.NFPGnMarginY.toString(); //convert from number to string

  if(typeof(oDoc.info.NFPGcFontName) == "undefined" || oDoc.info.NFPGcFontName=="")
  {
    oDoc.info.NFPGcFontName = "Helvetica";
    //oDoc.info.setPersistent("NFPGcFontName",true);
  }
  PreferencesDlg.NFPGcFontName = oDoc.info.NFPGcFontName;

  if(typeof(oDoc.info.NFPGnTextSize) == "undefined" || oDoc.info.NFPGnTextSize=="")
  {
    oDoc.info.NFPGnTextSize = 20;
	  console.println("Text size on loading (default) " + oDoc.info.NFPGnTextSize);
    //oDoc.info.setPersistent("NFPGnTextSize",true);
  }
  PreferencesDlg.NFPGnTextSize = oDoc.info.NFPGnTextSize.toString(); //convert from number to string
  console.println("Text size on loading " + oDoc.info.NFPGnTextSize);

  if(typeof(oDoc.info.NFPGbBold) == "undefined" || oDoc.info.NFPGbBold=="")
  {
    oDoc.info.NFPGbBold = "false";
    //oDoc.info.setPersistent("NFPGbBold",true);
  }
  PreferencesDlg.NFPGbBold = oDoc.info.NFPGbBold;

  if(typeof(oDoc.info.NFPGbItalics) == "undefined" || oDoc.info.NFPGbItalics=="")
  {
    oDoc.info.NFPGbItalics = "false";
    //oDoc.info.setPersistent("NFPGbItalics",true);
  }
  PreferencesDlg.NFPGbItalics = oDoc.info.NFPGbItalics;

  if(typeof(oDoc.info.NFPGstrTextCol) == "undefined" || oDoc.info.NFPGstrTextCol=="")
  {
    oDoc.info.NFPGstrTextCol = ["Black"];
    //oDoc.info.setPersistent("NFPGstrTextCol",true);
  }
  PreferencesDlg.NFPGstrTextCol = oDoc.info.NFPGstrTextCol;

  if(typeof(oDoc.info.NFPGstrRange) == "undefined" || oDoc.info.NFPGstrRange=="")
  {
    oDoc.info.NFPGstrRange = "rAll";
    //oDoc.info.setPersistent("NFPGstrRange",true);
  }
  PreferencesDlg.NFPGstrRange = oDoc.info.NFPGstrRange;

  if(typeof(oDoc.info.NFPGstrStrtPg) == "undefined" || oDoc.info.NFPGstrStrtPg=="")
  {
    oDoc.info.NFPGstrStrtPg = "";
    //oDoc.info.setPersistent("NFPGstrStrtPg",true);
  }
  PreferencesDlg.NFPGstrStrtPg = oDoc.info.NFPGstrStrtPg;

  if(typeof(oDoc.info.NFPGstrEndPg) == "undefined" || oDoc.info.NFPGstrEndPg=="")
  {
    oDoc.info.NFPGstrEndPg = "";
    //oDoc.info.setPersistent("NFPGstrEndPg",true);
  }
  PreferencesDlg.NFPGstrEndPg = oDoc.info.NFPGstrEndPg;

  if(typeof(oDoc.info.date_of_birth) == "undefined" || oDoc.info.date_of_birth=="")
  {
    oDoc.info.date_of_birth = "";
    //oDoc.info.setPersistent("NFPGstrEndPg",true);
  }
  PreferencesDlg.date_of_birth = oDoc.info.date_of_birth;

  if(typeof(oDoc.info.date_of_injury) == "undefined" || oDoc.info.date_of_injury=="")
  {
    oDoc.info.date_of_injury = "";
    //oDoc.info.setPersistent("NFPGstrEndPg",true);
  }
  PreferencesDlg.date_of_injury = oDoc.info.date_of_injury;
  PreferencesDlg.nNumPages = oDoc.numPages;
  PreferencesDlg.nCurPage= oDoc.pageNum;
  PreferencesDlg.bHidden = oDoc.hidden;

	  if("ok" == dothePrefDialog(PreferencesDlg,oDoc))
  		{
  			DownloadPrefDialog(PreferencesDlg);
			if(PreferencesDlg.dirty){
				if(RemovePagination(oDoc, true)){
					oDoc.info.PaginationExists=false;
					oDoc.info.PaginationExists=AddPagination(oDoc);
					PreferencesDlg.dirty=false;
				}
			}

		}

	app.endPriv();
});

 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7Preferences = 
"000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff0000004000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000009f0000004d00000000000000000000001900000080000000ff000000ff00000080000000180000000000000000000000510000009d00000003000000000000000000000000000000000000009f000000ff000000fa00000061000000a6000000fd000000ff000000ff000000ff000000ff000000fd000000a300000063000000fb000000ff0000009b000000000000000000000000000000000000004e000000fa000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000f90000004a00000000000000000000000000000000000000000000006c000000ff000000ff000000ff000000ad0000003d00000009000000090000003e000000af000000ff000000ff000000ff0000005c000000000000000000000000000000000000000000000000000000b5000000ff000000ff0000007300000000000000000000000000000000000000000000000100000076000000ff000000ff000000a100000000000000000000000000000000000000000000001b000000fe000000ff000000ad0000000000000000000000000000000000000000000000000000000000000001000000b1000000ff000000fb000000150000000000000000000000400000004000000080000000ff000000ff0000003d00000000000000000000000000000000000000000000000000000000000000000000003f000000ff000000ff0000007c0000004000000040000000ff000000ff000000ff000000ff000000ff0000000900000000000000000000000000000000000000000000000000000000000000000000000b000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000000900000000000000000000000000000000000000000000000000000000000000000000000b000000ff000000ff000000ff000000ff000000ff000000400000004000000080000000ff000000ff0000003e000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff0000007c0000004000000040000000000000000000000018000000fd000000ff000000af0000000100000000000000000000000000000000000000000000000000000001000000b3000000ff000000fd000000150000000000000000000000000000000000000000000000a3000000ff000000ff0000007600000001000000000000000000000000000000000000000100000079000000ff000000ff000000ae00000000000000000000000000000000000000000000000000000063000000ff000000ff000000ff000000b10000003f0000000b0000000b00000040000000b3000000ff000000ff000000ff00000068000000000000000000000000000000000000000000000051000000fb000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000fa0000004d000000000000000000000000000000000000009d000000ff000000f90000005c000000a1000000fb000000ff000000ff000000ff000000ff000000fb0000009d0000005e000000fa000000ff0000009900000000000000000000000000000000000000030000009b0000004a0000000000000000000000150000007c000000ff000000ff0000007c0000001400000000000000000000004d00000099000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff000000400000000000000000000000000000000000000000000000000000000000000000000000"; //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
 
var oIconPreferences = null;

 //if(app.viewerVersion < 7){
 //}else{
 
oIconPreferences = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7Preferences.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
 
var NFDoCmdPreferences = 
"NFSetupPreferences(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
 
var oButObjPreferences = 
{cName: "NFPreferences",
cExec: NFDoCmdPreferences,
cEnable: "event.rc = (app.doc != null)",
cTooltext: "Set preferences",
cLabel: "Preferences",
nPos: 0};
 //</JSCodeSnippet>
if(oIconPreferences != null)
    oButObjPreferences.oIcon = oIconPreferences;

try{app.removeToolButton("NFPreferences");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
 
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjPreferences);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["BookmarkFooter_InDoc"] = "1:17:2011:17:55:45";
//else
//    global["NFPreferences"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjPreferences"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}

 //</JSCodeSnippet>
 
 //</AcroButtons>

