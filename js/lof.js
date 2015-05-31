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
	//	if (lookForWall(isDiagonal, lastSquare, currentSquare, crossSquare))
	//		highestLoFType = 2;
			
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
}
function determineLoF_old(atkSquare, tarSquare)
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
			nextsq.row = parseInt(nextPoint.substr(1)) - 1 + 1;
			nextC = nextPoint.substr(0,1).charCodeAt() - 65 + 1;
			// console.log('reading row/col: ' + nextsq.row + ' ' + nextC);
			nextSquare = createSquare(nextsq.row, nextC);
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
			nextsq.row = parseInt(nextPoint.substr(1)) - 1 + 1;
			nextC = nextPoint.substr(0,1).charCodeAt() - 65 + 1;
			// console.log('reading row/col: ' + nextsq.row + ' ' + nextC);
			nextSquare = createSquare(nextsq.row, nextC);
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
		
function lookForWall_old(firstsq, lastcrosssq, crosssq, nextsq, diag, sofar) 
{
	var ULsquare, URsquare, LLsquare, LRsquare;
	var wallExists = false;
	var slope;
			
	// console.log('Checking walls...');
	if (diag == 'exit')	// determine if we want to bother with 
	{
		// rearrange squares to keep it straight in my brain
		// we know first and next are diagonally opposite; so are lastcross and cross
		if (firstsq.row < nextsq.row) 
		{
			if (firstsq.col < nextsq.col)
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
			if (firstsq.col < nextsq.col) {
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
		
		if (lastcrosssq.row < crosssq.row)
		{
			if (lastcrosssq.col < nextsq.col)
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
			if (firstsq.col < nextsq.col)
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
			if (ULsquare.gridSquare.className.indexOf('eastwall') > -1 && URsquare.gridSquare.className.indexOf('westwall') > -1)
				northwall = true;
			else
				northwall = false;
		}
		if (LLsquare && LRsquare)
		{
			if (LLsquare.gridSquare.className.indexOf('eastwall') > -1 && LRsquare.gridSquare.className.indexOf('westwall') > -1)
				southwall = true;
			else
				southwall = false;
		}
		if (LRsquare && URsquare)
		{
			if (LRsquare.gridSquare.className.indexOf('northwall') > -1 && URsquare.gridSquare.className.indexOf('southwall') > -1)
				eastwall = true;
			else
				eastwall = false;
		}
		if (ULsquare && LLsquare)
		{
			if (LLsquare.gridSquare.className.indexOf('northwall') > -1 && ULsquare.gridSquare.className.indexOf('southwall') > -1)
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
	else if (diag == "")
	{
		// console.log('comparing 2 squares');
		// only really care about first and next, and the 1 line in between
				
		if ((firstsq.row < nextsq.row) && (firstsq.gridSquare.className.indexOf('southwall') > -1)) 
			wallExists = true;
		else if ((firstsq.row > nextsq.row) && (firstsq.gridSquare.className.indexOf('northwall') > -1)) 
			wallExists = true;
		else if ((firstsq.col < nextsq.col) && (firstsq.gridSquare.className.indexOf('eastwall') > -1)) 
			wallExists = true;
		else if ((firstsq.col > nextsq.col) && (firstsq.gridSquare.className.indexOf('westwall') > -1)) 
			wallExists = true;
	}
			
	if (wallExists)
		return 2;
	else
		return sofar;	
}  // lookForWall()

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
		if (lastsq.row < currsq.row)
		{
			// case where last is above curr (both left or right)
			if (lastsq.col < crosssq.col)
			{
				// last is left of cross, so last is upper left 
				ULsquare = lastsq;
				LLsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					URsquare = crosssq;									// L +
					LRsquare = createSquare(currsq.row, crosssq.col);	// C x
				}
				else
				{
					URsquare = createSquare(lastsq.row, crosssq.col);	// L x
					LRsquare = crosssq;									// C +
				}
				slope = -1;
			}
			else
			{
				// last is right of cross, so last is upper right
				URsquare = lastsq;
				LRsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					ULsquare = crosssq;									// + L
					LLsquare = createSquare(currsq.row, crosssq.col);	// x C
				}
				else
				{
					ULsquare = createSquare(lastsq.row, crosssq.col);	// x L
					LLsquare = crosssq;									// + C
				}			
				slope = 1;
			}
		}
		else if (lastsq.row > currsq.row)
		{
			// case where last is below curr (both left or right)
			if (lastsq.col < crosssq.col)
			{
				// last is left of cross, so last is lower left 
				LLsquare = lastsq;
				ULsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					LRsquare = crosssq;									// C x
					URsquare = createSquare(currsq.row, crosssq.col);	// L +
				}
				else
				{
					LRsquare = createSquare(lastsq.row, crosssq.col);	// C +
					URsquare = crosssq;									// L x
				}
				slope = 1;
			}
			else
			{
				// last is right of cross, so last is lower right
				LRsquare = lastsq;
				URsquare = currsq;
				if (crosssq.row == lastsq.row)
				{
					LLsquare = crosssq;									// x C
					ULsquare = createSquare(currsq.row, crosssq.col);	// + L
				}
				else
				{
					LLsquare = createSquare(lastsq.row, crosssq.col);	// + C
					ULsquare = crosssq;									// x L
				}			
				slope = -1;
			}
		}
		else  
		{
			// case where both last and curr are in same row
			if (lastsq.col < currsq.col)
			{
				// last is to left of curr (both top or bottom)
				if (lastsq.row < crosssq.row)
				{
					// last is above cross, so last is on upper left
					ULsquare = lastsq;
					URsquare = currsq;
					if (crosssq.col == lastsq.col)
					{
						LLsquare = crosssq;									// L C
						LRsquare = createSquare(crosssq.row, currsq.col);	// + x
					}
					else
					{
						LLsquare = createSquare(crosssq.row, lastsq.col);	// x +
						LRsquare = crosssq;									// L C
					}
					slope = -1;  // slope = \ 
				}
				else
				{
					// last is below cross, so last is lower left
					LLsquare = lastsq;
					LRsquare = currsq;
					if (crosssq.col == lastsq.col)
					{
						ULsquare = crosssq;									// + x
						URsquare = createSquare(crosssq.row, currsq.col);	// L C
					}
					else
					{
						ULsquare = createSquare(crosssq.row, lastsq.col);	// x + 
						URsquare = crosssq;									// L C
					}
					slope = 1; // slope = /  
				}
			}
			else
			{
				// last is to right of curr (both top or bottom)
				if (lastsq.row < crosssq.row)
				{
					// last is above cross, so last is on upper right
					URsquare = lastsq;
					ULsquare = currsq;
					if (crosssq.col == lastsq.col)
					{
						LRsquare = crosssq;									// C L
						LLsquare = createSquare(crosssq.row, currsq.col);	// x +
					}
					else
					{
						LRsquare = createSquare(crosssq.row, lastsq.col);	// C L 
						LLsquare = crosssq;									// + x
					}
					slope = 1;  
				}
				else
				{
					// last is below cross, so last is lower right
					LRsquare = lastsq;
					LLsquare = currsq;
					if (crosssq.col == lastsq.col)
					{
						URsquare = crosssq;									// x +
						ULsquare = createSquare(crosssq.row, currsq.col);	// C L
					}
					else
					{
						URsquare = createSquare(crosssq.row, lastsq.col);	// + x
						ULsquare = crosssq;									// C L
					}
					slope = -1;   
				}
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
}

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