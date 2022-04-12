let facemesh; 
let predictions = [];
let img;
var px = 0;
var py = 0;
var semantics = ['silhouette','lipsUpperOuter','lipsLowerOuter','lipsUpperInner','lipsLowerInner']

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
  strokeWeight(10)
  for (let i = 0; i < predictions.length; i += 1) {
    // const keys = Object.keys(predictions[i].annotations);
    // console.log(keys)
    Object.entries(predictions[i].annotations).forEach(([key, keyPoints]) => {
      console.log(key);
      if (semantics.includes(key)) {
        // loop through every value and draw a new line of random color
        px =  keyPoints[0].x;
        py =  keyPoints[0].y;
        // stroke(randomColor())
        for (j = 0; j < keyPoints.length; j++ ) {
          const [x, y] = keyPoints[j];
          line(px,py,x,y);
          px = x;
          py = y;
        }
      }
    });
  }
}
