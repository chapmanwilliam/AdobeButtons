   
     //Note: all dates must either start at the beginning or be preceded by , or , and space or just a space.
	 //a.... 20/6/10   'assumes years <50 are 20??. So this is 20/6/2010
	 //b.... 20/6/2010
	 //c..... 6/10     'will translate this as 1/6/2010
	 //d..... 6/2010     'will translate this as 1/6/2010
	 //e..... 1 Jun 10   'will translate this as 1/6/2010	spaces can be replaced with '.' or '-' or '/'
	 //f..... 1 Jun 2010   'will translate this as 1/6/2010	  spaces can be replaced with '.' or '-' or '/'
	 //g..... Jun 10   'will translate this as 1/6/2010   spaces can be replaced with '.' or '-' or '/'
	 //h..... Jun 2010 'will translate this as 1/6/2010   spaces can be replaced with '.' or '-' or '/'
	 //i..... 2010     'will translate this as 1/1/2010   spaces can be replaced with '.' or '-' or '/'
	 //j..... 10     'will translate this as 1/1/2010     spaces can be replaced with '.' or '-' or '/'
	 //k..... age 10 'will translate as 10 years + dob_C
	 //l..... age 10-20 'will translate as 10 years + dob_C - 20 years + dob_C
	var patA=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2}))$/;  // this matches a)
	var patB=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4}))$/;  // this matches b)
	var patC=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})[\/\-\.](\d{2}))$/;  //this matches c)
	var patD=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})[\/\-\.](\d{4}))$/;  //this matches d)
	var patE=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})(?:st|nd|rd|th)?[\- \/\.]?(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\- \/\.]?(\d{1,2}))$/i;
	var patF=/(?:(?:^|(?:,|(?: )|, ))(\d{1,2})(?:st|nd|rd|th)?[\- \/\.]?(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\- \/\.]?(\d{4}))$/i;
	var patG=/(?:(?:^|(?:,|(?: )|, ))(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\- \/\.](\d{2}))$/i;
	var patH=/(?:(?:^|(?:,|(?: )|, ))(Jan|January|Feb|February|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|September|Oct|October|Nov|November|Dec|December)[\- \/\.](\d{4}))$/i;
	var patI=/(?:(?:^|(?:,|(?: )|, ))(\d{4}))$/;
	var patJ=/(?:(?:^|(?:,|(?: )|, ))(\d{2}))$/;
	var patK=/(?:(?:^|(?:,|(?: )|, ))(age \d{1,3}(\.[\d+])?))$/;
	var patL=/(?:(?:^|(?:,|(?: )|, ))(age (\d{1,3}(\.[\d+])?)?[ ]{0,1}-[ ]{0,1}(\d{1,3}(\.[\d+])?)?))$/;

	var date_part=/,([^,]*)$/
//	var time_element=/ \d{2}(:\d{2}){0,3}$/;
	var time_element=/ \d+(:\d+){1,3}$/;
	var age_element=/(age \d{1,3}(\.[\d+])?)/;
	var ages_element=/(age (\d{1,3}(\.[\d+])?)?[ ]{0,1}-[ ]{0,1}(\d{1,3}(\.[\d+])?)?)$/;
 //*******************************************\\
 //This sorts bookmarks by date or alphabet but leaves italicised bookmarks alone
var nCount=0;
var dob_C=null; //stores the date of birth of C
var date_formatsUK=["DD/MM/YY", "DD/MM/YYYY", "DD MMM YY","DD MMMM YY","DD MMM YYYY","DD MMMM YYYY", "MMM YY", "MMMM YY", "MMM YYYY", "MMMM YYYY", "YYYY", "YY"];
var date_formatsUS=["MM/DD/YY", "MM/DD/YYYY", "MMM DD YY","MMMM DD YY","MMM DD YYYY","MMMM DD YYYY", "MMM YY", "MMMM YY", "MMM YYYY", "MMMM YYYY", "YYYY", "YY"];
//var date_formats=["MMM YYYY"];


function ConvertDateToUS(Bm){
	//Takes a bookmark and returns a string with any date converted from the UK date format (dd/mm/yy) to the US date format (mm/dd/yy)
	//We only need to be worried about patterns A and B

	var base_Dt=new Date("10/10/1066");   //the ridiculously early date by default

	var Nm=Bm.name.replace(pattern_toggle_page_label,"").trim();	

	var com=/,?( )?/;

	 //set these to an invalid date
	var dd=-1;
	var mm=-1;
	var yyyy=1;
	
	var s=""; //string that we return
	switch (GetDateFormatType(Bm)){
		case "A": //part year dd/mm/yy
			a=Nm.match(patA);
			a[0]=a[0].replace(com, "");
			var part=a[0].split(/[\-\/\.]/);  //there should be three parts
			dd=parseInt(part[0],10); //the first part is the day
			mm=parseInt(part[1],10)-1; //the second part is the month
			if(parseInt(part[2],10)<50){ //last part is the year
				yyyy=parseInt(part[2],10)+2000;
			}else{
				yyyy=parseInt(part[2],10)+1900;
			}
			if(IsValidDate(dd,mm+1,yyyy)){ //check its a valid date we've got
				var new_date_string=mm.toString()+"/"+dd.toString()+"/"+yyyy.toString();
				s=Bm.name.replace(patA,new_date_string)
			}		
		break;
		case "B": //full year dd/mm/yyyy
			a=Nm.match(patB);
			a[0]=a[0].replace(com, "");
			var part=a[0].split(/[\-\/\.]/);  //there should be three parts
			mm=parseInt(part[0],10); //the first part is the day
			dd=parseInt(part[1],10)-1; //the second part is the month
			yyyy=parseInt(part[2],10); //last part is the year
			if(IsValidDate(dd,mm+1,yyyy)){ //check its a valid date we've got
				var new_date_string=mm.toString()+"/"+dd.toString()+"/"+yyyy.toString();
				s=Bm.name.replace(patB,new_date_string)
			}		
		break;
		deafult:
			return Bm.name; //simply return what we got
		break;
	}
	if(s!=""){
			return s; //return changed date if successful
		}else{
			return Bm.name; //i.e. unchanged if unsuccessful
		}		
	 
}

