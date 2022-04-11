// var img;
// //setup the canvas for rendering



// function setup() {
//   createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size
//   // background(255, 204, 0);
//   image(img, 0, 0);
// }


let facemesh;
let predictions = [];
let img;
var px = 0;
var py = 0;

function preload() {
  img = loadImage('https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image');
}

function setup() {
  // Create a canvas that's at least the size of the image.
  createCanvas(img.width,img.height) //create the canvas w/ TT size

  // create an image using the p5 dom library
  // call modelReady() when it is loaded
  // img = createImg("https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image", imageReady);
  // set the image size to the size of the canvas
  imageReady()
  // img.hide(); // hide the image in the browser
  frameRate(1); // set the frameRate to 1 since we don't need it to be running quickly in this case
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
  console.log("Model ready!");
  facemesh.predict(img);
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
  // stroke("red")
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;
    // [px, py] = keypoints[0];
    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];
      // console.log([x,y])
      // line(px,py,x,y)
      // px = x;
      // py = y;
      fill(255*(j/keypoints.length));
      ellipse(x, y, 10, 10);
    }
  }
}
