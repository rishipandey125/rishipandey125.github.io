import { World } from './component.js';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

// DOM selectors
const containerEl = document.querySelector(".container"); // container for renderer

let world;
let prevTime; // to track dt

init(); //onStart
render(); //onUpdate

function init() {
  world = new World(0); //create the world object

  //get the current URL and check it's search parameters
  let url = new URL(window.location.href); 
  let search_params = url.searchParams;  
  let projectResult = search_params.get('project');

  prevTime = 0; //start with time = 0 

  //if the search parameter exists load that project
  if (projectResult != null) {

    // load the corresponding json file url  
    function Get(yourUrl){
      var Httpreq = new XMLHttpRequest(); // a new request
      Httpreq.open("GET",yourUrl,false);
      Httpreq.send(null);     
      return Httpreq.responseText;          
    }

    // the path where we are hosting spatial files
    var githubPath = 'https://raw.githubusercontent.com/rishipandey125/rishipandey125.github.io/master/projects/spatial/';

    //load the spatial file 
    var spatialFile = JSON.parse(Get(githubPath + projectResult));

    world.import(spatialFile);

    world.presentationMode();

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
  let deltaTime = (time - prevTime)/1000; //calculate dt in seconds

  world.renderer.setAnimationLoop( render );
  
  if (world.renderer.xr.isPresenting) { //if the user is using AR 
    //handle xr viewing 
    world.handleARViewing();
  }
  
  world.components.forEach(component => component.animate(deltaTime, world.motion, world.camera));

  ThreeMeshUI.update();

  world.renderer.render(world.scene, world.camera);

  prevTime = time;

}