function ConvertDateToUK(Bm){
	//Takes a bookmark and returns a string with any date converted from the US date format (mm/dd/yy) to the US date format (dd/mm/yy)
	//We only need to be worried about patterns A and B
	
	var base_Dt=new Date("10/10/1066");   //the ridiculously early date by default

	var Nm=Bm.name.replace(pattern_toggle_page_label,"").trim();	

	var com=/,?( )?/;

	 //set these to an invalid date
	var dd=-1;
	var mm=-1;
	var yyyy=1;
	
	var s=""; //string that we return
	switch (GetDateFormatType(Bm)){
		case "A": //part year mm/dd/yy
			a=Nm.match(patA);
			a[0]=a[0].replace(com, "");
			var part=a[0].split(/[\-\/\.]/);  //there should be three parts
			mm=parseInt(part[0],10); //the first part is the month
			dd=parseInt(part[1],10)-1; //the second part is the day
			if(parseInt(part[2],10)<50){ //last part is the year
				yyyy=parseInt(part[2],10)+2000;
			}else{
				yyyy=parseInt(part[2],10)+1900;
			}
			if(IsValidDate(dd,mm+1,yyyy)){ //check its a valid date we've got
				var new_date_string=dd.toString()+"/"+mm.toString()+"/"+yyyy.toString();
				s=Bm.name.replace(patA,new_date_string)
			}		
		break;
		case "B": //full year mm/dd/yyyy
			a=Nm.match(patB);
			a[0]=a[0].replace(com, "");
			var part=a[0].split(/[\-\/\.]/);  //there should be three parts
			mm=parseInt(part[0],10); //the first part is the month
			dd=parseInt(part[1],10)-1; //the second part is the day
			yyyy=parseInt(part[2],10); //last part is the year
			if(IsValidDate(dd,mm+1,yyyy)){ //check its a valid date we've got
				var new_date_string=dd.toString()+"/"+mm.toString()+"/"+yyyy.toString();
				s=Bm.name.replace(patB,new_date_string)
			}		
		break;
		deafult:
			return Bm.name; //simply return what we got
		break;
	}
	if(s!=""){
			return s; //return changed date if successful
		}else{
			return Bm.name; //i.e. unchanged if unsuccessful
		}		
}

function FindBookmarkByName(oBkMkParent,cFindName) {
	var aBkMks = oBkMkParent.children; var oRtn = null; if(aBkMks != null) {
		for(var i=0;i<aBkMks.length;i++) {
			if(aBkMks[i].name == cFindName) oRtn = aBkMks[i];
			else if(aBkMks[i].children != null) oRtn = FindBookmarkByName(aBkMks[i],cFindName);
			if(oRtn != null) break;
		}
	}
	return oRtn;
}

function CloneBookMark(Bm, oDoc){
	 //clones the bookmark and puts it end of Root tree
	app.beginPriv();
	Bm.execute();
	app.execMenuItem('NewBookmark');
	app.execMenuItem('NewBookmark');
	var new_bookmark= FindBookmarkByName(oDoc.bookmarkRoot,"Untitled");
	new_bookmark.name=Bm.parent.name;
	var pg_lbl=GetPageLabel(Bm, oDoc);
	console.println("Page label: " + pg_lbl);
	new_bookmark.name.replace(/ \[\w+\]$/, " ["+pg_lbl+"]");
	var decoy_bookmark=FindBookmarkByName(oDoc.bookmarkRoot,"Untitled");
	decoy_bookmark.remove();	
	oDoc.bookmarkRoot.insertChild(new_bookmark,oDoc.bookmarkRoot.children.length);
	app.endPriv();
	return new_bookmark;
}

function GetPageLabel(Bm, oDoc){
	Bm.execute();
	return oDoc.getPageLabel(oDoc.pageNum);
}

function Sort(Bm, nLvlMax, nLevel, oDoc, AZ, Sel, index){
	app.beginPriv();
	 //console.println("AZ 1: " +AZ);
	 //console.println("Selected: " + Sel);
	var y=Bm.children==null ? 0 : Bm.children.length;
	nCount=nCount+ y;  //counter for the thermometer
	//console.println("Started level: " + nLevel + " and  nCount: " + nCount);
	//app.thermometer.value=nCount;
	var x=Math.round(nCount/app.thermometer.duration*100);
	//app.thermometer.text="Sorting...." + x + "%";
	arguments.callee.oProg.value=nCount;
	arguments.callee.oProg.text = "Sorting...." + x + "%";

	
	 //if(app.thermometer.cancelled) return -1;  //exit if cancelled
	
	 // process children
	if (nLevel<nLvlMax && Bm.children != null){
		 //Check if the parent bookmark points to the first bookmark
		 //If it doesn't then nothing needs to be done
		 //If it does then the parent bookmark needs be set to the first bookmark after the sort
	
		var flag=false;
		 //if(CheckParentChild(Bm, oDoc)) flag=true;  //set flag if first-child points to parent's page
		
		
		 //Conduct the sort for this branch
		if(Sel && Bm.name!="Root") {
			quickSort(AZ, Bm, 0,"End" ,oDoc);  //if only doing selected bookmarks then don't do the Root
		}else{
			if(!Sel)quickSort(AZ, Bm, 0,"End", oDoc);  //we're doing the whole lot
		}
		
		
		if(flag){
			app.beginPriv();
			 //clone the first child bookmark
			var clone=null;
			console.println(Bm.name);
			console.println("Here");
			clone=CloneBookMark(Bm.children[0], oDoc);	
			 //Now move all the children to the cloned bookmark
			var k=Bm.children.length;
			console.println("No children " + k);
			for (var j=0; j<k; j++){
				console.println("Nth child " + j);
				var c=Bm.children.length-1;  //i.e. the last child of Bm
				console.println("Child moving " + Bm.children[c].name);
				clone.insertChild(Bm.children[c]);
			}
			 //Now move the cloned bookmark to the original place
			console.println("Index: " + index);
			Bm.parent.insertChild(clone,index);
			 //Now destroy the now empty original
			Bm.remove();
			 //CreateDecoy(oDoc);
			Bm=clone;
			app.endPriv();
		}

		
		 //And now sort all the sub-branches
		for (var i = 0; i < Bm.children.length; i++){ //and for the children of children	
			if(!Sel){
				Sort(Bm.children[i], nLvlMax, nLevel + 1, oDoc, AZ, Sel, i);
			}else{
				if(Bm.children[i].open==true){  //only sort if the bookmark is open
					Sort(Bm.children[i], nLvlMax, nLevel + 1, oDoc, AZ, Sel, i);
				}
			}
		}
	}
	

	return nCount;
}

function CheckParentChild(Bm, oDoc){
	 //returns true if Parent points to same as first child
	if(Bm.name=="Root") return false;  //i.e. if this is the root
	if(Bm.children==null)return false;  //i.e. if no children then return false
	var Ch=Bm.children[0];
	Bm.execute();
	var pg_parent=oDoc.pageNum;
	Ch.execute();
	var pg_child=oDoc.pageNum;
	if(pg_child==pg_parent){
		return true;
	}else{
		return false;
	}
}

function NoDateFromString(S, oDoc){
	 //returns true if there is no date in bookmark where S is a string
	if(!GetDateFromString(S, oDoc)) {return true; return false;};	
}

