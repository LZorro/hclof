range = 0;

/**
	* Starts the Line of Fire process
	* Called when LINE button is clicked on Select Points panel
*/	
function getSquares() {
	// clears page of any previously highlighted LoF
	resetPage(false);
	
	// gets values from Select Points panel
	var ac = document.getElementById("attackCol");
	var ar = document.getElementById("attackRow");
	var tc = document.getElementById("targetCol");
	var tr = document.getElementById("targetRow");
	var acVal = ac.options[ac.selectedIndex].text;
	var arVal = ar.options[ar.selectedIndex].text;
	var tcVal = tc.options[tc.selectedIndex].text;
	var trVal = tr.options[tr.selectedIndex].text;
	
	// +1 offsets to compensate for the table headers
	var acNum = acVal.charCodeAt(0) - 65 + 1;
	var arNum = parseInt(arVal) - 1 + 1;
	var tcNum = tcVal.charCodeAt(0) - 65 + 1;
	var trNum = parseInt(trVal) - 1 + 1;
	
	var width = Math.abs(acNum - tcNum) + 1;
	var height = Math.abs(arNum - trNum) + 1;
						
	var gridtable = document.getElementsByClassName('grid');
	//var attackSquare = gridtable[0].rows[arNum].cells[acNum];
	var attackSquare = createSquare(arNum, acNum);
	//var targetSquare = gridtable[0].rows[trNum].cells[tcNum];
	var targetSquare = createSquare(trNum, tcNum);

	// highlights all squares of the LoF
	plotLine(arNum, acNum, trNum, tcNum); 
	// highlights start (attacker) and end (target) squares
	attackSquare.gridSquare.className += ' attacker';
	targetSquare.gridSquare.className += ' target';
			
	document.getElementById("result").value = acVal + arVal + " (e" + attackSquare.elevation + ") to " + tcVal + trVal + " (e" + targetSquare.elevation + ") , a " 
		+ width + "x" + height + " box." + ", a range of " + range;

	isCrossedSpecial = false;
		
	// calculates the type of line (hindered, blocking, etc.) - result written to Line of Fire is: line 
	determineLoF(attackSquare, targetSquare);
	
}  // getSquares()

