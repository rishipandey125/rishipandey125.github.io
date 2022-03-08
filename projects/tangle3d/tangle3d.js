var renderer, camera, scene;//gl renderer, camera and the scene
var geometry, line; //geometry and line
var rotation = 0; //initial rotation

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer(); //render using webgl
  renderer.setSize( window.innerWidth, window.innerHeight ); //set the render size
  document.body.appendChild( renderer.domElement ); //adds a canvas element to html so that we can view the rendered scene
  
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 ); // create a camera with (fov, aspect ratio, near, far)
  camera.position.set( 0, 0, 100 ); //set the camera location
  camera.lookAt( 0, 0, 0 ); //set camera lookat 
  
  scene = new THREE.Scene(); //create a scene : stores items (geometry/lights/etc.)
  
  const material = new THREE.LineBasicMaterial( { color: "rgb(255,255,255)" } ); // create a material for the lines
  const points = []; //create a list of points for the line
  for (let i = 0; i < 50; i++) {
    points.push(new THREE.Vector3(getRandomNumber(-20,20),getRandomNumber(-20,20),getRandomNumber(-20,20))) // push a random point
  }
  geometry = new THREE.BufferGeometry().setFromPoints( points ); //turn the points into geometry by storing in a buffer geo

  line = new THREE.Line( geometry, material ); //create a line based on that buffer geo and the material
  scene.add(line);
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

//animate function onUpdate
function animate() {
  requestAnimationFrame( animate ); //animate function

  //rotate line
  rotation += 0.001
  line.rotation.y = rotation;

  renderer.render( scene, camera );
}
