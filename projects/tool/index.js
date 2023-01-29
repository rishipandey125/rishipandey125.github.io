import { World } from './component.js';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

// DOM selectors
const containerEl = document.querySelector(".container"); // container for renderer

let world;

let handleAR;

init(); //onStart
render(); //onUpdate

function init() {
  world = new World(0); //create the world object

  //get the current URL and check it's search parameters
  let url = new URL(window.location.href); 
  let search_params = url.searchParams;  
  let projectResult = search_params.get('project');
  let viewResult = search_params.get('view');

  function Get(yourUrl){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);     
    return Httpreq.responseText;          
  } 

  handleAR = false;

  //if the search parameter exists load that project
  if (projectResult != null) {
    // the path where we are hosting spatial files
    var githubPath = 'https://raw.githubusercontent.com/rishipandey125/rishipandey125.github.io/master/projects/spatial/';
    let worldDict = JSON.parse(Get(githubPath + projectResult));
    world.import(worldDict);
    world.presentationMode();
    world.enableAR();
  } else if (viewResult != null) {
    // the path where we are hosting spatial files
    var githubPath = 'https://raw.githubusercontent.com/rishipandey125/rishipandey125.github.io/master/projects/spatial/';
    let worldDict = JSON.parse(Get(githubPath + viewResult));
    world.import(worldDict);
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
  world.renderer.setAnimationLoop( render );
  
  if (world.renderer.xr.isPresenting) { //if the user is using AR 
    //handle xr viewing 
    if (!handleAR) {
      world.handleARViewing();
      handleAR = true;
    }
  }
  
  let deltaTime = world.clock.getDelta();

  world.components.forEach(component => component.animate(deltaTime, world.motion, world.camera));

  ThreeMeshUI.update();

  world.renderer.render(world.scene, world.camera);
}

