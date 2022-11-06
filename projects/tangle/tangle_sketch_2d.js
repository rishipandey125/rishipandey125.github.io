var canvas; //setup the canvas for rendering
//stroke properties
var strokeSizeMin; //min thickness
var strokeSizeMax; //max thickness
var strokeColor; //stroke color
var x,y; //next xy of the stroke
var px,py; //previous xy of the stroke

//control whether to sketch or not
let sketch;

//PARAMS
var PARAMS;


//return a random pastel color
function randomPastelColor() {
  colorMode(HSB) //use hsb color space so I can saturate things
  
  var col = color(random(0,360),random(0,100),random(0,100)) //generate random color
  
  var saturationValue = 1.1 * saturation(col) //saturate 10%

  var mixedHue = (0.5 * (hue(col))) + (0.5 * 210) //lerp hue with white in HSB
  var mixedSat = (0.5 * saturationValue) + (0.5 * 1) //lerp saturation with white in HSB
  var mixedBri = (0.5 * brightness(col)) + (0.5 * 100) //lerp brightness with white in HSB
  var pastelColor = color(mixedHue,mixedSat,mixedBri) //random pastel color

  return pastelColor
}


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
  colorMode(RGB) //use hsb color space
  //set bg
  let bgColor = color(random(0,255),random(0,255),random(0,255)) //random background color

  background(bgColor)

  //set the canvas stroke min & max thickness
  strokeSizeMin = 1
  strokeSizeMax = 12
}

//rendering canvas
function draw() {
  if (sketch) { //if a noodle should be drawn
    //noise is between 0 - 1 
    //subtract 0.5 to have the value move up and down or left and right
    //multiply by offset 10 -> offset between (-5 and 5)
    x += (noise(frameCount * 0.01) - 0.5) * 10;
    y += (noise(frameCount * 0.02) - 0.5) * 10;
    
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
    strokeColor = randomPastelColor()
    stroke(strokeColor)
    //set stroke thickness
    let strokeThickness = lerp(strokeSizeMin,strokeSizeMax,random());
    // random(strokeSizeMin,strokeSizeMax)
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


//save the sketch as a png
function saveImage(){
  save("tangle.png");
  sketch = false
}