function NoDate(Bm, oDoc){
	//returns true if there is no date in bookmark
	console.println("NoDate");
	console.println(oDoc.path);
	return NoDateFromString(Bm.name, oDoc);
}

function ExcludeBkMk(Bm, AZ, oDoc){
	 //returns true if the bookmark should be excluded from sort
	if ((!AZ && NoDate(Bm, oDoc)) || Bm.style==1){
		return true;
	}else{
		return false;
	}
}

function GetAgeFromString(S){
	//Gets the Age from the string and returns age by number if found or null
	var age=null;
	S=RemovePageLabelFromString(S).toLowerCase();
	var b=S.match(patK);
	//get age no from age part
	if(b!=null){
		age=b[0].match(/(\d+[\.\d+]{0,1})/);		
		if (age!=null) return Number(age[0]);
	}
	return age;
}

function GetAgeFromBookMark(Bm){
	return GetAgeFromString(Bm.name);
}

function GetDateFromAge(age){
	if (!dob_C || age==null || age=="")return null;
	//console.println("Here " + dob_C);
	//console.println("Moment: " + moment(dob_C).toDate());
	return moment(dob_C).startOf('day').add(age,'years').startOf('day').toDate();
}

function GetDateFromAgeBookMark(Bm){
	return GetDateFromAgeString(GetAgeFromString(Bm.name));
}

function GetDateFromAgeString(S){
	return GetDateFromAge(GetAgeFromString(S));	
}

function GetDatePartFromString(S, oDoc){
	//using moments
	var a=S.match(date_part);
	if(!a)return null;
	return S.match(date_part)[1].trim();
}

function GetTimePartFromString(S){
	//using moments
	var a=RemovePageLabelFromString(S).match(time_element);
	if(!a)return null;
	return a[0].trim();
}

function AddTimePart(mom, date_part){
	//returns mom with add time part in S amended
	var time_part=GetTimePartFromString(date_part);
	if(time_part){
		time_parts=time_part.split(":");
		time_parts[0] ? HH=Number(time_parts[0]): HH=0;
		time_parts[1] ? MM=Number(time_parts[1]): MM=0;
		time_parts[2] ? SS=Number(time_parts[2]): SS=0;
		time_parts[3] ? ML=Number(time_parts[3]): ML=0;
		mom.hour(HH);
		mom.minute(MM);
		mom.seconds(SS);
		mom.milliseconds(ML);
		//console.println(HH + ":" + MM + ":"+ SS + ":"+ ML);
	}
	return mom;
}

function GetDateFromString(S, oDoc){
	 //This function returns the date as entered in the following formats from string
	var Nm=S.replace(pattern_toggle_page_label,"").trim();	
	
	//using moments
	var date_part=GetDatePartFromString(Nm, oDoc);
	if(date_part){
	
	
		if(date_part.match('-')){ //we have spanning elements
			//Span age elements like age 10-12
			if(age_element.test(date_part)){
				//console.println("Got here2: " + S);
				if(dob_C){
					var ages=GetAgesFromAgeSpan(Nm);
					if(ages!=null){
						var age="";
						var d;
						ages[0]=="" ? age=Number(ages[1]): age=Number(ages[0]); //set the age to second part if no first part
						d=GetDateFromAge(age);
						if(frac(age)==0 & ages[0]==""){ //move to end of year if this is end of time
							d=moment(d).add(1,'y').subtract(1,'ms').toDate();					
						}
				
						//console.println(S + "==>"+d);
						return d;
					}
				}else{
					return null;
				}
			}else{ //or it's a date element
				//Span date elements like this 1/10/10 - 2/10/10
				//We will take the first date as the date of the bookmark
				var p=date_part.split("-");
				if(p){// there are span elements
					//use the first part to get the date
					var p_to_use="";
					if(!p[0]){
						p_to_use=p[1];
					}else{
						p_to_use=p[0];
					}
					if (p_to_use) {
						return MoveToEndPeriodString(", " + p_to_use.trim(),GetRegularDate(p_to_use.trim(),oDoc));
					}else{
						return null;
					}
				}
			}
		}else{ //no spanning elements
			//Age element like age 10 where we have the age at the end
			if(age_element.test(date_part)){
				//console.println("Got here1: " + S);
				if(dob_C){
					return GetDateFromAgeString(date_part);
				}else{
					return null;
				}
			}
			//Get regular date
			//console.println("here it is " + date_part);
			return GetRegularDate(date_part, oDoc);
		}
			
	}else{
		return null;
	}

	return null;
	
}

function GetLocaleDate(oDoc){
	//returns string of local 'en-GB' or 'en-US'
	if(typeof(oDoc.info.NFPGstrDtFormat) == "undefined"|| oDoc.info.NFPGstrDtFormat==""){
		return 'en-GB'; /*default is UK*/
	}else{
		if(oDoc.info.NFPGstrDtFormat=="DtUK"){
			return 'en-GB';
		}else{
			return 'en-US';
		}
	}	
	return 'en-GB'
}

function GetRegularDate(date_part, oDoc){
	var mom;
	if (GetLocaleDate(oDoc)=='en-GB'){
		mom=moment(date_part, date_formatsUK, 'en-GB'); /*default is UK*/
	}else{
			mom=moment(date_part,date_formatsUS,'en-US');
	}

	if(mom.isValid()){
		mom=AddTimePart(mom, date_part);
		return mom.toDate();
	}
	return null;	
}

function GetDate(Bm, oDoc){
	 //This function returns the date as entered in the following formats at the end of the bookmark
	//console.println(GetDateFromString(Bm.name, oDoc));
//	console.println("GetDate");
//	console.println(oDoc.path);
	return GetDateFromString(Bm.name, oDoc);
}

function GetTime(Nm){
	//returns the time element in string format
	var pat=/ \(\d{4,6}\), /;
	//console.println("Name "+ Nm);
	var a;
	a=Nm.match(pat);
	if (a!=null) {
		//console.println("Time, "+ a[0]);
		//strip brackets, commas and spaces
		var b=a[0];
		a[0]=a[0].replace(/[\(\)\, ]/g,"");
		switch (a[0].length){ //check it's ok
			case 4:
				if(Number(a)<0 || Number(a)>2400) return null; //return null if not 24 hr clock
			break;
			case 6:
				var hr;
				hr=parseInt(a[0].slice(0,4), 10); //turns first two characters in to number
				//console.println("Hr ", hr);
				var sec;
				sec=parseInt(a[0].slice(4,6), 10); //turns first two characters in to number
				//console.println("Min "+ mm);
				if(hr<0 || hr>2400) return null;
				if(sec<0 || sec>59) return null; 
			break;
			default:
				console.println("Apparent time wrong length");
			return null;
			break;
		}
		return a[0];
	}
	return null;
}

function RemovetimeString(S){
	var pat=/ \(\d{4,6}\)$/;
	return S.replace(pat,"");
}