/**
	* Steps through the squares listed in the LoF and calculates its outcome
*/		
function determineLoF(atkSquare, tarSquare)
{
	var resultTA = document.getElementById('lofResult');
	var lastSquare;
	var useSquare = {};
	var currentSquare;
	var crossSquare;
	var oppositeSquare;
	var lowerSquare;
	var upperSquare;
	var highestLoFType = 0;
	var isDiagonal = false;
	var elevationChange = false;
	var tempTerrainLine;
	var reason = "";
	
	elevationChange = (atkSquare.elevation != tarSquare.elevation);  // keep track if there is an overall change in elevation
	
	// step through the traversal list (created in plotLine()), comparing each square to the next one in line
	lastSquare = atkSquare;
	for (var i = 0; i < traversalList.length; i++)
	{
		// if there is a crosssquare present, this is a diagonal pairing...
		if (traversalList[i].crosssquare != "")
		{
			crossSquare = traversalList[i].crosssquare;
			oppositeSquare = traversalList[i].square;
			currentSquare = traversalList[i+1].square;		// cheat by looking at the diagonal square ahead (it will be there)
			isDiagonal = true;
			
			// make considerations based on the diagonals squares we're passing through
			
			// useSquare becomes the proper amalgation of the two (we only really care about terrain and elevation, so not all the information will get copied over)
			// 	terrain is whichever is less restrictive	
			useSquare = {};
			useSquare.terrain = (terrainNumber(oppositeSquare.terrain) < terrainNumber(crossSquare.terrain)) ? oppositeSquare.terrain : crossSquare.terrain;
			
			// elevation: if they're the same, great, use it, otherwise use the lower one
			useSquare.elevation = (oppositeSquare.elevation <= crossSquare.elevation) ? oppositeSquare.elevation : crossSquare.elevation;
	
			// indoor: if either one is indoor, it's indoor
			useSquare.isIndoor = (oppositeSquare.isIndoor || crossSquare.isIndoor);
			
			// special: in case we're crossing special terrain (to make adding text to the final result easier)
			useSquare.isSpecial = (oppositeSquare.isSpecial || crossSquare.isSpecial);
			if (useSquare.isSpecial) 
				isCrossedSpecial = true;
			
			tempTerrainLine = compareLeastRestrictiveTerrain(useSquare.terrain, highestLoFType);
			var testElevation = (currentSquare.elevation < lastSquare.elevation) ? currentSquare.elevation : lastSquare.elevation;  // the lower of the two lof-diagonal squares
			if (useSquare.elevation > testElevation)
			{
				// if we're "squeezing through a canyon"
				highestLoFType = 2;	
				reason = " (by elevated terrain)";
			}
			else if (!elevationChange)
			{
				// ignore the terrain if we're changing elevations
				highestLoFType = tempTerrainLine;
			}
			
		}
		else
		// ...otherwise the square is normal, use it for comparison
		{
			isDiagonal = false;
			crossSquare = "";		
			currentSquare = traversalList[i].square;
		}
		
		 if (currentSquare.isSpecial)
			isCrossedSpecial = true;
		
		// if there is a change in elevation, we might possibly ignore the terrain result
		// it may also be blocked due to elevated terrain in the way
		tempTerrainLine = compareLeastRestrictiveTerrain(currentSquare.terrain, highestLoFType);
		if (elevationChange)
		{
			
			// keep track if the attacker or target is the lower elevation
			if (atkSquare.elevation < tarSquare.elevation)
			{
				lowerSquare = atkSquare;
				upperSquare = tarSquare;
			}
			else
			{
				lowerSquare = tarSquare; 
				upperSquare = atkSquare;
			}
			
			// blocked if there is blocking terrain on the lower elevation
			if ((currentSquare.elevation == lowerSquare.elevation) && ((currentSquare.terrain == "blocking" || currentSquare.terrain == 2)))
			{
				highestLoFType = 2;
				reason = " (by lower blocking terrain)";
			}
			// hindered only if the target is sitting in hindering terrain
			else if (isSquareEqual(currentSquare,tarSquare) && (currentSquare.terrain == "hindering" || currentSquare.terrain == 1))
			{
				highestLoFType = 1;
			}
			// blocked if there is a square of elevated terrain between the attacker and target
			else if (currentSquare.elevation > lowerSquare.elevation && currentSquare.elevation <= upperSquare.elevation)//(currentSquare.elevation != lastSquare.elevation)
			{	
				if (!(isSquareEqual(currentSquare, atkSquare) || isSquareEqual(currentSquare, tarSquare)))
				{
					highestLoFType = 2;	
					reason = " (by elevated terrain)";
				}	
			}
			// unless it's one of these cases, terrain doesn't matter
		}
		else
		{
			// blocked if there's a higher elevation between the elevation we're on
			if (currentSquare.elevation > atkSquare.elevation)
			{
				highestLoFType = 2; 
				reason = " (by elevated terrain)";
			}
			else if (currentSquare.elevation < atkSquare.elevation)
			{
				// if we're below the line we're on, and it's indoor blocking, it's blocked
				if ((currentSquare.terrain == 'blocking' || currentSquare.terrain == 2) && currentSquare.isIndoor)
				{
					highestLoFType = 2;
					reason = " (by lower indoor blocking terrain)";
				}
				// otherwise we're ignoring any other type of lower terrain
			}
			else			
				highestLoFType = tempTerrainLine;  // if it's on the same elevation as the LoF, keep the result of the terrain
		}

		// check for walls
		if (lookForWall(isDiagonal, lastSquare, currentSquare, crossSquare))
			highestLoFType = 2;
			
		// print result	(if not already set by the elevation cases above)
		if (highestLoFType == 2)
			resultTA.value = 'BLOCKED';
		else if (highestLoFType == 1)
			resultTA.value = 'HINDERED';
		else
			resultTA.value = "CLEAR";
		resultTA.value += reason;
				
		// set current to last before stepping forward
		lastSquare = currentSquare;
		if (isDiagonal)
			i++;  // skip over the square (end of diagonal) that we just processed
	} // end traversal
	
	if (resultTA.value.indexOf('HINDERED') > -1) 
		resultTA.style.color = "green";
	else if (resultTA.value.indexOf('BLOCKED') > -1)
		resultTA.style.color = 'chocolate';
	else
		resultTA.style.color = 'black';
				
	if (isCrossedSpecial)
		resultTA.value += " (see special rules)";
} // determineLoF()

		
function determineTerrainType(sq)
{
	if (sq.indexOf('special') > -1)
	{
		isCrossedSpecial = true;
		var sptype = sq.substr(sq.indexOf('SPtype')+6, 1);
		if (sptype == "H")
			return 'hindering';
		else if (sptype == "B")
			return 'blocking';
		else
			return 'clear';
	}
	else if (sq.indexOf('hindering') > -1)
		return 'hindering';
	else if (sq.indexOf('blocking') > -1)
		return 'blocking';
	else
		return 'clear';
}  // determineTerrainType()
		
