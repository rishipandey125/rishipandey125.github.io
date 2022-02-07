
let myName = "Under Construction!"
let hindiName = "ऋषि!"
// let fontUse;


// function preload() {
//   fontUse = loadFont('assets/VT323-Regular.ttf');
// }

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
  createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size
  let bgColor = randomPastelColor() //random pastel color
  background(bgColor)

  // textFont(fontUse);

}

//rendering canvas
function draw() {
  text(myName, 10, 30);
}
