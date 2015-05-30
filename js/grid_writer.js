var lastClicked;

function createGrid(row, col) 
{
	//var oldgrid = document.getElementsByClassName('griddiv');
	var oldgrid = document.getElementsByClassName('grid');
	var newgrid = clickableGrid(row, col, selectSquare);	
	var attach = document.getElementById('tablehere');
	
	//var griddiv = document.createElement('div');
	//griddiv.id = 'griddiv';

	if (oldgrid.length > 0)
		attach.replaceChild(newgrid, oldgrid[0]);
	else
		attach.appendChild(newgrid);
	
}  // createGrid()
     
function clickableGrid( rows, cols, callback ){
    var i = 0;
    var r, c;
	var tr, cell;
	var grid = document.createElement('table');
    grid.className = 'grid';
	grid.align = 'left';
	
	tr = grid.appendChild(document.createElement('tr'));
	//tr.style.borderBottom = '2px solid';
	//tr.style.outline = '2px solid';
	
	// create upper header (letters)
	for (c = 1; c < (cols*3); ++c)
	{
		cell = tr.appendChild(document.createElement('th'));
		cell.id = 'grid';
		if ((c == 0) || (c%3 != 2))
			cell.innerHTML = "";
		else
		{
			cell.innerHTML = String.fromCharCode(65+(c/3));
			cell.style.borderBottom = '2px solid';
		}
	}
	
	// create body
    for (r = 1; r < (rows*3)-1; ++r)
	{
        tr = grid.appendChild(document.createElement('tr'));
		
		// line of north walls
		if (r % 3 == 0)
		{
			// create row header (number)
			cell = tr.appendChild(document.createElement('th'));
			cell.id = 'grid';
			//cell.innerHTML = (Math.floor(r/3)+1).toString();
			cell.style.borderRight= '2px solid';
			
			for (c = 1; c < (cols*3)-1; ++c)
			{
				cell = tr.appendChild(document.createElement('td'));
				++i;
				cell.id = 'grid';
				if (c % 3 == 1)
				{
					cell.className = 'north ';
					cell.addEventListener('click',(function(el,r,c,i){
						return function(){
							callback(el,r,c,i);
						}
					})(cell,r,c,i),false); 
				}
				else
					cell.className = "spacer ";
			}
		}
		else if (r % 3 == 1)
		{
			// create row header (number)
			cell = tr.appendChild(document.createElement('th'));
			cell.id = 'grid';
			cell.innerHTML = (Math.floor(r/3)+1).toString();
			cell.style.borderRight= '2px solid';
			//cell.style.borderBottomWidth = '0px';
		
			// create body
			for (c = 1; c < (cols*3)-1; ++c)
			{
				cell = tr.appendChild(document.createElement('td'));
				++i;
				cell.id = 'grid';
				if (c % 3 == 0)
					cell.className = 'west ';
				else if (c % 3 == 2)
					cell.className = 'east ';
				else
					cell.innerHTML = document.getElementById("elevation").value;
			
				//cell.style.outline = '';
				cell.addEventListener('click',(function(el,r,c,i){
					return function(){
						callback(el,r,c,i);
					}
				})(cell,r,c,i),false); 
			}
		}
		else
		{
			// create row header (number)
			cell = tr.appendChild(document.createElement('th'));
			cell.id = 'grid';
			//cell.innerHTML = (Math.floor(r/3)+1).toString();
			cell.style.borderRight= '2px solid';
			
			// line of south walls
			for (c = 1; c < (cols*3)-1; ++c)
			{
				cell = tr.appendChild(document.createElement('td'));
				++i;
				cell.id = 'grid';
				if (c % 3 == 1)
				{
					cell.className = 'south ';
					cell.addEventListener('click',(function(el,r,c,i){
						return function(){
							callback(el,r,c,i);
						}
					})(cell,r,c,i),false); 
				}
				else
					cell.className = "spacer ";
			}
		}
    }
    return grid;
}  // clickableGrid()

function getBorder(cell)
{
	if (cell.className.indexOf("east") > -1)
		return "east ";
	else if (cell.className.indexOf("west") > -1)
		return "west ";
	else if (cell.className.indexOf("north") > -1)
		return "north ";
	else if (cell.className.indexOf("south") > -1)
		return "south ";
	else 
		return "";
}

function selectSquare(el, row, col, i) 
{
	var isBorder = "";
	var terrainType = document.getElementById("terrainType").value;
	var elevation = document.getElementById("elevation").value;
	
	// force indoor terrain settings
	if (terrainType == "indoorclear")
		document.getElementById("isIndoor").checked = true;
	
	var isIndoor = document.getElementById("isIndoor").checked;
	
	// if it's a border piece, mark it appropriately
	isBorder = getBorder(el);
	if (isBorder)
	{
		terrainType = "border" + terrainType;
	}
	
	// set the proper className for elevated terrain (for values larger than 1)
	if (terrainType.indexOf("elevated") > -1)
	{
		if (elevation > 1)
		{
			if (!isBorder)
				terrainType = " elevation" + elevation;
		}
		else
			terrainType = '';
	}
	
	if (el.className.indexOf(terrainType) > -1) 
	{
		if (el.innerHTML.indexOf(elevation) == -1)
		{
			el.innerHTML = elevation;
			if (isIndoor) 
				el.innerHTML += " I";
		}
		else
			el.className = el.className.replace(terrainType,'');	
	}
	else
	{
		if (!(!isBorder && (terrainType == "stair" || terrainType == "wall")))
			el.className = isBorder + terrainType;
		
	}
	
	el.innerHTML = document.getElementById("elevation").value;
	if (isIndoor)
		el.innerHTML += " I";
}  // selectSquare()

function defaultStart()
{
	var grid = document.getElementsByClassName("grid");
	var rows = document.getElementById("rows").value;
	var cols = document.getElementById("columns").value;
	
	var startCol = 7;
	var endCol = ((cols-2)*3) - 2;  // 40 for a standard 16 cols
	var endRow = ((rows)*3) - 2;    // 70 for a standard 24 rows (last row)
	
	
	for (var c = startCol; c <= endCol; c = c + 3)
	{
		// top start area
		grid[0].rows[1].cells[c].className += " start";
		grid[0].rows[4].cells[c].className += " start";
		// bottom start area
		grid[0].rows[endRow].cells[c].className += " start";
		grid[0].rows[endRow-3].cells[c].className += " start";
		// horizontal borders
		grid[0].rows[5].cells[c].className += " borderstart";
		grid[0].rows[endRow-4].cells[c].className += " borderstart";
	}
	
	// side borders
	grid[0].rows[1].cells[startCol-1].className += " borderstart";
	grid[0].rows[1].cells[endCol+1].className   += " borderstart";
	grid[0].rows[4].cells[startCol-1].className += " borderstart";
	grid[0].rows[4].cells[endCol+1].className   += " borderstart";
	grid[0].rows[endRow].cells[startCol-1].className += " borderstart";
	grid[0].rows[endRow].cells[endCol+1].className   += " borderstart";
	grid[0].rows[endRow-3].cells[startCol-1].className += " borderstart";
	grid[0].rows[endRow-3].cells[endCol+1].className   += " borderstart";

}