import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader';
import ThreeMeshUI from 'https://cdn.skypack.dev/three-mesh-ui';

const MAX_GRID_DISTANCE = 30;
const FONT_URL = "https://raw.githubusercontent.com/shaheelm/shaheelm.github.io/main/fonts/";
const FONT_DICT = {
    robotomono: "RobotoMono",
    vt323: "VT323",
    timesnewroman: "TimesNewRoman",
    inter: "Inter",
};

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
        this.div = $('<div id=' + "'"+this.id+"'" + ' ></div>');

        this.div.width(componentWidth); //set the pane width to something normal 

        $("body").append(this.div); //add the pane to the html body

        this.element = this.div[0]; // save the element 
        
        this.div.hide(); // hide the element to start

        this.draggableMesh = new THREE.Object3D(); // the draggable mesh for each component
        this.trackPosition = new THREE.Vector3();  //track the draggable mesh position 


    };

    //handle hover events
    handleDragStart() {
        this.trackPosition.copy(this.draggableMesh.position);
    }
    
    handleDragEnd() {
        this.PARAMS.position = {x: this.draggableMesh.position.x, y: this.draggableMesh.position.y, z: this.draggableMesh.position.z}
        this.pane.refresh()

        //this is how we differentiate tap vs no tap 
        if (this.trackPosition.equals(this.draggableMesh.position)) {
            if (this.div.is(":visible")) {
                this.div.hide();
                this.draggableMesh.material.opacity = 0.0
            } else {
                this.div.show();
                this.draggableMesh.material.opacity = 1.0
            }
        }

    }

    handleHoverStart() {
        this.draggableMesh.material.opacity = 1.0
    }

    handleHoverEnd() {
        if (! this.div.is(":visible")) 
            this.draggableMesh.material.opacity = 0.0;
    }   
    
    add(scene) {
        console.log("add to scene!")
    }

    delete(scene) {
        console.log("delete!")
    }

    updatePaneLocation(camera) {
        //update the pane of the location every tick 

        let tempV = new THREE.Vector3();
        // get the position of the center of the cube
        this.draggableMesh.updateWorldMatrix(true, false);
        this.draggableMesh.getWorldPosition(tempV);
            
        // get the normalized screen coordinate of that position
        // x and y will be in the -1 to +1 range with x = -1 being
        // on the left and y = -1 being on the bottom
        tempV.project(camera);
        
        // convert the normalized position to CSS coordinates
        let x = (tempV.x *  .5 + .5) * window.innerWidth;
        let y = (tempV.y * -.5 + .5) * window.innerHeight;

        this.div.css({top: y, left: x , position:'absolute'}); 
    }

    //animate function for every component
    animate(camera) {
        console.log("animate!")
    }
}

