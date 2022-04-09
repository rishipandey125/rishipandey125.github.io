var points = [] //array for points
var colors = [] //array for colors of the points 
var mult = 0.005 //variation for perlin noise
var radius = 4 //radius of the rendered dots
//return a random pastel color
function randomPastelColor() {
  colorMode(HSB) //use hsb color space so I can saturate things
  
  var col = color(random(0,360),random(0,100),random(0,100)) //generate random color
  
  var saturationValue = 1.1 * saturation(col) //saturate 10%

  var mixedHue = (0.5 * (hue(col))) + (0.5 * 210) //lerp hue with white in HSB
  var mixedSat = (0.5 * saturationValue) + (0.5 * 1) //lerp saturation with white in HSB
  var mixedBri = (0.5 * brightness(col)) + (0.5 * 100) //lerp brightness with white in HSB
  var pastelColor = color(mixedHue,mixedSat,mixedBri) //random pastel color

  return pastelColor
}

//setup the canvas for rendering
function setup() {
  
  var localColors = [] //local colors for lines
  let numLocalColors = 4
  for (var i = 0; i < numLocalColors; i++) {
    localColors.push(randomPastelColor()) //generate local colors r
  }
  createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size
  let bgColor = color(random(0,255),random(0,255),random(0,255)) //random background color
  background(bgColor)
  
  angleMode(DEGREES) //trig mode degrees
  var density = int(random(20,50)) //density of points
  var space = width / density //space between points
  
  //create initial list of points
  for (var x = 0; x < width; x += space) {
    for (var y = 0; y < height; y += space) {
      
      var p = createVector(x + random(-10,10),y + random(-10,10)) //creates a vec2 w/ variation
      
      var index = int(random(0,localColors.length)) //rand index for local colors
      var col = localColors[index] //rand local colors
      points.push(p) //add points to array
      colors.push(col) //add colors to array
    }
  }

  

  
}

//rendering canvas
function draw() {

  for (var i = 0; i < points.length; i++) { //loop through every point
    noStroke() //fill inside
    fill(colors[i]) //use assigned local color to fill 
    
    var currPoint = points[i] //get the current Point
    
    var angle = map(noise(currPoint.x * mult,currPoint.y * mult),0,1,0,720) //map perlin noise to an angle (degrees)
    
  //use the angle to find the change in x and change in y
  // set that to be the new points location
    points[i].add(createVector(radius*cos(angle),radius*sin(angle))) //update direction w/ vector field
    
    circle(points[i].x,points[i].y,radius) //draw dot
  }
  
}
