var lastClicked;

function createGrid(row, col) 
{

	//var oldgrid = document.getElementsByClassName('griddiv');
	var oldgrid = document.getElementsByClassName('grid');
	var newgrid = clickableGrid(row, col, selectSquare);	
	//var attach = document.getElementById('mainpage');
	var attach = document.getElementById('griddiv');
	
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
