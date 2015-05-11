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
	sq.className = sq.className + ' clicked'; //click();
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
					sq.className = sq.className + ' clicked';	
					traversalList[length] = createTraversalListElement(y-ystep, x, sq);
					passThrough += sq.innerText + ' ';
				}
				else if (error + errorprev > ddx)
				{ // left square also 
					sq = createSquare(y, x-xstep);
					sq.className = sq.className + ' clicked'; 
					traversalList[length] = createTraversalListElement(y, x-xstep, sq);
					passThrough += sq.innerText + ' ';
				}
				else
				{  // corner: bottom and left squares also 
					sq = createSquare(y-ystep, x);
					sq.className = sq.className + ' wiggle';  
					passThrough += '[' + sq.innerText + ',';
					sq2 = createSquare(y, x-xstep);
					sq2.className = sq2.className  + ' wiggle';  
					passThrough += sq2.innerText + '] ';
					traversalList[length] = createTraversalListElement(y-ystep, x, sq, y, x-xstep, sq2);
				} 
			} 
	  
			sq = createSquare(y,x);
			sq.className = sq.className + ' clicked'; 
			passThrough += sq.innerText + ' ';
			traversalList[length] = createTraversalListElement(y, x, sq);
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
					sq.className = sq.className + ' clicked'; 
					passThrough += sq.innerText + ' ';
					traversalList[length] = createTraversalListElement(y, x-xstep, sq);
				}
				else if (error + errorprev > ddy) 
				{
					sq = createSquare(y-ystep,x);
					sq.className = sq.className + ' clicked'; 
					passThrough += sq.innerText + ' ';
					traversalList[length] = createTraversalListElement(y-ystep, x, sq);
				}
				else
				{ 
					sq = createSquare(y, x-xstep);
					sq.className = sq.className + ' wiggle';
					passThrough += '[' + sq.innerText + ',';
					sq2 = createSquare(y-ystep, x);
					sq2.className = sq2.className + ' wiggle'; 
					passThrough += sq2.innerText + '] ';
					traversalList[length] = createTraversalListElement(y-ystep, x, sq, y, x-xstep, sq2);
		
				} 
			} 
	  
			sq = createSquare(y,x);
			sq.className = sq.className + ' clicked'; 
			passThrough += sq.innerText + ' ';
			traversalList[length] = createTraversalListElement(y, x, sq);
			range++;
			errorprev = error; 
		} 
	} 
  
	var passThroughList = document.getElementsByTagName('textarea');
	passThroughList[0].value = passThrough;
}

function createSquare(row, col) 
{
	var gridtable = document.getElementsByClassName('grid');
	if (gridtable.length > 0)
		return gridtable[0].rows[row].cells[col];
}

function createTraversalListElement(row, col, square, crossrow, crosscol, crosssquare)
{
	var retValue;
	retValue.terrain = determineTerrainType(square.className);
	retValue.elevation = getElevation(square.className);
	retValue.row = row;
	retValue.col = col;
	if (crossrow === undefined && crosscol === undefined && crosssquare === undefined)
	{
		retValue.crossrow = "";
		retValue.crosscol = "";
		retValue.crossterrain = "";
		retValue.crosselevation = "";
	}
	else
	{
		retValue.crossrow = crossrow;
		retValue.crosscol = crosscol;
		retValue.crossterrain = determineTerrainType(crosssquare.classname);
		retValue.crosselevation = getElevation(crosssquare.classname);
	}
	return retValue;
}