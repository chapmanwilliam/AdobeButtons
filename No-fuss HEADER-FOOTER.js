

 //*******************************************\\
 //This creates header / footer\\
var head_thm_count=0;
var listFCol = 
{
  "Yellow": -1,
  "Black": -1,
  "White": -1,
  "Red": -1,
  "Dark Blue": -1,
  "Dark Red": -1,
  "Cream": -1,
  "Green": -1,
  "Blue": -1,
  "Grey": -1,
  "Dark Green": -1,
  "Brown":-1,
  "Cyan": -1,
  "Magenta":-1,
  "Orange":-1,
  "Purple":-1,
};

var DoBrowseForSumFolder = app.trustedFunction(function()
{
    var cRslt = null;  
console.println("Version=" + app.viewerVersion);
    try{
      app.beginPriv();
      if(app.viewerVersion>9)
        cRslt = Collab.browseForFolder();  
      else if(app.viewerVersion > 8)
        cRslt = Collab.browseForNetworkFolder();  
      else
        app.alert("Browse not possible in this version");

      app.endPriv();

    }catch(e){
      app.alert("Cannot Browse For Folder");
    }
    return cRslt;
});

 //<CodeAbove>
 //Acrobat JavaScript Dialog
 //Created by DialogDesigner from WindJack Solutions
