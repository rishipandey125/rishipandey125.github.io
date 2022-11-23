import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module";
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls'
import { ImprovedNoise } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/math/ImprovedNoise.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.146.0/examples/jsm/webxr/ARButton.js';

// DOM selectors
const containerEl = document.querySelector(".container"); // container for renderer
const textInputEl = document.querySelector("#text-input"); // container for particle typography 

// font settings
const fontName = "Roboto Mono"; 
const textureFontSize = 30;
const fontScaleFactor = 0.17;

// We need to keep the style of editable <div> (hidden inout field) and canvas
textInputEl.style.fontSize = textureFontSize + "px";
textInputEl.style.font = "100 " + textureFontSize + "px " + fontName;
textInputEl.style.lineHeight = 1.1 * textureFontSize + "px";

var noiseObject = new ImprovedNoise(); //improved noise object

// 3D scene related globals
let scene,
  camera,
  renderer,
  textCanvas,
  textCtx,
  particleGeometry,
  particleMaterial, 
  instancedMesh,
  dummy,
  totalTime,
  controller;

//tweakpane params
let PARAMS = {
  background: '#ffffff',
  text: "default",
  color: "#000000"
} 

let pane, background, stringInput, textColor, particleStyle;

// String to show
let string = "default";

// Coordinates data per 2D canvas and 3D scene
let textureCoordinates = [];
let particles = [];

let particleSizeStart, particleSizeEnd;

let styleIndex = 0

// Parameters of whole string per 2D canvas and 3D scene
let stringBox = {
  wTexture: 0,
  wScene: 0,
  hTexture: 0,
  hScene: 0,
  caretPosScene: []
};

function mix(a,b,val) {
  return a + ((b-a) * val);
}

textInputEl.innerHTML = string; //set the canvas text input default

init(); //onStart
createEvents(); //creates all necessary events
refreshText(); //samples text coordinates and creates an instanced mesh
render(); //onUpdate

