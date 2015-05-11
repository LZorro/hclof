range = 0;
	
function getSquares() {
	resetPage(false);
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
	var attackSquare = gridtable[0].rows[arNum].cells[acNum];
	var targetSquare = gridtable[0].rows[trNum].cells[tcNum];
			
	plotLine(arNum, acNum, trNum, tcNum); 
	attackSquare.className = attackSquare.className + ' attacker';
	targetSquare.className = targetSquare.className + ' target';
			
	document.getElementById("result").value = acVal + arVal + " to " + tcVal + trVal + " , a " + width + "x" + height + " box."
		+ ", a range of " + range;
				
	determineLoF(attackSquare, targetSquare);
}  // getSquares()
		
function determineLoF(atkSquare, tarSquare)
{
	var resultTA = document.getElementById('lofResult');
	var traversal = document.getElementsByTagName('textarea')[0].value;
	var nextPoint = '';
	var crossPoint = '';
	var highestLoFType = 0;
	var typePerElevation = [0,0,0,0];
	var attackElevation, targetElevation, lineElevation;
	var nextR, nextC, crossR, crossC;
	var nextSquare, nextType, crossSquare, crossType;
	var lastSquare, lastCrossSquare;
	var nextElevation, crossElevation;
	var checkType, checkElevation;
	var isDiagonal;
	var isIndoorBlocked = false;
	isCrossedSpecial = false;
			
	attackElevation = getElevation(atkSquare.className);
	targetElevation = getElevation(tarSquare.className);
	lineElevation = 1;
	lastSquare = atkSquare;
	lastCrossSquare = '';
			
	// console.log("traversing:-" + traversal +'-');
			
	// 'traversal' is a list of all the squares the line passes through.
	// This loop steps through each square, updating the line of fire status along the way.
	while (traversal != '')
	{
		var buffer = traversal.indexOf(' ');
		var readPoint = traversal.substr(0, buffer+1);
				
		if (readPoint.substr(0,1) == '[')
		{
			isDiagonal = true;
			// if the first char is a [, it's an intersection through corner - determine least restrictive lof between these 2 squares
			// reset string to read 2 squares instead of one
			traversal = traversal.replace(readPoint, '');
			nextPoint = readPoint.substr(1,readPoint.indexOf(',')-1);
			crossPoint = readPoint.substr(readPoint.indexOf(',')+1, readPoint.length - readPoint.indexOf(']') + 1);
			// console.log("looking at:-" + nextPoint + '- and -' + crossPoint + '-, leaving -' + traversal +'-');	

			// +1 compensation for table headers
			nextR = parseInt(nextPoint.substr(1)) - 1 + 1;
			nextC = nextPoint.substr(0,1).charCodeAt() - 65 + 1;
			// console.log('reading row/col: ' + nextR + ' ' + nextC);
			nextSquare = createSquare(nextR, nextC);
			nextType = determineTerrainType(nextSquare.className);
			nextElevation = getElevation(nextSquare.className);
						
			crossR = parseInt(crossPoint.substr(1)) - 1 + 1;
			crossC = crossPoint.substr(0,1).charCodeAt() - 65 + 1;
			crossSquare = createSquare(crossR, crossC);
			crossType = determineTerrainType(crossSquare.className);
			crossElevation = getElevation(crossSquare.className);
			// console.log('cross-checking row/col: ' + crossR + ' ' + crossC);
					
			// determine the terrain type of the next/cross pair
			if (nextType == crossType)
				checkType = nextType;
			else 
			{
				var nextNum = compareLeastRestrictiveTerrain(nextType, 0);
				var crossNum = compareLeastRestrictiveTerrain(crossType, 0);
				// if there is elevated, consider it blocking
				if (crossElevation > nextElevation)
					crossNum += 2;		
				if (nextElevation > crossElevation)
					nextNum += 2;
				if (nextNum > crossNum)
					checkType = crossNum;
				else
					checkType = nextNum;
			}
			// console.log(nextType + ' + ' + crossType + ' = ' + checkType);
			
			// determine the elevation of the next/cross pair
			if (nextElevation <= crossElevation)
				checkElevation = nextElevation;
			else 
				checkElevation = crossElevation;
			// console.log("Elevations " + nextElevation + ' + ' + crossElevation + ' = ' + checkElevation);
		} 
		else
		{
			// at this point, we are reading one square from the traversal list
			
			// this is so we're only reading one square from now on, rather than bundling it into a diagonal pair
			if (isDiagonal == true)
				isDiagonal = 'exit';
			else
				isDiagonal = false;
			
			traversal = traversal.replace(readPoint, '');	
			nextPoint = readPoint.substr(0,readPoint.length - 1);  // remove space at the end
			crossPoint = '';
			// console.log("looking at:-" + nextPoint + '- , leaving -' + traversal +'-');	
			// +1 compensation for table headers
			nextR = parseInt(nextPoint.substr(1)) - 1 + 1;
			nextC = nextPoint.substr(0,1).charCodeAt() - 65 + 1;
			// console.log('reading row/col: ' + nextR + ' ' + nextC);
			nextSquare = createSquare(nextR, nextC);
			nextType = determineTerrainType(nextSquare.className);
			nextElevation = getElevation(nextSquare.className);
			checkType = nextType;
			checkElevation = nextElevation;
		}
						
		// console.log('highestLoFType was: ' + highestLoFType + ", " + lineElevation);
		highestLoFType = compareLeastRestrictiveTerrain(checkType, highestLoFType);
		highestLoFType = lookForWall(lastSquare, lastCrossSquare, crossSquare, nextSquare, isDiagonal, highestLoFType);
		// if we cross a square of blocking terrain, and it's either indoor, or anywhere on an indoor map, it's probably blocked
		if (highestLoFType >= 2 && ((document.getElementById('mapInOut').textContent == "Indoor") || nextSquare.className.indexOf('indoor') > -1))
			isIndoorBlocked = true;
				
		typePerElevation[checkElevation-1] = compareLeastRestrictiveTerrain(checkType, typePerElevation[checkElevation-1]);
		typePerElevation[checkElevation-1] = lookForWall(lastSquare, lastCrossSquare, crossSquare, nextSquare, isDiagonal, typePerElevation[checkElevation-1]);
		if (nextSquare != tarSquare)  // checks for elevated rim
			lineElevation = getHighestElevation(checkElevation, lineElevation);
		// console.log('highestLoFType now: ' + highestLoFType + ", " + lineElevation);
				
		// keep track of 'nextSquare' to make the next comparison in the loop		
		if (isDiagonal == true)
		{
			lastCrossSquare = crossSquare;
			crossSquare = nextSquare;
		}
		else
			lastSquare = nextSquare;
		
	}  // end traversal loop
			
	// determine if elevated terrain blocks line of fire in any way
	if (attackElevation == targetElevation)
	{
		if (lineElevation > attackElevation) // or line > target, same thing in this case
		{
			resultTA.value = 'BLOCKED (by elevation)';
		}
		else if (lineElevation < attackElevation)
		{
			if (typePerElevation[attackElevation-1] == 1)
				resultTA.value = 'HINDERED (level ' + attackElevation + ' only)';
			else if (typePerElevation[attackElevation-1] == 2)
				resultTA.value = 'BLOCKED (level ' + attackElevation + ' only)';
			else
			{
				if (isIndoorBlocked)
					resultTA.value = 'BLOCKED (by grounded indoor terrain)';
				else
					resultTA.value = 'CLEAR (passing over lower elevation terrain)';
			}
		}
		else
		{
			// if lineElevation is equal to attack (and also target), we ignore this case, as the result will be
			// whatever the most restrictive terrain type will be, which is set later after this if statement
					
			// determine line of fire status based on terrain type
			if (highestLoFType == 1)
			{
				resultTA.value = 'HINDERED';
			}
			else if (highestLoFType == 2)
			{
				resultTA.value = 'BLOCKED';
			}
			else
				resultTA.value = "CLEAR";
		}
	}
	else // attacker and target are on different elevations
	{
		var higherElevation, lowerElevation
		if (attackElevation > targetElevation)
		{
			higherElevation = attackElevation;
			lowerElevation  = targetElevation;
		}
		else 
		{
			higherElevation = targetElevation;
			lowerElevation  = attackElevation;
		}
		
		if (lineElevation > lowerElevation)
		{
			resultTA.value = 'BLOCKED (by elevated)';
		}
		else 
		{
			if (typePerElevation[lowerElevation-1] == 2)
				resultTA.value = 'BLOCKED (by grounded blocking)';
			else if (typePerElevation[targetElevation-1] == 1)
			{
				if (determineTerrainType(tarSquare.className) == "hindering")
					resultTA.value = 'HINDERED (target in hindering)';
				else
				resultTA.value = 'CLEAR (ignoring grounded hindering)';
			}
			else
				resultTA.value = 'CLEAR (ignoring grounded hindering)';
		}
	}
			
	if (resultTA.value.indexOf('HINDERED') > -1) 
		resultTA.style.color = "green";
	else if (resultTA.value.indexOf('BLOCKED') > -1)
		resultTA.style.color = 'chocolate';
	else
		resultTA.style.color = 'black';
				
	if (isCrossedSpecial)
		resultTA.value += " (see special rules)";
}  // determineLoF()
		
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
	if (sq.indexOf('elevated2') > -1)
		return 2;
	if (sq.indexOf('elevated3') > -1)
		return 3;
	if (sq.indexOf('elevated4') > -1)
		return 4;
	else
		return 1;
}  // getElevation()
		
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
		
