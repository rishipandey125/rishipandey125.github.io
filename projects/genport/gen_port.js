let facemesh; // facemesh variable
let predictions = []; //predictions list (num of people predicted)
let img; //input image from StyleGan2
let capture;
var captured = false;
var px = 0; //previous x component  
var py = 0; //prev y
var saved = false //bool indicating facepoints were saved
var facePointsStart = []; //list of saved face points start
var facePointsEnd = []; //list of saved face points end
var numPoints = 0;

var tx; //translate x y
var ty; 


var renderCircles = false; //render the keyPoints
const RADIUS = 5; //radius of rendered keyPoints

var selectedIndex = 0; //index selected by the mouse
var pointSelected = false; //indicating a point was selected

var semantics = [ //list and order of semantics for saved facepoints
                'lipsUpperOuter',
                'lipsLowerOuter',
                'lipsUpperInner',
                'lipsLowerInner', 
                'noseBottom',
                'noseLeftCorner',
                'noseTip',
                'midwayBetweenEyes',
                'leftEyeUpper1',
                'leftEyeLower1',
                'silhouette',
                'rightEyebrowUpper',
                'rightEyeLower1',
                'rightEyeUpper1'
              ]

//PARAMS
var PARAMS;

function setup() {
  // create a canvas that's at least the size of the image.
  setupUI()

  let aspectRatio = 9/16;
  let canvasHeight = 700
  let canvasWidth = canvasHeight*aspectRatio

  //enforce conditions for mobile friendly canvas
  if (windowWidth < canvasWidth) {
    //make canvas mobile friendly
    canvasWidth = 0.8*windowWidth;
    canvasHeight = canvasWidth * (1/aspectRatio);
  }

  tx = (640/2)-(canvasWidth/2); //calculate x and y translation from webcam to frame
  ty = (480/2)-(canvasHeight/2); //640x480 is the output for webcam facemesh

  createCanvas(canvasWidth,canvasHeight) 

  capture = createCapture(VIDEO);
  capture.size(width,height);
  facemesh = ml5.facemesh(capture, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  facemesh.on("predict", results => {
    predictions = results;
  });

  capture.hide(); //hide the webcam

}

//setup the UI
function setupUI() {
  //initial params
  PARAMS = {
    design1: false,
    design2: false,
    line: '#ffffff',
    lerp: 1,
    thickness: 25,
    noise: 10,
    background: '#000000',
    face: '#ff0000'
  };

  const pane = new Tweakpane.Pane({
            container: document.getElementById('UI'),
            expanded: true
          });

  
  pane.addInput(PARAMS, 'design1');
  pane.addInput(PARAMS, 'design2');

  //set the bg color of the canvas
  pane.addInput(PARAMS, 'background',{
              label: 'bg',
              picker: 'inline',
              expanded: true,
              });

  //set the bg color of the canvas
  pane.addInput(PARAMS, 'face',{
    label: 'face',
    picker: 'inline',
    expanded: true,
    });

  pane.addInput(PARAMS, 'lerp',{
    label: 'lerp',
    min: 1,
    max: 100,
    step: 1
    }
  );

  //thickness controls for stroke
  pane.addInput(PARAMS, 'thickness',{
          label: 'thickness',
          min: 1,
          max: 100,
          step: 1
          }
        );

  pane.addInput(PARAMS, 'noise',{
          label: 'noise',
          min: 1,
          max: 100,
          step: 1
          }
        );



  //color controls for stroke
 pane.addInput(PARAMS, 'line',{
              label: 'line',
              picker: 'inline',
              expanded: true,
              });

}

// signal that the model is ready
function modelReady() {
  console.log("Model ready!");
}

function randomColor() {
  return color(random(0,255),random(0,255),random(0,255));
}

// draw() function (onUpdate)
function draw() {
  //get the predictions and save the keypoints
  if (!captured) { //if not captured then when the user taps capture their face as the seed mesh
    clear();
    background(PARAMS.background)
    drawKeyPoints();
    return
  }

  if (predictions.length > 0 && !saved) { //cache the keypoints
    saveKeyPoints();
  } else if (saved) { //keypoints have been cached 
    clear()
    // set the background color
    background(PARAMS.background)

    //create a new stroke
    stroke(PARAMS.line); // stroke color
    strokeWeight((PARAMS.thickness/100)*(25)) //stroke thickness
    curveTightness(0); //set the curve tightness

    beginShape() //begin the curve
    noFill() //dont fill in the curve
    //loop through the points
    for (let i = 0; i < numPoints; i++) {
      let noiseSeed = random(100); //seed for the perlin noise

      let xNoise = 0; //initiailize x and y noise
      let yNoise = 0;

      let interpolator = PARAMS.lerp/100;

      if (PARAMS.design1 && !PARAMS.design2) {
        interpolator = 0 //display the first face
        let radius = 2*RADIUS;
        if (i == selectedIndex && pointSelected) {
          radius = 5*RADIUS;
        }
        circle(facePointsStart[i].x,facePointsStart[i].y,radius);
      } else if (!PARAMS.design1 && PARAMS.design2) {
        interpolator = 1; //display the second face
        let radius = 2*RADIUS;
        if (i == selectedIndex && pointSelected) {
          radius = 5*RADIUS;
        }
        circle(facePointsEnd[i].x,facePointsEnd[i].y,radius);
      } else {
        xNoise = (noise(noiseSeed * 0.01) - 0.5) * PARAMS.noise;
        yNoise = (noise(noiseSeed * 0.02) - 0.5) * PARAMS.noise;
      }
      //x and y for curveVertex - is lerped between the two
      // console.log(facePointsStart[i].x==facePointsEnd[i].x)
      let x = lerp(facePointsStart[i].x,facePointsEnd[i].x,interpolator) + xNoise
      let y = lerp(facePointsStart[i].y,facePointsEnd[i].y,interpolator) + yNoise
      curveVertex(x,y); //add face mesh point to the stroke
    }
    endShape() //end the shape
  }




  // beginShape()
}


function mousePressed() {
  //find which point you clicked 
  //return the index of that point
  if (!captured) {
    captured = true;
  } 

  if (PARAMS.design1 && !PARAMS.design2) {
    if (pointSelected) {
      facePointsStart[selectedIndex] = createVector(mouseX,mouseY);
      pointSelected = false;
    } else {
      selectedIndex = getExistingPointIndex(mouseX,mouseY,0);
      if (selectedIndex > -1)
        pointSelected = true    
    }
  } else if (!PARAMS.design1 && PARAMS.design2) {
    if (pointSelected) {
      facePointsEnd[selectedIndex] = createVector(mouseX,mouseY);
      pointSelected = false;
    } else {
      selectedIndex = getExistingPointIndex(mouseX,mouseY,1);
      if (selectedIndex > -1)
        pointSelected = true    
    }
  }
}

function getExistingPointIndex(x,y,flag) {
  for (let i = 0; i < numPoints; i++) {
    let existingX = facePointsStart[i].x;
    let existingY = facePointsStart[i].y;
    if (flag == 1) {
      existingX = facePointsEnd[i].x;
      existingY = facePointsEnd[i].y;
    }
    if (dist(x,y,existingX,existingY) <= RADIUS) 
      return i;
  }
  return -1; //return -1 if no point was selected
}


function drawKeyPoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      fill(PARAMS.line);
      ellipse(x-tx, y-ty, 5, 5);
    }
  }
}


