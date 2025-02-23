var points = [] //array for points
var mult = 0.0005//variation for perlin noise
var radius = 10; //radius of the rendered dots

var iteration = 0;
var noiseScale = 1;

//setup the canvas for rendering
function setup() {

  createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size

  colorMode(RGB) //use hsb color space so I can saturate things

  background(color(0))
  
  angleMode(DEGREES) //trig mode degrees
  // var density = int(random(20,50)) //density of points
  var density = 10;
  var space = width / density //space between points

  //create initial list of points
  for (var x = 0; x < width; x += space) {
    for (var y = 0; y < height; y += space) {
      
      var p = createVector(x,y) //creates a vec2 w/ variation

      points.push(p) //add points to array
    }
  }

  

  
}


//p5 canvas goes from 0 -> width (from left to right) and from 0 -> height from (top to bottom)
//rendering canvas
function draw() {
  if (iteration < 100) {
    for (var i = 0; i < points.length; i++) { //loop through every point

      var currPoint = points[i] //get the current Point
     
      noStroke() //fill inside
      fill(color((1.0-(currPoint.y/height))*255,100,200))

      var angle = map(noise((currPoint.x/width)*noiseScale,(currPoint.y/height)*noiseScale),0,1,0,360) //map perlin noise to an angle (degrees)
      
      // //use the angle to find the change in x and change in y
      // // set that to be the new points location
      points[i].add(createVector(radius*sin(angle),radius*cos(angle))) //update direction w/ vector field
      
      circle(points[i].x,points[i].y,radius) //draw dot
    }
    iteration += 1
  }

}