//world component class
export class World extends Component {
    constructor(componentID) {
        super(componentID,"world",250);

        this.worldDict = {}
        this.ARController; 
        
        // create objects for the overall scene
        this.camera = new THREE.PerspectiveCamera( //create the camera
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
         );
        this.camera.position.x = -10;
        this.camera.position.y = 5;
        this.camera.position.z = 30;

        this.scene = new THREE.Scene(); //create the scene

        this.renderer = new THREE.WebGLRenderer({  //create the renderer
            antialias: true,
            alpha: true
        });
        

        this.renderer.setPixelRatio(window.devicePixelRatio); 
        this.renderer.setSize(window.innerWidth, window.innerHeight);


        //create orbit controls
        this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbit.enablePan = false;
        this.orbit.maxDistance = 100;
        this.orbit.minDistance = 1;

        //create drag controls 
        this.dragControls = new DragControls([], this.camera, this.renderer.domElement);
        this.hoverComponentIdx = -1; //no component is selected

        this.components = []

        //setup helper grid
        this.gridXZ = new THREE.GridHelper(MAX_GRID_DISTANCE, 10);
        this.scene.add(this.gridXZ);
    
        this.gridXY = new THREE.GridHelper(MAX_GRID_DISTANCE, 10);
        this.gridXY.rotation.x = Math.PI / 2;
        this.scene.add(this.gridXY);
    
        this.gridYZ = new THREE.GridHelper(MAX_GRID_DISTANCE, 10);
        this.gridYZ.rotation.z = Math.PI / 2;
        this.scene.add(this.gridYZ);

        const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light

        this.scene.add(ambientLight);

        //create the pane 
        this.PARAMS = {
            background: '#ffffff',
            grid: false,
            component: "mesh"
        }   

        this.pane = new Tweakpane.Pane({
            // title: this.title,
            expanded: true
        });

        const tab = this.pane.addTab({
            pages: [
              {title: 'scene'},
              {title: 'file'},
            ],
          });

        tab.pages[0].addInput(this.PARAMS,"background");  // control the background color of the world

        tab.pages[0].addInput(this.PARAMS, 'grid');

        //list of components
        tab.pages[0].addInput(this.PARAMS, 'component', {
            label: 'component',
            options: {
                mesh: "mesh",
                typography: "typography",
                particlesphere: "particle sphere",
            }
        });

        //create component button
        const btn = tab.pages[0].addButton({
            title: 'add component'
        });

        //create export button
        const importBtn = tab.pages[1].addButton({
            title: 'import'
        });

                
        //create export button
        const exportBtn = tab.pages[1].addButton({
            title: 'export'
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
                this.renderer.setClearColor(color, 1 );
            } else if (event.presetKey == "grid") {
                this.gridXY.visible = this.PARAMS.grid;
                this.gridXZ.visible = this.PARAMS.grid;
                this.gridYZ.visible = this.PARAMS.grid;
            }
        });	

        btn.on('click', () => {
            let comp = this.PARAMS.component;
            this.createComponent(comp,false,null);
        });
        
        importBtn.on('click', () => {
            var importFiles = document.getElementById('selectFiles');
            var worldDict = null;
            var _self = this;
            importFiles.addEventListener('input', (ev) => {
                console.log("import files")
                var fr = new FileReader();

                fr.onload = function(e) { 
                  worldDict = JSON.parse(e.target.result);
                  if (worldDict != null) {
                    _self.import(worldDict);
                  }
                }
                fr.readAsText(importFiles.files.item(0));  
            })
            importFiles.click();
        });

        exportBtn.on('click', () => {
            this.export() // export world as dict
            let data = JSON.stringify(this.worldDict); //turn the dict into a string json  
            //download the .spatial file
            var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(data);
            var dlAnchorElem = document.getElementById('downloadAnchorElem');
            dlAnchorElem.setAttribute("href",     dataStr     );
            dlAnchorElem.setAttribute("download", "project.spatial");
            dlAnchorElem.click();

        });

        // create right click pane 
        this.righClickPane = new Tweakpane.Pane({
            // title: "right click",
            container: this.element, //gets the HTML element of the pane div
            expanded: true
        }); //create the pane and parent it to the draggable div

        //create delete button
        const deleteBtn = this.righClickPane.addButton({
            title: 'delete'
        });

        //create duplicate button
        const duplicateBtn = this.righClickPane.addButton({
            title: 'duplicate'
        });

        this.div.width(100); //size the popup menu 
        this.div.hide(); //hide it on start

        deleteBtn.on('click', () => {
            if (this.hoverComponentIdx > -1 ) {
                let comp = this.components[this.hoverComponentIdx]; // get the component to delete
                comp.delete(this.scene);
    
                this.components.splice(this.hoverComponentIdx,1); // remove the component from the component list 
                this.orbit.enabled = true;
    
                this.hoverComponentIdx = -1;
                
                this.updateDragControls(); // drag controsl re-enabled here
    
                this.div.hide();
            }
        });

        duplicateBtn.on('click', () => {
            if (this.hoverComponentIdx > -1 ) {
                let comp = this.components[this.hoverComponentIdx]; // get the component to delete
                this.createComponent(comp.title,true,comp.pane.exportPreset()); // drag controsl re-enabled here
                this.hoverComponentIdx = -1;
                
                _self.orbit.enabled = true;
                this.div.hide();
            }
        });

        //document events 
        let _self = this;


