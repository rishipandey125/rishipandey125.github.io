let facemesh; // facemesh variable
let predictions = []; //predictions list (num of people predicted)
let capture; //video feed for webcam
var captured = false;
var px = 0; //previous x component  
var py = 0; //prev y

var savedStart = false //bool indicating facepoints were saved
var savedEnd = false

var facePointsStart = []; //list of saved face points start
var facePointsEnd = []; //list of saved face points end

var numPoints = 0; //total num point

var tx; //translate x y
var ty; 


var totalTime = 0; //total time

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
    bg1: '#000000',
    bg2: '#ffffff',
    stroke1: '#ffffff',
    stroke2: '#000000',
    thickness1: 25,
    thickness2: 25,
  };

  const pane = new Tweakpane.Pane({
            container: document.getElementById('UI'),
            expanded: true
          });

  const tab = pane.addTab({pages: [
    {title: 'pose #1'},
    {title: 'pose #2'}
    ],
  });

  tab.pages[0].addInput(PARAMS, 'design1', {label:'design'});

  tab.pages[1].addInput(PARAMS, 'design2', {label:'design'});

  tab.pages[0].addInput(PARAMS, 'bg1',{
    label: 'bg',
    });
  
  tab.pages[0].addInput(PARAMS, 'stroke1',{
    label: 'stroke',
    });

  tab.pages[1].addInput(PARAMS, 'bg2',{
    label: 'bg',
    });
  
  tab.pages[1].addInput(PARAMS, 'stroke2',{
    label: 'stroke',
    });

  //thickness controls for stroke
  tab.pages[0].addInput(PARAMS, 'thickness1',{
          label: 'thickness',
          min: 1,
          max: 100,
          step: 1
          }
        );

  //thickness controls for stroke
  tab.pages[1].addInput(PARAMS, 'thickness2',{
    label: 'thickness',
    min: 1,
    max: 100,
    step: 1
    }
  );

}

// signal that the model is ready
function modelReady() {
  console.log("Model ready!");
}

// draw() function (onUpdate)
function draw() {

  let d1 = false;
  let d2 = false;

  let bgColor1 = color(PARAMS.bg1);
  let strokeColor1 = color(PARAMS.stroke1);
  let bgColor2 = color(PARAMS.bg2);
  let strokeColor2 = color(PARAMS.stroke2);

  //get the predictions and save the keypoints
  if (!captured) { //if not captured then when the user taps capture their face as the seed mesh
    clear();
    if (!savedEnd) {
      background(bgColor2)
      fill(strokeColor2)
    }
    if (!savedStart) {
      background(bgColor1)
      fill(strokeColor1)
    }
    drawKeyPoints();
    return
  }

  if (savedStart && savedEnd) { //keypoints have been cached 
    clear()

    curveTightness(0); //set the curve tightness

    beginShape() //begin the curve
    noFill() //dont fill in the curve

    //loop through the points
    let noiseVal = 0;
    let interpolator = 0;
     
    let modTime = totalTime % 4500; //loop every 10 seconds

    let l = (modTime % 500)/500; 

    interpolator = modTime/4500;
    noiseVal = 10;

    let thicknessInterp = lerp(PARAMS.thickness1,PARAMS.thickness2,interpolator)/100;
    strokeWeight(0.75 + (12.5-0.75)*thicknessInterp); //stroke thickness
    background(lerpColor(bgColor1,bgColor2,interpolator));
    stroke(lerpColor(strokeColor1,strokeColor2,interpolator));

    if (PARAMS.design1 && !PARAMS.design2) {
      background(bgColor1);
      stroke(strokeColor1);
      d1 = true;
    } else if (PARAMS.design2 && !PARAMS.design1) {
      background(bgColor2);
      stroke(strokeColor2);
      d2 = true;
    }
    for (let i = 0; i < numPoints; i++) {
      let noiseSeed = random(100); //seed for the perlin noise

      let xNoise = 0; //initiailize x and y noise
      let yNoise = 0;


      if (d1) {
        strokeWeight(0.75 + (12.5-0.75)*0.1);
        interpolator = 0 //display the first face
        let radius = 2*RADIUS;
        if (i == selectedIndex && pointSelected) {
          radius = 5*RADIUS;
        }
        console.log("in")
        circle(facePointsStart[i].x,facePointsStart[i].y,radius);
      } else if (d2) {
        strokeWeight(0.75 + (12.5-0.75)*0.1);
        interpolator = 1; //display the second face
        let radius = 2*RADIUS;
        if (i == selectedIndex && pointSelected) {
          radius = 5*RADIUS;
        }
        circle(facePointsEnd[i].x,facePointsEnd[i].y,radius);
      } else {
        xNoise = (noise(noiseSeed * 0.01) - 0.5) * noiseVal;
        yNoise = (noise(noiseSeed * 0.02) - 0.5) * noiseVal;
      }
  
      //x and y for curveVertex - is lerped between the two
      let x = lerp(facePointsStart[i].x,facePointsEnd[i].x,interpolator) + xNoise
      let y = lerp(facePointsStart[i].y,facePointsEnd[i].y,interpolator) + yNoise
      curveVertex(x,y); //add face mesh point to the stroke
    }
    endShape() //end the shape
  }




  totalTime += deltaTime;
}


function mouseClicked() {
  //find which point you clicked 
  //return the index of that point

  if (!captured) {
    if (!savedStart) {
      if (predictions.length > 0) {
        saveKeyPoints(0)
        return
      }
    }
    
    if (!savedEnd) {
      if (predictions.length > 0) {
        saveKeyPoints(1)
        captured = true;
        return
      }
    }

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

      // fill(PARAMS.line);
      ellipse(x-tx, y-ty, 5, 5);
    }
  }
}


// A function to draw ellipses over the detected keypoints
function saveKeyPoints(flag) {
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
            if (flag == 1) {
              facePointsEnd.push(point)   
            } else {
              facePointsStart.push(point) //add the point to the overall list 
            }
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) {
              const [x, y] = keyPoints[start];
              let point = createVector(x-tx,y-ty);
              if (flag == 1) {
                facePointsEnd.push(point)   
              } else {
                facePointsStart.push(point) //add the point to the overall list 
              }
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
  if (flag == 1) {
    savedEnd = true 
  } else {
    savedStart = true
  }
}


