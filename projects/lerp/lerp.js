//Global Variables

var canvas;
var canvasWidth;
var canvasHeight;

var totalTime = 0; //total time

var START_PARAMS = {
  line_color_start: "#ffffff",
  bg_color_start: "#000000",
  thickness_start: 5,
  num_points_start: 10
}

var END_PARAMS = {
  line_color_end: "#000000",
  bg_color_end: "#ffffff",
  thickness_end: 10,
  num_points_end: 50
}

var startThickness;
var endThickness;
var startNumPoints;
var endNumPoints;

var pointList = [];
var startControlPoint;
var startSet;
var endControlPoint;

const RADIUS = 2; //radius of rendered keyPoints

var selectedIndex = 0; //index selected by the mouse
var pointSelected = false; //indicating a point was selected

//onStart
function setup() {  
  let aspectRatio = 1; //aspect ratio of canvas
  canvasHeight = 800 //canvas height
  canvasWidth = canvasHeight*aspectRatio //canvas width

  //enforce conditions for mobile friendly canvas
  if (windowWidth < canvasWidth) {
    //make canvas mobile friendly
    canvasWidth = 0.8*windowWidth;
    canvasHeight = canvasWidth * (1/aspectRatio);
  }

  canvas = createCanvas(canvasWidth,canvasHeight); //create canvas
  canvas.parent('sketch'); //parent the canvas to sketch

  colorMode(RGB);

  startThickness = 5
  endThickness = 5

  startNumPoints = 4
  endNumPoints = 10
  //initialize the start and end points
  // startControlPoint = [10,10]
  startSet = true;
  // endControlPoint = [100,100]

  //for spawning the things you have are...
  //which point in the sequence it is 
  //how many points there are 
  //how large the canvas is
  //canvas origin is top left corner
  setupUI();
}

function setupUI() {
  const start_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_START_CONTROLLERS')
  });

  start_pane.addInput(START_PARAMS, 'line_color_start');
  start_pane.addInput(START_PARAMS, 'bg_color_start');
  start_pane.addInput(START_PARAMS, 'thickness_start');
  start_pane.addInput(START_PARAMS, 'num_points_start');

  const end_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_END_CONTROLLERS')
  });

  end_pane.addInput(END_PARAMS, 'line_color_end');
  end_pane.addInput(END_PARAMS, 'bg_color_end');
  end_pane.addInput(END_PARAMS, 'thickness_end');
  end_pane.addInput(END_PARAMS, 'num_points_end');
}

function updatePointList(numPoints) {
  pointList = []
  for (let x = 0; x < numPoints; x++) {
    //f(x) function
    //
    pointList.push([random(canvasWidth),random(canvasHeight)])
    // pointList.push([sin(x/numPoints)*random(canvasWidth),random(canvasHeight)])
  }
  startControlPoint = pointList[0]
  endControlPoint = pointList[pointList.length-1]
}

// onUpdate
function draw() { 
  let animTime = 15
  let animValue = ((totalTime/1000)%animTime)/animTime

  //set point list 
  updatePointList(lerp(START_PARAMS.num_points_start,END_PARAMS.num_points_end,animValue))

  background(lerpColor(color(START_PARAMS.bg_color_start),color(END_PARAMS.bg_color_end),animValue))
  stroke(lerpColor(color(START_PARAMS.line_color_start),color(END_PARAMS.line_color_end),animValue))
  strokeWeight(lerp(START_PARAMS.thickness_start,END_PARAMS.thickness_end,animValue))
  noFill()

  if (startSet) {
    beginShape()
    // beginning point for controlling curve 
    curveVertex(startControlPoint[0],startControlPoint[1])
    for (let i = 0; i < pointList.length; i++) {
      let x = pointList[i][0]
      let y = pointList[i][1]
      curveVertex(x,y) //add the curve point  -- it d
      // circle(x,y,RADIUS) // draw a circle at that curve point to visualize
    }
    //end point for controlling curve 
    curveVertex(endControlPoint[0],endControlPoint[1])
    endShape()

    //draw points
    // drawCircles()
  }

  totalTime += deltaTime; //update total time
}

function drawCircles() {
  stroke(255,0,0)
  for (let i = 0; i < pointList.length; i++) {
    circle(pointList[i][0],pointList[i][1],RADIUS)
  }
}