function getElevation(sq)
{
	var elev_index = sq.indexOf("elevation");
	
	if (elev_index > -1)
		return parseInt(sq.substr(elev_index+9, 1));
	else
		return 1;
}  // getElevation()

function terrainNumber(terrainString)
{
	if (terrainString == 'hindering')
		return 1;
	if (terrainString == 'blocking')
		return 2;
	if (terrainString == 'clear')
		return 0;
}
		
function compareLeastRestrictiveTerrain(type, sofar)
{
	if ((type == 'hindering' || type == 1) && sofar < 1)
		return 1;
	if ((type == 'blocking' || type == 2) && sofar < 2) 
		return 2;
	return sofar;
}  // compareLeastRestrictiveTerrain()
		
function getHighestElevation(check, sofar)
{
	if (check > sofar)
		return check;
	else
		return sofar;
}  // getHighestElevation()

function isSquareIndoor(gridSquareClass)
{
	if (gridSquareClass.className.indexOf('indoor') > -1)
		return true;
	else
		return false;
} // isSquareIndoor

function isSquareEqual(square1, square2)
{
	return (square1.row == square2.row) && (square1.col == square2.col);
}
		

function lookForWall(isdiag, lastsq, currsq, crosssq)
{
	var ULsquare, URsquare, LLsquare, LRsquare;
	var wallExists = false;
	var slope;

	if (isdiag)
	{
		// checking the diagonal case
		// normalize squares - the fourth square can be calculated from the other three
		// chances are not all of these cases will be hit, but we're being thorough
		// we assume that currentSquare is diagonally opposite from lastSquare
		if (lastsq.row < currsq.row)
		{
			// case where last is above curr 
			if (lastsq.col < currsq.col)
			{
				// last is left of curr, so last is upper left, curr lower right
				ULsquare = lastsq;
				LRsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					URsquare = crosssq;									// L +
					LLsquare = createSquare(currsq.row, lastsq.col);	// x C
				}
				else
				{
					URsquare = createSquare(lastsq.row, currsq.col);	// L x
					LLsquare = crosssq;									// + C
				}
				slope = -1;
			}
			else
			{
				// last is right of cross, so last is upper right
				URsquare = lastsq;
				LLsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					ULsquare = crosssq;									// + L
					LRsquare = createSquare(currsq.row, lastsq.col);	// C x
				}
				else
				{
					ULsquare = createSquare(lastsq.row, currsq.col);	// x L
					LRsquare = crosssq;									// C +
				}			
				slope = 1;
			}
		}
		else 
		{
			// case where last is below curr 
			if (lastsq.col < currsq.col)
			{
				// last is left of cross, so last is lower left 
				LLsquare = lastsq;
				URsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					LRsquare = crosssq;									// x C
					ULsquare = createSquare(currsq.row, lastsq.col);	// L +
				}
				else
				{
					LRsquare = createSquare(lastsq.row, currsq.col);	// + C
					ULsquare = crosssq;									// L x
				}
				slope = 1;
			}
			else
			{
				// last is right of cross, so last is lower right
				LRsquare = lastsq;
				ULsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					LLsquare = crosssq;									// C x
					URsquare = createSquare(currsq.row, lastsq.col);	// + L
				}
				else
				{
					LLsquare = createSquare(lastsq.row, currsq.col);	// C +
					URsquare = crosssq;									// x L
				}			
				slope = -1;
			}
		} // end normalization
		
		// get the relevant wall segments
		var northwall, southwall, eastwall, westwall;
		if (ULsquare && URsquare) 
		{
			northwall = (ULsquare.gridSquare.className.indexOf('eastwall') > -1 && URsquare.gridSquare.className.indexOf('westwall') > -1)
		}
		if (LLsquare && LRsquare)
		{
			southwall = (LLsquare.gridSquare.className.indexOf('eastwall') > -1 && LRsquare.gridSquare.className.indexOf('westwall') > -1)
		}
		if (LRsquare && URsquare)
		{
			eastwall = (LRsquare.gridSquare.className.indexOf('northwall') > -1 && URsquare.gridSquare.className.indexOf('southwall') > -1)
		}
		if (ULsquare && LLsquare)
		{
			westwall = (LLsquare.gridSquare.className.indexOf('northwall') > -1 && ULsquare.gridSquare.className.indexOf('southwall') > -1)
		}
				
		// compare 6 cases:		|	_ _		_ |		_		| _		  _
		//						|					  |				|
		if (northwall && southwall)						// north/south always blocks
			wallExists = true;
		else if (eastwall && westwall)					// east/west always blocks
			wallExists = true;
		else if (northwall && westwall && slope == -1) 	// north/west, but only \ slope
			wallExists = true;
		else if (southwall && eastwall && slope == -1)	// south/east on \ slope
			wallExists = true;
		else if (northwall && eastwall && slope == 1)	// north/east on / slope
			wallExists = true;
		else if (southwall && westwall && slope == 1)	// south/west on / slope
			wallExists = true;
	}
	else
	{
		// horizontal or vertical case
		// we only need to compare the last and curr squares	
		if ((lastsq.row < currsq.row) && (lastsq.gridSquare.className.indexOf('southwall') > -1)) 
			wallExists = true;
		else if ((lastsq.row > currsq.row) && (lastsq.gridSquare.className.indexOf('northwall') > -1)) 
			wallExists = true;
		else if ((lastsq.col < currsq.col) && (lastsq.gridSquare.className.indexOf('eastwall') > -1)) 
			wallExists = true;
		else if ((lastsq.col > currsq.col) && (lastsq.gridSquare.className.indexOf('westwall') > -1)) 
			wallExists = true;
	}
		
	return wallExists;
} // lookForWall()