        //override the right click
        document.addEventListener('contextmenu', function(e) {
            if (_self.hoverComponentIdx > -1) { 
                let comp = _self.components[_self.hoverComponentIdx]; // get the component that you right clicked on 
                if (_self.div.is(":visible")) { // if right click menu is activated 
                    _self.div.hide();
                    _self.updateDragControls(); //this really shouldn't be the solution - take a look in alpha pls 
                    _self.orbit.enabled = true;
                } else {
                    _self.div.css({top: comp.div.css("top"), left: comp.div.css("left") , position:'absolute'}); 
                    _self.div.show(); //show the right click ui
                    comp.div.hide(); 
                    _self.dragControls.enabled = false;
                    _self.orbit.enabled = false;
                }

            } else {
                _self.div.hide();
                _self.orbit.enabled = true;
                _self.dragControls.enabled = true;
            }
            e.preventDefault();
        }, false);
        
        document.addEventListener('pointerup', function(e) {

        }, false);
    };

    createComponent(comp, usePreset, preset) {
        let component = null; 

        if (comp == "mesh") {
            component = new Mesh(this.components.length);
        } else if (comp == "typography") {
            component = new Typography(this.components.length);
        } else if (comp == "particle sphere") {
            component = new ParticleSphere(this.components.length);
        }

        if (component != null) {
            component.add(this.scene);
            if (usePreset) {
                component.pane.importPreset(preset);
            }
            this.components.push(component);
        }

        this.updateDragControls()
    }

    updateDragControls() { //update the drag controls when a change happens in the world components 
        let meshes = []

        for (let i = 0; i < this.components.length; i++) {
            let component = this.components[i];
            component.id = i;
            component.draggableMesh.name = i;
            meshes.push(component.draggableMesh);
        }

        this.dragControls.dispose(); //dispose the prev drag controls and create a new one 
        this.dragControls = new DragControls(meshes, this.camera, this.renderer.domElement);

        let _self = this;
        // drag events 
        this.dragControls.addEventListener('dragstart', function (event) {
            _self.orbit.enabled = false
            let idx = parseInt(event.object.name); // get the index of the mesh
            let component = _self.components[idx]; // get the corresponding component
            _self.div.hide();
            if (component != null)
                component.handleDragStart();
        })

        this.dragControls.addEventListener('dragend', function (event) {
            _self.orbit.enabled = true
            let idx = parseInt(event.object.name); // get the index of the mesh
            let component = _self.components[idx]; // get the corresponding component
            // _self.div.hide();
            if (component != null)
                component.handleDragEnd();
        })
    
        this.dragControls.addEventListener('hoveron', function (event) {
            _self.orbit.enabled = false
            let idx = parseInt(event.object.name); // get the index of the mesh
            let component = _self.components[idx]; // get the corresponding component   
            _self.div.hide();
            if (component != null)
                component.handleHoverStart();

            _self.hoverComponentIdx = idx;
        })
    
        this.dragControls.addEventListener('hoveroff', function (event) {
            _self.orbit.enabled = true
            let idx = parseInt(event.object.name); // get the index of the mesh
            let component = _self.components[idx]; // get the corresponding component
            // _self.div.hide();
            if (component != null)
                component.handleHoverEnd();

            _self.hoverComponentIdx = -1;
        })
    }

    presentationMode() {
        //turn grid off
        this.gridXY.visible = false;
        this.gridXZ.visible = false;
        this.gridYZ.visible = false;

        //disable all panes visiblity
        this.pane.hidden = true;

        //disable all drag controls 
        this.dragControls.enabled = false;

        //fix orbit controls 
        this.orbit.maxDistance = 100;
        this.orbit.minDistance = 100;
    }

    enableAR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild( ARButton.createButton( this.renderer ) );
        console.log(this.renderer.xr)
        this.ARController = this.renderer.xr.getController(0);
        // controller.addEventListener( 'selectstart', onSelectStart );
        // controllexr.addEventListener( 'selectend', onSelectEnd );
        this.ARController.userData.skipFrames = 0;
        this.scene.add(this.ARController);
    }

    handleARViewing() {
        //make renderer transparent for camera passthrough
        this.renderer.setClearColor( new THREE.Color(this.PARAMS.background), 0 );
        
        //scale down scene 
        this.scene.scale.set(0.06,0.06,0.06);

        //disable orbit controls
        this.orbit.enabled = false;

        //turn grid off
        this.gridXY.visible = false;
        this.gridXZ.visible = false;
        this.gridYZ.visible = false;

        //disable dragging 
    }

    import(worldDict) {  
        console.log(worldDict)
        for (const [key, value] of Object.entries(worldDict)) { //iterate through the dictionary
            if (key == "world") { // import world settings
                this.pane.importPreset(value); 
            } else { //create components in world 
                let comp = key.substr(0, key.indexOf('_')); //get the component name (upto the _) ie: mesh_1 -> mesh
                this.createComponent(comp,true,value); 
            }
        }
    }

    export() {
        this.worldDict = {} //empty the dictionary
        this.worldDict["world"] = this.pane.exportPreset() //export the world settings
        // loop through every component
        this.components.forEach(component => 
            this.worldDict[component.title + "_" + component.id] = component.pane.exportPreset()
        );
    }
}

