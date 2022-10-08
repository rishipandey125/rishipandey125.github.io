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

var FILL_PARAMS = {
  fill: false,
  fill_color: "#ff0000"
}

var ANIM_PARAMS = {
  value: 0,
  function: "linear",
  timer: 5
}

var SCATTER_PARAMS = {
  math_operators: [
    ['+', '-', '*'],
    ['%',  '(', ')'],
    ['?', '/', '<'],
  ],
  variables: [
    ['p', 'l', 'w'],
    ['h',  '*', 'E'],
    ['SW', 'S', 'SE'],
  ],
  numbers: [
    ['1', '2', '3'],
    ['4',  '5', '6'],
    ['7', '8', '9'],
  ],
  functions: [
    ['random(', 'lerp(', '3'],
    ['4',  '5', '6'],
    ['7', '8', '9'],
  ],
  x_equation: "",
  y_equation: ""
}

var CONSOLE_PARAMS = {
  console: ""
}


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

  updatePointList("random(w)","random(h)",30)
  startSet = true;
  setupUI();
}

function setupUI() {
  const start_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_START_CONTROLS')
  });

  start_pane.addInput(START_PARAMS, 'line_color_start');
  start_pane.addInput(START_PARAMS, 'bg_color_start');
  start_pane.addInput(START_PARAMS, 'thickness_start');
  start_pane.addInput(START_PARAMS, 'num_points_start');

  const end_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_END_CONTROLS')
  });

  end_pane.addInput(END_PARAMS, 'line_color_end');
  end_pane.addInput(END_PARAMS, 'bg_color_end');
  end_pane.addInput(END_PARAMS, 'thickness_end');
  end_pane.addInput(END_PARAMS, 'num_points_end');

  const fill_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_FILL_CONTROLS')
  });

  fill_pane.addInput(FILL_PARAMS, 'fill');
  fill_pane.addInput(FILL_PARAMS, 'fill_color');

  const anim_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_ANIM_CONTROLS')
  });

  anim_pane.addInput(ANIM_PARAMS, 'timer');
  anim_pane.addInput(ANIM_PARAMS, 'function', {
    label: 'animation curve',
    options: {
      random: 'random',
      sin: 'sin',
      linear: 'linear',
      mouse_x: 'mouse_x',
      mouse_y: 'mouse_y',
    }
  });

  //add monitor and graph for tracking the value 
  anim_pane.addMonitor(ANIM_PARAMS, 'value', {
    view: 'graph',
    min: 0,
    max: 1,
  });

  const scatter_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_SCATTER_CONTROLS')
  });

  scatter_pane.registerPlugin(TweakpaneEssentialsPlugin);

  
  scatter_pane.addBlade({
    view: 'buttongrid',
    size: [3, 3],
    cells: (x, y) => ({
      title: SCATTER_PARAMS.math_operators[y][x],
    }),
    label: 'buttongrid',
  }).on('click', (ev) => {
    SCATTER_PARAMS.x_equation += SCATTER_PARAMS.math_operators[ev.index[1]][ev.index[0]]
    SCATTER_PARAMS.y_equation += SCATTER_PARAMS.math_operators[ev.index[1]][ev.index[0]]
  });

  scatter_pane.addBlade({
    view: 'buttongrid',
    size: [3, 3],
    cells: (x, y) => ({
      title: SCATTER_PARAMS.variables[y][x],
    }),
    label: 'buttongrid',
  }).on('click', (ev) => {
    SCATTER_PARAMS.x_equation += SCATTER_PARAMS.variables[ev.index[1]][ev.index[0]]
    SCATTER_PARAMS.y_equation += SCATTER_PARAMS.variables[ev.index[1]][ev.index[0]]
  });

  scatter_pane.addBlade({
    view: 'buttongrid',
    size: [3, 3],
    cells: (x, y) => ({
      title: SCATTER_PARAMS.numbers[y][x],
    }),
    label: 'buttongrid',
  }).on('click', (ev) => {
    SCATTER_PARAMS.x_equation += SCATTER_PARAMS.numbers[ev.index[1]][ev.index[0]]
    SCATTER_PARAMS.y_equation += SCATTER_PARAMS.numbers[ev.index[1]][ev.index[0]]
  });

  scatter_pane.addBlade({
    view: 'buttongrid',
    size: [3, 3],
    cells: (x, y) => ({
      title: SCATTER_PARAMS.functions[y][x],
    }),
    label: 'buttongrid',
  }).on('click', (ev) => {
    SCATTER_PARAMS.x_equation += SCATTER_PARAMS.functions[ev.index[1]][ev.index[0]]
    SCATTER_PARAMS.y_equation += SCATTER_PARAMS.functions[ev.index[1]][ev.index[0]]
  });


  const compile_btn = scatter_pane.addButton({
    title: 'button',
    label: 'compile'
  });
  
  compile_btn.on('click', () => {
    updatePointList(SCATTER_PARAMS.x_equation,SCATTER_PARAMS.y_equation,30)
  });

  const eq_console_pane = new Tweakpane.Pane({
    container: document.getElementById('UI_EQ_CONSOLE_CONTROLS')
  });

  eq_console_pane.addMonitor(SCATTER_PARAMS, 'x_equation', {
    multiline: true,
    lineCount: 1
  });

  eq_console_pane.addMonitor(SCATTER_PARAMS, 'y_equation', {
    multiline: true,
    lineCount: 1
  });
}

