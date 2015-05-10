
function loadMap(loadTitle) {
	// console.log("Loading Map: " + loadTitle);

	if (loadTitle != "")
	{
		var xmlDoc = loadXMLDoc('maps/' + loadTitle);

		var x = xmlDoc.documentElement.childNodes;
	
		var totalRows = parseInt(xmlDoc.getElementsByTagName("totalRows")[0].childNodes[0].nodeValue);
		var totalCols = parseInt(xmlDoc.getElementsByTagName("totalCols")[0].childNodes[0].nodeValue);
	
		document.getElementById("mapTitle").textContent 		= xmlDoc.getElementsByTagName("title")[0].childNodes[0].nodeValue;
		document.getElementById("mapSet").textContent 			= xmlDoc.getElementsByTagName("set")[0].childNodes[0].nodeValue;
		document.getElementById("mapUniverse").textContent 		= xmlDoc.getElementsByTagName("universe")[0].childNodes[0].nodeValue;
		document.getElementById("mapInOut").textContent 		= xmlDoc.getElementsByTagName("inout")[0].childNodes[0].nodeValue;
	
		if (xmlDoc.getElementsByTagName("specialRules").length > 0)
		{
			document.getElementById("mapSpecial").style.visibility = "visible";
			document.getElementById("mapSpecialRules").textContent 	= xmlDoc.getElementsByTagName("specialRules")[0].childNodes[0].nodeValue;
		}
		else
		{
			document.getElementById("mapSpecial").style.visibility = "hidden";
			document.getElementById("mapSpecialRules").textContent 	= "";
		}
	
		createGrid(totalRows, totalCols);
		//createOverlay();
		resetDropdowns(totalRows, totalCols);
		findCells(xmlDoc);
		showGrid(document.getElementById('toggleGrid'));
		showCoordinates(document.getElementById('toggleCoordinates'));
	}
}  // loadMap()

function processNodes(x, r, c)
{
	for (var i = 0; i < x.length; i++)
	{ 
		if (x[i].nodeType==1)
		{
			//Process only element nodes (type 1) 
			console.log(c + r + " " + x[i].nodeName + ": " + x[i].childNodes[0].nodeValue);
			if (x[i].childElementCount > 0)
			{
				var y = x[i].childNodes;
				processNodes(y, r, c);
			}
			
		} 
	}
}  // processNodes()

function findCells(x) {
	var cells = x.getElementsByTagName("cell");
	for (var i = 0; i < cells.length; i++)
	{
		var r = cells[i].attributes[0].nodeValue;
		var c = cells[i].attributes[1].nodeValue;
		var terrainType = cells[i].getElementsByTagName("terrain")[0].childNodes[0].nodeValue;
		var elevation   = cells[i].getElementsByTagName("elevated")[0].childNodes[0].nodeValue;
		var isWallNorth = cells[i].getElementsByTagName("north");
		var isWallSouth = cells[i].getElementsByTagName("south");
		var isWallEast  = cells[i].getElementsByTagName("east");
		var isWallWest  = cells[i].getElementsByTagName("west");
		var isIndoor    = cells[i].getElementsByTagName("indoor");
		var isSpecial	= cells[i].getElementsByTagName("special");
		
		//console.log(c + r + ": T:" + terrainType + " E:" + elevation);
		// +1 compensation for table headers
		var square = createSquare(r-1+1, (c.charCodeAt(0)-65+1));
		var isClear = true;

		if (elevation > 1) 
		{
			square.className += ' elevated' + elevation;
			isClear = false;
		}
			
		if (terrainType != "clear")
		{
			square.className += ' ' + terrainType;
			isClear = false;
		}
		
		if (isIndoor.length > 0)
		{
			square.className += ' indoor';
			if (isClear)
				square.className += ' indoorclear';
		}
		
		if (isSpecial.length > 0)
		{
			square.className += ' SPtype' + isSpecial[0].childNodes[0].nodeValue;
		}
		
		var totalRows = x.childNodes[0].getElementsByTagName("totalRows")[0].textContent;
		var totalCols = x.childNodes[0].getElementsByTagName("totalCols")[0].textContent;
		var totalColsAlpha = String.fromCharCode(65 + parseInt(totalCols) - 1);
		
		// do not apply walls to outermost edges
		if (isWallNorth.length > 0 && (r != "1"))
		{
			var wallType = isWallNorth[0].childNodes[0].nodeValue;
			square.className += ' north' + wallType;
		}
		if (isWallSouth.length > 0 && (r != totalRows))
		{
			var wallType = isWallSouth[0].childNodes[0].nodeValue;
			square.className += ' south' + wallType;
		}
		if (isWallEast.length > 0 && (c != totalColsAlpha))
		{
			var wallType = isWallEast[0].childNodes[0].nodeValue;
			square.className += ' east' + wallType;
		}
		if (isWallWest.length > 0 && (c != "A"))
		{
			var wallType = isWallWest[0].childNodes[0].nodeValue;
			square.className += ' west' + wallType;
		}
		
	}
}  // findCells()