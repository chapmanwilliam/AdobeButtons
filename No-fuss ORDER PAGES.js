
 //
var nCurPage = 0;  //the insertion point
var BkMks=new Array();  //new array to store all the bookmarks
var counter_order_thm=0;
 //
 // Recursive function to build page list order from current bookmark order
 //
function OrderPagesMain(oDoc, bm, bStart){
<<<<<<< HEAD
	if(!CheckPermitted())return;
=======
	if(!CheckLicence())return;
>>>>>>> 9a8c3ab (first commit)

	 //console.println("Main");
	BkMks.length=0;  //Clear the array
	var nDepth = FindMaxBkDepth(oDoc.bookmarkRoot);
	var n = FindNumBks(oDoc.bookmarkRoot.children,nDepth);
	app.thermometer.duration=n;
	app.thermometer.begin();
	counter_order_thm=0;
	FillArray(oDoc, bm, bStart, n, true);  //Fill it with bookmarks info
	app.thermometer.end();
	SortThingsOut(oDoc);  //Do a few sort routines
	MoveThePages(oDoc);  //Move the pages into position
	DoREFRESH(oDoc); //update everything
}


function FillArray(oDoc, bm, bStart, n, bSkipItalicised=false){

	 //console.println("FillArray");
	 //console.println(bm.name);

	counter_order_thm=counter_order_thm+1;
	app.thermometer.value=counter_order_thm;
	x=Math.round(counter_order_thm/n * 100);
	app.thermometer.text="Getting bookmark info " + x + "%";
	 //Recursive function to iterate thro' bookmarks and add them to BkMks[]
	if(bm.name=="Root" || (bSkipItalicised && bm.style==1)){
 //		console.println("Start");
	}else{

		 //First: run through the childbookmarks to get their page references and store in array
		 //Create a new object that adds properties to the childbookmarks
		bm.execute();
		var p=oDoc.pageNum;
		var l=getLengthDoc(bm.name);
		var e=0;
		if(l)e=(p+l)-1;
		//console.println("Page end: " + e);
		var ext;
		color.equal(bm.color,color.black) ? ext=false : ext=true; //flags non-black bookmarks
		var lnk;
		bm.style==2 ? lnk =true: lnk=false; //flags bookmarks in bold for linking

		var old_name=bm.name; //store the old name
		var new_name;
		console.println(bm.name);

		bm.name=RemoveLegalNumThis(bm);  //remove legal numbering
		bm.name=RemovePageLabel(bm);	 //strip []
		bm.name=RemoveBrackets(bm); //strip ()
		bm.name=RemoveBraces(bm);	 //strip {}
		bm.name=MoveDateToStart(bm,oDoc); //moves the date to the start
		new_name=bm.name;
		new_name=new_name.replace("/", "-");//replace forward slashes with - to avoid folder confusion
		console.println("New name " + new_name);
		bm.name=old_name; //put the name back
		
		var BkMk={Name: new_name, OK: true, Order: BkMks.length, PageRef:p, PageEnd:e, Chunk: 0, extract: ext, Link: lnk, Lvl: bStart, page_label: oDoc.getPageLabel(p)};
		BkMks.push(BkMk);
		 //console.println(BkMks[BkMks.length-1].Order + " " + BkMks[BkMks.length-1].PageRef + " " + BkMks[BkMks.length-1].Chunk);
	}

	if (bm.children != null && !(bSkipItalicised && bm.style==1)){
		 // if bm has children call recursively
		for (var i = 0; i < bm.children.length; i++)  	  
  			FillArray(oDoc, bm.children[i], bStart+1,n, bSkipItalicised);
		}
	app.thermometer.end();
}

function CheckParentChild(oDoc, BkMk){  //Check that a child does not point to the same page as the parent: if it does set the parent to point to same page as first child



/*

	if(BkMk.children!=null){
		 //run through the children and check if they point to same page as parent
		BkMk.execute();
		var parent_page=oDoc.pageNum;
		for(i=0;i++;i<BkMk.children.length){
			BkMk.children[i].execute();
			var child_page=oDoc.pageNum;
			if(child_page==parent_page){
				MakeBkMksPointSamePage(BkMk, BkMk.children[0]);  //make parent point to same page as the first child
			}	
		}
		CheckParentChild(BkMk);
	}
*/
}

function MakeBkMksPointSamePage(BkMkA, BkMkB){
}


function SortThingsOut(oDoc){

	 //console.println("SortThingsOut");
	 //Sort the array in ascending order according to the pages the bookmarks point to
	BkMks.sort(
		function(a,b){
			return a.PageRef-b.PageRef
		}
	)

	 //Now calculate the chunk sizes
	for (var i=0;i<BkMks.length; i++){
		if(i<BkMks.length-1){
			BkMks[i].Chunk=BkMks[i+1].PageRef-BkMks[i].PageRef
			BkMks[i].PageEnd=BkMks[i+1].PageRef;
		}else{  //this is the last bookmark
			BkMks[i].Chunk=oDoc.numPages-BkMks[i].PageRef	
			BkMks[i].PageEnd=oDoc.numPages-1;
		}
	}

	nCurPage=BkMks[0].PageRef  //sets the starting point for insertion at the first bookmark pageref
	 //console.println("Initial insertion point: " + nCurPage);

	 //Now re-sort the array of bookmarks in the order they appear
	BkMks.sort(
		function(a,b){
			return a.Order-b.Order
		}
	)

}

