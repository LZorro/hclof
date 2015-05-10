function resetDropdowns(rows, cols) {
	var attackCol = document.getElementById('attackCol');
	var attackRow = document.getElementById('attackRow');
	var targetCol = document.getElementById('targetCol');
	var targetRow = document.getElementById('targetRow');
	
	attackCol.innerHTML = attackRow.innerHTML = '';
	targetCol.innerHTML = targetRow.innerHTML = '';
		
	for (var i = 0; i < cols; i++)
	{
		var dropdownValue = document.createElement('option');
		dropdownValue.value = dropdownValue.textContent = String.fromCharCode(65 + i);
		attackCol.appendChild(dropdownValue);
		targetCol.innerHTML = attackCol.innerHTML; 
	}	
	for (var i = 0; i < rows; i++)
	{
		var dropdownValue = document.createElement('option');
		dropdownValue.value = dropdownValue.textContent = i + 1;
		attackRow.appendChild(dropdownValue);
		targetRow.innerHTML = attackRow.innerHTML; 
	}	
}  // resetDropdowns()

function init_map_buttons()
{
	var mainpage = document.getElementById("mainpage");
	var mdd = document.createElement('select');
	mdd.id = "mapDropdown";
	mdd.size = 5;
	mainpage.appendChild(mdd); 
		
	var mapIndex = loadXMLDoc("mapindex.xml");
	var mapItems = mapIndex.getElementsByTagName("map");
		
	for (var i = 0; i < mapItems.length; i++)
	{
		var mapItemValues = mapItems[i].children;
		var mapOption = document.createElement('option');
		mapOption.value = mapItemValues[0].textContent;
		mapOption.textContent = mapItemValues[1].textContent;
		mdd.appendChild(mapOption);		
	}
		
	var mapLoadButton = document.createElement('button');
	mapLoadButton.addEventListener('click', function(){
		resetPage(true);
		loadMap(mdd.options[mdd.selectedIndex].value);
	});	
	mapLoadButton.appendChild(document.createTextNode("Load Map"));
	mainpage.appendChild(mapLoadButton);
} // init_map_buttons()
	