export class Typography extends Component {
    constructor(componentID) {
        super(componentID,"typography",250);

        this.fontURL = "https://raw.githubusercontent.com/shaheelm/shaheelm.github.io/main/fonts/"
        //setup the UI for the typography
        this.PARAMS = {
            text: "text",
            fontColor: '#000000',
            fontSize: 3.0,
            containerWidth: 10.0,
            letterSpacing: 0.03,
            position: {x: 0, y: 0, z: 0},
            rotation: {x: 0, y: 0, z: 0},
            textAlign: "center",
            font: "robotomono"
        }

        this.pane = new Tweakpane.Pane({
            title: this.title,
            container: this.element, //gets the HTML element of the pane div
            expanded: true
        }); //create the pane and parent it to the draggable div

        this.pane.addInput(this.PARAMS, 'text');

        this.pane.addInput(this.PARAMS, 'font', {
            label: 'font',
            options: FONT_DICT
        });
        this.pane.addInput(this.PARAMS, 'textAlign', {
            label: 'align',
            options: {
                left: "left",
                center: "center",
                right: "right"
            }
        });

        this.pane.addInput(this.PARAMS,'fontColor', {
            label: "color"
        }); 
        this.pane.addSeparator();

        this.pane.addInput(this.PARAMS, 'fontSize', {
            label: "font size",
            min: 0.1,
            max: 10.0,
        });
        this.pane.addInput(this.PARAMS, 'containerWidth', {
            label: "container width",
            min: 1.0,
            max: 100.0,
        });
        this.pane.addInput(this.PARAMS, 'letterSpacing', {
            label: "letter spacing",
            min: 0.01,
            max: 1.0,
        });

        this.pane.addSeparator();

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

    	this.textBox = new ThreeMeshUI.Block({
                backgroundSide: THREE.DoubleSide,
                width: this.PARAMS.containerWidth,
                height: 0.5,
                padding: 0.03,
                justifyContent: 'center',
                textAlign: this.PARAMS.textAlign,
                backgroundOpacity: 0.0,
                fontColor: new THREE.Color(this.PARAMS.fontColor),
                fontFamily: FONT_URL + this.PARAMS.font + "/" + this.PARAMS.font + ".json",
                fontTexture: FONT_URL + this.PARAMS.font + "/" + this.PARAMS.font + ".png"
        });

        let t = new ThreeMeshUI.Text({
            content: this.PARAMS.text,
            fontSize: this.PARAMS.fontSize,
            letterSpacing: this.PARAMS.letterSpacing
        });
        
        this.textBox.add(t);

        //text box event
        this.textBox.onAfterUpdate = () => {
            if (t.children.length > 0) {
                t.children[0].material.side = THREE.DoubleSide;
                t.children[0].material.transparent = false; //basic transparency for glass & typography
            }
        }; 

        //create the bounding box 
        const box = new THREE.Box3().setFromObject(this.textBox);
        const geometry = new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
        const edges = new THREE.EdgesGeometry( geometry );
        this.draggableMesh = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: new THREE.Color('#3682df') } ) );
        this.draggableMesh.name = (this.id).toString();
        this.draggableMesh.material.transparent = true;
        this.draggableMesh.material.opacity = 0;

        //track the draggable mesh position 
        this.trackPosition = new THREE.Vector3();

        //pane events 
        this.pane.on('change', (event) => { //if the pane changes
            //event.presetKey -> key that was changed
            //event.value -> what it was changed to

            if (event.value == NaN) {
                event.value = 1.0;
            }

            if (event.presetKey == "text") {
                this.textBox.children[1].set({content: event.value});
            } else if (event.presetKey == "font") {
                this.textBox.set({fontFamily: this.fontURL + event.value + "/" + event.value + ".json"})
                this.textBox.set({fontTexture: this.fontURL + event.value + "/" + event.value + ".png"})
            } else if (event.presetKey == "textAlign") {
                this.textBox.set({textAlign: event.value})
            } else if (event.presetKey == "fontColor") {
                this.textBox.set({fontColor: new THREE.Color(event.value)});
            } else if (event.presetKey == "fontSize") {
                this.textBox.children[1].set({fontSize: event.value});
            } else if (event.presetKey == "containerWidth") {
                this.textBox.set({width: event.value});
            } else if (event.presetKey == "letterSpacing") {
                this.textBox.children[1].set({letterSpacing: event.value});
            } else if (event.presetKey == 'position') {
                let position = event.value;
                this.textBox.position.set(position.x,position.y,position.z);
            } else if (event.presetKey == 'rotation') {
                let rotation = event.value;
                this.textBox.rotation.set(THREE.MathUtils.degToRad(rotation.x),THREE.MathUtils.degToRad(rotation.y),THREE.MathUtils.degToRad(rotation.z));
            }
            this.updateBoundingBox() 
        });		
    };
    
    updateBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.textBox);
        const geometry = new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
        const edges = new THREE.EdgesGeometry( geometry );
        this.draggableMesh.geometry = edges;
        this.draggableMesh.position.set(this.PARAMS.position.x,this.PARAMS.position.y,this.PARAMS.position.z);
    }

    add(scene) {
        scene.add(this.draggableMesh);
        scene.add(this.textBox);
    }

    delete(scene) {
        scene.remove(this.draggableMesh);
        scene.remove(this.textBox);
        this.div.remove();
    }

    animate(camera) {
        this.updatePaneLocation(camera)
    }

}

