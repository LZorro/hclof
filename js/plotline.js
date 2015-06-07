function plotLine (y1, x1, y2, x2) 
{ 
	var i;               // loop counter 
	var ystep, xstep;    // the step on y and x axis 
	var error;           // the error accumulated during the increment 
	var errorprev;       // *vision the previous value of the error variable 
	var y = y1, x = x1;  // the line points 
	var ddy, ddx;        // compulsory variables: the double values of dy and dx 
	var dx = x2 - x1; 
	var dy = y2 - y1; 
	var sq;
	var sq2;
	var passThrough = "";	// cumulative list (as string) of squares the LoF passes through - to be deprecated
  
	var traversalListTemp;
	traversalList = [];		// cumulative list (as array of objects) of squares the LoF passes through
  
	// first point 
	sq = createSquare(y1, x1);
	sq.gridSquare.className += ' clicked'; //click();
	range = 0;
	
	// calculating which direction to start counting
	if (dy < 0)
	{ 
		ystep = -1; 
		dy = -dy; 
	}
	else 
		ystep = 1; 
		
	if (dx < 0)
	{ 
		xstep = -1; 
		dx = -dx; 
	}
	else 
		xstep = 1; 
		
	ddy = 2 * dy;  // work with double values for full precision 
	ddx = 2 * dx; 
	if (ddx >= ddy)
	{  	// first octant (0 <= slope <= 1) 
		// compulsory initialization (even for errorprev, needed when dx==dy) 
		errorprev = error = dx;  // start in the middle of the square 
		for (i=0 ; i < dx ; i++)
		{  // do not use the first point (already done) 
			x += xstep; 
			error += ddy; 
			if (error > ddx)
			{  // increment y if AFTER the middle ( > ) 
				y += ystep; 
				error -= ddx; 
				// three cases (octant == right->right-top for directions below): 
				if (error + errorprev < ddx)
				{  // bottom square also 
					sq = createSquare(y-ystep, x);
					sq.gridSquare.className += ' clicked';	
					traversalList[traversalList.length] = createTraversalListElement(sq);
					passThrough += sq.gridSquare.innerText + ' ';
				}
				else if (error + errorprev > ddx)
				{ // left square also 
					sq = createSquare(y, x-xstep);
					sq.gridSquare.className += ' clicked'; 
					traversalList[traversalList.length] = createTraversalListElement(sq);
					passThrough += sq.gridSquare.innerText + ' ';
				}
				else
				{  // corner: bottom and left squares also 
					sq = createSquare(y-ystep, x);
					sq.gridSquare.className += ' wiggle';  
					passThrough += '[' + sq.gridSquare.innerText + ',';
					sq2 = createSquare(y, x-xstep);
					sq2.gridSquare.className += ' wiggle';  
					passThrough += sq2.gridSquare.innerText + '] ';
					traversalList[traversalList.length] = createTraversalListElement(sq, sq2);
				} 
			} 
	  
			sq = createSquare(y,x);
			sq.gridSquare.className += ' clicked'; 
			passThrough += sq.gridSquare.innerText + ' ';
			traversalList[traversalList.length] = createTraversalListElement(sq);
			range++;

			errorprev = error; 
		} 
	}
	else
	{  // the same as above 
		errorprev = error = dy; 
		for (i=0 ; i < dy ; i++)
		{ 
			y += ystep; 
			error += ddx; 
			if (error > ddy)
			{ 
				x += xstep; 
				error -= ddy; 
				if (error + errorprev < ddy) 
				{
					sq = createSquare(y, x-xstep);
					sq.gridSquare.className += ' clicked'; 
					passThrough += sq.gridSquare.innerText + ' ';
					traversalList[traversalList.length] = createTraversalListElement(sq);
				}
				else if (error + errorprev > ddy) 
				{
					sq = createSquare(y-ystep,x);
					sq.gridSquare.className += ' clicked'; 
					passThrough += sq.gridSquare.innerText + ' ';
					traversalList[traversalList.length] = createTraversalListElement(sq);
				}
				else
				{ 
					sq = createSquare(y, x-xstep);
					sq.gridSquare.className += ' wiggle';
					passThrough += '[' + sq.gridSquare.innerText + ',';
					sq2 = createSquare(y-ystep, x);
					sq2.gridSquare.className += ' wiggle'; 
					passThrough += sq2.gridSquare.innerText + '] ';
					traversalList[traversalList.length] = createTraversalListElement(sq, sq2);
		
				} 
			} 
	  
			sq = createSquare(y,x);
			sq.gridSquare.className += ' clicked'; 
			passThrough += sq.gridSquare.innerText + ' ';
			traversalList[traversalList.length] = createTraversalListElement(sq);
			range++;
			errorprev = error; 
		} 
	} 
  
	var passThroughList = document.getElementById('squareList');
	passThroughList.value = passThrough;
}

function createSquare(row, col) 
{
	var returnSquare = {};
	returnSquare.row = row;
	returnSquare.col = col;
	var gridtable = document.getElementsByClassName('grid');
	if (gridtable.length > 0)
		returnSquare.gridSquare = gridtable[0].rows[row].cells[col];
	returnSquare.terrain = determineTerrainType(returnSquare.gridSquare.className);
	returnSquare.elevation = getElevation(returnSquare.gridSquare.className);
	returnSquare.colAlpha = returnSquare.gridSquare.innerText[0];
	returnSquare.isIndoor = ((isSquareIndoor(returnSquare.gridSquare)) || (document.getElementById('mapInOut').textContent == "Indoor"));
	returnSquare.isSpecial = (returnSquare.gridSquare.className.indexOf("SPtype") > -1);
	
	return returnSquare;
}

function createTraversalListElement(square, crosssquare)
{
	var retValue = {};
	retValue.square = square;
	if (crosssquare === undefined)
	{
		retValue.crosssquare = "";
	}
	else
	{
		retValue.crosssquare = crosssquare;
	}
	return retValue;
}