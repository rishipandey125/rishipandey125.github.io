//Global Variables
let facemesh; // facemesh variable
let predictions = []; //predictions list (num of people predicted)
let capture; //video feed for webcam
var captured = false; //whether the keyframes have been captured 

var savedStart = false //bool indicating facepoints were saved
var savedEnd = false //end face points saved

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

//PARAMS for UI controllers
var PARAMS;

//onStart
function setup() {
  setupUI() //setup the UI controllers

  let aspectRatio = 9/16; //aspect ratio of canvas
  let canvasHeight = 700 //canvas height
  let canvasWidth = canvasHeight*aspectRatio //canvas width

  //enforce conditions for mobile friendly canvas
  if (windowWidth < canvasWidth) {
    //make canvas mobile friendly
    canvasWidth = 0.8*windowWidth;
    canvasHeight = canvasWidth * (1/aspectRatio);
  }

  tx = (640/2)-(canvasWidth/2); //calculate x and y translation from webcam to frame
  ty = (480/2)-(canvasHeight/2); //640x480 is the output for webcam facemesh

  createCanvas(canvasWidth,canvasHeight) //create canvas

  capture = createCapture(VIDEO); //record from webcam
  capture.size(width,height); //webcam width/height



  facemesh = ml5.facemesh(capture, modelReady); //create face mesh model with webcam

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
    design1: false, //design first keypoint set
    design2: false, //design second keypoint set
    bg1: '#000000', //first bg color
    bg2: '#ffffff', //second bg color  
    stroke1: '#ffffff', //first stroke color
    stroke2: '#000000', //second stroke color 
    thickness1: 25, //first thickness
    thickness2: 25, //second thickness
    noise1: 10, //first noise
    noise2: 10 //second noise
  };

  const pane = new Tweakpane.Pane({
            container: document.getElementById('UI'),
            expanded: true
          }); //create the pane and parent it to the "UI"

  const tab = pane.addTab({pages: [ //create two tabs one for pose 1 and one for pose 2 
    {title: 'pose #1'},
    {title: 'pose #2'}
    ],
  });

  tab.pages[0].addInput(PARAMS, 'design1', {label:'design'}); //design checkbox
  tab.pages[1].addInput(PARAMS, 'design2', {label:'design'});

  //colors for each tab
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

  //thickness controls for stroke 1
  tab.pages[0].addInput(PARAMS, 'thickness1',{
          label: 'thickness',
          min: 1,
          max: 100,
          step: 1
          }
        );

  //noise controls for stroke 1
  tab.pages[0].addInput(PARAMS, 'noise1',{
    label: 'noise',
    min: 1,
    max: 100,
    step: 1
    }
  );

  //thickness controls for stroke 2
  tab.pages[1].addInput(PARAMS, 'noise2',{
    label: 'noise',
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

// onUpdate
function draw() { 
  let d1 = false; //design state flags
  let d2 = false; 

  //convert colors from user input string to color objects
  let bgColor1 = color(PARAMS.bg1);
  let strokeColor1 = color(PARAMS.stroke1);
  let bgColor2 = color(PARAMS.bg2);
  let strokeColor2 = color(PARAMS.stroke2);

  //get the predictions and save the keypoints
  if (!captured) { //if not captured then when the user taps capture their face as the seed mesh
    clear(); // clear the canvas
    if (!savedEnd) { // if the end is not saved 
      background(bgColor2)
      fill(strokeColor2)
    }
    if (!savedStart) { // if the start is not saved
      background(bgColor1)
      fill(strokeColor1)
    }
    drawKeyPoints(); //draw the keypoints from webcam
    return
  }

  if (savedStart && savedEnd) { //keypoints have been cached 
    clear(); //clear canvas

    beginShape() //begin the curve
    noFill() //dont fill in the curve
    
    //temp interpolator
    let interpolator = 0;
     
    let modTime = totalTime % 4500; //loop every 10 seconds

    let l = (modTime % 500)/500; 

    interpolator = modTime/4500;


    //set the thickness & noise values based on the interpolator
    let thicknessInterp = lerp(PARAMS.thickness1,PARAMS.thickness2,interpolator)/100;
    let noiseVal = lerp(PARAMS.noise1,PARAMS.noise2,interpolator);
    strokeWeight(0.75 + (12.5-0.75)*thicknessInterp); //set thickness
    //set the background and stroke color based on the interpolator
    background(lerpColor(bgColor1,bgColor2,interpolator));
    stroke(lerpColor(strokeColor1,strokeColor2,interpolator));

    //if design states set the appropriate colors and cache design state
    if (PARAMS.design1 && !PARAMS.design2) {
      background(bgColor1);
      stroke(strokeColor1);
      d1 = true;
    } else if (PARAMS.design2 && !PARAMS.design1) {
      background(bgColor2);
      stroke(strokeColor2);
      d2 = true;
    }

    //loop through all the points
    for (let i = 0; i < numPoints; i++) {
      let noiseSeed = random(100); //seed for the perlin noise

      let xNoise = 0; //initiailize x and y noise
      let yNoise = 0;


      if (d1) { //if design state 1
        strokeWeight(0.75 + (12.5-0.75)*0.1); //set a constant stroke weight
        interpolator = 0 //display the first face so interpolator must be 0
        let diameter = 2*RADIUS; //default diameter
        if (i == selectedIndex && pointSelected) { //if this point was selected by the mouse
          diameter = 5*RADIUS; //larger diameter  
        }
        circle(facePointsStart[i].x,facePointsStart[i].y,diameter); //draw the point
      } else if (d2) { //if design state 2
        strokeWeight(0.75 + (12.5-0.75)*0.1); //set a constant stroke weight
        interpolator = 1; //display the second face so interpolator must be 1
        let diameter = 2*RADIUS; //default diamter 
        if (i == selectedIndex && pointSelected) { //if this point was selected by the mouse
          diameter = 5*RADIUS; //larger diamter
        }
        circle(facePointsEnd[i].x,facePointsEnd[i].y,diameter); //draw the point
      } else { //not a design state so initialize noise to be non 0
        xNoise = (noise(noiseSeed * 0.01) - 0.5) * noiseVal; //create noise based on curr noise val
        yNoise = (noise(noiseSeed * 0.02) - 0.5) * noiseVal; 
      }
      
      //x and y for curveVertex - is lerped between the two
      let x = lerp(facePointsStart[i].x,facePointsEnd[i].x,interpolator) + xNoise
      let y = lerp(facePointsStart[i].y,facePointsEnd[i].y,interpolator) + yNoise
      curveVertex(x,y); //add face mesh point to the stroke
    }
    endShape() //end the shape
  }

  totalTime += deltaTime; //update total time
}


//mouse clicked!
function mouseClicked() {

  // if the key points have not been cached
  if (!captured) { 
    if (!savedStart) { //if the first set has not been cached
      if (predictions.length > 0) {
        saveKeyPoints(0) //cache current view! 
        return
      }
    }
    
    if (!savedEnd) { //if the second set has not been cached - you got here since the first was
      if (predictions.length > 0) {
        saveKeyPoints(1) //cache the current view!
        captured = true;
        return
      }
    }

  } 

  if (PARAMS.design1 && !PARAMS.design2) { //design state 1
    if (pointSelected) { // if a point is selected 
      facePointsStart[selectedIndex] = createVector(mouseX,mouseY); //then move that point to where you click
      pointSelected = false; //unselect point
    } else { // not selected
      selectedIndex = getExistingPointIndex(mouseX,mouseY,0); //find if a point is near where you clicked
      if (selectedIndex > -1) //if a point was selected register that
        pointSelected = true    
    }
  } else if (!PARAMS.design1 && PARAMS.design2) { //design state 2
    if (pointSelected) { // if a point is selected 
      facePointsEnd[selectedIndex] = createVector(mouseX,mouseY); //then move that point to where you click
      pointSelected = false; //unselect point
    } else { // not selected 
      selectedIndex = getExistingPointIndex(mouseX,mouseY,1); //find if a point is near where you clicked
      if (selectedIndex > -1) //if a point was selected register that
        pointSelected = true    
    }
  }
}

//find if a point exists at an xy location 
function getExistingPointIndex(x,y,flag) {
  for (let i = 0; i < numPoints; i++) { //loop through points 
    let existingX = facePointsStart[i].x;
    let existingY = facePointsStart[i].y;
    if (flag == 1) { //if dealing with the second set 
      existingX = facePointsEnd[i].x;
      existingY = facePointsEnd[i].y;
    } 
    if (dist(x,y,existingX,existingY) <= RADIUS)  //if the xy location is close to the point then it exists at that location
      return i; //return the index
  }
  return -1; //return -1 if no point was selected
}

//draw face points
function drawKeyPoints() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh; //loop through the keypoints of ML algo

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];
      ellipse(x-tx, y-ty, 5, 5); //draw the keypoints after transformation
    }
  }
}

//cache the keypoints
function saveKeyPoints(flag) {
  let px = 0; //prev x and y points
  let py = 0;
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
            let point = createVector(x-tx,y-ty); //get the point
            if (flag == 1) {
              facePointsEnd.push(point) // add the point to the second keyframe
            } else {
              facePointsStart.push(point) //add the point to the first keyframe
            }
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) { 
              const [x, y] = keyPoints[start];
              let point = createVector(x-tx,y-ty); //get the point 
              if (flag == 1) { //cache it corresponding to the flag
                facePointsEnd.push(point)   
              } else {
                facePointsStart.push(point)  
              }
              px = x; //update prev
              py = y;
              start += iterate;
            }
          }
        }
      });
    }
  }
  numPoints = facePointsStart.length; //update num points
  if (flag == 1) { //update flags for whether the points were cached
    savedEnd = true 
  } else {
    savedStart = true
  }
}


