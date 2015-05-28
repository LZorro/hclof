function writeFile()
{
	var textFile = null;
	var makeTextFile = function (text) 
	{
		var data = new Blob([text], {type: 'text/plain'});

		// If we are replacing a previously generated file we need to
		// manually revoke the object URL to avoid memory leaks.
		if (textFile !== null) {
			window.URL.revokeObjectURL(textFile);
		}

		textFile = window.URL.createObjectURL(data);

		return textFile;
	};


	var filename = document.getElementById('fileName').value;
	if (!filename)
		filename = "!newmap.xml";
	if (filename.indexOf(".xml") == -1)
		filename += ".xml";
		
	var xmlText = createXMLText();

	var link = document.getElementById('downloadlink');
	link.href = makeTextFile(xmlText);
	link.style.display = 'block';
	link.innerHTML = filename;
	link.download = filename; 
	
	//var fh = fopen("C:\\Users\Tim Volpe\Documents\GameDev\Heroclix_LoF\MyFile.txt", 3);
	// Open the file for writing
}

function createXMLText()
{
	var grid = document.getElementsByClassName("grid");
	var rows = parseInt(document.getElementById("rows").value);
	var cols = parseInt(document.getElementById("columns").value);
	var gridrow, gridcol;
	var square;
	var tempsquare;
	var borderIndex;
	
	var text;
	var temptext;
	var tempterrain;
	// header and opening tags
	text = "<?xml version='1.0' encoding='us-ascii'?>\n\n";
	text += "<library>\n";
	text += "\t<map>\n";
	
	// build meta information
	text += "\t\t<universe>" + document.getElementById("mapUniverse").value + "</universe>\n";
	text += "\t\t<title>" + document.getElementById("mapTitle").value + "</title>\n";
	text += "\t\t<set>" + document.getElementById("mapSet").value + "</set>\n";
	text += "\t\t<inout>" + document.getElementById("mapInOut").value + "</inout>\n";
	text += "\t\t<totalRows>" + rows + "</totalRows>\n";
	text += "\t\t<totalCols>" + cols + "</totalCols>\n";
	if (document.getElementById("mapSpecialRules").value)
		text += "\t\t<specialRules>" + document.getElementById("mapSpecialRules").value + "</specialRules>\n";
		
	// build map data	
	text += "\t\t<tile>\n";
	
	for (var r = 1; r < rows+1; r++)
	{
		text += "\t\t\t<row>\n";
		for (var c = 1; c < cols+1; c++)
		{
			gridrow = ((r-1)*3)+1;
			gridcol = ((c-1)*3)+1;
			square = grid[0].rows[gridrow].cells[gridcol];
		
			text += "\t\t\t\t<column>\n";
			text += "\t\t\t\t\t<cell row=\'" + r + "\' col=\'" + String.fromCharCode(64 + c) + "\'>\n";
			
			//determine square's terrain type
			text += "\t\t\t\t\t\t<terrain>";
			if (square.className.indexOf("hindering") > -1)
				tempterrain = "hindering";
			else if (square.className.indexOf("blocking") > -1)
				tempterrain = "blocking";
			else if (square.className.indexOf("water") > -1)
				tempterrain = "water";
			else if (square.className.indexOf("special") > -1)
				tempterrain = "special";
			else if (square.className.indexOf("start") > -1)
				tempterrain = "start";
			else
				tempterrain = "clear";
			text += tempterrain;
			text += "</terrain>\n";
			
			//determine square's elevation
			text += "\t\t\t\t\t\t<elevated>";
			text += square.innerHTML[0];
			text += "</elevated>\n";
			
			// if square has a north border
			if (r > 1) // ignore top edge
			{
				tempsquare = grid[0].rows[gridrow-1].cells[gridcol];
				borderIndex = tempsquare.className.indexOf("border");
				if (borderIndex > -1)
				{
					temptext = tempsquare.className.substr(borderIndex+6);
					if (temptext == "indoorclear")
						temptext = "indoor";
					text += "\t\t\t\t\t\t<north>" + temptext + "</north>\n";
				}
			}
			
			// if square has a east border
			if (c < cols) // ignore top edge
			{
				tempsquare = grid[0].rows[gridrow].cells[gridcol+1];
				borderIndex = tempsquare.className.indexOf("border");
				if (borderIndex > -1)
				{
					temptext = tempsquare.className.substr(borderIndex+6);
					if (temptext == "indoorclear")
						temptext = "indoor";
					text += "\t\t\t\t\t\t<east>" + temptext + "</east>\n";
				}	
			}
			
			// if square has a west border
			if (c > 1) // ignore top edge
			{
				tempsquare = grid[0].rows[gridrow].cells[gridcol-1];
				borderIndex = tempsquare.className.indexOf("border");
				if (borderIndex > -1)
				{
					temptext = tempsquare.className.substr(borderIndex+6);
					if (temptext == "indoorclear")
						temptext = "indoor";
					text += "\t\t\t\t\t\t<west>" + temptext + "</west>\n";
				}
			}
			
			// if square has a south border
			if (r < rows) // ignore top edge
			{
				tempsquare = grid[0].rows[gridrow+1].cells[gridcol];
				borderIndex = tempsquare.className.indexOf("border");
				if (borderIndex > -1)
				{
					temptext = tempsquare.className.substr(borderIndex+6);
					if (temptext == "indoorclear")
						temptext = "indoor";
					text += "\t\t\t\t\t\t<south>" + temptext + "</south>\n";
				}
			}
			
			// if square is marked indoor, put it here
			if (square.innerHTML.indexOf("I") > -1)
			{
				text += "\t\t\t\t\t\t<indoor></indoor>\n";
			}
			
			// Special Terrain type
			if (tempterrain == "special")
			{
				var spterrain = document.getElementById("SPType").value;
				if (spterrain != "C")
				{
					text += "\t\t\t\t\t\t<special>" + spterrain + "</special>\n";
				}
			}
			
			// close out the tags
			text += "\t\t\t\t\t</cell>\n";
			text += "\t\t\t\t</column>\n";
		}
		text += "\t\t\t</row>\n";
	}
		
	// close out tags
	text += "\t\t</tile>\n";
	text += "\t</map>\n";
	text += "</library>\n";
	
	return text;
}