function RemoveTime(Bm){
	return RemovetimeString(Bm.name);
}

function GetHourTime(T){
	//returns the HHs for Time. Time is simply four string number (24 hr clock)
	//check nm is valid
	if(T==null) return 0;
	//console.println("Time " + T + "T length " + T.length);
	//console.println("Len ", T.length);
	if (T.length!=4 && T.length!=6) return 0;
	//console.println("Time " + T + " Hour " + parseInt(T.slice(2), 10));

	var HH=parseInt(T.slice(0,2), 10); //turns first two characters in to number
	//check number is between 0 and 24
	//console.println("Got here, ", HH);
	if(HH<0 || HH>24) return 0;
	return HH;
}

function GetMinuteTime(T){
	//returns the MMs for Time. Time is simply four string number (24 hr clock)
	//check nm is valid
	if(T==null) return 0;
	if (T.length!=4 && T.length!=6) return 0;
	var MM=parseInt(T.slice(2,4), 10); //turns last two characters in to number
	//check number is between 0 and 59
	if(MM<0 || MM>59) return 0;
	return MM;
}

function GetSecTime(T){
	//returns the SSs for Time. Time is simply four string number (24 hr clock)
	//check nm is valid
	if(T==null) return 0;
	if (T.length!=6) return 0;
	var SS=parseInt(T.slice(-2), 10); //turns last two characters in to number
	//check number is between 0 and 59
	if(SS<0 || SS>59) return 0;
	return SS;
}