//mesh component class
export class Mesh extends Component {
    constructor(componentID) {
        super(componentID,"mesh",250);

        //setup the UI for the cube
        this.PARAMS = {
            position: {x: 0, y: 0, z: 0},
            rotation: {x: 0, y: 0, z: 0},
            scale: {x: 1, y: 1, z: 1},
            geometry: "cube",
            material: "basic",
            color: '#000000'
        }

        this.pane = new Tweakpane.Pane({
            title: this.title,
            container: this.element, //gets the HTML element of the pane div
            expanded: true
        }); //create the pane and parent it to the draggable div

        this.pane.addInput(this.PARAMS, 'geometry', {
            label: 'geometry',
            options: {  
                cube: "cube",
                sphere: "sphere",
                icosahedron: "icosahedron"
            }
        });

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

        this.pane.addSeparator();

        this.pane.addInput(this.PARAMS, 'material', {
            label: 'material',
            options: {
                basic: "basic",
                glass: "glass",
                metal: "metal",
                diffuse: "diffuse",
            }
        });

        this.pane.addInput(this.PARAMS, 'color');

        //setup the cube mesh
        const geometry = new THREE.BoxGeometry(1,1,1);

        const material = new THREE.MeshBasicMaterial( {color: new THREE.Color(this.PARAMS.color)} );


        this.mesh = new THREE.Mesh( geometry, material );

        this.geometryChange(this.PARAMS.geometry);

        this.materialChange(this.PARAMS.material);

        // this.draggableMesh.name = (this.id).toString();

        //create the bounding box 
        const box = new THREE.Box3().setFromObject(this.mesh);
        const boxgeo = new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
        const edges = new THREE.EdgesGeometry( boxgeo );
        this.draggableMesh = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: new THREE.Color('#3682df') } ) );
        this.draggableMesh.name = (this.id).toString();
        this.draggableMesh.material.transparent = true;
        this.draggableMesh.material.opacity = 0;

        //track the draggable mesh position 
        this.trackPosition = new THREE.Vector3();

        //handle events 
        //pane events - change attributes of mesh 

        this.pane.on('change', (event) => { //if the pane changes
            //event.presetKey -> key that was changed
            //event.value -> what it was changed to
            if (event.presetKey == 'geometry') {
                this.geometryChange(event.value);
            } else if (event.presetKey == 'position') {
                this.mesh.position.set(event.value.x, event.value.y, event.value.z);
            } else if (event.presetKey == 'rotation') {
                let rotation = event.value;
                this.mesh.rotation.set(THREE.MathUtils.degToRad(rotation.x),THREE.MathUtils.degToRad(rotation.y),THREE.MathUtils.degToRad(rotation.z));
            } else if (event.presetKey == 'scale') {
                let scale = event.value;
                this.mesh.scale.set(scale.x, scale.y, scale.z);
            } else if (event.presetKey == 'material') {
                this.materialChange(event.value);
            } else if (event.presetKey == 'color') {
                let color = event.value;
                this.mesh.material.color = new THREE.Color(color);
            }
            this.updateBoundingBox();
        });		
    };

    updateBoundingBox() {
        const box = new THREE.Box3().setFromObject(this.mesh);
        const geometry = new THREE.BoxGeometry(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
        const edges = new THREE.EdgesGeometry( geometry );
        this.draggableMesh.geometry = edges;
        this.draggableMesh.position.set(this.PARAMS.position.x,this.PARAMS.position.y,this.PARAMS.position.z);
    }

    add(scene) {
        scene.add(this.draggableMesh);
        scene.add(this.mesh);

    }

    delete(scene) {
        scene.remove(this.draggableMesh);
        scene.remove(this.mesh);
        this.div.remove();
    }

    geometryChange(geometryString) {
        let geometry = null;
        if (geometryString == "cube") {
            geometry = new THREE.BoxGeometry(1,1,1);
        } else if (geometryString == "sphere") {
            geometry = new THREE.SphereGeometry(1,64,32);
        } else if (geometryString == "icosahedron") {
            geometry = new THREE.IcosahedronGeometry(1,0);
        }
        if (geometry != null) {
            this.mesh.geometry = geometry;
        }
    }

    materialChange(materialString){
        let material = null; 
        if (materialString == "basic") {
            material = new THREE.MeshBasicMaterial( {color: new THREE.Color(this.PARAMS.color)} );
        } else if (materialString == "glass") {
            const textureLoader = new THREE.TextureLoader();
            //normal map
            const normalMapTexture = textureLoader.load("bumpmap.jpeg");
            normalMapTexture.wrapS = THREE.RepeatWrapping;
            normalMapTexture.wrapT = THREE.RepeatWrapping;

            const hdrEquirect = new RGBELoader().load(
                "./hdr_lights.hdr",  
                () => { 
                  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
                }
              );

            material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(this.PARAMS.color),
                roughness: 0.1,
                transmission: 1, // Add transparency
                thickness: 0.5, // Add refraction!
                clearcoat: 1.0,
                normalScale: new THREE.Vector2(0.1),
                normalMap: normalMapTexture,  
                normalScale: new THREE.Vector2(0.1),
                clearcoatNormalMap: normalMapTexture,
                clearcoatRoughness: 0.1,
                envMap: hdrEquirect
            });
        } else if (materialString == "metal") {

            const hdrEquirect = new RGBELoader().load(
                "./hdr_lights.hdr",  
                () => { 
                  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
                }
              );

            material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(this.PARAMS.color),
                roughness: 0.35,
                metalness: 1,
                clearcoat: 0.35,
                envMap: hdrEquirect
            });
        } else if (materialString == "diffuse") {
            const hdrEquirect = new RGBELoader().load(
                "./hdr_lights.hdr",  
                () => { 
                  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping; 
                }
              );

            material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(this.PARAMS.color),
                roughness: 1.0,
                metalness: 0,
                clearcoat: 0.0,
                envMap: hdrEquirect,
                envMapIntensity: 0.1,
            });
        } 
        if (material != null) {
            material.side = THREE.DoubleSide;
            this.mesh.material = material;
        }
    }

    animate(camera) {
        this.updatePaneLocation(camera)
    }
}


