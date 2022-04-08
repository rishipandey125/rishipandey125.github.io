let c1,c2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  c1 = color(63, 191, 191); 
  c2 =  color(255);
  
  for(let y=0; y<height; y++){
    n = map(y,0,height,0,1);
    let newc = lerpColor(c1,c2,n);
    stroke(newc);
    line(0,y,width, y);
  }
}
function draw() {
  //background(220);
// console.log(c2);
}
