let canvas; 
let img;

let points = [];
let colors = [];
let mult;
let dotSize;
let shapeStyle;

let drawCount = 0;


function preload() {
  img = loadImage('img/faqir.jpg');
}

//setup the canvas for rendering
function setup() {
  // img = loadImage('img/img.png');
  canvas = createCanvas(img.width,img.height);

  let newCanvasX = (windowWidth - img.width) / 2;
  let newCanvasY = (windowHeight - img.height) / 2;

  canvas.position(newCanvasX,newCanvasY);
  // image(img,0,0)
  noStroke();
  mult = random() * 0.005
  dotSize = 1 * random();
  for (let i = 0; i < img.width; i += dotSize) {
    for (let j = 0; j < img.height; j += dotSize) {

      let c = img.get(i,j);

      points.push(createVector(i,j)) //add points to array
      colors.push(color(c)) //add colors to array
    }
  }

  
}


function draw() {
  
  if (drawCount < 100) {
    for (var i = 0; i < points.length; i++) { //loop through every point
      // noStroke() //fill inside
      fill(colors[i]) //use assigned local color to fill 
      
      var currPoint = points[i] //get the current Point
      
      var angle = map(noise(currPoint.x * mult,currPoint.y * mult),0,1,0,720) //map perlin noise to an angle (degrees)

      //use the angle to find the change in x and change in y
      // set that to be the new points location
      points[i].add(createVector(dotSize/2*cos(angle),dotSize/2*sin(angle))) //update direction w/ vector field
      circle(points[i].x,points[i].y,random()*dotSize);
      // rect(points[i].x,points[i].y,random()*dotSize);

    }
  }

  drawCount += 1
  
  
}

