let monoSynth;

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  // cnv.mousePressed(playSynth);

  monoSynth = new p5.MonoSynth();
}

function playSynth() {
  userStartAudio();

  console.log(mouseX)
  let note = mouseX; // i think hertz goes from 20 to 20,000
  // note velocity (volume, from 0 to 1)
  let velocity = random();
  // time from now (in seconds)
  let time = 0;
  // note duration (in seconds)
  let dur = 1/6;

  monoSynth.play(note, velocity, time, dur);
}

function draw() {
  background((mouseX/windowWidth)*255)
  playSynth()
}
