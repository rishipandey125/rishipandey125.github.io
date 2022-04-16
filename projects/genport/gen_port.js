let facemesh; 
let predictions = [];
let img;
var px = 0;
var py = 0;
var saved = false
var facePoints = [];

var semantics = [
                'lipsUpperOuter',
                'lipsLowerOuter',
                'lipsUpperInner',
                'lipsLowerInner', 
                'noseBottom',
                // 'noseRightCorner',
                'noseLeftCorner',
                'noseTip',
                'midwayBetweenEyes',
                // 'leftEyeLower1',
                // 'leftEyeUpper1',
                // 'leftEyebrowLower',
                'rightEyebrowUpper',
                'rightEyeLower1',
                'rightEyeUpper1'
              ]

function preload() {
  img = loadImage('https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image');
}

function setup() {
  // create a canvas that's at least the size of the image.
  createCanvas(img.width,img.height)
  background('black')
  imageReady()
}

// when the image is ready, then load up poseNet
function imageReady() {
  facemesh = ml5.facemesh(modelReady);

  facemesh.on("predict", results => {
    predictions = results;
  });
}

// when poseNet is ready, do the detection
function modelReady() {
  // console.log("Model ready!");
  facemesh.predict(img);
}

function randomColor() {
  return color(random(0,255),random(0,255),random(0,255));
}

// draw() will not show anything until poses are found
function draw() {
  //get the predictions and save the keypoints
  if (predictions.length > 0 && !saved) {
    // image(img, 0, 0, width, height);
    saveKeyPoints();
  } else if (saved) { //keypoints have been predicted 
      //create a new stroke
    clear();
    background('black')
    stroke("white")
    strokeWeight(5)

    // let py = keyPoints[0][1];
    for (let i = 0; i < facePoints.length-1; i++) {
      //loop through each x prev and next point
        //for every y value in that same lerp period
        //add perlin noise 
        //plot line
      let startX = facePoints[i].x;
      let startY = facePoints[i].y;
      let endX = facePoints[i+1].x;
      let endY = facePoints[i+1].y; 
      let step = 10;
      // line(startX,startY,endX,endY)
      // circle(startX,startY,4)
      let px = startX;
      let py = startY; // since px py
      for (let j = 0; j <= 1; j += 0.1) {
        let perlinSeed =  2;
        let x = ((noise(perlinSeed * 0.01) - 0.5) * 100) + lerp(startX,endX,j);
        let y = ((noise(perlinSeed * 0.02) - 0.5) * 100) + lerp(startY,endY,j);
        if (j == 0) {
          px = x;
          py = y;
        }
        // circle(x,y,8)
        line(px,py,x,y)
        px = x;
        py = y;
        // perlinSeed += 0.01;
      }
    }
  }
}

// A function to draw ellipses over the detected keypoints
function saveKeyPoints() {

  for (let i = 0; i < predictions.length; i += 1) { //for all the predictions - should be 1
    // loop through all semantics - if it is that one draw
    for (let k = 0; k < semantics.length; k++) {
      Object.entries(predictions[i].annotations).forEach(([key, keyPoints]) => { //loop through key and values in the semantic understanding of facemesh
        // console.log(key); //log all the keys
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
            facePoints.push(point)
            // line(px,py,x,y); //set line
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) {
              const [x, y] = keyPoints[start];
              let point = createVector(x,y);
              facePoints.push(point)
              // line(px,py,x,y); //set line
              // wobblyLine(px,py,x,y);
              //create wobbly line 
              px = x; //update prev
              py = y;
              start += iterate;
            }
          }
        }
      });
    }
  }
  saved = true
}


