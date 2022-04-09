var img;

  
function setup() {
  createCanvas(300, 200);
  img = loadImage('https://thispersondoesnotexist.com/image')

  image(img, 20, 40, 100, 100);
}