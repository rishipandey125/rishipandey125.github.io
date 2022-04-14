let facemesh; 
let predictions = [];
let img;
var px = 0;
var py = 0;

const pixelsPerSegment = 10;
const noiseScale = 120;
const noiseFrequency = 0.01;
const noiseSpeed = 0.1;

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
                'leftEyeUpper1',
                'leftEyeLower1',
                'leftEyebrowLower',
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
            line(px,py,x,y); //set line
            px = x; //update prev
            py = y;
          } else {
            //loop through array in correct direction
            while (start != end) {
              const [x, y] = keyPoints[start];
              // line(px,py,x,y); //set line
              drawWobblyCurve(px,py,x,y);
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
}

function drawWobblyCurve(sx,sy,ex,ey) {
  let start = createVector(sx,sy);
  let end = createVector(ex,ey);
  let lineLength = start.dist(end);
  // Determine the number of segments, and make sure there is at least one.
  let segments = max(1, round(lineLength / pixelsPerSegment));
  // Determine the number of points, which is the number of segments + 1
  let points = 1 + segments;
  
  // We need to know the angle of the line so that we can determine the x
  // and y position for each point along the line, and when we offset based
  // on noise we do so perpendicular to the line.
  let angle = atan2(end.y - start.y, end.x - start.x);
  
  let xInterval = pixelsPerSegment * cos(angle);
  let yInterval = pixelsPerSegment * sin(angle);
  
  // beginShape();
  // Always start with the start point
  // vertex(start.x, start.y);
  
  // for each point that is neither the start nor end point
  for (let i = 1; i < points - 1; i++) {
    // determine the x and y positions along the straight line
    let x = start.x + xInterval * i;
    let y = start.y + yInterval * i;
    
    // calculate the offset distance using noice
    let offset =
      // The bigger this number is the greater the range of offsets will be
      noiseScale *
      (noise(
        // The bigger the value of noiseFrequency, the more erretically
        // the offset will change from point to point.
        i * pixelsPerSegment * noiseFrequency,
        // The bigger the value of noiseSpeed, the more quickly the curve
        // fluxuations will change over time.
        (millis() / 1000) * noiseSpeed
      ) - 0.5);
      
    // Translate offset into x and y components based on angle - 90°
    // (or in this case, PI / 2 radians, which is equivalent)
    let xOffset = offset * cos(angle - PI / 2);
    let yOffset = offset * sin(angle - PI / 2);
    
    line(x,y,x+xOffset,y+yOffset);
    // vertex(x + xOffset, y + yOffset);
  }
  
  // vertex(end.x, end.y);
  // endShape();
}