//ParticleSphere component class
export class ParticleSphere extends Component {
    constructor(componentID) {
        super(componentID,"particle sphere",250);

        //setup the UI for the cube
        this.PARAMS = {
            color: '#000000',
            position: {x: 0, y: 0, z: 0},
            radius: 5,
            count: 100,
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

        this.pane.addInput(this.PARAMS, 'radius', {
            label: "radius",
            min: 1.0,
            max: 10.0,
        });

        this.pane.addInput(this.PARAMS, 'count', {
            label: "count",
            step: 1,
            min: 0,
            max: 10000,
        });

        this.pane.addInput(this.PARAMS,'color', {
            label: "color"
        }); 


        let instancedGeometry = new THREE.SphereGeometry(.05,64,32);
        let instancedMaterial = new THREE.MeshBasicMaterial( {color: new THREE.Color(this.PARAMS.color)} );
        this.instancedMesh = new THREE.InstancedMesh( instancedGeometry, instancedMaterial, 10000 );
        this.instancedMesh.count =  this.PARAMS.count;

		this.instancedMesh.instanceMatrix.setUsage( THREE.DynamicDrawUsage ); // will be updated every frame

        this.setInstancedMeshPositions(this.instancedMesh);


        //setup the bounding box mesh 
        const geometry = new THREE.BoxGeometry(2,2,2);
        const edges = new THREE.EdgesGeometry( geometry );
        this.draggableMesh = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: new THREE.Color('#3682df') } ) );
        this.draggableMesh.name = (this.id).toString();
        this.draggableMesh.scale.set(this.PARAMS.radius,this.PARAMS.radius,this.PARAMS.radius);
        this.draggableMesh.material.transparent = true;

        this.draggableMesh.material.opacity = 0.0;

        //handle events 
        //pane events - change attributes of mesh 

        this.pane.on('change', (event) => { //if the pane changes
            //event.presetKey -> key that was changed
            //event.value -> what it was changed to
            if (event.presetKey == "radius") {
                this.draggableMesh.scale.set(event.value, event.value, event.value);
            } else if (event.presetKey == "count") {
                this.instancedMesh.count =  event.value;
            } else if (event.presetKey == "position") {
                this.draggableMesh.position.set(event.value.x, event.value.y, event.value.z);
            } else if (event.presetKey == "color" ) {
                this.instancedMesh.material.color = new THREE.Color(event.value);
            }
            this.setInstancedMeshPositions(this.instancedMesh);
        });		
    };


    add(scene) {
        scene.add(this.draggableMesh);
        scene.add(this.instancedMesh);
    }

    delete(scene) {
        scene.remove(this.draggableMesh);
        scene.remove(this.instancedMesh);
        this.div.remove();
    }

    setInstancedMeshPositions(mesh) {
        var dummy = new THREE.Object3D();
        let radius = this.PARAMS.radius;

        for ( var i = 0; i < mesh.count; i ++ ) {
            var k = i + 0.5;

            var phi = Math.acos(1 - 2 * k / mesh.count);
            var theta = Math.PI * (1 + Math.sqrt(5)) * k;
        
            var x = Math.cos(theta) * Math.sin(phi);
            var y = Math.sin(theta) * Math.sin(phi);
            var z = Math.cos(phi);
            dummy.position.set((x*radius) + this.PARAMS.position.x,(y*radius) + + this.PARAMS.position.y,(z*radius) + + this.PARAMS.position.z);
            dummy.updateMatrix();
            mesh.setMatrixAt( i, dummy.matrix );
        }

        mesh.instanceMatrix.needsUpdate = true;
    }

    animate(camera) {
        this.setInstancedMeshPositions(this.instancedMesh);
        this.updatePaneLocation(camera)
    }
}
