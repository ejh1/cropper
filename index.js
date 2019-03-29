(function() {
	function setStyle(element, style) {
		for (let k in style) {
			element.style[k] = style[k];
		}
	}
	function hide(el) {
		el.style.display = 'none';
	}
	function show(el) {
		el.style.display = '';
	}
	const D = document;
	D.gebi = D.getElementById;
	D.ce = D.createElement;
	const body = D.body;
	body.ondragstart = () => false;
	body.style.position = 'relative';
	let btns = D.ce('div');
	setStyle(btns, {position:'fixed',top:'10px',left:'10px',zIndex:1000000});
	btns.innerHTML = `<button id="select" >select</button><button id="clear"> x </button><button id="crop">crop</button>`;
	let crp = D.ce('div');
	setStyle(crp, {zIndex:1000000});
	body.appendChild(crp);
	body.appendChild(btns);
	const selBtn = D.gebi('select');
	const clearBtn = D.gebi('clear');
	hide(clearBtn);
	const cropBtn = D.gebi('crop')
	hide(cropBtn);
	setStyle(crp, {position:'absolute',top:0,left:0,width:'100%',height:'100%',display:'none'});
	hide(crop);

	let state, selection, startX, startY, left, top, width, height, offsetLeft, offsetTop, mLeft, mTop, xDim, yDim;
	function getCropDiv(a, i) {
		const M = 10, px = M+'px';
		const B = 1;
		const x = (i%4 == 1)? '' : (i<2||i>4)? 'w' : 'e';
		const y = (i%4 == 3)? '' : i<3? 'n' : 's';
		return `<div id="${x||0}${y||0}" style="position:absolute;background:gray;border:solid 1px black;width:${!x? '100%' : px
			};height:${!y? '100%' : px};${x=='w'? 'left' : 'right'}:-${!x? B:2*B+M
			}px;${y=='n'? 'top' : 'bottom'}:-${!y? B:2*B+M}px;cursor:${!x?'ns':!y?'ew':y+x}-resize;"></div>`;
	}
	crp.onmousedown = function(e) {
		body.onmousemove = mm;
		body.onmouseup = mu;
		startX = e.pageX;
		startY = e.pageY;
		switch (state) {
			case 'select':
				selection = D.ce('div');
				selection.innerHTML = `<div style="display:none;cursor:grab;">${Array(8).fill(1).map(getCropDiv).join('')}</div>`;
				crp.appendChild(selection);
				setStyle(selection, {position:'absolute', border:'solid 1px gray', left:startX+'px', top:startY+'px', width:0, height:0});
				xDim = new dynamicDim(selection, true, startX, 0, startX, false);
				yDim = new dynamicDim(selection, false, startY, 0, startY, false);
				break;
			case 'move':
				if (e.target != selection) {
					state = 'crop';
					let id = e.target.id, x = id[0], y = id[1];
					x != '0' && (xDim = new dynamicDim(selection, true, left, width, startX, x == 'w'));
					y != '0' && (yDim = new dynamicDim(selection, false, top, height, startY, y == 'n'));
				}

		}
	}

	function mm(e) {
		let x = e.pageX, y = e.pageY;
		switch (state) {
			case 'select':
			case 'crop':
				xDim && xDim.updateDragPosition(x);
				yDim && yDim.updateDragPosition(y);
				break;
			case 'move':
				setStyle(body, {left:(mLeft = x-startX+offsetLeft)+'px', top:(mTop = y-startY+offsetTop)+'px'});
				break;
		}
	}
	function mu(e) {
		body.onmousemove = null;
		body.onmouseup = null;
		xDim && (left = xDim.start) && (width = xDim.length);
		yDim && (top = yDim.start) && (height = yDim.length);
		xDim = yDim = null;
		switch (state) {
			case 'select':
				state = 'move';
				offsetLeft = offsetTop = 0;
				selection.style.boxShadow = 'black 0 0 0 10000px';
				show(cropBtn);
				break;
			case 'crop':
				state = 'move';
				break;
			case 'move':
				offsetLeft = mLeft;
				offsetTop = mTop;
		}
	}
	selBtn.onclick = function() {
		crp.style.display = 'block';
		hide(selBtn);
		show(clearBtn);
		state = 'select';
	}
	clearBtn.onclick = function() {
		crp.innerHTML = '';
		setStyle(body, {left:0,top:0});
		state = 'select';
		hide(clearBtn);
		show(selBtn);
		hide(cropBtn);
		hide(crp);
		cropping = false;
		setStyle(cropBtn, {backgroundColor:''});
	}
	let cropping = false;
	cropBtn.onclick = function() {
		cropping = !cropping;
		cropping? show(selection.firstChild) : hide(selection.firstChild);
		setStyle(cropBtn, {backgroundColor:cropping? 'blue':''});
	}
	class dynamicDim {
		constructor(elem, isX, initialStart, initialLength, dragStartPosition, isStartDrag) {
			Object.assign(this, {elem, isX, initialStart, initialLength, dragStartPosition, isStartDrag,
				initialEnd : initialStart + initialLength,
				start : initialStart,
				length : initialLength
			});
		}
		updateDragPosition(pos) {
			let diff = pos - this.dragStartPosition;
			if (this.isStartDrag) {
				diff *= -1;
			}
			let length = this.initialLength + diff;
			this.start = (length < 0)? (this.isStartDrag? this.initialEnd : this.initialStart + length) : (this.isStartDrag? this.initialEnd - length : this.initialStart);
			this.length = Math.abs(length);
			setStyle(this.elem, this.isX? {left:this.start+'px', width:this.length+'px'} : {top:this.start+'px',height:this.length+'px'});
		}
	}
})()