/**
	* @param full Boolean - if true, sets grid to blank and clears out Info panel (called when loading a new map)
	* if false, only clears grid of Line of Fire highlighted squares (called when creating or clearing LoF)
*/	
function resetPage(full) {
	document.getElementById("result").value = "";
	document.getElementById("lofResult").value = "";
	document.getElementsByTagName('textarea')[0].value = "";	
	traversalList = [];
			
	if (full)
	{
		document.getElementById("attackCol").selectedIndex = 0;
		document.getElementById("attackRow").selectedIndex = 0;
		document.getElementById("targetCol").selectedIndex = 0;
		document.getElementById("targetRow").selectedIndex = 0;
		document.getElementById("mapTitle").textContent 		= "";
		document.getElementById("mapSet").textContent 			= "";
		document.getElementById("mapUniverse").textContent 		= "";
		document.getElementById("mapInOut").textContent 		= "";
		document.getElementById("mapSpecial").style.visibility = "hidden";
		document.getElementById("mapSpecialRules").textContent 	= "";
	}
		
	var gridtable = document.getElementsByClassName('grid');
	if (gridtable.length > 0)
	{
		var totalRows = gridtable[0].childNodes.length;
		var totalCols = gridtable[0].childNodes[0].childNodes.length;
		// start at 1 to compensate for table headers
		for (var r = 1; r < totalRows; r++)
		{
			for (var c = 1; c < totalCols; c++)
			{
				var square = createSquare(r, c);
				if (!full)
				{
					if (square.gridSquare.className.indexOf('clicked') > -1)
						square.gridSquare.className = square.gridSquare.className.replace('clicked','');
					if (square.gridSquare.className.indexOf('wiggle') > -1)
						square.gridSquare.className = square.gridSquare.className.replace('wiggle','');
					if (square.gridSquare.className.indexOf('attacker') > -1)
						square.gridSquare.className = square.gridSquare.className.replace('attacker','');
					if (square.gridSquare.className.indexOf('target') > -1)
						square.gridSquare.className = square.gridSquare.className.replace('target','');
					if (document.getElementById("toggleCoordinates").checked)
						square.gridSquare.style.fontSize = "13px";
					else
						square.gridSquare.style.fontSize = "0px";
				}
				else
					square.gridSquare.className = '';
			}
		}
	}
}  // resetPage()