function lookForWall(firstsq, lastcrosssq, crosssq, nextsq, diag, sofar) 
{
	var ULsquare, URsquare, LLsquare, LRsquare;
	var wallExists = false;
	var slope;
			
	// +1 compensation for table headers
	var firstR = parseInt(firstsq.innerHTML.substr(1)) - 1 + 1;
	var firstC = firstsq.innerHTML.substr(0,1).charCodeAt() - 65 + 1;
	var nextR = parseInt(nextsq.innerHTML.substr(1)) - 1 + 1;
	var nextC = nextsq.innerHTML.substr(0,1).charCodeAt() - 65 + 1;
			
			
	// console.log('Checking walls...');
	if (diag == 'exit')	// determine if we want to bother with 
	{
		// console.log('Exiting diagonal squares, 4 in total');
		// +1 compensation for table headers
		var lastcrossR = parseInt(lastcrosssq.innerHTML.substr(1)) - 1 + 1;
		var lastcrossC = lastcrosssq.innerHTML.substr(0,1).charCodeAt() - 65 + 1;
		var crossR = parseInt(crosssq.innerHTML.substr(1)) - 1 + 1;
		var crossC = crosssq.innerHTML.substr(0,1).charCodeAt() - 65 + 1;
				
		// rearrange squares to keep it straight in my brain
		// we know first and next are diagonally opposite; so are lastcross and cross
		if (firstR < nextR) 
		{
			if (firstC < nextC)
			{
				ULsquare = firstsq;
				LRsquare = nextsq;
				slope = -1;
			}
			else
			{
				URsquare = firstsq;
				LLsquare = nextsq;
				slope = 1;
			}
		}
		else 
		{
			if (firstC < nextC) {
				LLsquare = firstsq;
				URsquare = nextsq;
				slope = 1;
			}
			else 
			{
				LRsquare = firstsq;
				ULsquare = nextsq;
				slope = -1;
			}
		}
		
		if (lastcrossR < crossR)
		{
			if (lastcrossC < nextC)
			{
				ULsquare = lastcrosssq;
				LRsquare = crosssq;
			}
			else
			{
				URsquare = lastcrosssq;
				LLsquare = crosssq;
			}
		}
		else
		{
			if (firstC < nextC)
			{
				LLsquare = lastcrosssq;
				URsquare = crosssq;
			}
			else 
			{
				LRsquare = lastcrosssq;
				ULsquare = crosssq;
			}
		}
				
		// get the relevant wall segments
		var northwall, southwall, eastwall, westwall;
		if (ULsquare && URsquare) 
		{
			if (ULsquare.className.indexOf('eastwall') > -1 && URsquare.className.indexOf('westwall') > -1)
				northwall = true;
			else
				northwall = false;
		}
		if (LLsquare && LRsquare)
		{
			if (LLsquare.className.indexOf('eastwall') > -1 && LRsquare.className.indexOf('westwall') > -1)
				southwall = true;
			else
				southwall = false;
		}
		if (LRsquare && URsquare)
		{
			if (LRsquare.className.indexOf('northwall') > -1 && URsquare.className.indexOf('southwall') > -1)
				eastwall = true;
			else
				eastwall = false;
		}
		if (ULsquare && LLsquare)
		{
			if (LLsquare.className.indexOf('northwall') > -1 && ULsquare.className.indexOf('southwall') > -1)
				westwall = true;
			else
				westwall = false;
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
	else if (diag == false)
	{
		// console.log('comparing 2 squares');
		// only really care about first and next, and the 1 line in between
				
		if ((firstR < nextR) && (firstsq.className.indexOf('southwall') > -1)) 
			wallExists = true;
		else if ((firstR > nextR) && (firstsq.className.indexOf('northwall') > -1)) 
			wallExists = true;
		else if ((firstC < nextC) && (firstsq.className.indexOf('eastwall') > -1)) 
			wallExists = true;
		else if ((firstC > nextC) && (firstsq.className.indexOf('westwall') > -1)) 
			wallExists = true;
	}
			
	if (wallExists)
		return 2;
	else
		return sofar;	
}  // lookForWall()
		
function resetPage(full) {
	document.getElementById("result").value = "";
	document.getElementById("lofResult").value = "";
	document.getElementsByTagName('textarea')[0].value = "";		
			
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
					if (square.className.indexOf('clicked') > -1)
						square.className = square.className.replace('clicked','');
					if (square.className.indexOf('wiggle') > -1)
						square.className = square.className.replace('wiggle','');
					if (square.className.indexOf('attacker') > -1)
						square.className = square.className.replace('attacker','');
					if (square.className.indexOf('target') > -1)
						square.className = square.className.replace('target','');
					if (document.getElementById("toggleCoordinates").checked)
						square.style.fontSize = "13px";
					else
						square.style.fontSize = "0px";
				}
				else
					square.className = '';
			}
		}
	}
}  // resetPage()