
let myName = "Under Construction!"
let hindiName = "ऋषि!"


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
  //draw rectangle
  noFill();
  myRect = rect(100, 100, 0.1*windowWidth, 0.1*windowHeight, 20);
  // myRect.mouseClicked(window.open('projects/pastel_flow_fields/pastel_flow_fields.html'))
  let flowFieldsLink = createA('projects/pastel_flow_fields/pastel_flow_fields.html', 'pastel flow field - generative art - 01/15/2022 ➡️','_blank');
  let backLitCinematic = createA('https://www.tiktok.com/@wookiepandey25/video/7045762666773712175?is_from_webapp=1&sender_device=pc&web_id7029858848710624774', 'void - a quick animated piece - 12/25/2021 ❤️️','_blank');
  let eyeCinematic = createA('https://www.tiktok.com/@wookiepandey25/video/7060704194579303727?is_from_webapp=1&sender_device=pc&web_id7029858848710624774','contact - a quick animated piece - 02/02/2022 👁','_blank');
  eyeCinematic.position(0,0);
  flowFieldsLink.position(0, 30);
  backLitCinematic.position(0,60);
}

//rendering canvas
function draw() {
  // text(myName, 10, 30);
    textFont("Roboto Mono");
    fill(255);
    textSize(32);
    text("rishi!",
         300, 300, 200, 200);
 
}
