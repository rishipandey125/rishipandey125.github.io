let facemesh; // facemesh variable
let predictions = []; //predictions list (num of people predicted)
let img; //input image from StyleGan2
var px = 0; //previous x component  
var py = 0; //prev y
var saved = false //bool indicating facepoints were saved
var facePoints = []; //list of saved facepoints

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
                // 'noseRightCorner',
                'noseLeftCorner',
                'noseTip',
                'midwayBetweenEyes',
                'leftEyeUpper1',
                'leftEyeLower1',
                // 'leftEyebrowLower',
                'silhouette',
                'rightEyebrowUpper',
                'rightEyeLower1',
                'rightEyeUpper1'
                // 'rightEyeUpper0'
                // 'rightEyeLower0',
                // 'rightEyeUpper2',
                // 'rightEyeLower2',
                // 'rightEyeLower3',
                // 'rightEyebrowLower',
                // 'leftEyeUpper0',
                // 'leftEyeLower0',
                // 'leftEyeUpper2',
                // 'leftEyeLower2',
                // 'leftEyeLower3',
                // 'leftEybrowUpper',
                // 'rightCheek',
                // 'leftCheek'
              ]

//PARAMS
var PARAMS;


function preload() {
  img = loadImage('https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image');
}

function setup() {
  // create a canvas that's at least the size of the image.
  createCanvas(img.width,img.height)
  setupUI()
  background('white')
  imageReady() //load poseNet when image ready
}

//setup the UI
function setupUI() {
  //initial params
  PARAMS = {
    design: false,
    line: '#ffffff',
    thickness: 25,
    background: '#000000',
    face: '#ff0000'
  };

  const pane = new Tweakpane.Pane({
            container: document.getElementById('UI'),
            expanded: true
          });

  
  pane.addInput(PARAMS, 'design');

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

  //thickness controls for stroke
  pane.addInput(PARAMS, 'thickness',{
          label: 'thickness',
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

// when the image is ready, then load up poseNet
function imageReady() {
  facemesh = ml5.facemesh(modelReady);//load poseNet

  facemesh.on("predict", results => {
    predictions = results;
  });
}

// when poseNet is ready, do the detection
function modelReady() {
  // console.log("Model ready!");
  facemesh.predict(img);//predict the keypoints
}

function randomColor() {
  return color(random(0,255),random(0,255),random(0,255));
}

// draw() function (onUpdate)
function draw() {
  //get the predictions and save the keypoints
  if (predictions.length > 0 && !saved) {
    saveKeyPoints();

  } else if (saved) { //keypoints have been predicted 

    background(PARAMS.background)
    //draw the image abstract

    //create a new stroke

    stroke(PARAMS.line);
    strokeWeight((PARAMS.thickness/100)*(25))
    // strokeWeight(100)
    curveTightness(0);

    beginShape()
    noFill()
    for (let i = 0; i < facePoints.length; i++) {
      let noiseSeed = random(100)

      let xNoise = 0;
      let yNoise = 0;

      if (PARAMS.design) {
        let radius = 2*RADIUS;
        if (i == selectedIndex && pointSelected) {
          radius = 5*RADIUS;
        }
        circle(facePoints[i].x,facePoints[i].y,radius);
      } else {
        xNoise = (noise(noiseSeed * 0.01) - 0.5) * 100;
        yNoise = (noise(noiseSeed * 0.02) - 0.5) * 100;
      }
      curveVertex(facePoints[i].x+xNoise,facePoints[i].y+yNoise); //add face mesh point to the stroke
    }
    endShape() //end the shape
  }

  // beginShape()
}


function mousePressed() {
  //find which point you clicked 
  //return the index of that point
  if (PARAMS.design) {
    if (pointSelected) {
      //move said point
      facePoints[selectedIndex] = createVector(mouseX,mouseY);
      //set point Selected to false
      pointSelected = false;
    }  else {
      selectedIndex = getExistingPointIndex(mouseX,mouseY);
      if (selectedIndex > -1)
        pointSelected = true
    }
  }

}

// function mouseReleased() {
//   if (pointSelected) {
//     // facePoints[selectedIndex] = createVector(mouseX,mouseY)
//     pointSelected = false
//   }
// }

// function mouseDragged() {
//   //if a point was clicked 
//   //set the point at that index to mouseX,mouseY
//   if (pointSelected) {
//     facePoints[selectedIndex] = createVector(mouseX,mouseY)
//   }
// }

function getExistingPointIndex(x,y) {
  for (let i = 0; i < facePoints.length; i++) {
    if (dist(x,y,facePoints[i].x,facePoints[i].y) <= RADIUS) 
      return i;
  }
  return -1; //return -1 if no point was selected
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
            let point = createVector(x,y);
            facePoints.push(point) //add the point to the overall list 
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) {
              const [x, y] = keyPoints[start];
              let point = createVector(x,y);
              facePoints.push(point) //add point to the overall list
              px = x; //update prev
              py = y;
              start += iterate;
            }
          }
        }
      });
    }
  }
  saved = true //facepoints have been saved! 
}


