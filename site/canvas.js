var theCanvas = document.getElementById("canvas");
var context = theCanvas.getContext("2d");

var numShapes;
var shapes;
var shadow;

var dragIndex;
var dragging;
var mouseX;
var mouseY;
var dragHoldX;
var dragHoldY;

const imgSize = 300;
var imgHalf = imgSize / 2;

init();

function init() {
	shadow = new Image()

	numShapes = 0;
	shapes = [];
	shadow.src = "site/Shadow.png";

	drawScreen();
	
	theCanvas.addEventListener("mousedown", mouseDownListener, false);
	window.addEventListener("keydown", keyPressListener, false);
}

function makeShape(card,sides) {
	var	tempX = theCanvas.width / 2;
	var	tempY = theCanvas.height / 2;
	var tempImg = new Image()
	var tempR = 0;
	
	console.log("card1:" + card);
	console.log("card2:" + card.substring(0, 13));

	if (card.substring(0, 13) == "tse/Backstory"){
		tempR = (Math.PI / 8) * 6;
	}
	
	tempImg.src = card + ".jpg";
	tempImg.onload = () => {
		tempShape = {x:tempX, y:tempY, r:tempR, i:tempImg, s:sides};
		shapes.push(tempShape);
		numShapes ++;
		drawScreen();
	}
}

function arraymove(fromIndex, toIndex) {
    var element = shapes[fromIndex];
    shapes.splice(fromIndex, 1);
    shapes.splice(toIndex, 0, element);
}
  
function keyPressListener(e) {
    switch(e.keyCode) {
        case 37:
            // left key pressed
			shapes[dragIndex].r += Math.PI / (shapes[dragIndex].s / 2);
            break;
        case 38:
            // up key pressed
			if (dragIndex < numShapes-1) {
				arraymove(dragIndex,dragIndex+1);
				dragIndex++;
			}
            break;
        case 39:
            // right key pressed
			shapes[dragIndex].r -= Math.PI / (shapes[dragIndex].s / 2);
            break;
        case 40:
            // down key pressed
			if (dragIndex > 0) {
				arraymove(dragIndex,dragIndex-1);
				dragIndex--;
			}
            break;  
		default: 
			console.log(shapes);
			break;
    }   
	drawScreen();
}       

function mouseDownListener(evt) {
	var i;
	//We are going to pay attention to the layering order of the objects so that if a mouse down occurs over more than object,
	//only the topmost one will be dragged.
	var highestIndex = -1;
	
	//getting mouse position correctly, being mindful of resizing that may have occured in the browser:
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
			
	//find which shape was clicked
	for (i=0; i < numShapes; i++) {
		if	(hitTest(shapes[i], mouseX, mouseY)) {
			dragging = true;
			if (i > highestIndex) {
				//We will pay attention to the point on the object where the mouse is "holding" the object:
				dragHoldX = mouseX - shapes[i].x;
				dragHoldY = mouseY - shapes[i].y;
				highestIndex = i;
				dragIndex = i;
			}
		}
	}
	
	if (dragging) {
		window.addEventListener("mousemove", mouseMoveListener, false);
	}
	theCanvas.removeEventListener("mousedown", mouseDownListener, false);
	window.addEventListener("mouseup", mouseUpListener, false);
	
	//code below prevents the mouse down from having an effect on the main browser window:
	if (evt.preventDefault) {
		evt.preventDefault();
	} //standard
	else if (evt.returnValue) {
		evt.returnValue = false;
	} //older IE
	return false;
}

function mouseUpListener(evt) {
	theCanvas.addEventListener("mousedown", mouseDownListener, false);
	window.removeEventListener("mouseup", mouseUpListener, false);
	if (dragging) {
		dragging = false;
		window.removeEventListener("mousemove", mouseMoveListener, false);
	}
}

function mouseMoveListener(evt) {
	var posX;
	var posY;
	var minX = 0;
	var maxX = theCanvas.width;
	var minY = 0;
	var maxY = theCanvas.height;
	//getting mouse position correctly 
	var bRect = theCanvas.getBoundingClientRect();
	mouseX = (evt.clientX - bRect.left)*(theCanvas.width/bRect.width);
	mouseY = (evt.clientY - bRect.top)*(theCanvas.height/bRect.height);
	
	//clamp x and y positions to prevent object from dragging outside of canvas
	posX = mouseX - dragHoldX;
	posX = (posX < minX) ? minX : ((posX > maxX) ? maxX : posX);
	posY = mouseY - dragHoldY;
	posY = (posY < minY) ? minY : ((posY > maxY) ? maxY : posY);
	
	shapes[dragIndex].x = posX;
	shapes[dragIndex].y = posY;
	
	drawScreen();
}

function hitTest(shape,mx,my) {
	return (mx > shape.x - imgHalf && mx < shape.x + imgHalf && my > shape.y - imgHalf && my < shape.y + imgHalf );	
}

function drawShapes() {
	var i;
	var is = -imgSize / 2;
	for (i=0; i < numShapes; i++) {
		context.setTransform(1, 0, 0, 1, shapes[i].x, shapes[i].y); // sets scale and origin
		context.rotate(shapes[i].r);
		context.drawImage(shadow, is-12, is-12);
		context.drawImage(shapes[i].i, is, is);
	}
	context.setTransform(1,0,0,1,0,0); 
}

function drawScreen() {
//	context.fillStyle = "#AAAAAA";
	context.fillStyle = "#FFFFFF";
	
	context.fillRect(0,0,theCanvas.width,theCanvas.height);
	
	drawShapes();		
}

function draw(deck,card,max,sides){
	var nr = Math.floor(Math.random() * max) + 1;
	const c = deck + '/' + card + nr;
	makeShape(c , sides);
}

