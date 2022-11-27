import { OrbitControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/OrbitControls'
import { DragControls } from 'https://cdn.skypack.dev/three@0.133.1/examples/jsm/controls/DragControls'

//parent component class
class Component {
    // constructor
    constructor(componentID,componentTitle,componentWidth) {
        this.id = componentID;
        this.title = componentTitle;

        this.div;
        this.element; 

        this.pane; //UI info for this component

        //create the div for this component
        this.div = $('<div id=' + "'"+componentID+"'" + ' ></div>');

        this.div.width(componentWidth); //set the pane width to something normal 

        $("body").append(this.div); //add the pane to the html body

        this.element = this.div[0]; // save the element 
        
        this.div.hide(); // hide the element to start
        
    };

    //animate function for every component
    animate(camera) {
        console.log("animate!")
    }
}

//world component class
export class World extends Component {
    constructor(componentID) {
        super(componentID,"world",250);

        // create objects for the overall scene
        this.camera = new THREE.PerspectiveCamera( //create the camera
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
         );
        this.camera.position.z = 5;

        this.scene = new THREE.Scene(); //create the scene

        this.renderer = new THREE.WebGLRenderer({  //create the renderer
            alpha: true,
            antialiasing: true
        });
        

        this.renderer.setPixelRatio(window.devicePixelRatio); 
        this.renderer.setSize(window.innerWidth, window.innerHeight);


        //create orbit controls
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.enablePan = false;
        this.orbit.maxDistance = 25;
        this.orbit.minDistance = 1;

        this.objects = []

        //setup helper grid
        this.gridXZ = new THREE.GridHelper(10, 10);
        this.gridXZ.setColors(new THREE.Color(0x006600), new THREE.Color(0x006600));
        this.scene.add(this.gridXZ);
    
        this.gridXY = new THREE.GridHelper(10, 10);
        this.gridXY.rotation.x = Math.PI / 2;
        this.gridXY.setColors(new THREE.Color(0x000066), new THREE.Color(0x000066));
        this.scene.add(this.gridXY);
    
        this.gridYZ = new THREE.GridHelper(10, 10);
        this.gridYZ.rotation.z = Math.PI / 2;
        this.gridYZ.setColors(new THREE.Color(0x660000), new THREE.Color(0x660000));
        this.scene.add(this.gridYZ);

        //create the pane 
        this.PARAMS = {
            background: '#ffffff',
            grid: false,
            component: "cube"
        }   

        this.pane = new Tweakpane.Pane({
            title: this.title,
            expanded: true
        });

        this.pane.addInput(this.PARAMS,"background");  // control the background color of the world

        this.pane.addInput(this.PARAMS, 'grid');

        //list of components
        this.pane.addInput(this.PARAMS, 'component', {
            label: 'component',
            options: {
                cube: "cube"
            }
        });

        //create component button
        const btn = this.pane.addButton({
            title: 'add component'
        });

        //set the background color 
        this.renderer.setClearColor( new THREE.Color(this.PARAMS.background), 1 );

        //set the grid helper to be on or off based on initial setting
        this.gridXY.visible = this.PARAMS.grid;
        this.gridXZ.visible = this.PARAMS.grid;
        this.gridYZ.visible = this.PARAMS.grid;

        //handle pane event
        this.pane.on('change', (event) => { //if the pane changes
            //event.presetKey -> key that was changed
            //event.value -> what it was changed to
            if (event.presetKey == 'background') {
                let color = event.value;
                console.log(color)
                this.renderer.setClearColor(color, 1 );
            } else if (event.presetKey == "grid") {
                this.gridXY.visible = this.PARAMS.grid;
                this.gridXZ.visible = this.PARAMS.grid;
                this.gridYZ.visible = this.PARAMS.grid;
            }
        });	

        btn.on('click', () => {
            let comp = this.PARAMS.component;
            if (comp == "cube") {
                let cube = new Cube(this.objects.length+1);
                cube.addMeshToScene(this.scene);
                cube.createDragControls(this.scene,this.camera,this.renderer,this.orbit);
                this.objects.push(cube)
            } 
        });
        
    };
}

//cube component class
export class Cube extends Component {
    constructor(componentID) {
        super(componentID,"cube",250);

        //setup the UI for the cube
        this.PARAMS = {
            position: {x: 0, y: 0, z: 0},
            rotation: {x: 0, y: 0, z: 0},
            scale: {x: 1, y: 1, z: 1},
            color: '#000000'
        }

        this.pane = new Tweakpane.Pane({
            title: this.title,
            container: this.element, //gets the HTML element of the pane div
            expanded: true
        }); //create the pane and parent it to the draggable div

        this.pane.addInput(this.PARAMS, 'position', {
            x: {step: 1},
            y: {step: 1},
            z: {step: 1}
        });

        this.pane.addInput(this.PARAMS, 'rotation', {
            x: {min: 0, max: 360},
            y: {min: 0, max: 360},
            z: {min: 0, max: 360}
        });

        this.pane.addInput(this.PARAMS, 'scale', {
            x: {step: 0.1},
            y: {step: 0.1},
            z: {step: 0.1}
        });

        this.pane.addInput(this.PARAMS, 'color');

        //setup the cube mesh
        const geometry = new THREE.BoxGeometry(1,1,1);
        const material = new THREE.MeshBasicMaterial( {color: new THREE.Color(this.PARAMS.color)} );

        this.mesh = new THREE.Mesh( geometry, material );
        
        //handle events 
        //pane events - change attributes of mesh 

        this.pane.on('change', (event) => { //if the pane changes
            //event.presetKey -> key that was changed
            //event.value -> what it was changed to
            if (event.presetKey == 'position') {
                let position = event.value;
                this.mesh.position.set(position.x,position.y,position.z);
            } 
            else if (event.presetKey == 'rotation') {
                let rotation = event.value;
                this.mesh.rotation.set(THREE.MathUtils.degToRad(rotation.x),THREE.MathUtils.degToRad(rotation.y),THREE.MathUtils.degToRad(rotation.z));
            } else if (event.presetKey == 'scale') {
                let scale = event.value;
                this.mesh.scale.set(scale.x, scale.y, scale.z);
            } else if (event.presetKey == 'color') {
                let color = event.value;
                this.mesh.material.color = new THREE.Color(color);
            }
        });		
    };

    createDragControls(scene, camera, renderer, orbit) {
        //add drag orbits for the cube
        let dragControls = new DragControls([this.mesh], camera, renderer.domElement);
        // scene.add(dragControls);
        //drag events 
        var _self = this;
        dragControls.addEventListener('dragstart', function (event) {
            orbit.enabled = false
            event.object.material.opacity *= 0.90
        })
        
        dragControls.addEventListener('dragend', function (event) {
            orbit.enabled = true
            event.object.material.opacity = 1.0
            console.log(_self.PARAMS)
            _self.PARAMS.position = {x: event.object.position.x, y: event.object.position.y, z: event.object.position.z}
            _self.pane.refresh()
    
        })
    
        dragControls.addEventListener('hoveron', function (event) {
            orbit.enabled = false
            event.object.material.opacity *= 0.90
            _self.div.show();
        })
    
        dragControls.addEventListener('hoveroff', function (event) {
            orbit.enabled = true
            event.object.material.opacity = 1.0
            _self.div.hide();
        })
    }

    addMeshToScene(scene) {
        scene.add(this.mesh);
    }

    updatePaneLocation(camera) {
        //update the pane of the location every tick 

        let tempV = new THREE.Vector3();
        // get the position of the center of the cube
        this.mesh.updateWorldMatrix(true, false);
        this.mesh.getWorldPosition(tempV);
            
        // get the normalized screen coordinate of that position
        // x and y will be in the -1 to +1 range with x = -1 being
        // on the left and y = -1 being on the bottom
        tempV.project(camera);
        
        // convert the normalized position to CSS coordinates
        let x = (tempV.x *  .5 + .5) * window.innerWidth;
        let y = (tempV.y * -.5 + .5) * window.innerHeight;
        // element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;

        this.div.css({top: y, left: x , position:'absolute'}); 
    }

    animate(camera) {
        this.updatePaneLocation(camera)
    }
}