function IsValidDate(dd, mm, yyyy){
//console.println("Got date here");
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

function SameDate(a,b){
	if(!a || !b) return false;
	var dd_a=a.getDate();
	var mm_a=a.getMonth();
	var yy_a=a.getFullYear();
	

	var dd_b=b.getDate();
	var mm_b=b.getMonth();
	var yy_b=b.getFullYear();


	if (dd_a==dd_b && mm_a==mm_b && yy_a==yy_b){
		return true;
	}

	return false;

}

function SameDateAndTime(a,b){
	if(!a || !b){
		console.println("Null dates passed to SameDateAndTime");
		return false;
	}
	var dd_a=a.getDate();
	var mm_a=a.getMonth();
	var yy_a=a.getFullYear();
	var hrs_a=a.getHours();
	var mins_a=a.getMinutes();
	var secs_a=a.getSeconds();

	var dd_b=b.getDate();
	var mm_b=b.getMonth();
	var yy_b=b.getFullYear();
	var hrs_b=b.getHours();
	var mins_b=b.getMinutes();
	var secs_b=b.getSeconds();


	if (dd_a==dd_b && mm_a==mm_b && yy_a==yy_b && hrs_a==hrs_b && mins_b==mins_a && secs_a==secs_b){
		return true;
	}

	return false;

}

function GetLegalNumbering(a)
{
	 //returns legal numbering of bookmark text
	var pattern=/^\d+[\.\d+]*\:/;
	var b=a.match(pattern);
	if(b!=null) return b[0].replace(":","");  //remove colon
	return null;
}

function LegalNumberingCompare(v1, v2) {
	 //returns:
		 //1 if v1 > v2
		 //-1 if v1 < v2
		 //0 if v1==v2
		
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

	 //pad out with zeros if unequal length
    while (v1parts.length < v2parts.length) v1parts.push("0");
    while (v2parts.length < v1parts.length) v2parts.push("0");

     //converts to numbers
    v1parts = v1parts.map(Number);
    v2parts = v2parts.map(Number);

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length == i) {
            return 1;
        }

        if (v1parts[i] == v2parts[i]) {
            continue;
        }
        else if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

function LessThanAlpha(a,b)
{
	 //returns true if:
		 //a and b have legal numbering and a's legal numbering is less than b's OR
		 //if a or b have legal numbering the legal numbering wins regardless
		 //neither a or b have legal numbering and a is less than b
		
	var a_legal=GetLegalNumbering(a);
	var b_legal=GetLegalNumbering(b);
	if(a_legal!=null && b_legal!=null){  //i.e. both have legal numbering
		return (LegalNumberingCompare(a_legal, b_legal)==-1);
	}
	if(a_legal==null && b_legal!=null){ //i.e. if b has legal numbering it wins
		return true;
	}
	if(a_legal!=null && b_legal==null){ //i.e. if a has legal numbering it wins
		return false;
	}
	if(a_legal==null && b_legal==null){ //i.e. neither has legal numbering then it's a straight contest
		return (a<b);
	}
	 //console.println(a + " , " + b);
	return false;
}

function MoreThanAlpha(a,b)
{
	 //returns true if:
		 //a and b have legal numbering and a's legal numbering is more than b's OR
		 //if a or b have legal numbering the legal numbering wins regardless
		 //neither a or b have legal numbering and a is more than b
		
	var a_legal=GetLegalNumbering(a);
	var b_legal=GetLegalNumbering(b);
	if(a_legal!=null && b_legal!=null){  //i.e. both have legal numbering
		return (LegalNumberingCompare(a_legal, b_legal)==1);
	}
	if(a_legal==null && b_legal!=null){ //i.e. if b has legal numbering it wins
		return false;
	}
	if(a_legal!=null && b_legal==null){ //i.e. if a has legal numbering it wins
		return true;
	}
	if(a_legal==null && b_legal==null){ //i.e. neither has legal numbering then it's a straight contest
		return (a>b);
	}
	 //console.println(a + " , " + b);
	return false;
}

function LessThan(Bm,i,pivot, AZ, oDoc){

	
	 //returns true if the selected bookmark is 'less' than the pivot 
			//console.println("A: " + Bm.children[i].name + " " + GetDate(Bm.children[i]).toString());
			//console.println("B: " + pivot.name + " " + GetDate(pivot).toString());

	if(!AZ){ //this is a date comparison
		var a=GetDate(Bm.children[i], oDoc);
		var p=GetDate(pivot, oDoc);
		if(a==null)a=new Date("10/10/1066");
		if(p==null)p=new Date("10/10/1066");
		if(a<p){
			//console.println("LESS THAN\n");
			return true;
		}else{
			if(SameDateAndTime(GetDate(Bm.children[i],oDoc),GetDate(pivot,oDoc))){
				 //do a secondary test on alphabet
				if(LessThanAlpha(Bm.children[i].name,pivot.name)) return true;
			}
		}
	}else{ //this is an alphabet comparison
		if(LessThanAlpha(Bm.children[i].name,pivot.name)) return true;
	}

	return false;
}

function MoreThan(Bm,i,pivot, AZ, oDoc){

 //	console.println("Comp More "+ Bm.children[i].name + " " + pivot.name);

	 //returns true if the selected bookmark is 'more' than the pivot 


	if(!AZ){  //this is a date comparison
		var a=GetDate(Bm.children[i], oDoc);
		var p=GetDate(pivot, oDoc);
		if(a==null)a=new Date("10/10/1066");
		if(p==null)p=new Date("10/10/1066");
		if(a>p){
			return true;
		}else{
			if(SameDateAndTime(a,p)){  //do a secondary test on alphabet
				 //do a secondary test on alphabet
				if(MoreThanAlpha(Bm.children[i].name,pivot.name)) return true;
			}
		}
	}else{ //this is an alphabet comparison	
		if(MoreThanAlpha(Bm.children[i].name,pivot.name)) return true;
	}


	return false;
}

function partition(Bm, left, right, AZ, oDoc) {

	 //var c=0;  //counts how many excluded bkmks we skip
    var piv=	Math.floor((right+left)/2);
     //console.println(piv + " excluded? " + ExcludeBkMk(Bm.children[piv],AZ));
    var z=piv;  //going up
    var y=piv;  //going down
    
     //find nearest non-excluded pivot bookmark
    while (ExcludeBkMk(Bm.children[z], AZ, oDoc) && z<Bm.children.length-1) z++;  //make sure pivot bookmark is not italicised
    while (ExcludeBkMk(Bm.children[y], AZ, oDoc) && y>0) y--;  //make sure pivot bookmark is not italicised
     //check to see if this within limits
    if(z<right) {
    		piv=z;
    	}else{
    		piv=y;	
    }
    
    var pivot   = Bm.children[piv];
    //console.println("Pivot: "+ piv + ", " + pivot.name + " " + left + ", " + right);
    var i       = left;
    var j       = right;

    while (i <= j) {

        while ((LessThan(Bm,i,pivot, AZ, oDoc) || ExcludeBkMk(Bm.children[i], AZ, oDoc)) && i<Bm.children.length-1) {
        	//console.println("I " + i + " name: " + Bm.children[i].name + " Skip: " + ((LessThan(Bm,i,pivot, AZ) || ExcludeBkMk(Bm.children[i], AZ)) && i<Bm.children.length-1));
        	i++;
        }

        while ((MoreThan(Bm,j,pivot, AZ, oDoc) || ExcludeBkMk(Bm.children[j], AZ, oDoc)) && j>0) {
        	//console.println("J " + j + " name: " + Bm.children[j].name + " Skip: " + ((LessThan(Bm,j,pivot, AZ) || ExcludeBkMk(Bm.children[j], AZ)) && i<Bm.children.length-1));       	
        	j--;
        }
        
        //console.println("I,J " + i + ", " + j);

        if (i <= j) {
            if(i!=j){   //no point swapping if equal
            	swap(Bm, i, j);
            }
            i++;
            j--;
        }
    }

 	//console.println("STOP, " + i);
    return i;
}

function swap(Bm, a, b){

	 //a and b are indices of two bookmarks of the same level
	var a_mk=Bm.children[a];
	var b_mk=Bm.children[b];
  
	Bm.insertChild(b_mk,a);
	Bm.insertChild(a_mk,b+1);
	
}

function quickSort(AZ, Bm, left, right, oDoc) {
 //	console.println("AZ quick: " + AZ);
    var index;

    if (Bm.children.length > 1) {

        left = typeof left != "number" ? 0 : left;
        while(ExcludeBkMk(Bm.children[left], AZ, oDoc) && left<Bm.children.length-1)left++;  //make sure left is not italicised: grab first non-italicised bkmk on left
        right = typeof right != "number" ? Bm.children.length - 1 : right;
        while(ExcludeBkMk(Bm.children[right], AZ, oDoc) && right>0)right--;  //make sure right is not italicised: grab first non-italicised bkmk on right
      	 //console.println("Left: " + left + ", Right: " + right);
        if(left>=right) return;  //if there are no non-italicised bkmks then quit
        
        index = partition(Bm, left, right, AZ, oDoc);
        
         //console.println("Left: " + left + ", Right: " + right + ", index: " + index);
        
        if (left < index - 1) {  //sort the left side
            quickSort(AZ, Bm, left, index - 1, oDoc);
        }

        if (index < right) {  //sort the right side
            quickSort(AZ, Bm, index, right, oDoc);
        }
    }
}

function SeparateDateBookMarks(Bm, nLevel, oDoc){  //put the dated bookmarks to the end
	nCount++;  //counter for the thermometer
	app.thermometer.value=nCount;
	if(app.thermometer.cancelled) return -1;  //exit if cancelled

	if (Bm.children != null){
		Separate(Bm);
		for (var i = 0; i < Bm.children.length; i++){ //and for the children of children	
			SeparateDateBookMarks(Bm.children[i], nLevel + 1, oDoc);
		}
	}
	
	return nCount;
}

function SetParentToChild(Bm, nLvlMax, nLevel, oDoc, bName)
{
	nCount++;  //counter for the thermometer
	app.thermometer.value=nCount;
	if(app.thermometer.cancelled) return -1;  //exit if cancelled

	if(Bm.children!=null && nLevel<nLvlMax){
		if(Bm.name!="Root"){
			Bm.children[0].execute();
			var pg=oDoc.pageNum.toString();
			Bm.setAction("this.pageNum=" + pg);
		}
		for(var i=0; i<Bm.children.length; i++){
			 //Set child name to that of parent
			if(Bm.name!="Root"){
				var name_parent=Bm.name;
				var pattern=/.+(, \d+\/\d+\/\d+$)/;
				 //console.println("Parent & Child name :" + Bm.name + ", " + Bm.children[i].name);
				if(bName) Bm.children[i].name=Bm.children[i].name.replace(pattern, Bm.name+"$1");
			}
	
			SetParentToChild(Bm.children[i], nLvlMax, nLevel+1, oDoc, bName);
		}
	}
	return nCount;
}

function SetParentToChildName(Bm, nLvlMax, nLevel, oDoc)
{
	nCount++;  //counter for the thermometer
	app.thermometer.value=nCount;
	if(app.thermometer.cancelled) return -1;  //exit if cancelled

	if(Bm.children!=null && nLevel<nLvlMax){
		if(Bm.name!="Root"){
 //			Bm.children[0].execute();
 //			var pg=oDoc.pageNum.toString();
 //			Bm.setAction("this.pageNum=" + pg);
		}
		for(var i=0; i<Bm.children.length; i++){
			 //Set child name to that of parent
			if(Bm.name!="Root"){
				var name_parent=Bm.name;
				var pattern=/.+(, \d+\/\d+\/\d+$)/;
				 //console.println("Parent & Child name :" + Bm.name + ", " + Bm.children[i].name);
				Bm.children[i].name=Bm.children[i].name.replace(pattern, Bm.name+"$1");
			}
			SetParentToChildName(Bm.children[i], nLvlMax, nLevel+1, oDoc);
		}
	}
	return nCount;
}

var SortBookMarks=app.trustedFunction(function(oDoc)
{

app.beginPriv();

	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);

	if(nDepth > 0)	{
		SORTBkDlg.strTitle = "Contents " +oDoc.documentFileName.replace(/\.pdf$/i,"");
		SORTBkDlg.bAZ=false;
		SORTBkDlg.bParent=false;
		SORTBkDlg.bName=false;
		SORTBkDlg.bMinMax=false;
		SORTBkDlg.nLevel = SORTBkDlg.nLvlMax = nDepth.toString();
		SORTBkDlg.nPgMax = oDoc.numPages.toString();
		SORTBkDlg.nInsertAt = "1";
		SORTBkDlg.bSelected=false;
		
		if("ok" == app.execDialog(SORTBkDlg)){
			console.println("Sort A-Z : "+!SORTBkDlg.bAZ);
			
			var nNumBks = FindNumBks(oDoc.bookmarkRoot.children,100); // find number of bookmarks to arbitrary max level

			//console.println("Num bookmarks : " + nNumBks);

			 //set up the thermometer
			var thm = app.thermometer;
			thm.duration = nNumBks;

			var root = oDoc.bookmarkRoot;
		
			nCount=0;
			thm.text = "Sorting......";
//			thm.value = 0;
			thm.begin();
			Sort.oProg = app.thermometer;

			var AZ=!SORTBkDlg.bAZ;
			 //console.println(SORTBkDlg.bSelected);
			var y=Sort(oDoc.bookmarkRoot,SORTBkDlg.nLevel, 0, oDoc, AZ, SORTBkDlg.bSelected);  //sort the dated bookmarks
			 //ShiftFocus(oDoc);		
			 //console.println("Num sort : " + y);
			
			if(SORTBkDlg.bParent){
				nCount=0;
				thm.text = "Setting parent bookmarks to top child......";
				thm.value = 0;
				SetParentToChild(oDoc.bookmarkRoot,SORTBkDlg.nLevel, 0, oDoc, SORTBkDlg.bName);
			}
			
			if(SORTBkDlg.bName && !SORTBkDlg.bParent){
				nCount=0;
				thm.text = "Setting child names to parent's";
				thm.value = 0;
				SetParentToChildName(oDoc.bookmarkRoot,SORTBkDlg.nLevel, 0, oDoc);
			}
			
		
			if(SORTBkDlg.bMinMax){
				nCount=0;
				thm.text = "Getting min/max";
				thm.value = 0;
				GetMinMaxDates(oDoc.bookmarkRoot,0, SORTBkDlg.nLevel, oDoc); 
			}


			thm.end();  //close thermometer
		
			 //if(CheckForDuplicationsPage(oDoc)!=null)app.alert("Multiple bookmarks pointing to same page!");	
			app.alert("All sorted");
	}
}
		
app.endPriv();
		
});

