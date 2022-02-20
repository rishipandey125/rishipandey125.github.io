var canvas; //setup the canvas for rendering
var buttonSave; //button for save
var buttonReset; //button for reset
//key colors for color palette
var keyColors = []
let numKeyColors = 5

//stroke properties
var strokeSizeMin; //min thickness
var strokeSizeMax; //max thickness
var strokeColor; //stroke color
var x,y; //next xy of the stroke
var px,py; //previous xy of the stroke

//control whether to sketch or not
let sketch;

//setup the sketch -- runs on start
function setup() {
  //setup canvas with correct aspect ratio
  let aspectRatio = 2/3
  let canvasHeight = 700
  let canvasWidth = canvasHeight*aspectRatio

  //enforce conditions for mobile friendly canvas
  if (windowWidth < canvasWidth) {
    //make canvas mobile friendly
    canvasWidth = 0.8*windowWidth;
    canvasHeight = canvasWidth * (1/aspectRatio);
  }
  canvas = createCanvas(canvasWidth,canvasHeight)
  //position canvas in webpage
  let canvasXPosition = (windowWidth - canvasWidth)/2
  let canvasYPosition = (windowHeight - canvasHeight)/2
  canvas.parent('sketch') //parent the canvas to sketch

  //handle canvas click
  canvas.mouseClicked(createNewStroke)

  //set the background color of the canvas
  colorMode(HSB) //use hsb color space
  // generate key colors
  for (let i = 0; i < numKeyColors; i++) {
    keyColors.push(randomColor()) // 5 random colors
  }

  //generate a color in the palette for the background
  background(randomColorInPalette()) //set the background

  //set the canvas stroke min & max thickness
  strokeSizeMin = 1
  strokeSizeMax = 12

  //save button position and action
  buttonSave = createButton('save');
  buttonSave.style('font-size', '15px');
  buttonSave.position((windowWidth - width)/2,10);
  buttonSave.mousePressed(saveImage);

  //reset button position and action
  buttonReset = createButton('reset');
  buttonReset.style('font-size', '15px');
  buttonReset.position((windowWidth - width)/2,50);
  buttonReset.mousePressed(resetSketch);
}

//rendering canvas
function draw() {
  if (sketch) { //if a noodle should be drawn
    //noise is between 0 - 1 
    //subtract 0.5 to have the value move up and down or left and right
    //multiply by offset 10 -> offset between (-5 and 5)
    x += (noise(frameCount * 0.01) - 0.5) * 6;
    y += (noise(frameCount * 0.02) - 0.5) * 6;
    
    //enforce boundary conditions
    enforceBoundaryConditions()
    //draw the line
    line(px, py, x, y);
    //update the previous point
    px = x;
    py = y;
  }
}

//creates a new stroke
function createNewStroke() {
  //flip sketch state
  if (sketch) {
    sketch = false
  } else {
    //set the strokes color
    strokeColor = randomColorInPalette()
    stroke(strokeColor)
    //set stroke thickness
    let strokeThickness = random(strokeSizeMin,strokeSizeMax)
    strokeWeight(strokeThickness)
    //start position is where the user clicked
    x = mouseX
    y = mouseY
    //initialize previous points
    px = x;
    py = y;
    //set sketch to true
    sketch = true
  }
}
//generate random hsb color
function randomColor() {
  return color(random(0,360),random(0,100),random(0,100))
}

//generate a random color in the palette based on the key colors
function randomColorInPalette() {
  shuffle(keyColors,true) //eliminate bias in color area by shuffling color vertices for sampling space
  let endColor = keyColors[0] //initialize end color
  for (let i = 1; i < keyColors.length; i++) { //loop through colors to sample from restricted color space
    endColor = lerpColor(endColor,keyColors[i],random(0,1))
  }
  return endColor; //return sampled color
}

//enforces canvas boundary conditions
function enforceBoundaryConditions() {
    //enforce modular boundary
    if (x > width) {
      px = x = 0;
    }
    if (x < 0) {
      px = x = width;
    }
    if (y > height) {
      py = y = 0;
    }
    if (y < 0) {
      py = y = height;
    }
}

//reset the sketch when the button is clicked
function resetSketch() {
  //clear canvas
  sketch = false
  clear();
  //clear colors list and update with new palette
  keyColors = []
  for (let i = 0; i < numKeyColors; i++) {
    keyColors.push(randomColor()) // 5 random colors
  }
  //generate a color in the palette for the background
  background(randomColorInPalette()) //set the background
  //set background
  //handle canvas click
}

//save the sketch as a png
function saveImage(){
  save("tangle.png");
  sketch = false
}

//move the save button as the window is resized
function windowResized() {
  buttonSave.position((windowWidth - width)/2,10);
  buttonReset.position((windowWidth - width)/2,50);
}

