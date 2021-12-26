

 //*******************************************\\
 //This performs a search and replace on all the bookmarks

	var pattern_dec=/(.*?)(\d+$)/i //i.e. anything followed by decimals
	var pattern_roman=/(.*?)((?=[MDCLXVI])M*(C[MD]|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$)/i //i.e. anything followed by roman numerals
	var pattern_alphabet=/(.*?)([A-Z]+$)/i    //i.e. anything followed by a space or a non-letter followed by letters


function SearchReplace(Bm, nLevel, nLvlMax, oDoc, S, R, Reg, MtchCase, bColor, col, b_date, from_date, to_date, b_whole_words, bReplace, bBold, bItalics, bPlain, bInclude_Non_Dates, bSkipItalicised){

	//check if this bookmark is within date
	bWithinDate=true;

	if(b_date){
		if(!NoDate(Bm)){ //i.e. there is a date
			var BkMkDate=GetDate(Bm);
			if(! ((BkMkDate>from_date && BkMkDate<to_date) || (SameDateAndTime(BkMkDate,from_date) || SameDateAndTime(BkMkDate,to_date)))) bWithinDate=false;
		}else{ //i.e. there is no date
			if(!bInclude_Non_Dates)bWithinDate=false;
		}
	}
	
 if (Bm.style!=1 || !bSkipItalicised){ //skip italicised and their children
	 //Search and replace
	//console.println("Colour code: " + col);

	if(bWithinDate){//if this is within the date
		var S_=S;
		if(!Reg)S_=escapeRegExp(S_); //deal with regex
		if(b_whole_words) S_="\\b"+S_+"\\b"; //add regex boundaries if required
		//deal with style
		var sty=null;
		if(bItalics)sty=1;
		if(bBold)sty=2;
		if(bItalics && bBold)sty=3;
		if(bPlain)sty=0;
		//deal with match case
		var pat;
		if(MtchCase){pat=new RegExp(S_,'g');}else{pat=new RegExp(S_,'gi');}
		//ok, do it
		if(pat.test(Bm.name)){
			console.println("Matching: " + Bm.name);
			if(bReplace)Bm.name=Bm.name.replace(pat,R).trim();
			if(bColor) Bm.color=col;
			if(sty!=null) Bm.style=sty;
		}
	}	

	 // process children
	if (nLevel<nLvlMax && Bm.children != null){	
		for (var i = 0; i < Bm.children.length; i++){	
			SearchReplace(Bm.children[i], nLevel + 1,nLvlMax, oDoc, S, R, Reg, MtchCase, bColor, col, b_date, from_date, to_date, b_whole_words, bReplace, bBold, bItalics, bPlain, bInclude_Non_Dates, bSkipItalicised);
		}
	}
 }
 
}


function escapeRegExp(string){
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}


function GetTypePgLb(PgLb){
	//returns:
		// 1 if decimal
		// 2 if roman
		// 3 if alphabet
		// 0 if null
	var res=0;
	
	
	if(pattern_dec.test(PgLb)) { res=1; return res;}
	if(pattern_roman.test(PgLb)) { res=2; return res;}
	if(pattern_alphabet.test(PgLb)) { res=3; return res;}
	
	return res;
}

function GetPrefixPartPgLb(PgLb, type_numeric){
	//returns the numeric part of Page Label
	var res="";
	switch(type_numeric)
	{
		case 1: //decimal
			res=PgLb.replace(pattern_dec,"$1");		
		break;
		case 2: //roman
			res=PgLb.replace(pattern_roman,"$1");		
		break;
		case 3: //alphabet
			res=PgLb.replace(pattern_alphabet,"$1");		
		break;
		default:
		//shouldn't get here
		console.println("No match to prefix part of page label: " + PgLb)
		break;
	};
	console.println(PgLb + " prefix part is " + res);
	return res;
}

function GetNumericPartPgLb(PgLb, type_numeric){
	//returns the numeric part of Page Label
	var res="";
	switch(type_numeric)
	{
		case 1: //decimal
			console.println(PgLb + " is a decimal");
			res=PgLb.replace(pattern_dec,"$2");		
		break;
		case 2: //roman
			console.println(PgLb + " is a roman");
			res=PgLb.replace(pattern_roman,"$2");		
		break;
		case 3: //alphabet
			console.println(PgLb + " is a alphabet");
			res=PgLb.replace(pattern_alphabet,"$2");		
		break;
		default:
		//shouldn't get here
		console.println("No match to numeric part of page label: " + PgLb)
		break;
	};
	console.println(PgLb + " numeric part is " + res);
	return res;
}

function fromAlphabet(str){
	//returns number equivalent of alphabet
	//where a=1, b=2 and so on
	//aa=27
	
	var res=-1;
	var len=str.length;	
	var l=str.slice(0,1);
	console.println("Letter is " + l);
	l=l.toUpperCase();
	console.println("Letter is " + l);
	var az="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	pos= az.indexOf(l)+1;
	res=pos+(len-1)*26;		
	console.println(str + " is "  + res + " in decimal");
	return res; 
}

function toRoman(num) {  
  var result = '';
  var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
  for (var i = 0;i<=decimal.length;i++) {
    while (num%decimal[i] < num) {     
      result += roman[i];
      num -= decimal[i];
    }
  }
  return result;
}

function fromRoman(str) {
	str=str.toUpperCase(str);  
  var result = 0;
  // the result is now a number, not a string
  var decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
  for (var i = 0;i<=decimal.length;i++) {
    while (str.indexOf(roman[i]) === 0){
      result += decimal[i];
      str = str.replace(roman[i],'');
    }
  }
  return result;
}

function SearchReplacePgLbs(oDoc, S, R, Reg, MtchCase){
	

	for(var i=oDoc.numPages-1;i>=0;i--){
		var PgLb=oDoc.getPageLabel(i);
		console.println(i + " " + PgLb);
		var type_numeric=GetTypePgLb(PgLb);
		var numeric=GetNumericPartPgLb(PgLb, type_numeric);
		var prefix=GetPrefixPartPgLb(PgLb, type_numeric);
		var prefix_new="";
		
		//Work on the prefix, if there is a prefix
		if(prefix!="" && S!=""){
			if(Reg){
				if(MtchCase){
					prefix_new=prefix.replace(new RegExp(S, 'g'),R).trim();		
				}else{
					prefix_new=prefix.replace(new RegExp(S, 'gi'),R).trim();
				} 
			}else{
				prefix_new=prefix.replaceAll(S,R,!MtchCase).trim();
			}
		}else{ //there is no prefix, so give it one to put at beginning
			prefix_new=R+prefix;
		}
		if(S=="")prefix_new=R+prefix;
		
		//Now convert the numeric to get the start number
		var a=GetNumberOfNumeric(type_numeric, numeric);
		//console.println("Number part is " + a);	
		//console.println("New prefix is " + prefix_new);
		switch(type_numeric)
		{
			case 1: //decimal
				oDoc.setPageLabels(i,["D",prefix_new,a]);
			break;
			case 2: //roman
				if(IsNumericUpperCase(numeric)){ 
						oDoc.setPageLabels(i,["R",prefix_new,a])
					}else{
						oDoc.setPageLabels(i,["r",prefix_new,a]);
					}
			break; 
			case 3: //alphabet
				if(IsNumericUpperCase(numeric)){
					 oDoc.setPageLabels(i,["A",prefix_new,a]);
				}else{ 
					oDoc.setPageLabels(i,["a",prefix_new,a]);
				}
			break;
			default:
			break;
		};
	}
	
}

function IsNumericUpperCase(numeric){
	var l=numeric.slice(0,1);
	return IsLetterUpperCase(l);
}

function IsLetterUpperCase(l){
	//returns true if l is uppercase
	if (l == l.toLowerCase())
	{
  	// The character is lowercase
  		return false;
	}
	else
	{
  	// The character is uppercase
  		return true;
	}
}

function GetNumberOfNumeric(type_numeric, numeric_part){
	//returns the number of the numeric part
	var res=0;
	switch(type_numeric)
	{
		case 1: //decimal
			res=Number(numeric_part);
		break;
		case 2: //roman
			res=fromRoman(numeric_part);
		break; 
		case 3: //alphabet
			res=fromAlphabet(numeric_part);
		break;
		default:
		break;
	};
	return res;
}

 // Find, Replace, Case
String.prototype.replaceAll = function(_f, _r, _c){ 

	 //console.println("Proto match " + _c);

  var o = this.toString();
  var r = '';
  var s = o;
  var b = 0;
  var e = -1;
  if(_c){ _f = _f.toLowerCase(); s = o.toLowerCase(); }

  while((e=s.indexOf(_f)) > -1)
  {
    r += o.substring(b, b+e) + _r;
    s = s.substring(e+_f.length, s.length);
    b += e+_f.length;
  }

   // Add Leftover
  if(s.length>0){ r+=o.substring(o.length-s.length, o.length); }

   // Return New String
  return r;
};


var SetGlobalVariablesSearch=app.trustedFunction(function(oDoc, SearchReplaceDlg)
{
	app.beginPriv();
	
			global.strSrch=SearchReplaceDlg.strSrch;
			global.strRplc=SearchReplaceDlg.strRplc;
			global.bRegex=SearchReplaceDlg.bRegex;
			global.bMatchCase=SearchReplaceDlg.bMatchCase;
			global.bPlain=SearchReplaceDlg.bPlain;
			global.bBold=SearchReplaceDlg.bBold;
			global.bItalics=SearchReplaceDlg.bItalics;
			global.bSearch=SearchReplaceDlg.bSearch;
			global.bReplace=SearchReplaceDlg.bReplace;
			global.bWholeWords=SearchReplaceDlg.bWholeWords;
			global.strFromDate=SearchReplaceDlg.strFromDate;
			global.strToDate=SearchReplaceDlg.strToDate;
			global.strTextCol=SearchReplaceDlg.strTextCol;
			global.bDate=SearchReplaceDlg.bDate;
			global.bPgLbs=SearchReplaceDlg.bPgLbs;
			global.bColor=SearchReplaceDlg.bColor;
			global.bInclude_Non_Dates=SearchReplaceDlg.bInclude_Non_Dates;
			global.bSkipItalicised=SearchReplaceDlg.bSkipItalicised;
	
	app.endPriv();
	
});


var DoItSearch=app.trustedFunction(function(oDoc,SearchReplaceDlg){

	//Applies the settings to the bookmarks
	app.beginPriv();
	
			
			SetGlobalVariablesSearch(oDoc,SearchReplaceDlg); //reset the global variables
			 
			var srch=SearchReplaceDlg.strSrch;
			var bReg=SearchReplaceDlg.bRegex;
			var bSearch=SearchReplaceDlg.bSearch;
			var bReplace=SearchReplaceDlg.bReplace;
			var bWholeWords=SearchReplaceDlg.bWholeWords;
			var bDate=SearchReplaceDlg.bDate;
			var str_from_date=SearchReplaceDlg.strFromDate;
			var str_to_date=SearchReplaceDlg.strToDate;

		   	if(SearchReplaceDlg.strFromDate=="")str_from_date="1/1/1080"; //set to impossibly early date if blank
    		if(SearchReplaceDlg.strToDate=="")str_to_date="31/12/3000"; //set to impossibly future date if blank
    		if(NoDateFromString(str_from_date) || NoDateFromString(str_to_date)) bDate=false; //if one of the dates is bad, don't do date search
			var from_date=GetDateFromString(", " + str_from_date, oDoc);
			var to_date=GetDateFromString(", " + str_to_date, oDoc);

			if(bDate){//only bother checking if filter by dates required
    			if(from_date>to_date){// then swap them round
    				//for the strings
    				var tmp_date_str=SearchReplaceDlg.strFromDate;
    				SearchReplaceDlg.strFromDate=SearchReplaceDlg.strToDate;
    				SearchReplaceDlg.strToDate=tmp_date_str;
    				//for the dates
    				var tmp_date=from_date;
    				from_date=to_date;
    				to_date=tmp_date;		
					SetGlobalVariablesSearch(oDoc,SearchReplaceDlg); //reset the global variables
    			}
    		}

			if(SearchReplaceDlg.strSrch=="" || !bSearch) {srch="^.*$"; bReg=true; bWholeWords=false} //match anything if empty search string or search turned off
			if((SearchReplaceDlg.strSrch=="" && SearchReplaceDlg.strRplc=="") || !bReplace) bReplace=false; //don't replace anything if both boxes blank
			
						
			if(!global.bPgLbs)SearchReplace(oDoc.bookmarkRoot,0, SearchReplaceDlg.nLevel, oDoc, srch, global.strRplc, bReg, global.bMatchCase, SearchReplaceDlg.bColor, GetColor(SearchReplaceDlg.strTextCol), bDate, from_date, to_date, bWholeWords, bReplace, SearchReplaceDlg.bBold, SearchReplaceDlg.bItalics, SearchReplaceDlg.bPlain, global.bInclude_Non_Dates, SearchReplaceDlg.bItalics);
			if(global.bPgLbs)SearchReplacePgLbs(oDoc, global.strSrch, global.strRplc, global.bRegex, global.bMatchCase);
	
	app.endPriv();
});

 // // // // // // // // // // // // ///
 //
 //  This is the main function for search and replace
 //

var DoSearchAndReplace = app.trustedFunction(function(oDoc)
{
	if(!CheckLicence())return;

	app.beginPriv();

	var Pg=oDoc.pageNum;  //note page number

	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	if(nDepth > 0)
	{

	 // Get Persistent Params
  
  	if(typeof(global.strSrch) == "undefined")
  	{
    	global.strSrch = "";
    	global.setPersistent("strSrch",true);
  	}
  	SearchReplaceDlg.strSrch = global.strSrch;

  	if(typeof(global.strRplc) == "undefined")
  	{
    	global.strRplc = "";
    	global.setPersistent("strRplc",true);
  	}
  	SearchReplaceDlg.strRplc = global.strRplc;

  	if(typeof(global.bRegex) == "undefined")
  	{
    	global.bRegex = false;
    	global.setPersistent("bRegex",true);
  	}
  	SearchReplaceDlg.bRegex = global.bRegex;

  	if(typeof(global.bMatchCase) == "undefined")
  	{
    	global.bMatchCase = false;
    	global.setPersistent("bMatchCase",true);
  	}
  	if(typeof(global.bPgLbs) == "undefined")
  	{
    	global.bPgLbs = false;
    	global.setPersistent("bPgLbs",true);
  	}
  	SearchReplaceDlg.bPgLbs = global.bPgLbs;
  	if(typeof(global.bDate) == "undefined")
  	{
    	global.bDate = false;
    	global.setPersistent("bDate",true);
  	}
  	SearchReplaceDlg.bDate = global.bDate;
  	if(typeof(global.bWholeWords) == "undefined")
  	{
    	global.bWholeWords = false;
    	global.setPersistent("bWholeWords",true);
  	}
  	SearchReplaceDlg.bWholeWords = global.bWholeWords;
	if(typeof(global.bSearch) == "undefined")
  	{
    	global.bSearch = false;
    	global.setPersistent("bSearch",true);
  	}
  	SearchReplaceDlg.bSearch = global.bSearch;
	if(typeof(global.bReplace) == "undefined")
  	{
    	global.bReplace = false;
    	global.setPersistent("bReplace",true);
  	}
  	SearchReplaceDlg.bReplace = global.bReplace;
	if(typeof(global.bItalics) == "undefined")
  	{
    	global.bItalics = false;
    	global.setPersistent("bItalics",true);
  	}
  	SearchReplaceDlg.bItalics = global.bItalics;
	if(typeof(global.bBold) == "undefined")
  	{
    	global.bBold = false;
    	global.setPersistent("bBold",true);
  	}
  	SearchReplaceDlg.bBold = global.bBold;
	if(typeof(global.bPlain) == "undefined")
  	{
    	global.bPlain = false;
    	global.setPersistent("bPlain",true);
  	}
  	SearchReplaceDlg.bPlain = global.bPlain;
	if(typeof(global.bColor) == "undefined")
  	{
    	global.bColor = false;
    	global.setPersistent("bColor",true);
  	}
  	SearchReplaceDlg.bColor = global.bColor;
  	
	if(typeof(global.strFromDate) == "undefined")
  	{
    	global.strFromDate = "";
    	global.setPersistent("strFromDate",true);
  	}
  	SearchReplaceDlg.strFromDate = global.strFromDate;
	if(typeof(global.strToDate) == "undefined")
  	{
    	global.strToDate = "";
    	global.setPersistent("strToDate",true);
  	}
  	SearchReplaceDlg.strToDate = global.strToDate;
	if(typeof(global.strTextCol) == "undefined")
  	{
    	global.strTextCol = "";
    	global.setPersistent("strTextCol",true);
  	}
  	SearchReplaceDlg.strTextCol = global.strTextCol;  	
	if(typeof(global.bInclude_Non_Dates) == "undefined")
  	{
    	global.bInclude_Non_Dates = false;
    	global.setPersistent("bInclude_Non_Dates",true);
  	}
  	SearchReplaceDlg.bInclude_Non_Dates = global.bInclude_Non_Dates;
	if(typeof(global.bSkipItalicised) == "undefined")
  	{
    	global.bSkipItalicised = true;
    	global.setPersistent("bSkipItalicised",true);
  	}
  	SearchReplaceDlg.bSkipItalicised = global.bSkipItalicised;

	SearchReplaceDlg.nLevel = SearchReplaceDlg.nLvlMax = nDepth.toString();
	
		if("ok" == dotheSearchDialog(SearchReplaceDlg,oDoc))
		{
			DoItSearch(oDoc,SearchReplaceDlg);
		}
	}

	oDoc.pageNum=Pg;  //reset page number to where it started
	
 //    return nFound;
    return 0;
  app.endPriv();
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7SearchReplace = 
"00000000000000000000000000000000000000000000000040000000700000008000000070000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000df000000ff000000ff000000ff000000ff000000ff000000df0000007000000000000000000000000000000000000000000000000000000000000000000000000000000010000000af000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000bf0000001000000000000000000000000000000000000000000000000000000000000000af000000ff000000ff000000ff000000bf000000600000004000000060000000af000000ff000000ff000000ff000000bf00000000000000000000000000000000000000000000000000000060000000ff000000ff000000ef00000040000000000000000000000000000000000000000000000040000000ef000000ff000000ff000000700000000000000000000000000000000000000000000000df000000ff000000ff000000400000000000000000000000000000000000000000000000000000000000000040000000ff000000ff000000df0000000000000000000000000000000000000030000000ff000000ff000000bf0000000000000000000000000000000000000000000000000000000000000000000000000000009f000000ff000000ff0000004000000000000000000000000000000070000000ff000000ff0000006000000000000000000000000000000000000000000000000000000000000000000000000000000050000000ff000000ff0000008000000000000000000000000000000080000000ff000000ff0000004000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff0000008000000000000000000000000000000080000000ff000000ff0000004000000000000000000000000000000000000000000000000000000000000000000000000000000040000000ff000000ff0000008000000000000000000000000000000040000000ff000000ff0000008f0000000000000000000000000000000000000000000000000000000000000000000000000000008f000000ff000000ff0000005000000000000000000000000000000010000000ff000000ff000000ef000000100000000000000000000000000000000000000000000000000000000000000010000000ef000000ff000000ff00000010000000000000000000000000000000000000009f000000ff000000ff000000cf00000010000000000000000000000000000000000000000000000010000000bf000000ff000000ff000000af000000000000000000000000000000000000000000000010000000ef000000ff000000ff000000df0000005000000000000000000000000000000050000000cf000000ff000000ff000000ff000000ff00000060000000000000000000000000000000000000000000000030000000ef000000ff000000ff000000ff000000ff000000cf000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff00000060000000000000000000000000000000000000000000000030000000cf000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000cf000000ef000000ff000000ff000000ff000000ff00000060000000000000000000000000000000000000000000000000000000500000009f000000bf000000bf000000bf0000009f000000500000000000000040000000ff000000ff000000ff000000ff000000ff00000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000ff000000ff000000ff000000ff0000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000060000000ff000000ff000000ff000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000800000004000000000000000";
 //</JSCodeSnippet>


var dotheSearchDialog=app.trustedFunction(function (dialog,oDoc){
	app.beginPriv();
	dialog.doc=oDoc;
	//dialog.dirty=false;
	var retn=app.execDialog(dialog);
	return retn;
	app.endPriv();
});




var SearchReplaceDlg =
{
	
	
    strSrch:"",
    strRplc:"",
    nLevel:"1",
	nLvlMax:"1",
	nPgMax:"2",
	nInsertAt:"2",
	bMatchCase:false,
	bRegex:false,
	bPgLbs:false,
	bColor:false,
    strTextCol:["Black"],
    bDate:false,
    strFromDate:"",
    strToDate:"",
    bWholeWords:true,
    bSearch:true,
    bReplace:true,
    bBold:false,
    bItalics:false,
    bPlain:false,
    bSkipItalicised: true,
    bInclude_Non_Dates: false,

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


	

    initialize: function(dialog)
    {
        
        var dlgInit = 
        {
            "nIns": this.nInsertAt,
            "nlvl": this.nLevel,
            "Srch": this.strSrch,
            "Rplc": this.strRplc,
            "bMcs": this.bMatchCase,
            "bReg": this.bRegex,
            "bPgL": this.bPgLbs,
            "bDat": this.bDate,
            "dFrm": this.strFromDate,
            "dTom": this.strToDate,
            "bCol": this.bColor,
            "FCol": listFCol,
            "bWWs": this.bWholeWords,
            "bSrc": this.bSearch,
            "bRep": this.bReplace,
            "Bold": this.bBold,
            "Ital": this.bItalics,
            "Plan": this.bPlain,
            "bIDt": this.bInclude_Non_Dates,
            "bIts": this.bSkipItalicised,
        };
        this.SetListSel(listFCol, this.strTextCol);

        dialog.load(dlgInit);
        var oRslt = dialog.store();
    	//enable accordingly
    	dialog.enable({"FCol":oRslt["bCol"]});    		
    	dialog.enable({"dFrm":oRslt["bDat"]});    		    
    	dialog.enable({"dTom":oRslt["bDat"]});    		    
    	dialog.enable({"bIDt":oRslt["bDat"]});    		    
		dialog.enable({"Srch":oRslt["bSrc"]});    	
		dialog.enable({"Rplc":oRslt["bRep"]}); 
		   	
		dialog.enable({"bMcs":oRslt["bSrc"]});    	
		dialog.enable({"bWWs":oRslt["bSrc"]});    	
		dialog.enable({"bReg":oRslt["bSrc"]}); 
		   	
	
    },
    
    SetVariables: function(dialog)
    {
        var path = new Array();
        var oRslt = dialog.store();
        this.strSrch = oRslt["Srch"];
        this.strRplc = oRslt["Rplc"];
        this.nLevel = oRslt["nlvl"];
        this.nInsertAt = oRslt["nIns"];
        this.bMatchCase = oRslt["bMcs"];
        this.bRegex = oRslt["bReg"];
        this.bPgLbs=oRslt["bPgL"];
        this.bColor=oRslt["bCol"];
        this.strFromDate=oRslt["dFrm"];
        this.strToDate=oRslt["dTom"];
        this.bDate=oRslt["bDat"];
        this.bWholeWords=oRslt["bWWs"];
        this.bSearch=oRslt["bSrc"];
        this.bReplace=oRslt["bRep"];
        this.bBold=oRslt["Bold"];
        this.bItalics=oRslt["Ital"];
        this.bPlain=oRslt["Plan"];
        this.bInclude_Non_Dates=oRslt["bIDt"];
        this.bSkipItalicised=oRslt["bIts"];
        this.strTextCol = ((this.GetListSel(oRslt["FCol"],path))?path.reverse():"").toString();    	
    },
    
    validate: function(dialog){
    	console.println("Validating search and replace...");
        var oRslt = dialog.store();
        if(oRslt["bDat"]){ //then validate dates
    		if(oRslt["dFrm"]=="")return true;    	
				if(NoDateFromString(", " + oRslt["dFrm"])){
					app.alert("No valid 'from' date.");
					return false;
				}
	    		if(oRslt["dTom"]=="")return;    	
				if(NoDateFromString(", " + oRslt["dTom"])){
					app.alert("No valid 'to' date.");
					return false;
				}
        	}
        return true;
    },



    commit: function(dialog)
    {
    	this.SetVariables(dialog);	
    },
   
    "dFrm":function(dialog){
    	//console.println("Got from:");
    	var oRslt = dialog.store();
    	this.strFromDate=oRslt["dFrm"];    	
    	this.bDate=oRslt["bDat"];
    	//if(bDate){
    	if(this.strFromDate=="")return;    	
			if(NoDateFromString(", " + this.strFromDate)){
				app.alert("No valid 'from' date.");
				return;
			}
		dialog.load({"dFrm":SwapDateFromText(", "+ this.strFromDate,false)});
		//}    	
    },
    
    "dTom":function(dialog){
    	//console.println("Got to:");
    	var oRslt = dialog.store();    	
    	this.strToDate=oRslt["dTom"];
    	this.bDate=oRslt["bDat"];
    	//if(bDate){
    	if(this.strToDate=="")return;    	
			if(NoDateFromString(", " + this.strToDate)){
				app.alert("No valid 'to' date.");
				return;
			}
		dialog.load({"dTom":SwapDateFromText(", "+ this.strToDate,false)});
		//}    	    
    },
    
   "OkCn": function(dialog){
   		//console.println("got here");
   },
   
    "but1": function(dialog)//resets to default values
    {
    	
			this.strSrch="";
    		this.strRplc="";
    		this.nLevel="1";
			this.nLvlMax="1";
			this.nPgMax="2";
			this.nInsertAt="2";
			this.bMatchCase=false;
			this.bRegex=false;
			this.bPgLbs=false;
			this.bColor=false;
    		this.strTextCol=["Black"];
    		this.bDate=false;
    		this.strFromDate="";
    		this.strToDate="";
    		this.bWholeWords=true;
    		this.bSearch=true;
    		this.bReplace=true;
    		this.bBold=false;
		    this.bItalics=false;
    		this.bPlain=false;
    		this.bInclude_Non_Dates=false;
    		this.bSkipItalicised=true;
    		this.nLevel=parseInt(FindMaxBkDepth(this.doc.bookmarkRoot),10).toString();
    		this.nLvlMax=this.nLevel;
        	this.initialize(dialog);
    },
    
    "but2": function (dialog) //apply button
    {
    	if(!this.validate(dialog)) return;
    	//applies search and replace
   		this.SetVariables(dialog);
   		DoItSearch(this.doc,SearchReplaceDlg);
		dialog.load({"dFrm":this.strFromDate});
		dialog.load({"dTom":this.strToDate});
    },
    
    "bSrc": function (dialog)
    {
    	var oRslt = dialog.store();    	   
		dialog.enable({"Srch":oRslt["bSrc"]});    	
		dialog.enable({"bMcs":oRslt["bSrc"]});    	
		dialog.enable({"bWWs":oRslt["bSrc"]});    	
		dialog.enable({"bReg":oRslt["bSrc"]}); 
	},
    
    "bRep": function (dialog)
    {
    	var oRslt = dialog.store();    	   
		dialog.enable({"Rplc":oRslt["bRep"]});    	
		//dialog.enable({"Plan":oRslt["bRep"]}); 
		//dialog.enable({"Bold":oRslt["bRep"]}); 
		//dialog.enable({"Ital":oRslt["bRep"]});
    },
    
    "Plan": function(dialog)
    {
    	this.bBold=false;
    	this.bItalics=false;
    	dialog.load({"Bold":this.bBold,"Ital":this.bItalics});
    },
    "Ital": function(dialog)
    {
    	this.bPlain=false;
    	dialog.load({"Plan":this.bPlain});
    },
    "Bold": function(dialog)
    {
    	this.bPlain=false;
    	dialog.load({"Plan":this.bPlain});
    },
    
    "bCol":function(dialog)
    {
    	var oRslt = dialog.store();    	
    	dialog.enable({"FCol":oRslt["bCol"]});    		
    },
    
    "bDat": function (dialog)
    {
    	var oRslt = dialog.store();    	
    	dialog.enable({"dFrm":oRslt["bDat"]});    		    
    	dialog.enable({"dTom":oRslt["bDat"]});    		    
    	dialog.enable({"bIDt":oRslt["bDat"]});    		    
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
        name: "Search and Replace",
        elements:
        [
            {
                type: "view",
                elements:
                [
                    {
                        //type: "view",
                        //alignment: "align_fill",
                        //elements:
                        type: "cluster",
                        item_id: "cls1",
                        name: "Search for:",
                        elements:
                       [
                            {
                            	type: "view",
                            	alignment: "align_fill",
                            	align_children: "align_row",
                            	elements:
                            	[
		                            {
        		                        type: "check_box",
                		                item_id: "bSrc",
                        		        name: "",
                                		variable_name: "bSearch",
                            		},
    		                          {
            		                    type: "edit_text",
                    		            item_id: "Srch",
                           			   	variable_Name: "strSrch",
                                		char_width: 7,
                                		alignment: "align_fill",
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
                                        item_id: "bMcs",
                                        name: "Match case",
                                        variable_Name: "bMatchCase",
                                    },
                                    {
                                        type: "check_box",
                                        group_id: "LbTy",
                                        item_id: "bWWs",
                                        name: "Whole words",
                                        variable_Name: "bWholeWords",
                                    },
                                    {
                                        type: "check_box",
                                        group_id: "LbTx",
                                        item_id: "bReg",
                                        name: "Use Regex",
                                        variable_Name: "bRegex",
                                    },
                                    
                                    {
                                        type: "check_box",
                                        group_id: "LbTx",
                                        item_id: "bPgL",
                                        name: "Page labels",
                                        variable_Name: "bPgLbs",
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
                                        item_id: "bIts",
                                        name: "Skip italicised",
                                        variable_name: "bSkipItalicised",
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
                                        item_id: "bDat",
                                        name: "Filter by date:",
                                        variable_name: "bDate",
                                    },
                                    {
                                        type: "static_text",
                                        item_id: "sta4",
                                        name: "from",
                                    },
                                    {
                                        type: "edit_text",
                                        item_id: "dFrm",
                                        variable_Name: "strFromDate",
                                        char_width: 10,
                                    },
                                    {
                                        type: "static_text",
                                        item_id: "sta5",
                                        name: "to",
                                    },
                                    {
                                        type: "edit_text",
                                        item_id: "dTom",
                                        variable_Name: "strToDate",
                                        char_width: 10,
                                    },
                                ]
                            },
                            
                                 {
                                      type: "check_box",
                                      item_id: "bIDt",
                                      name: "Match non-date bookmarks",
                                      variable_name: "bInclude_Non_Dates",
                                 },

                            
                           											
														
                        ]
                    },
 			         {
                        //type: "view",
                        //alignment: "align_fill",
                        //elements:
                        type: "cluster",
                        item_id: "cls2",
                        name: "Replace with:",
                        elements:
                       [                            
    
                            {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
		                            {
        		                        type: "check_box",
                		                item_id: "bRep",
                        		        name: "",
                                		variable_name: "bReplace",
                            		},
                            		{
		                                type: "edit_text",
        		                        item_id: "Rplc",
                		                variable_Name: "strRplc",
                        		        char_width: 7,
                      			  		alignment: "align_fill",
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
                                          item_id: "Plan",
                                          name: "Plain",
                                          variable_Name: "bPlain",
                                    },
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
                                        type: "check_box",
                                        item_id: "bCol",
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
                    
                    {
                        type: "ok_cancel",
                        item_id: "OkCn",
                    },
                ]
            },
        ]
    }
};



 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconSearchReplace = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconSearchReplace = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7SearchReplace.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdSearchReplace = 
"DoSearchAndReplace(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjSEARCH_REPLACE = 
{cName: "SEARCH_REPLACE",
cExec: DoCmdSearchReplace,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
cMarked: "event.rc = false",
cTooltext: "Search and replace bookmark text",
cLabel: "Search and replace",
nPos: -1};
 //</JSCodeSnippet>
if(oIconSearchReplace != null)
    oButObjSEARCH_REPLACE.oIcon = oIconSearchReplace;

try{app.removeToolButton("SEARCH_REPLACE");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjSEARCH_REPLACE);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["SEARCH_REPLACE_InDoc"] = "1:17:2011:17:55:45";
// else
//    global["SEARCH_REPLACE_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjSEARCH_REPLACE"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