var SORTBkDlg =
{
    strTitle:"",
    bAZ:false,
    bParent:false,
    bName:false,
    bMinMax: false,
    nLevel:"1",
	nLvlMax:"1",
	nPgMax:"2",
	nInsertAt:"2",
	bSelected:false,
    initialize: function(dialog)
    {
        var dlgInit = 
        {
            "nIns": this.nInsertAt,
            "nlvl": this.nLevel,
            "Titl": this.strTitle,
            "bPar": this.bParent,
            "bNam": this.bName,
            "bMin": this.bMinMax,
            "bSel": this.bSelected,
        };
		dlgInit[this.bAZ?"byAZ":"byDt"] = true;
        dialog.load(dlgInit);
    },
    commit: function(dialog)
    {
        var oRslt = dialog.store();
		this.bAZ = oRslt["byDt"];
		this.bParent=oRslt["bPar"];
		this.bName=oRslt["bNam"];
		this.bMinMax=oRslt["bMin"];
        this.strTitle = oRslt["Titl"];
        this.nLevel = oRslt["nlvl"];
        this.nInsertAt = oRslt["nIns"];
        this.bSelected=oRslt["bSel"];
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
        name: "Sorting Tool",
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
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "static_text",
                                        item_id: "sta1",
                                        name: "Number of Bookmark Levels to Include in Sort:",
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
                                    {
                                        type: "static_text",
                                        item_id: "sta2",
                                        name: "Sort: ",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "byAZ",
                                        name: "A-Z",
                                        variable_Name: "bAZ",
                                    },
                                    {
                                        type: "radio",
                                        group_id: "LbTy",
                                        item_id: "byDt",
                                        name: "Date",
                                    },
                                ]
                            },
 /*                           {
                                type: "view",
								alignment: "align_fill",
								align_children: "align_row",
                                elements:
                                [
                                    {
                                        type: "check_box",
                                        group_id: "LbTx",
                                        item_id: "bPar",
                                        name: "Set parent to top child",
                                        variable_Name: "bParent",
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
                                        group_id: "LbTx",
                                        item_id: "bNam",
                                        name: "Set child names to parent's",
                                        variable_Name: "bName",
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
                                        group_id: "LbTx",
                                        item_id: "bMin",
                                        name: "Get min/max dates of children",
                                        variable_Name: "bMinMax",
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
                                        group_id: "LbTx",
                                        item_id: "bSel",
                                        name: "Open bookmarks only",
                                        variable_Name: "bSelected",
                                    },
                                ]
                            },
*/														                            							
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


function GatherBkMks(Bm, nLvl, oDoc, array_bkmks)
{
	if(Bm.name!="Root"){
		oDoc.pageNum = 0;
		Bm.execute();
		var nTgtPage1 = oDoc.pageNum;
	   
		oDoc.pageNum = oDoc.numPages-1;
		Bm.execute();
		var nTgtPage2 = oDoc.pageNum;
		if(nTgtPage1==nTgtPage2){
			var bkmk_data={BkMk:Bm, n: 0, p: oDoc.pageNum};
			array_bkmks.push(bkmk_data);
		}
	}
	
	if(Bm.children!=null){
		for(var i=0; i<Bm.children.length; i++){
			GatherBkMks(Bm.children[i], nLvl+1, oDoc, array_bkmks);
		}
	}
}

 //compare bkmks according to page reference
function compareBkMksPage(a,b) {
  if (a.p < b.p)
     return -1;
  if (a.p > b.p)
    return 1;
  return 0;
}

 //compare bkmks according to label
function compareBkMksLabel(a,b) {

  if (LabelAlter(a) < LabelAlter(b))
     return -1;
  if (LabelAlter(a) > LabelAlter(b))
    return 1;
  return 0;

}

function LabelAlter(s){
	 //make the comparison case insensitive
	a=s.BkMk.name.toUpperCase(); 
	 //Remove []
	a=a.replace(pattern_toggle_page_label,"").trim();
	return a;	
}


