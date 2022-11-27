import { World, Cube } from './component.js';

// DOM selectors
const containerEl = document.querySelector(".container"); // container for renderer

let world;

// let cubes = []

function mix(a,b,val) {
  return a + ((b-a) * val);
}


init(); //onStart
render(); //onUpdate

function init() {
  world = new World(0);

  containerEl.appendChild(world.renderer.domElement);

  createEvents();
} 

function createEvents() {
  //updates and scales everything in the site when things are resized
  window.addEventListener("resize", () => {
    world.camera.aspect = window.innerWidth / window.innerHeight;
    world.camera.updateProjectionMatrix();
    world.renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function render(time) {
  requestAnimationFrame(render);

  world.objects.forEach(object => object.animate(world.camera));

  world.renderer.render(world.scene, world.camera);
}
