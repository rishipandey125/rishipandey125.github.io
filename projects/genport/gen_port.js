var img;
//setup the canvas for rendering

function preload() {
  img = loadImage('https://corsanywhere.herokuapp.com/http://thispersondoesnotexist.com/image');
}


function setup() {
  createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size
  // background(255, 204, 0);
  image(img, 0, 0);
}