function CheckForDuplicationsLabel(oDoc){
	 //returns array of duplicate bookmarks if duplicates found
	var array_bkmks=[];
	GatherBkMks(oDoc.bookmarkRoot, 0, oDoc, array_bkmks);
	for (var i=0; i<array_bkmks.length;i++) array_bkmks[i].n=i; //set the order

	array_bkmks.sort(compareBkMksLabel);  //sort the array by label

	if(array_bkmks.length>1){
		var last_bkmk=array_bkmks[0];
		var dup_array=[];
		var same_dups=[];
		var flag=false;
		var dup_flag=false;
		for(var i=1; i<array_bkmks.length;i++){
			if(LabelAlter(array_bkmks[i])==LabelAlter(last_bkmk)){
				 //we have bookmarks with same name
				 //console.println("Here");
				if(!flag) same_dups.push(last_bkmk);  //i.e. add the first matching bookmark just once
				flag=true;
				dup_flag=true;
				same_dups.push(array_bkmks[i]);  //i.e. add any subsequent matching bookmarks
			}else{		
				last_bkmk=array_bkmks[i];
				if(flag){
					 //var tmp={sm_dups: same_dups};
					 //console.println("Length same_dups : " + same_dups.length);
					 //for(var j=0;j<same_dups.length;j++)console.println(same_dups[j].BkMk.name);
					 //Add the same_dups to the dup_array
					dup_array[dup_array.length]=new Array(same_dups.length);
					for(var j=0;j<same_dups.length;j++){
						dup_array[dup_array.length-1][j]=same_dups[j];
					}
					 //console.println("Length of added same_dups : " + dup_array[dup_array.length-1].length);
					 //for(var j=0;j<dup_array[dup_array.length-1].length;j++){
					 //	console.println("Added :" + dup_array[dup_array.length-1][j].BkMk.name);
					 //}
					for(var j=0;j<=same_dups.length;j++) same_dups.pop();  //clear the array
					flag=false;
					 //console.println("Cleared length: " + same_dups.length);
				}
			}	
		}
	}
	if(dup_flag){
 //		for(var i=0;i<dup_array.length;i++){
 //			for(var j=0;j<dup_array[i].length;j++){
 //				console.println(dup_array[i][j].BkMk.name);
 //			}
 //		}
		return dup_array;
	}else{
		return null;
	}

}

function CheckForDuplicationsPage(oDoc)
{
	 //returns array of duplicate bookmarks if duplicates found
	var array_bkmks=[];
	GatherBkMks(oDoc.bookmarkRoot, 0, oDoc, array_bkmks);
	for (var i=0; i<array_bkmks.length;i++) array_bkmks[i].n=i; //set the order

	array_bkmks.sort(compareBkMksPage);  //sort the array by page refs
	
	 //for(var i=0;i<array_bkmks.length;i++){
	 //	a=array_bkmks[i];
	 //	console.println(a.BkMk.name + ", " + a.n + ", " + a.p);
	 //}


	if(array_bkmks.length>1){
		var last_bkmk=array_bkmks[0];
		var dup_array=[];
		var same_dups=[];
		var flag=false;
		var dup_flag=false;
		for(var i=1; i<array_bkmks.length;i++){
			if(array_bkmks[i].p==last_bkmk.p && Math.abs(array_bkmks[i].n-last_bkmk.n)>1){
				 //we have bookmark pointing to page of another not next to each other
				 //console.println("Here");
				if(!flag) same_dups.push(last_bkmk);  //i.e. add the first matching bookmark just once
				flag=true;
				dup_flag=true;
				same_dups.push(array_bkmks[i]);  //i.e. add any subsequent matching bookmarks
			}else{		
				last_bkmk=array_bkmks[i];
				if(flag){
					 //var tmp={sm_dups: same_dups};
					 //console.println("Length same_dups : " + same_dups.length);
					//for(var j=0;j<same_dups.length;j++)console.println(same_dups[j].BkMk.name);
					 //Add the same_dups to the dup_array
					dup_array[dup_array.length]=new Array(same_dups.length);
					for(var j=0;j<same_dups.length;j++){
						dup_array[dup_array.length-1][j]=same_dups[j];
					}
					 //console.println("Length of added same_dups : " + dup_array[dup_array.length-1].length);
					 //for(var j=0;j<dup_array[dup_array.length-1].length;j++){
					 //	console.println("Added :" + dup_array[dup_array.length-1][j].BkMk.name);
					 //}
					for(var j=0;j<=same_dups.length;j++) same_dups.pop();  //clear the array
					flag=false;
				}
			}	
		}
	}
	if(dup_flag){
 //		for(var i=0;i<dup_array.length;i++){
 //			for(var j=0;j<dup_array[i].length;j++){
 //				console.println(dup_array[i][j].BkMk.name);
 //			}
 //		}
		return dup_array;
	}else{
		return null;
	}
}

/*function GetDate_(Bm){
	 //this returns a date or null if no date
	var base_Dt=null;

	if(bk_date_pattern.test(Bm.name)==true){  //i.e. there is a date match
		var BkMkDate=Bm.name.match(bk_date_pattern);  //get the date
		var yy=Number(BkMkDate[BkMkDate.length-1].slice(-2));  //last two digits
 //		console.println("Date :"+ BkMkDate+" " + yy);
		if(yy<50){ //make it a year above 2000
			var d=BkMkDate[BkMkDate.length-1].replace(bk_date_pattern,"$2/$1/20$3");  //turn the numbers round for US date
		}else{ //make it a year after 1900
			var d=BkMkDate[BkMkDate.length-1].replace(bk_date_pattern,"$2/$1/19$3");  //turn the numbers round for US date			
		}
 //		console.println("Raw text :" + " " + d);
		Dt=new Date (d);
 //		console.println("Trans Date :"+ Dt);
		return Dt;		
	}else{
		return base_Dt;
	}
return base_Dt;	
}*/

function GetDateString(Dt)
{
	if(Dt==null)return "";
	 //returns string of date with padding
	var dd=Dt.getDate();
	var mm=Dt.getMonth()+1;
	var yy=Dt.getFullYear();
	 //d=util.printf("%02d",d);  //pad with any extra zeros

	var s=util.printf("%02d",dd.toString())+"/"+util.printf("%02d",mm.toString())+"/"+util.printf("%02d",yy.toString().slice(-2));
	return s;
}

function GetDayStrBkFromString(S, oDoc){
	//Returns day of the week for this bookmark assuming it points to an exact day
	 //console.println("GetDayStrBkFromString");
	 //console.println(oDoc.path);
	if(GetTimePartFromString(S)){ //special case where there is a time element - assume this points to particular day
		return GetDayStr(GetDateFromString(S, oDoc));
	}
	
	switch (GetDateFormatTypeFromString(S)){
		case "A":
		case "B":
		case "E":
		case "F": //only these patterns point to an exact day
		case "K":
		case "L":
			return GetDayStr(GetDateFromString(S, oDoc));
		default:
			return "";
	}
}


