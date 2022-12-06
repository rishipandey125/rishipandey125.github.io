import { World } from './component.js';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

// DOM selectors
const containerEl = document.querySelector(".container"); // container for renderer

let world;

init(); //onStart
render(); //onUpdate

function init() {
  world = new World(0); //create the world object

  //get the current URL and check it's search parameters
  let url = new URL(window.location.href); 
  let search_params = url.searchParams;  
  let projectResult = search_params.get('project');

  //if the search parameter exists load that project
  if (projectResult != null) {
    world.import(projectResult);
    world.enableAR();
  }

  
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
  // requestAnimationFrame(render);
  world.renderer.setAnimationLoop( render );
  
  if (world.renderer.xr.isPresenting) { //if the user is using AR 
    //handle xr viewing 
    world.handleARViewing();
  }

  world.components.forEach(component => component.animate(world.camera));

  ThreeMeshUI.update();

  world.renderer.render(world.scene, world.camera);
}