function MoveThePages (oDoc){

	 //console.println("MoveThePages");

	app.thermometer.duration=BkMks.length;
	app.thermometer.begin();

	 //Now move the pages to the right place for the bookmarks
	for (var i=0; i<BkMks.length; i++){
		 //console.println(BkMks[i].Name + "- before");
		 //PrintResults();
		app.thermometer.value=i;
		app.thermometer.text="Moving bookmark chunk " + i + " of " + BkMks.length;
		 //console.println("Moving bookmark chunk " + i + " of " + BkMks.length);
		if(BkMks[i].PageRef>nCurPage){	 //i.e. it needs moving
 //			console.println("Moving " + BkMks[i].Name);
			var pagetomove=BkMks[i].PageRef;
    		var NewPageRef=nCurPage;
    		for(var j=0;j<BkMks[i].Chunk;j++){
	    		oDoc.movePage(pagetomove,nCurPage-1);
	    		pagetomove++
	    		nCurPage++
			}
			
			 //Increase the pageref for other bookmarks by the chunksize
			 //where there has been a jumping of the queue
			if(i<BkMks.length-1){
				for (var k=i+1;k<BkMks.length;k++){
					if(BkMks[i].PageRef>BkMks[k].PageRef){ //i.e. a queue jump
						BkMks[k].PageRef=BkMks[k].PageRef+BkMks[i].Chunk;
					}
				}
			}
			 //Reset the pageref for the BkMk we have moved
			BkMks[i].PageRef=NewPageRef
			
		}else{
			 //If BkMk doesn't need moving we need to increase the insertion point
			 //console.println("Increasing insertion point by: " + BkMks[i].Chunk);
			nCurPage=nCurPage+BkMks[i].Chunk;
		}	
		 //console.println(BkMks[i].Name + "- after");
		 //PrintResults();
		
	}

	app.thermometer.end();
	 //console.println("Final Results");
	 //PrintResults();
	
}

function PrintResults(){
	 //Print out results
	console.println("Insertion point: " + nCurPage);
	for (var i=0; i<BkMks.length;i++){
		console.println(BkMks[i].Name + " " + BkMks[i].Order + " " + BkMks[i].PageRef + " " + BkMks[i].Chunk);
	}
}



 //</CodeAbove>

 //<JSCodeSnippet name="ImageData7">
var strWJOrdertoPgsBtn = 
"000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000090000009100000043000000000000000000000033000000a8000000ac000000ac000000ac000000ac000000ac000000ac000000ac000000000000000000000000000000000000000000000009000000ba000000ff000000f7000000460000000000000055000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000ff0000004d00000015000000000000000000000009000000ba000000ff00000099000000f2000000f700000045000000000000007a000000ff000000e90000005c0000005400000054000000c7000000ff000000d7000000d50000001600000009000000ba000000ff0000007a000000000000006c000000ff000000ec0000000000000000000000ac000000ff000000a10000000000000000000000ac000000ff000000d8000000ff000000d5000000bc000000ff00000079000000000000003b000000f2000000fe000000650000000000000047000000f8000000e9000000290000000100000006000000ac000000ff000000d8000000f6000000ff000000ff00000078000000000000003b000000f3000000fe000000650000000000000043000000f7000000eb0000002c0000000000000095000000b1000000b0000000ff000000d8000000a80000008700000078000000000000003c000000f3000000fe00000065000000000000003f000000f5000000ed0000002f0000000000000090000000ff000000ff000000fd000000ff000000d8000000a800000000000000000000003c000000f3000000fe000000650000000000000029000000f4000000ef00000032000000000000008c000000ff000000d2000000b9000000ff000000fd000000d8000000a8000000000000000000000079000000ff000000e300000016000000000000002e000000f8000000f20000003900000087000000ff000000d10000001400000008000000b8000000fa000000d8000000d5000000840000008400000084000000e1000000ff000000d3000000150000000000000048000000f8000000f9000000ff000000d10000001400000000000000000000000800000053000000d8000000ff000000ff000000ff000000ff000000ff000000ff000000ff000000a9000000000000000000000048000000f8000000d000000013000000000000000000000000000000000000000000000021000000280000002800000028000000280000002800000028000000270000000b000000000000000000000000000000220000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
 //</JSCodeSnippet>


 // Icon Generic Stream Object
 //<JSCodeSnippet name="ButtonIconDef">
var oIconWJBMOrdertoPgsBtn = {count: 0, width: 20, height: 20,
read: function(nBytes){return strWJOrdertoPgsBtn.slice(this.count, this.count += nBytes);}};
 //}
 //</JSCodeSnippet>

 //<JSCodeSnippet name="EventCode">
var DoWJOrdertoPgsBtn = 
"OrderPagesMain(this, this.bookmarkRoot, \"R\", 0);\n"
 //</JSCodeSnippet>

 //<JSCodeSnippet name="ButtonObjDef">
var oWJBMOrdertoPgsBtn = 
{cName: "WJBMOrdertoPgs",
cExec: DoWJOrdertoPgsBtn,
cEnable: "event.rc = (app.doc != null) && (app.doc.bookmarkRoot) && app.doc.bookmarkRoot.children && (app.doc.bookmarkRoot.children.length > 0)",
cMarked: "event.rc = false",
cTooltext: "Order pages according to bookmark order",
cLabel: "Order pages",
oIcon:oIconWJBMOrdertoPgsBtn,
nPos: 1};
 //</JSCodeSnippet>

try{app.removeToolButton("WJBMOrdertoPgs");}catch(e){}

 //<JSCodeSnippet name="TryAddBut">
try{ app.addToolButton(oWJBMOrdertoPgsBtn);}catch(e){}
 //</JSCodeSnippet>
 
 //</AcroButtons>