function init() {
  camera = new THREE.PerspectiveCamera( //create the camera
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 18;

  scene = new THREE.Scene(); //create the scene
 
  //create the renderer
  renderer = new THREE.WebGLRenderer({ 
    alpha: false
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  containerEl.appendChild(renderer.domElement);

  //add ar button to bottom of screen
  document.body.appendChild( ARButton.createButton( renderer ) );

  //create orbit controls
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enablePan = false;

  //setup the text canvas
  textCanvas = document.createElement("canvas");
  textCanvas.width = textCanvas.height = 0;
  textCtx = textCanvas.getContext("2d");

  //create dummy object for transposing matrices 
  dummy = new THREE.Object3D();

  //setup pane
  pane = new Tweakpane.Pane();  
  const scenePane = pane.addFolder({
    title: 'scene',
  });

  const particleTextPane = pane.addFolder({
    title: 'particle text',
  });

  background = scenePane.addInput(PARAMS,'background')
  stringInput = particleTextPane.addInput(PARAMS,'text')

  particleStyle = particleTextPane.addBlade({
    view: 'list',
    label: 'style',
    options: [
      {text: 'dots', value: 0},
      {text: 'flow field', value: 1},
      {text: 'smoke', value: 2},
    ],
    value: 0,
  });
  
  textColor = particleTextPane.addInput(PARAMS,'color')

  totalTime = 0;

  //ar controller

  controller = renderer.xr.getController( 0 );
  // controller.addEventListener( 'selectstart', onSelectStart );
  // controller.addEventListener( 'selectend', onSelectEnd );
  controller.userData.skipFrames = 0;
  
  scene.add( controller );

  // //create the text at start
  updateFontSettings()

  // textInputEl.focus();
  // handleInput(PARAMS.text);
  // refreshText();
} 

function createEvents() {
  background.on('change', function(ev) {
    renderer.setClearColor (ev.value, 1); //set the bg color
  });

  stringInput.on('change', function(ev) {
    updateFontSettings()
  });
  
  particleStyle.on('change', function(ev) {
    styleIndex = ev.value;
    updateFontSettings()
  });

  textColor.on('change', function(ev) { 
    particleMaterial.color = new THREE.Color(ev.value);
    // updateFontSettings()
  });

  //updates and scales everything in the site when things are resized
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

//update the font settings when you change something
//changes could be the font size or the type of font
function updateFontSettings() {
  setParticleStyleParameters()
  textInputEl.focus();
  handleInput(PARAMS.text);
  refreshText();
  particleMaterial.color = new THREE.Color(PARAMS.color);
}

//takes the string input and populates the stringbox object
function handleInput(input) {  
  textInputEl.innerHTML = input
  string = textInputEl.innerHTML //update the global string for the particle text
    .replaceAll("<p>", "\n")
    .replaceAll("</p>", "")
    .replaceAll("<div>", "\n")
    .replaceAll("</div>", "")
    .replaceAll("<br>", "")
    .replaceAll("<br/>", "")
    .replaceAll("&nbsp;", " ");

  stringBox.wTexture = textInputEl.clientWidth;
  stringBox.wScene = stringBox.wTexture * fontScaleFactor;
  stringBox.hTexture = textInputEl.clientHeight;
  stringBox.hScene = stringBox.hTexture * fontScaleFactor;
}

function render(time) {
  requestAnimationFrame(render);

  // if the user is using AR
  if (renderer.xr.isPresenting) {
    scene.scale.set( 0.3, 0.3, 0.3 );
    // renderer.alpha = true
    // mesh.material.color =  new THREE.Color(0,0,1);
    // mesh.material.color = mixColor(startColor,endColor,alpha);
  }

  updateParticlesMatrices();
  totalTime = time;
  renderer.render(scene, camera);
}


//turn stringbox & texture coords into particles
function refreshText() {
  sampleCoordinates();

  particles = textureCoordinates.map((c, cIdx) => {
    const x = c.x * fontScaleFactor;
    const y = c.y * fontScaleFactor;
    let p = new Particle([x,y]);
    // let p = c.old && particles[cIdx] ? particles[cIdx] : new Particle([x, y]);
    if (c.toDelete) {
      p.toDelete = true;
      p.scale = 1;
    }
    return p;
  });

  //create an instanced mesh of those particles
  recreateInstancedMesh();
}

// turn the string box info into texture coordinates
function sampleCoordinates() {
  // Draw text to a 2d canvas
  const lines = string.split(`\n`);
  const linesNumber = lines.length;
  textCanvas.width = stringBox.wTexture;
  textCanvas.height = stringBox.hTexture;
  textCtx.font = "100 " + textureFontSize + "px " + fontName;
  textCtx.fillStyle = "#2a9d8f";
  textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
  for (let i = 0; i < linesNumber; i++) {
    textCtx.fillText(
      lines[i],
      0,
      ((i + 0.8) * stringBox.hTexture) / linesNumber
    );
  }

  // Sample coordinates
  if (stringBox.wTexture > 0) {
    // Image data to 2d array
    const imageData = textCtx.getImageData(
      0,
      0,
      textCanvas.width,
      textCanvas.height
    );
    const imageMask = Array.from(
      Array(textCanvas.height),
      () => new Array(textCanvas.width)
    );
    for (let i = 0; i < textCanvas.height; i++) {
      for (let j = 0; j < textCanvas.width; j++) {
        imageMask[i][j] = imageData.data[(j + i * textCanvas.width) * 4] > 0;
      }
    }

    if (textureCoordinates.length !== 0) {
      // Clean up: delete coordinates and particles which disappeared on the prev step
      // We need to keep same indexes for coordinates and particles to reuse old particles properly
      textureCoordinates = textureCoordinates.filter((c) => !c.toDelete);
      particles = particles.filter((c) => !c.toDelete);

      // Go through existing coordinates (old to keep, toDelete for fade-out animation)
      textureCoordinates.forEach((c) => {
        if (imageMask[c.y]) {
          if (imageMask[c.y][c.x]) {
            c.old = true;
            if (!c.toDelete) {
              imageMask[c.y][c.x] = false;
            }
          } else {
            c.toDelete = true;
          }
        } else {
          c.toDelete = true;
        }
      });
    }

    // Add new coordinates
    for (let i = 0; i < textCanvas.height; i++) {
      for (let j = 0; j < textCanvas.width; j++) {
        if (imageMask[i][j]) {
          textureCoordinates.push({
            x: j,
            y: i,
            old: false,
            toDelete: false
          });
        }
      }
    }
  } else {
    textureCoordinates = [];
  }
}

// ---------------------------------------------------------------
// Handling params of each particle

function setParticleStyleParameters() {
  if (styleIndex == 0) { //dots
    //flowfield
    particleGeometry = new THREE.SphereGeometry(0.01);
    particleMaterial = new THREE.MeshBasicMaterial();
    particleSizeStart = 1;
    particleSizeEnd = 5;
  } else if (styleIndex == 1) { // flow field
    //flowfield
    particleGeometry = new THREE.BoxGeometry(0.005,0.04,0.0);
    particleMaterial = new THREE.MeshBasicMaterial();
    particleSizeStart = 1;
    particleSizeEnd = 1;
  } else if (styleIndex == 2) { 
    //smoke
    particleGeometry = new THREE.BoxGeometry( 0.2, 0.2, 0 );
    const texture = new THREE.TextureLoader().load('https://ksenia-k.com/img/threejs/smoke.png');
    particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        alphaMap: texture,
        depthTest: false,
        opacity: .3,
        transparent: true,
    });
    particleSizeStart = 1;
    particleSizeEnd = 5;
  }
}

function Particle([x, y]) {
  this.x = x;
  this.y = y;
  this.z = 0
  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.color = new THREE.Color(1,1,1);

  this.scale = 1

  this.deltaScale = 0.03 + 0.1 * Math.random();

  this.toDelete = false;

  if (styleIndex == 0) {
    this.scale = mix(2,6,Math.random());
    this.color = new THREE.Color(Math.random(),Math.random(),Math.random())
    this.z = mix(-0.5,0.5,Math.random())
  } else if (styleIndex == 1) {
    this.scale = 3;
  } else if (styleIndex == 2) {
    this.scale = mix(1,5,Math.random());
  }
  this.animate = function () {
    this.x = this.x + mix(-0.003,0.003,Math.random());
    this.y = this.y + mix(-0.003,0.003,Math.random());
    
    // this.rotationZ += this.deltaRotation;
    this.rotationZ += 0.01;

    this.scale += mix(0.001,0.0001,Math.random())

    if (styleIndex == 0) {

    } else if (styleIndex == 1) {
      let noise = noiseObject.noise(Math.floor(totalTime/10)*0.03,this.x,this.y);
      this.rotationZ = noise * 2*3.14;
    } else if (styleIndex == 2) {

    }

    // this.scale = 3
    if (this.toDelete) {
      this.scale -= this.deltaScale;
      if (this.scale <= 0) {
        this.scale = 0;
      }
    } else if (this.scale < 1) {
      this.scale += this.deltaScale;
    }
  };
}

//create an instanced mesh of the particles
function recreateInstancedMesh() {
  scene.remove(instancedMesh);
  instancedMesh = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    particles.length
  );
  scene.add(instancedMesh);

  instancedMesh.position.x = -0.5 * stringBox.wScene;
  instancedMesh.position.y = -0.5 * stringBox.hScene;
}

//update and animate the particles using their animate function
function updateParticlesMatrices() {
  let idx = 0;
  particles.forEach((p) => {
    p.animate();
    dummy.rotation.set(p.rotationX, p.rotationY, p.rotationZ);
    dummy.scale.set(p.scale, p.scale, p.scale);
    dummy.position.set(p.x, stringBox.hScene - p.y, p.z);
    dummy.updateMatrix();
    instancedMesh.setMatrixAt(idx, dummy.matrix)
    instancedMesh.setColorAt(idx, p.color)
    idx++;
  });
  instancedMesh.instanceMatrix.needsUpdate = true;
}

