const renderer = new THREE.WebGLRenderer(); //
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 0, 0, 100 );
camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();
// const geometry = new THREE.BoxGeometry();
const material = new THREE.LineBasicMaterial( { color: "rgb(255,255,255)" } );
const points = [];
points.push( new THREE.Vector3( - 10, 0, 0) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );

// scene.add( cube );

scene.add( line );
// renderer.render( scene, camera );
// camera.position.z = 5;

function animate() {
  requestAnimationFrame( animate );

  // line.rotation.x += 0.01;
  line.rotation.y += 0.01;

  renderer.render( scene, camera );
};

animate();