//TODO - PREVENT SCROLLING ON MOBILE
let inputText = ""

let paint = true

let divIntro, divInstruct;

let slider, button, inp, picker; 

//setup the canvas for rendering
function setup() {
  let canvas = createCanvas(windowWidth,windowHeight) //create the canvas w/ TT size

  console.log(canvas)
  
  background(255)

  //add some ui 
  divIntro = createDiv('TYPE-PAINT: created out of boredom on my flight from 🇮🇳 -> 🇺🇸 (3/9/23)');
  divIntro.style('font-size', '20px');
  divIntro.style('font-style', 'bold');
  divIntro.position(windowWidth*0.1, windowHeight*0.05);
  
  divInstruct = createDiv('type something in box below and click/tap the canvas to paint');
  divInstruct.style('font-size', '15px');
  divInstruct.style('font-style', 'bold');
  divInstruct.position(windowWidth*0.1, windowHeight*0.12);

  inp = createInput('');
  inp.position(windowWidth*0.1, windowHeight*0.15);
  inp.size(100);
  inp.input(setInputText);
  inp.mouseOver(setPaintFalse)
  inp.mouseOut(setPaintTrue)

  picker = createColorPicker('#ed225d');
  picker.position(windowWidth*0.1, windowHeight*0.2);
  picker.mouseOver(setPaintFalse)
  picker.mouseOut(setPaintTrue)

  slider = createSlider(1, 100, 30);
  slider.position(windowWidth*0.1, windowHeight*0.25);
  slider.style('width', '80px');
  slider.mouseOver(setPaintFalse)
  slider.mouseOut(setPaintTrue)

  button = createButton('save');
  button.position(windowWidth*0.1, windowHeight*0.3);
  button.mousePressed(saveCreation);
  button.mouseOver(setPaintFalse)
  button.mouseOut(setPaintTrue)
}

//save the creation
function saveCreation() {
  inp.hide()
  picker.hide()
  slider.hide()
  button.hide()

  saveCanvas('type-paint', 'png');

  inp.show()
  picker.show()
  slider.show()
  button.show()
}

//handle ui hovering 
function setPaintFalse() {
  paint = false;
}

function setPaintTrue() {
  paint = true;
}

//update input text
function setInputText() {
  inputText = this.value();
}

//when you drag your mouse -> paint!
function mouseDragged() {
  if (paint && inputText.length > 0) {
    divIntro.hide()
    divInstruct.hide()
    fill(picker.color())
    textSize(slider.value());
    text(inputText, mouseX, mouseY);
  }
  return false;
}

//easter egg -> clear sketch if you shake your device 
function deviceShaken() {
  clear()
}