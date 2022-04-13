let facemesh; 
let predictions = [];
let img;
var px = 0;
var py = 0;
var semantics = [
                'lipsUpperOuter',
                'lipsLowerOuter',
                'lipsUpperInner',
                'lipsLowerInner', 
                'noseBottom',
                'noseRightCorner',
                'noseLeftCorner',
                'noseTip',
                'midwayBetweenEyes',
                'leftEyeUpper1',
                'leftEyeLower1',
                'leftEyebrowLower',
                'silhouette',
                'rightEyebrowUpper',
                'rightEyeLower1',
                'rightEyeUpper1'
                // 'rightEyeUpper0',
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

function preload() {
  img = loadImage('https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image');
}

function setup() {
  // Create a canvas that's at least the size of the image.
  createCanvas(img.width,img.height)
  background('black')
  imageReady()

  // frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
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
  if (predictions.length > 0) {
    // image(img, 0, 0, width, height);
    drawKeypoints();
    noLoop(); // stop looping when the poses are estimated
  }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  //create a new stroke
  stroke("white")
  strokeWeight(1)
  for (let i = 0; i < predictions.length; i += 1) { //for all the predictions - should be 1
    // loop through all semantics - if it is that one draw
    for (let k = 0; k < semantics.length; k++) {
      Object.entries(predictions[i].annotations).forEach(([key, keyPoints]) => { //loop through key and values in the semantic understanding of facemesh
        // console.log(key); //log all the keys
        if (key == semantics[k]) { //if it is one of the keys we want to draw
          if (k == 0) {
            px =  keyPoints[0].x; //set prev
            py =  keyPoints[0].y;
          }

          //if px/py is closer to the first point than the last 
          // then keep the same
          // otherwise iterate in reverse
          let sx = keyPoints[0].x
          let sy = keyPoints[0].y
          let ex = keyPoints[keyPoints.length-1].x
          let ey = keyPoints[keyPoints.length-1].y

          //iterate forwards
          let start = 0;
          let end = keyPoints.length-1;
          let iterate = 1;
          // if (dist(px,py,sx,sy) > dist(px,py,ex,ey)) {
          //   //iterate backwards
          //   start = keyPoints.length-1;
          //   end = 0;
          //   iterate = -1;
          // }
          
          while (start != end) {
            const [x, y] = keyPoints[start];
            circle(x,y,4)
            line(px,py,x,y); //set line
            px = x; //update prev
            py = y;
            start += iterate;
          }
        }
      });
    }
  }
}