//update the plot with the changed equation
function updatePointList(equationX,equationY,numPoints) {
  //function turns string expression to executable function for a list of vars
  //function from https://stackoverflow.com/questions/41283897/how-to-convert-string-into-math-function-just-once
  function toFunction(equation, variables) {
    const expFormat = '(\\d+(?:\\.\\d+|)){{@}}';
    var expressionCache = {};
    function lookupExpansion(v) {
      if (!expressionCache[v]) {
        expressionCache[v] = new RegExp(expFormat.replace(/\{\{\@\}\}/, v), 'g');
      }
      return expressionCache[v];
    }
    variables.forEach(variable => {
      equation = equation.replace(lookupExpansion(variable), '$1 * ' + variable);
    });
    equation = equation.replace(/\b([a-z])([a-z])\b/g, '$1 * $2');
    // console.log('[DEBUG]: Expanded => ' + equation);

    return Function.apply(null, variables.concat('return ' + equation));
  }	

  var xScatter = toFunction(equationX,['p', 'l', 'w','h']);
  var yScatter = toFunction(equationY,['p', 'l', 'w','h']);

  pointList = []
  for (let x = 0; x < numPoints; x++) {
    let prevX = 0
    let prevY = 0
    if (x > 0) {
      prevX = pointList[x-1][0]
      prevY = pointList[x-1][1]
    }
    pointList.push([xScatter(x,numPoints,canvasWidth,canvasHeight),yScatter(x,numPoints,canvasWidth,canvasHeight)])
  }
  startControlPoint = pointList[0]
  endControlPoint = pointList[pointList.length-1]
}

// onUpdate
function draw() { 
  //get the lerp value 
  
  let scaledTime = ANIM_PARAMS.timer * 1000; // convert the seconds to millisecnds 
  let i = (totalTime % scaledTime)/scaledTime;
  if (ANIM_PARAMS.function == "random") {
    if (i < 0.02) {
      ANIM_PARAMS.value = Math.random(0,1); 
    }
  } else if (ANIM_PARAMS.function == "sin") {
    ANIM_PARAMS.value = (Math.sin(i*(2*Math.PI))+1)/2; //map sin to 0-1
  } else if (ANIM_PARAMS.function == "linear") {
    ANIM_PARAMS.value = i; //return 0-1 interpolater
  } else if (ANIM_PARAMS.function == "mouse_x") {
    ANIM_PARAMS.value = constrain(mouseX/canvasWidth,0,1);
  } else if (ANIM_PARAMS.function == "mouse_y") {
    ANIM_PARAMS.value = constrain(mouseY/canvasHeight,0,1);
  }

  let animValue = ANIM_PARAMS.value;

  //set point list 
  let num_points = lerp(START_PARAMS.num_points_start,END_PARAMS.num_points_end,animValue);

  updatePointList(SCATTER_PARAMS.x_equation,SCATTER_PARAMS.y_equation,30)

  background(lerpColor(color(START_PARAMS.bg_color_start),color(END_PARAMS.bg_color_end),animValue))
  stroke(lerpColor(color(START_PARAMS.line_color_start),color(END_PARAMS.line_color_end),animValue))
  strokeWeight(lerp(START_PARAMS.thickness_start,END_PARAMS.thickness_end,animValue))

  if (FILL_PARAMS.fill) {
    fill(FILL_PARAMS.fill_color)
  } else {
    noFill()
  }

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