var BookmarkFooterDlg =
{
    strHorzPos:"PosL",
    nMarginX:"0.5",
    strVertPos:"PosB",
    nMarginY:"0.5",
    cFontName:"Helvetica",
    nTextSize:"10",
    bBold:false,
    bItalics:false,
    strTextCol:["Black"],
    strRange:"rAll",
    strStrtPg:"",
    strEndPg:"",
    strSummaryPath:"",
    strSummaryName:"",
    bRepeat:false,
    nLevel:"1",
	nLvlMax:"1",

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
        this.SetListSel(listFont, this.cFontName);

        this.SetListSel(listFCol, this.strTextCol);

        var dlgInit = 
        {
            "stat": "This tool scans the bookmarks and uses the bookmark labels as the text in a page footer.",
            "MrgH": this.nMarginX,
            "MrgV": this.nMarginY,
            "Font": listFont,
            "Tsiz": this.nTextSize,
            "FCol": listFCol,
            "Bold": this.bBold,
            "Ital": this.bItalics,
            "tFPg": this.strStrtPg,
            "tTPg": this.strEndPg,
            "RptL": this.bRepeat,
            "LabL": this.bLastOnly,
            "nlvl": this.nLevel,
            "FPth": this.strSummaryPath,
            "SmNm": this.strSummaryName,
        };
        dlgInit[this.strHorzPos] = true;
        dlgInit[this.strVertPos] = true;
        dlgInit[this.strRange] = true;
        dialog.load(dlgInit);
        dialog.enable(
            {
                "tTPg": false,
                "tFPg": false,
            }
    );
        
        if( (this.strStrtPg == "")|| isNaN(this.strStrtPg) || (Number(this.strStrtPg) > this.nNumPages) )
        {
           if(this.bHidden)
               this.strStrtPg = "1";
           else
               this.strStrtPg = (this.nCurPage+1).toString();
        }
        
        if((this.strEndPg == "") || isNaN(this.strEndPg) || (Number(this.strEndPg) > this.nNumPages) )
           this.strEndPg = this.nNumPages.toString();
        
        
        var exInit ={"tFPg": this.strStrtPg,"tTPg":this.strEndPg, "sOfN":"of (" + this.nNumPages+")"};
        if(this.bHidden && this.strPgRangeSel == "rCur")
        {   
              this.strPgRangeSel = "rAll";
              exInit["rCur"] = false;
              exInit[this.strPgRangeSel] = true;
        }
         
        dialog.load(exInit);
        
        var exInit = {"ExPg":this.strPgRangeSel =="rFro", "MrgH":this.strHorzPos!="PosC", "MrgV":this.strVertPos!="PosM",
                                "tFPg":this.strPgRangeSel =="rFro", "tTPg":this.strPgRangeSel == "rFro", "rCur":!this.bHidden};
        
        dialog.enable(exInit);
    },
    validate: function(dialog)
    {
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
        
        return true;
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
        this.strHorzPos = this.GetRadioSel(oRslt,["PosL","PosC","PosR"]);
        this.nMarginX = oRslt["MrgH"];
        this.strVertPos = this.GetRadioSel(oRslt,["PosT","PosM","PosB"]);
        this.nMarginY = oRslt["MrgV"];
        var path = new Array();
        this.cFontName = ((this.GetListSel(oRslt["Font"],path))?path.reverse():"").toString();
        this.nTextSize = oRslt["Tsiz"];
        this.bBold = oRslt["Bold"];
        this.bItalics = oRslt["Ital"];
        var path = new Array();
        this.strTextCol = ((this.GetListSel(oRslt["FCol"],path))?path.reverse():"").toString();
        this.strRange = this.GetRadioSel(oRslt,["rAll","rCur","rFro"]);
        this.strStrtPg = oRslt["tFPg"];
        this.strEndPg = oRslt["tTPg"];
        this.bRepeat = oRslt["RptL"];
        this.bLastOnly = oRslt["LabL"];
        this.nLevel = oRslt["nlvl"];
        this.strSummaryPath = oRslt["FPth"];
        this.strSummaryName = oRslt["SmNm"];
    },  
    "But1": function(dialog)
    {
        var cRslt = DoBrowseForSumFolder();
        if((typeof(cRslt)!="undefined") && (cRslt != null))
           dialog.load({"FPth":cRslt});
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
	"nlvl": function(dialog)
	{
        var oRslt = dialog.store();
	    if (oRslt.nlvl < 1)
		   dialog.load({nlvl:"1"});
		else if (oRslt.nlvl > this.nLvlMax)
		   dialog.load({nlvl:this.nLvlMax});
	},
    description:
    {
        name: "Add Page Headers/Footers from Bookmark Labels",
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
                                name: "This tool scans the bookmarks for the first ",
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
                                                variable_Name: "strHorzPos",
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
                                                variable_Name: "nMarginX",
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
                                               	 variable_Name: "strVertPos",
                                            	},
                                            	{
                                               	 type: "radio",
                                               	 item_id: "PosM",
                                               	 group_id: "PosV",
                                               	 name: "Middle",
                                            	},
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
                                               	 variable_Name: "nMarginY",
                                               	 char_width: 8,
                                            	},
                                        	]
                                    	  },
                                		]
                            		},  //end of position cluster
                            		{
                                type: "cluster",
                                item_id: "cls2",
                                name: "Text",
                                align_children: "align_left",
                                elements:
                                [
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
                                                variable_Name: "cFontName",
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
                                                variable_Name: "nTextSize",
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
                                                variable_Name: "bBold",
                                            },
                                            {
                                                type: "check_box",
                                                item_id: "Ital",
                                                name: "Italics",
                                                variable_Name: "bItalics",
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta1",
                                                name: "Colour:",
                                            },
                                            {
                                                type: "popup",
                                                item_id: "FCol",
                                                variable_Name: "strTextCol",
                                                width: 86,
                                                height: 23,
                                                char_width: 8,
                                            },
                                        ]
                                    },
                                ]
                            },
                            		{
                                type: "cluster",
                                item_id: "cls3",
                                name: "Page range",
                                width: 332,
                                height: 96,
                                char_width: 8,
                                char_height: 8,
                                align_children: "align_left",
                                elements:
                                [
                                    {
                                        type: "view",
                                        align_children: "align_row",
                                        elements:
                                        [
                                            {
                                                type: "radio",
                                                item_id: "rAll",
                                                group_id: "PgRg",
                                                name: "All",
                                                variable_Name: "strRange",
                                                height: 20,
                                            },
                                            {
                                                type: "gap",
                                                item_id: "gap3",
                                                char_width: 1,
                                                char_height: 1,
                                            },
                                            {
                                                type: "radio",
                                                item_id: "rCur",
                                                group_id: "PgRg",
                                                name: "Current (Applies to open document)",
                                                variable_Name: "strRange",
                                                height: 20,
                                            },
                                        ]
                                    },
                                    {
                                        type: "view",
                                        width: 256,
                                        height: 20,
                                        char_width: 8,
                                        char_height: 8,
                                        align_children: "align_row",
                                        elements:
                                        [
                                            {
                                                type: "radio",
                                                item_id: "rFro",
                                                group_id: "PgRg",
                                                name: "From:",
                                                width: 12,
                                                height: 24,
                                            },
                                            {
                                                type: "edit_text",
                                                item_id: "tFPg",
                                                variable_Name: "strStrtPg",
                                                height: 24,
                                                char_width: 6,
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sta3",
                                                name: "To:",
                                                height: 24,
                                            },
                                            {
                                                type: "edit_text",
                                                item_id: "tTPg",
                                                variable_Name: "strEndPg",
                                                height: 24,
                                                char_width: 6,
                                            },
                                            {
                                                type: "static_text",
                                                item_id: "sOfN",
                                                name: "of (N)",
                                                height: 24,
                                            },
                                        ]
                                    },
                                    {
                                        type: "check_box",
                                        item_id: "RptL",
                                        name: "Repeat Header/Footer on Following Non-Bookmarked Pages",
                                        variable_Name: "bRepeat",
                                    },
		                          {
        		                        type: "view",
										alignment: "align_fill",
										align_children: "align_row",
                         		   		elements:
                                		[
                       		            	{
                            		        	    type: "static_text",
                                    		    	item_id: "sta1",
                                        			name: "Bookmark depth:",
                                	    	},
                                  	  		{
                                		        type: "edit_text",
                                        		item_id: "nlvl",
		                                        variable_Name: "nLevel",
        		                                char_width: 3,
                		                        SpinEdit: "true",
	                                    	},
                                            {
                                                type: "check_box",
                                                item_id: "LabL",
                                                name: "Last bookmark only",
                                                variable_Name: "bLastOnly",
                                            },
    	        	                    ]
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


 // // // // // // // // // // // // // // // // // // // // //
 //
 //  Find BkPage
 //
 //  this recursive function searches the bookmark tree
 //  to build a mapping of page numbers to bookmark labels
 //
function FindBkPage(oDoc, bkmk, oPgMap, nLevel, nLevelMax,n, last_only)
{


  
  if(nLevel == null)
    nLevel = 0;
  if(bkmk.children && bkmk.children.length){
  
    for(var i=bkmk.children.length-1;i>=0;i--){
       
 //      if(bkmk.children[i].style!=1){ //skip italicised 
	  	head_thm_count=head_thm_count+1;
  		var x=Math.round((head_thm_count/n) * 100);
  		app.thermometer.value=x;
  		app.thermometer.text="Getting bookmark info " + x + "%";
        
        oDoc.pageNum = 0;
        bkmk.children[i].execute();
        var curPg = oDoc.pageNum;
        oDoc.pageNum = oDoc.numPages-1;
        bkmk.children[i].execute();
        var ln=getLengthDoc(bkmk.children[i].name);
        if(ln)console.println("Length " + ln);
        if((curPg != 0) || (oDoc.pagNum != (oDoc.numPages-1) )) { // Bookmark navigates somewhere
           var oCur = oPgMap[curPg + 1] ;
           if((oCur == null) || (oCur.level >= nLevel)){
           		//if(oPgMap[curPg]==null){  //only fill in if undefined already
	            	  if(bkmk.children[i].style!=1) oPgMap[curPg] = {name:BuildName(bkmk.children[i], last_only) , level:nLevel, include: bkmk.children[i].style!=1, l:ln};
	        	//}
	        }else{
	        	console.println(bkmk.children[i].name);
	        }
        }else{
        	console.println("Here: " + bkmk.children[i].name);
        }
       if(nLevel+1<nLevelMax)FindBkPage(oDoc, bkmk.children[i], oPgMap, nLevel+1,nLevelMax,n, last_only);
 //	  }
     }
  }
}

function BuildName(BkMk, last_name_only=true){
	//if(BkMk.style==1)return ""; //ignore italicised
	var S=""; var keep_going=true;
	while (BkMk.name!="Root" && keep_going){
		S="/" + BkMk.name.replace(pattern_toggle_page_label,"").replace(pattern_toggle_braces_label,"") + S;
		BkMk=BkMk.parent;
		if(BkMk==null){
			return S.slice(-(S.length-1));
		}
		if(last_name_only) keep_going=false;
	}
	
	S=S.slice(-(S.length-1)); 

	return S;
}

var cFontType = "Helvetica";
var cAlign = "center";
var aTxtCol = color.white;

 // // // // // // // // // // // // ///
 //
 //  This is the main function for applying
 //  page headers or footers with the information
 //  collected in the Page number to Bookmark mapping
 //  object.
 //

function AddFooters(oDoc){

  var oPgMap=[]
 //  console.println("Before bookmark dig");
 //  console.println("After bookmark dig");

 // Get Persistent Params
  app.beginPriv();

	var PgNow=oDoc.pageNum;	


  if( (oDoc.bookmarkRoot == null) || (oDoc.bookmarkRoot.children == null) || (oDoc.bookmarkRoot.children.length == 0) )
  {
     app.alert("No Bookmarks Found",1,0,"Bookmarks to Page Header/Footer" );
     app.endPriv();
     return false;
  }

	DoCreateBkmkFooter(oDoc,BookmarkFooterDlg);
	oDoc.pageNum=PgNow;		
    app.endPriv();
	return true;
}

var DoSetupBkmkFooter = app.trustedFunction(function(oDoc)
{
	if(!CheckLicence())return;

	app.beginPriv();
	 //Delete the footers and exit, if they exist
	if (FooterExists(oDoc)) {
		oDoc.info.HeaderExists=!DeleteFooters(oDoc);
		return;
	}else{
	 //Set the dialog box to the global values
  if(typeof(global.strHorzPos) == "undefined")
  {
    global.strHorzPos = "PosL";
    global.setPersistent("strHorzPos",true);
  }
  BookmarkFooterDlg.strHorzPos = global.strHorzPos;

  if(typeof(global.nMarginX) == "undefined")
  {
    global.nMarginX = "0.5";
    global.setPersistent("nMarginX",true);
  }
  BookmarkFooterDlg.nMarginX = global.nMarginX;

  if(typeof(global.strVertPos) == "undefined")
  {
    global.strVertPos = "PosB";
    global.setPersistent("strVertPos",true);
  }
  BookmarkFooterDlg.strVertPos = global.strVertPos;

  if(typeof(global.nMarginY) == "undefined")
  {
    global.nMarginY = "0.5";
    global.setPersistent("nMarginY",true);
  }
  BookmarkFooterDlg.nMarginY = global.nMarginY;

  if(typeof(global.cFontName) == "undefined")
  {
    global.cFontName = "Helvetica";
    global.setPersistent("cFontName",true);
  }
  BookmarkFooterDlg.cFontName = global.cFontName;

  if(typeof(global.nTextSize) == "undefined")
  {
    global.nTextSize = "10";
    global.setPersistent("nTextSize",true);
  }
  BookmarkFooterDlg.nTextSize = global.nTextSize;

  if(typeof(global.bBold) == "undefined")
  {
    global.bBold = "false";
    global.setPersistent("bBold",true);
  }
  BookmarkFooterDlg.bBold = global.bBold;

  if(typeof(global.bItalics) == "undefined")
  {
    global.bItalics = "false";
    global.setPersistent("bItalics",true);
  }
  BookmarkFooterDlg.bItalics = global.bItalics;

  if(typeof(global.strTextCol) == "undefined")
  {
    global.strTextCol = ["Black"];
    global.setPersistent("strTextCol",true);
  }
  BookmarkFooterDlg.strTextCol = global.strTextCol;

  if(typeof(global.strRange) == "undefined")
  {
    global.strRange = "rAll";
    global.setPersistent("strRange",true);
  }
  BookmarkFooterDlg.strRange = global.strRange;

  if(typeof(global.strStrtPg) == "undefined")
  {
    global.strStrtPg = "";
    global.setPersistent("strStrtPg",true);
  }
  BookmarkFooterDlg.strStrtPg = global.strStrtPg;

  if(typeof(global.strEndPg) == "undefined")
  {
    global.strEndPg = "";
    global.setPersistent("strEndPg",true);
  }
  BookmarkFooterDlg.strEndPg = global.strEndPg;

  if(typeof(global.bRepeat) == "undefined")
  {
    global.bRepeat = "false";
    global.setPersistent("bRepeat",true);
  }
  BookmarkFooterDlg.bRepeat = global.bRepeat;

  if(typeof(global.bLastOnly) == "undefined")
  {
    global.bLastOnly = "false";
    global.setPersistent("bLastOnly",true);
  }
  BookmarkFooterDlg.bLastOnly = global.bLastOnly;


  var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);

  if(typeof(global.bLevel) == "undefined")
  {
    global.bLevel = nDepth;
    global.setPersistent("bLevel",true);
  }
  BookmarkFooterDlg.nLevel = global.bLevel;

  BookmarkFooterDlg.nNumPages = oDoc.numPages;
  BookmarkFooterDlg.nCurPage= oDoc.pageNum;
  BookmarkFooterDlg.bHidden = oDoc.hidden;
  //console.println("Depth " + nDepth);
  BookmarkFooterDlg.nLvlMax = nDepth.toString();


	  if("ok" == app.execDialog(BookmarkFooterDlg))
  		{
      		global.strHorzPos = BookmarkFooterDlg.strHorzPos;
      		global.nMarginX =   BookmarkFooterDlg.nMarginX;
      		global.strVertPos = BookmarkFooterDlg.strVertPos;
      		global.nMarginY =   BookmarkFooterDlg.nMarginY;
      		global.cFontName =  BookmarkFooterDlg.cFontName;
      		global.nTextSize =  BookmarkFooterDlg.nTextSize;
      		global.bBold =      BookmarkFooterDlg.bBold;
      		global.bItalics =   BookmarkFooterDlg.bItalics;
      		global.strTextCol = BookmarkFooterDlg.strTextCol;
      		global.strRange =   BookmarkFooterDlg.strRange;
      		global.strStrtPg =  BookmarkFooterDlg.strStrtPg;
      		global.strEndPg =   BookmarkFooterDlg.strEndPg;
      		global.bRepeat =    BookmarkFooterDlg.bRepeat;
      		global.bLastOnly= BookmarkFooterDlg.bLastOnly;
      		global.bLevel = BookmarkFooterDlg.nLevel;

	   		 oDoc.info.HeaderExists=AddFooters(oDoc);

		     /*var cMsg = "Found " + nFound + " Pages with Bookmarks";
		     if(BookmarkFooterDlg.bRepeat)
      			 cMsg += "\n\nHeader/Footer added to all pages, non-bookmarked pages received previous Header/Footer"
     		  else
       			cMsg += "\n\nOnly pages with bookmarks received a Header/Footer";
     			 //app.alert(cMsg,3,0, "Bookmarks to Page Header/Footer" );
     			 //oDoc.info.HeaderExists=true;
  			  }*/   
		}
	}
	app.endPriv();
});

function FooterExists(oDoc){
	 //returns true if footer's already present
    var rgFooterName = /BkLabel_Page/;
     // Delete all existing Header/Footer Fields
    for(var i=oDoc.numFields-1;i>=0;i--){
       var cFldName = oDoc.getNthFieldName(i);
       if(rgFooterName.test(cFldName)) return true;
    }
    return false;
}

function DeleteFooters(oDoc){

	app.thermometer.duration=oDoc.numFields;
	app.thermometer.begin();
    var rgFooterName = /BkLabel_Page/;
     // Delete all existing Header/Footer Fields
    for(var i=oDoc.numFields-1;i>=0;i--)
    {
    	app.thermometer.value=oDoc.numFields-i;
    	app.thermometer.text="Removing header/footer from " + i + " of " + oDoc.numFields + " header/footers.";
       var cFldName = oDoc.getNthFieldName(i);
       if(rgFooterName.test(cFldName)){
		 //console.println("Removing: " + cFldName);
         oDoc.removeField(cFldName);
       }
    }
    app.thermometer.end();
    return true;
}

function RefreshFooter(oDoc){
	 //Refreshes header/footers if they exist
	if(FooterExists(oDoc)){
		if(DeleteFooters(oDoc)){
			oDoc.info.HeaderExists=false;
			oDoc.info.HeaderExists=AddFooters(oDoc);
		}
	}

}
 // // // // // // // // // // // // ///
 //
 //  This is the main function for applying
 //  page headers or footers with the information
 //  collected in the Page number to Bookmark mapping
 //  object.
 //
 
function GetColor(col){
    var aTxtCol;
    switch(col)
    {
       case "Red":
         aTxtCol = ["RGB",1,0,0];
         break;
       case "Dark Red":
         aTxtCol = ["RGB",0.5,0,0];
         break;
       case "Green":
         aTxtCol = ["RGB",0,1,0];
         break;
       case "Dark Green":
         aTxtCol = ["RGB",0,0.5,0];
         break;
       case "Blue":
         aTxtCol = ["RGB",0,0,1];
         break;
       case "Dark Blue":
         aTxtCol = ["RGB",0,0,0.5];
         break;
       case "Yellow":
         aTxtCol = ["RGB",1,1,0];
         break;
       case "Cream":
         aTxtCol = ["RGB",0.984,0.957,0.776];
         break;
       case "White":
         aTxtCol = ["RGB",1,1,1];
         break; 
       case "Grey":
         aTxtCol = ["RGB",.7,.7,.7];
         break;
       case "Black":
         aTxtCol = ["RGB",0,0,0];
         break;
         
       case "Brown":
         aTxtCol = ["RGB",139/255,69/255,19/255];
       	 break; 
       case "Cyan":
         aTxtCol = color.cyan;      
       	 break;
       case "Magenta":
       	  aTxtCol=["RGB",1,0,1];
       	 break;
       case "Orange":
         aTxtCol = ["RGB",1,165/255,0];
         break;
       case "Purple":
         aTxtCol = ["RGB",.5,0,.5];
       	 break;
    	default:
    	console.println("Error getting color.");
         aTxtCol = ["RGB",0,0,0];
    	break;
    }
    return aTxtCol;
}  

function GetAlignment(Pos){
	var cAlign;
    switch(Pos)
    {
       case "PosL":
         cAlign = "left";
         break;
       case "PosC":
         cAlign = "center";
         break;
       case "PosR":
         cAlign = "right";
         break;
    }
    return cAlign;
}
 
var DoCreateBkmkFooter = app.trustedFunction(function(oDoc,oDlg)
{

  var oPgMap=[]
  app.beginPriv();
	
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n=FindNumBks(oDoc.bookmarkRoot.children,nDepth);
	
	app.thermometer.duration=100;
	app.thermometer.begin();
	app.thermometer.text="Getting bookmark info 0%";
    head_thm_count=0;
    
    FindBkPage(oDoc, oDoc.bookmarkRoot,oPgMap,null,oDlg.nLevel,n, oDlg.bLastOnly);
	
	app.thermometer.end();
	
	cAlign=GetAlignment(oDlg.strHorzPos.toString());
 
	aTxtCol=GetColor(oDlg.strTextCol.toString());    

	cFontType = GetFontType(oDlg.cFontName);
	
	if(oDlg.bBold)
       cFontType += "-Bold";

    
    if(oDlg.bItalics)
    {
       if(!/\-/.test(cFontType))
         cFontType += "-";
       if(oDlg.cFontName == "Times Roman")
         cFontType += "Italic";
       else
         cFontType += "Oblique";
    }
    if(cFontType == "Times")
      cFontType += "-Roman";
 
     switch(oDlg.strRange)
     {
       case "rAll":
         nPgStart = 0;
         nPgEnd = oDoc.numPages -1;
         break;
       case "rCur":
         nPgEnd = nPgStart = oDoc.hidden?0:oDoc.pageNum;
         break;
       case "rFro":
         nPgStart = Number(oDlg.strStrtPg)-1;
         nPgEnd = Number(oDlg.strEndPg)-1;
         if(nPgEnd > (oDoc.numPages -1))
           nPgEnd = oDoc.numPages -1;
         break;
     }
   
   
    var margX = oDlg.nMarginX * 72;
    var margY = oDlg.nMarginY * 72;
    var txtSize = Number(oDlg.nTextSize);

    var nFound = 0;
    var cLastLabel = "";
    var cLastPage=oDoc.numPages;
    var cInclude=false;
    var cLastLength=null;
    var cCount=1;
  //   console.println("This is how long : " + oPgMap.length);

	app.thermometer.duration=oDoc.numPages;
	app.thermometer.begin();

    for(var i=0;i<oDoc.numPages;i++)
    {
    app.thermometer.value=i;
    app.thermometer.text="Placing header/footer on page " + i + " out of " +oDoc.numPages + " pages.";
    
      if( (i>=nPgStart) && (i<=nPgEnd) )
      {  // In Page Range
       if(oPgMap[i] != null)
  	     { // Valid Page Label
			nFound++;
			cCount=1;
	    	cLastLabel = oPgMap[i].name;
	    	cLastLength= oPgMap[i].l;
	    	if(oPgMap[i].l){
		    	cLastPage=i+(oPgMap[i].l-1);
			}else{
				cLastPage=oDoc.numPages;
			}
	    	cInclude=oPgMap[i].include;
    	 }else{
    	 	cCount++;
    	 }

         if(cLastLabel.length && (oPgMap[i] || (oDlg.bRepeat && i<=cLastPage)) && cInclude)
         {
           var rcLabel = oDoc.getPageBox("Crop",i);
            rcLabel[0] += margX;
            rcLabel[2] -= margX;
            switch(oDlg.strVertPos.toString())
            {
               case "PosT":
                 rcLabel[1] -= margY;
                 rcLabel[3] = rcLabel[1] - txtSize - 4;
                 break;
               case "PosM":
                 mid = (rcLabel[1] + rcLabel[3])/2;
                 rcLabel[1] = mid + txtSize/2 + 2;
                 rcLabel[3] = mid - txtSize/2 - 2;
                 break;
               case "PosB":
                 rcLabel[3] += margY;
                 rcLabel[1] = rcLabel[3] + txtSize + 4;
                 break;
            }

            var oFld = oDoc.addField("BkLabel_Page" + i,"text",i,rcLabel);
            oFld.textSize = oDlg.nTextSize;
            oFld.textFont = cFontType;
            oFld.alignment = cAlign;
            oFld.textColor = aTxtCol;
            oFld.readonly = true;
            if(cLastLength){
            	oFld.value = cLastLabel + " (" + cCount + "/" + cLastLength + ")";
			}else{
            	oFld.value=cLastLabel;
			}
         }
 //     console.println((i+1).toString() + "\t- " + oPgMap[i].level + "  -  " + oPgMap[i].name);
        
      }
    }
	app.thermometer.end();
    return nFound;
  app.endPriv();
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7BookmarkFooter = 
"220000004400000000000000000000000600000060000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a0000004a0000009700000000000000000000000d000000d400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000580000004a0000009700000000000000000000000d000000d4000000020000005a000000b00000008100000003000000000000008b000000ac00000086000000000000000500000066000000af0000009b0000004a000000e7000000c4000000c4000000c7000000d4000000450000008c000000070000008d000000670000002a0000006000000000000000970000003a00000063000000850000000a000000b20000004a0000009700000000000000000000000d000000d400000094000000b6000000a0000000b100000086000000140000008b000000a5000000d10000004a000000a90000002900000000000000630000004a0000009700000000000000000000000d000000d40000006c00000057000000000000002b00000038000000820000005e00000000000000ae0000004a000000810000004800000000000000890000004a0000009700000000000000000000000d000000d400000016000000b1000000a0000000c40000001d0000004d000000bb0000009c000000b00000009600000023000000c2000000a7000000be00000000000000000000000000000000000000000000000000000000000000000000001c0000000300000000000000000000000e00000008000000000000000d0000000000000001000000150000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconBookmarkFooter = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconBookmarkFooter = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7BookmarkFooter.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdBookmarkFooter = 
"DoSetupBkmkFooter(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjBookmarkFooter = 
{cName: "BookmarkFooter",
cExec: DoCmdBookmarkFooter,
cEnable: "event.rc = (app.doc != null) &&  (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
 //cMarked: "event.rc = FooterExists(app.doc)",
cMarked: "event.rc = (app.doc != null) && app.doc.info.HeaderExists",
cTooltext: "Create Header or Footer from Bookmarks",
cLabel: "Header/Footer",
nPos: 0};
 //</JSCodeSnippet>
if(oIconBookmarkFooter != null)
    oButObjBookmarkFooter.oIcon = oIconBookmarkFooter;

try{app.removeToolButton("BookmarkFooter");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjBookmarkFooter);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["BookmarkFooter_InDoc"] = "1:17:2011:17:55:45";
//else
//    global["BookmarkFooter"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjBookmarkFooter"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>