function loadLibrary() 
{
	var library  = document.getElementById("library");
	var mapIndex = loadXMLDoc("maps/mapindex.xml");
	var mapItems = mapIndex.getElementsByTagName("map");
	
	// clean out existing library
	var numOptions = library.options.length;
	for (var o = 0; o < numOptions; o++)
	{
		library.remove(0);
	}
		
	for (var i = 0; i < mapItems.length; i++)
	{
		var mapOption = document.createElement('option');
		mapOption.textContent = mapItems[i].getElementsByTagName("title")[0].textContent;
		
		// include terrain stats to option value, to be parsed later
		mapOption.value = mapItems[i].getElementsByTagName("filename")[0].textContent;
		if (mapItems[i].getElementsByTagName("h").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("h")[0].textContent + "H";
		else
			mapOption.value += " 0%H";	
			
		if (mapItems[i].getElementsByTagName("b").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("b")[0].textContent + "B";
		else
			mapOption.value += " 0%B";				
			
		if (mapItems[i].getElementsByTagName("wall").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("wall")[0].textContent + "L";
		else
			mapOption.value += " 0%L";	
			
		if (mapItems[i].getElementsByTagName("e").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("e")[0].textContent + "E";
		else
			mapOption.value += " 0%E";	
		
		if (mapItems[i].getElementsByTagName("w").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("w")[0].textContent + "W";
		else
			mapOption.value += " 0%W";	
		
		if (mapItems[i].getElementsByTagName("s").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("s")[0].textContent + "S";
		else
			mapOption.value += " 0%S";	
		
		if (mapItems[i].getElementsByTagName("i").length > 0)
			mapOption.value += " " + mapItems[i].getElementsByTagName("i")[0].textContent + "I";
		else
			mapOption.value += " 0%I";	
			
		// also include set name
		if (mapItems[i].getElementsByTagName("set").length > 0)
			mapOption.value += ' ' + mapItems[i].getElementsByTagName("set")[0].textContent;
			
		// filter
		//  -universe
		var universeCheck = 'filter' + mapItems[i].getElementsByTagName("universe")[0].textContent;
		var uniCheckBox = document.getElementById(universeCheck);
		var uniPassed = false;
		if (uniCheckBox.checked)
			uniPassed = true;
				
		//  -indoor/outdoor
		var indoorCheck = mapItems[i].getElementsByTagName("inout")[0].textContent.indexOf("Indoor");
		var outdoorCheck = mapItems[i].getElementsByTagName("inout")[0].textContent.indexOf("Outdoor");
		var indoorCheckBox = document.getElementById("filterIndoor");
		var outdoorCheckBox = document.getElementById("filterOutdoor");
		var inoutPassed = false;
		if ((indoorCheck > -1 && indoorCheckBox.checked) || (outdoorCheck > -1 && outdoorCheckBox.checked))
			inoutPassed = true;
				
		//  -Modern Age
		var agePassed = true;
		var ageCheckBox = document.getElementById("filterModern");
		if (ageCheckBox.checked)
		{
			var ageCheck = mapItems[i].getElementsByTagName("age");
			if (ageCheck.length > 0)
			{
				if (ageCheck[0].textContent == "Modern")
					agePassed = true;
				else
					agePassed = false;
			}
			else
				agePassed = false; 
		}
		
		//  -map size
		var standardsizeCheck = mapItems[i].getElementsByTagName("size")[0].textContent.indexOf("16x24");
		var largesizeCheck = mapItems[i].getElementsByTagName("size")[0].textContent.indexOf("24x24");
		var tinysizeCheck = mapItems[i].getElementsByTagName("size")[0].textContent.indexOf("9x16");
		var standardsizeCheckBox = document.getElementById("filter1624");
		var largesizeCheckBox = document.getElementById("filter2424");
		var tinysizeCheckBox = document.getElementById("filter916");
		var sizePassed = false;
		if ((standardsizeCheck > -1 && standardsizeCheckBox.checked) 
			|| (largesizeCheck > -1 && largesizeCheckBox.checked)
			|| (tinysizeCheck > -1  && tinysizeCheckBox.checked))
			sizePassed = true;
			
		// finished - if it passed everything, it goes on the list
		if (uniPassed && inoutPassed && agePassed && sizePassed)
			library.appendChild(mapOption);
	}

	// sort, if applicable
	if (document.getElementById("filterAlpha").checked)
		sortLibrary('alpha');
	else if (document.getElementById("filterDefault").checked)
		sortLibrary('default');
}  // loadLibrary()
	
function sortLibrary(sortStyle)
{
	// uncheck radio buttons so they can go back to default/alpha
	if (sortStyle != 'alpha' && sortStyle != 'default')
	{
		var sortRadio = document.getElementsByName("sort");
		for (var x = 0; x < sortRadio.length; x++)
		{
			sortRadio[x].checked = false;
		}
	}
		
	// highlight cell so we know what we're looking at
	var sortButtons = document.getElementById("loadStatsBox");
	for (var y = 0; y < 7; y++)
	{
		if (sortButtons.rows[0].cells[y].className.indexOf("highlight") > -1)
			sortButtons.rows[0].cells[y].className = sortButtons.rows[0].cells[y].className.substr('', sortButtons.rows[0].cells[y].className);
			sortButtons.rows[1].cells[y].textContent = '';
	}
	switch(sortStyle)
	{
		case "H":
			sortButtons.rows[0].cells[0].className += "highlight";
			break;
		case "B":
			sortButtons.rows[0].cells[1].className += "highlight";
			break;
		case "L":
			sortButtons.rows[0].cells[2].className += "highlight";
			break;
		case "E":
			sortButtons.rows[0].cells[3].className += "highlight";
			break;
		case "W":
			sortButtons.rows[0].cells[4].className += "highlight";
			break;
		case "S":
			sortButtons.rows[0].cells[5].className += "highlight";
			break;
		case "I":
			sortButtons.rows[0].cells[6].className += "highlight";
			break;
	}				
	
	var library = document.getElementById("library");
	var tmpAry = new Array();
	for (var i = 0; i < library.options.length; i++)
	{
		tmpAry[i] = new Array();
		tmpAry[i][0] = library.options[i].text;
		tmpAry[i][1] = library.options[i].value;
	}
		
	// determine the kind of sort that will happen
	var sortFunction = function (a,b)
	{
		var aNum, bNum;
		if (sortStyle == "H")
		{
			aNum = a[1].substr(a[1].indexOf(".xml ") + 5, a[1].indexOf("%H") - (a[1].indexOf(".xml ") + 5));
			bNum = b[1].substr(b[1].indexOf(".xml ") + 5, b[1].indexOf("%H") - (b[1].indexOf(".xml ") + 5));
		}
		else if (sortStyle == "B")
		{
			aNum = a[1].substr(a[1].indexOf("%H") + 3, a[1].indexOf("%B") - (a[1].indexOf("%H") + 3));
			bNum = b[1].substr(b[1].indexOf("%H") + 3, b[1].indexOf("%B") - (b[1].indexOf("%H") + 3));
		}
		else if (sortStyle == "L")
		{
			aNum = a[1].substr(a[1].indexOf("%B") + 3, a[1].indexOf("%L") - (a[1].indexOf("%B") + 3));
			bNum = b[1].substr(b[1].indexOf("%B") + 3, b[1].indexOf("%L") - (b[1].indexOf("%B") + 3));
		}
		else if (sortStyle == "E")
		{
			aNum = a[1].substr(a[1].indexOf("%L") + 3, a[1].indexOf("%E") - (a[1].indexOf("%L") + 3));
			bNum = b[1].substr(b[1].indexOf("%L") + 3, b[1].indexOf("%E") - (b[1].indexOf("%L") + 3));
		}
		else if (sortStyle == "W")
		{
			aNum = a[1].substr(a[1].indexOf("%E") + 3, a[1].indexOf("%W") - (a[1].indexOf("%E") + 3));
			bNum = b[1].substr(b[1].indexOf("%E") + 3, b[1].indexOf("%W") - (b[1].indexOf("%E") + 3));
		}
		else if (sortStyle == "S")
		{
			aNum = a[1].substr(a[1].indexOf("%W") + 3, a[1].indexOf("%S") - (a[1].indexOf("%W") + 3));
			bNum = b[1].substr(b[1].indexOf("%W") + 3, b[1].indexOf("%S") - (b[1].indexOf("%W") + 3));
		}
		else if (sortStyle == "I")
		{
			aNum = a[1].substr(a[1].indexOf("%S") + 3, a[1].indexOf("%I") - (a[1].indexOf("%S") + 3));
			bNum = b[1].substr(b[1].indexOf("%S") + 3, b[1].indexOf("%I") - (b[1].indexOf("%S") + 3));
		}	
		return bNum - aNum;
	};

	if (sortStyle == 'alpha')
		tmpAry.sort();
	else 
		tmpAry.sort(sortFunction);
		
	while (library.options.length > 0) 
	{
		library.options[0] = null;
    }
	for (var j = 0; j < tmpAry.length; j++)
	{
		var op = new Option(tmpAry[j][0], tmpAry[j][1]);
		library.options[j] = op;
	}
 
	return;
}  // sortLibrary()
	
function loadMapDetails()
{
	var library = document.getElementById("library");
	resetPage(true);
	transferStats(true);
	if (library.selectedIndex > -1)
	{
		var mapFilename = library.options[library.selectedIndex].value;
		
		loadMap(mapFilename.substr(0, mapFilename.indexOf(' ')));
	}
}  // loadMapDetails()
	
function showGrid(val)
{
	var grid = document.getElementsByTagName('td');
	var setTo;
	if (val.checked)
		setTo = "1px";
	else
		setTo = "0px";
			
	for (var i = 0; i < grid.length; i++)
	{
		if (grid[i].id == 'grid')
		{
			if (grid[i].className.indexOf('north') == -1)
				grid[i].style.borderTopWidth = setTo;
			if (grid[i].className.indexOf('south') == -1)
				grid[i].style.borderBottomWidth = setTo;
			if (grid[i].className.indexOf('east') == -1)
				grid[i].style.borderRightWidth = setTo;
			if (grid[i].className.indexOf('west') == -1)
				grid[i].style.borderLeftWidth = setTo;
		}
	}
}  // showGrid()

function showCoordinates(val)
{
	var grid = document.getElementsByTagName('td');
			
	for (var i = 0; i < grid.length; i++)
	{
		if (grid[i].id == 'grid')
		{
			if (val.checked)	
				grid[i].style.fontSize = "13px";
			else
				if (grid[i].className.indexOf('clicked') == -1 || grid[i].className.indexOf('wiggle') == -1)
					grid[i].style.fontSize = "0px";
		}
	}
}  // showCoodrinates()
	
function loadStats()
{
	var library  = document.getElementById("library")
	var statsBox = document.getElementById("loadStatsBox");
	var title 	 = document.getElementById("loadmapSet");
		
	var statsArray = new Array(7);
	var mapStats = library.options[library.selectedIndex].value;
	var lastIndex = mapStats.indexOf(".xml") + 5;
	statsArray[0] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%H") - lastIndex));
	lastIndex = mapStats.indexOf("%H")+3;
	statsArray[1] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%B") - lastIndex));
	lastIndex = mapStats.indexOf("%B")+3;
	statsArray[2] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%L") - lastIndex));
	lastIndex = mapStats.indexOf("%L")+3;
	statsArray[3] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%E") - lastIndex));
	lastIndex = mapStats.indexOf("%E")+3;
	statsArray[4] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%W") - lastIndex));
	lastIndex = mapStats.indexOf("%W")+3;
	statsArray[5] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%S") - lastIndex));
	lastIndex = mapStats.indexOf("%S")+3;
	statsArray[6] = parseInt(mapStats.substr(lastIndex, mapStats.indexOf("%I") - lastIndex));
	lastIndex = mapStats.indexOf("%I")+3;
	title.textContent = mapStats.substr(lastIndex);
		
	if (library.selectedIndex > -1)
	{
		for (var i = 0; i < statsArray.length; i++)
		{
			if (statsArray[i] > 0) 
				statsBox.rows[1].cells[i].textContent = statsArray[i] + "%"; 
			else
				statsBox.rows[1].cells[i].textContent = "";
		}
	}
}  // loadStats()
	
function transferStats()
{
	var statsBox = document.getElementById("loadStatsBox");
	var mainBox = document.getElementById("mainStatsBox");
		
	for (var i = 0; i < statsBox.rows[1].cells.length; i++)
	{
		mainBox.rows[1].cells[i].textContent = statsBox.rows[1].cells[i].textContent;
	}
}  // transferStats();