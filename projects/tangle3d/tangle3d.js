const renderer = new THREE.WebGLRenderer(); //render using webgl
renderer.setSize( window.innerWidth, window.innerHeight ); //set the render size
document.body.appendChild( renderer.domElement ); //adds a canvas element to html so that we can view the rendered scene

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 ); // create a camera with (fov, aspect ratio, near, far)
camera.position.set( 0, 0, 100 ); //set the camera location
camera.lookAt( 0, 0, 0 ); //set camera lookat 

const scene = new THREE.Scene(); //create a scene : stores items (geometry/lights/etc.)

const material = new THREE.LineBasicMaterial( { color: "rgb(255,255,255)" } ); // create a material for the lines

const points = []; //create a list of points for the line
points.push( new THREE.Vector3( - 10, 0, 0) ); //add some points
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points ); //turn the points into geometry by storing in a buffer geo

const line = new THREE.Line( geometry, material ); //create a line based on that buffer geo and the material


scene.add( line ); // add the line to scene

//animate function onUpdate
function animate() {
  requestAnimationFrame( animate ); //animate function

  //rotate line
  line.rotation.y += 0.01;

  renderer.render( scene, camera );
};

animate();