// A function to draw ellipses over the detected keypoints
function saveKeyPoints() {
  for (let i = 0; i < predictions.length; i += 1) { //for all the predictions - should be 1
    // loop through all semantics - if it is that one draw
    for (let k = 0; k < semantics.length; k++) {
      Object.entries(predictions[i].annotations).forEach(([key, keyPoints]) => { //loop through key and values in the semantic understanding of facemesh
        if (key == semantics[k]) { //if it is one of the keys we want to draw
          //get the first and last points in the array
          const [sx, sy] = keyPoints[0];
          const [ex, ey] = keyPoints[keyPoints.length-1];

          if (k == 0) { //if the sketch just started
            px =  sx; //set prev
            py =  sy;
          }

          //iterate forwards
          let start = 0;
          let end = keyPoints.length-1;
          let iterate = 1;

          //if the last point is closest
          if (dist(px,py,sx,sy) > dist(px,py,ex,ey)) {
            //iterate backwards
            start = keyPoints.length-1;
            end = 0;
            iterate = -1;
          }
          
          if (start == end) { // if array len is 1 
            const [x, y] = keyPoints[start];
            let point = createVector(x-tx,y-ty);
            facePointsStart.push(point) //add the point to the overall list 
            facePointsEnd.push(point)   
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) {
              const [x, y] = keyPoints[start];
              let point = createVector(x-tx,y-ty);
              facePointsStart.push(point) //add point to the overall list
              facePointsEnd.push(point)
              // initialPoints2.push(point)
              px = x; //update prev
              py = y;
              start += iterate;
            }
          }
        }
      });
    }
  }
  numPoints = facePointsStart.length;
  // facePointsEnd = facePointsStart;

  saved = true //facepoints have been saved! 
}