function GetDayStrBk(Bm, oDoc){
	return GetDayStrBkFromString(Bm.name, oDoc);
}

function GetDayStr(Dt){
	//returns the day of week
	switch (Dt.getDay()){
		case 0:
			return "Su";
		break;
		case 1:
			return "M";
		break;
		case 2:
			return "Tu";
		break;
		case 3:
			return "W";
		break;
		case 4:
			return "Th";
		break;
		case 5:
			return "F";
		break;
		case 6:
			return "Sa";
		break;
		default:
			//Shouldn't get here
			return "";
			console.println("Unable to return day of the week");
	}
	
}

var MinMaxFlag;

function MinMaxDatesPresent(Bm, nLvl, oDoc)
{
	 //returns true if minmaxdates present and wipes (...) from bookmark names
	var rep_pattern=/ \(.+\)/g
	if(Bm.name.match(rep_pattern)) {
		MinMaxFlag=true;
		Bm.name=Bm.name.replace(rep_pattern, "");
	}
	
	if(Bm.children!=null){
		for (var i=0; i<Bm.children.length; i++){
			MinMaxDatesPresent(Bm.children[i], nLvl+1, oDoc);
		}
	}
	return MinMaxFlag;	
}

function GetMinMaxDates(Bm, nLvl, nLvlMax, oDoc)
{
	nCount++;  //counter for the thermometer
	app.thermometer.value=nCount;
	if(app.thermometer.cancelled) return -1;  //exit if cancelled

 //	if(Bm.name.slice(0,1)=="*"){  //then we want the min and max of the childbookmarks
		if(Bm.children!=null && Bm.name!="Root"){
			var min_date=null;
			var max_date=null;
			for(var i=0;i<Bm.children.length;i++){
				console.println("Name " + Bm.children[i].name);
				var this_date=GetDate_(Bm.children[i]);
				console.println("Date " + this_date);
				if(this_date!=null){
					if(this_date<min_date || min_date==null) min_date=this_date;
					if(this_date>max_date || max_date==null) max_date=this_date;
				}
			}
			console.println("Min " + min_date);
			console.println("Max " + max_date);
			var min_dt=GetDateString(min_date);
			var max_dt=GetDateString(max_date);
			if(min_dt==null)min_dt="";
			if(max_dt==null)max_dt="";
			 //delete previous stuff between ()
			var rep_pattern=/ \(.+\)/g
			Bm.name=Bm.name.replace(rep_pattern, "");
			 //add the data
			Bm.name=Bm.name + " (" + min_dt + " to " + max_dt + ")";
		}
 //	}
	
	if(nLvl<nLvlMax && Bm.children!=null){
		for(var i=0; i<Bm.children.length;i++){
			GetMinMaxDates(Bm.children[i], nLvl+ 1,nLvlMax, oDoc);
		}
	}
}
 // // // // // // // // // // // // ///
 //
 //  This is the main function for sorting
 //  bookmarks by date
 //

var DoSORT_BKMKS = app.trustedFunction(function(oDoc,oDlg)
{
	if(!CheckPermitted())return;


	app.beginPriv();

	var Pg=oDoc.pageNum;  //note page number

	SortBookMarks(oDoc); //sort the bookmarks
	
	oDoc.pageNum=Pg;  //reset page number to where it started
	
 //    return nFound;
    return 0;
  app.endPriv();
});
 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strData7SORT_BKMKS = 
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002500000023000000000000000000000000000000000000000000000000000000100000005700000058000000580000005800000058000000460000000000000000000000000000000000000009000000e6000000e400000007000000000000000000000000000000000000000000000078000000ff000000ff000000ff000000ff000000ff000000ff0000001b00000000000000000000000000000071000000ff000000ff0000006c00000000000000000000000000000000000000000000000e000000520000005400000054000000bb000000ff0000009c00000000000000000000000000000009000000e8000000e3000000e8000000e500000007000000000000000100000004000000040000000000000000000000000000003e000000fd000000d20000000900000000000000000000000000000072000000ff0000006a00000071000000ff0000006d00000000000000b6000000ff000000ff0000005a0000000000000016000000e5000000f4000000280000000000000000000000000000000a000000e8000000f90000005f00000061000000fa000000e50000000800000068000000a8000000a60000002e00000002000000b9000000ff0000005b0000000000000000000000000000000000000073000000ff000000ff000000ff000000ff000000ff000000ff0000006e000000000000000000000000000000000000007a000000ff0000009b0000000000000000000000000000000000000009000000e9000000e300000054000000540000005400000054000000e6000000e60000000800000000000000000000003b000000fd000000ff000000b5000000ac000000ac0000009b0000000700000017000000eb000000600000000000000000000000000000000000000065000000e80000001300000000000000000000005d000000fa000000fc000000fc000000fc000000fc000000ea0000001300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconSORT_BKMKS = null;
 //if(app.viewerVersion < 7){
 //}else{
oIconSORT_BKMKS = {count: 0, width: 20, height: 20,
read: function(nBytes){return strData7SORT_BKMKS.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoCmdSORT_BKMKS = 
"DoSORT_BKMKS(event.target);"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oButObjSort_BkMks = 
{cName: "SORT_BKMKS",
cExec: DoCmdSORT_BKMKS,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
cMarked: "event.rc = false",
cTooltext: "Sort bookmarks by date or A-Z",
cLabel: "Sort bookmarks",
nPos: 1};
 //</JSCodeSnippet>
if(oIconSORT_BKMKS != null)
    oButObjSort_BkMks.oIcon = oIconSORT_BKMKS;

try{app.removeToolButton("SORT_BKMKS");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try
{
 //</JSCodeSnippet>
 //<JSCodeSnippet name="AddButtonfn">
    app.addToolButton(oButObjSort_BkMks);
 //</JSCodeSnippet>
// if((event.type == "Doc") && (app.viewerVersion >= 7))
//    global["SortBkMks_InDoc"] = "1:17:2011:17:55:45";
// else
//   global["SortBkMks_InDoc"] = "1:17:2011:17:55:45";
 //<JSCodeSnippet name="CatchAddBut">
}catch(e)
{
   if((global.bReportNameCollision != null) && (global.bReportNameCollision == true))
   {
    var strError = 'Cannot Install AcroButton "oButObjSort_BkMks"\n';
    strError += ':' + e.fileName + '\n';
    strError += 'Error: ' + e.name + '\n';
    strError += e.message + '\n';
    strError += 'Possible Name conflict';
    app.alert(strError,0,0,'AcroButton Error');
   }
}
 //</JSCodeSnippet>
 
 //</AcroButtons>




