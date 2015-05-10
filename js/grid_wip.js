var lastClicked;

function createGrid(row, col) 
{
	var oldgrid = document.getElementsByClassName('grid');
	var newgrid = clickableGrid(row, col, selectSquare);	
	var attach = document.getElementById('griddiv');
	
	if (oldgrid.length > 0)
		attach.replaceChild(newgrid, oldgrid[0]);
	else
		attach.appendChild(newgrid);

} // creategrid()

function createOverlay()
{
	// we're good up until this point.  Everything below is experimental

	var mapElementsAttach = document.getElementById('mapdiv');
	var mapElementsDiv = document.getElementById('mapElementsDiv');
	var mapElements = document.getElementById('mapElements');
	
	var existingGrid = document.getElementById('grid');
	
	//mapElements.style.width = attach.style.width;
	
	
	if (!mapElementsDiv)
	{
		mapElementsDiv = document.createElement('div');
		mapElementsDiv.id = 'mapElementsDiv';
		mapElementsDiv.style.position = 'absolute';
		mapElementsDiv.style.left = '0px';
		mapElementsDiv.style.top = '0px';
		mapElementsDiv.style.width = existingGrid.style.width;
		mapElementsDiv.style.height = '100%';
		mapElementsDiv.width = '100px';
		//mapElementsDiv.zIndex = '100';
		//mapElementsDiv.style.width = mapElementsAttach.style.width;
		//mapElementsDiv.style.height = mapElementsAttach.style.height;
		mapElementsAttach.appendChild(mapElementsDiv);
		
		if (!mapElements)
		{
			mapElements = document.createElement('canvas');
			mapElements.id = 'mapElements';
			mapElements.style.position = 'absolute';
			mapElements.style.left = '0px';
			mapElements.style.top = '0px';
			mapElements.style.width = '100%';
			mapElements.style.height = '100%';
			mapElements.style.zIndex = '100';
			mapElementsDiv.appendChild(mapElements);
			
			var context = mapElements.getContext('2d');
			context.fillStyle = '#00F0F0';
			context.fillRect(0,0, 100, 5);		
		}
	}
	
}  // createOverlay()

function clickableGrid( rows, cols, callback ){
    var i = 0;
    var r, c;
	var tr, cell;
	var grid = document.createElement('table');
    grid.className = 'grid';
	grid.style.margin = '0px';
	grid.style.position = 'relative';
	//grid.align = 'left';
	
	tr = grid.appendChild(document.createElement('tr'));
	//tr.style.borderBottom = '2px solid';
	//tr.style.outline = '2px solid';
	for (c = 0; c < cols+1; ++c)
	{
		cell = tr.appendChild(document.createElement('th'));
		cell.id = 'grid';
		if (c == 0)
			cell.innerHTML = "";
		else
		{
			cell.innerHTML = String.fromCharCode(65+c - 1);
			cell.style.borderBottom = '2px solid';
		}
	}
	
    for (r = 0; r < rows; ++r)
	{
        tr = grid.appendChild(document.createElement('tr'));
		cell = tr.appendChild(document.createElement('th'));
		cell.id = 'grid';
		cell.innerHTML = (r+1).toString();
		cell.style.borderRight= '2px solid';
		//cell.style.borderBottomWidth = '0px';
        for (c = 0; c < cols; ++c)
		{
            cell = tr.appendChild(document.createElement('td'));
			++i;
			cell.id = 'grid';
            cell.innerHTML = String.fromCharCode(65 + c) + (r+1).toString();
			//cell.style.outline = '';
           /* cell.addEventListener('click',(function(el,r,c,i){
                return function(){
                    callback(el,r,c,i);
                }
            })(cell,r,c,i),false); */
        }
    }
    return grid;
}  // clickableGrid()

function selectSquare(el, row, col, i) 
{
	if (el.className == 'clicked') 
		el.className = el.className + ' blocking';
	else
		el.className = 'clicked';
}  // selectSquare()
