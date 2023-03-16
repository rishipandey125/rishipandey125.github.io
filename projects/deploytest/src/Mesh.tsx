import {
  useCursor,
  Edges,
} from "@react-three/drei";
import { useState } from "react";
import { useThree, useFrame} from "@react-three/fiber";
import { useGesture } from "@use-gesture/react"
import MaterialLibrary from './MaterialLibrary'
import * as THREE from "three";

export default function Mesh(props) { //box component
  // useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01));
  const [hover, setHover] = useState(false)

  let bbScale = 1.2; 
  if (props.geometry === "sphere" || props.geometry === "isocahedron") {
    bbScale = 2.1;
  }

  const {gl, size, viewport, camera } = useThree();

  const canvas = gl.domElement;
  const rect = canvas.getBoundingClientRect();

  const id = props.id;

  const bind = useGesture({
    onDrag: ({ xy: [x, y], active: a}) => {
      props.setOrbit(!(a)) // turn off orbit controls when dragging
      props.setGrid(a)
      if (a && hover && props.selected) {
        
        const canvasX = (x - rect.left) * size.width / rect.width;
        const canvasY = (y - rect.top) * size.height / rect.height; 

        const clipX =  (canvasX/size.width) * 2 - 1;
        const clipY = (canvasY/size.height) * -2 + 1; 

        const clipPos = new THREE.Vector3(props.position[0],props.position[1],props.position[2]);
        clipPos.project(camera);

        const pos = new THREE.Vector3(clipX, clipY, clipPos.z);
        pos.unproject(camera);

        props.setControls({[`position ~${id}`]: {x: pos.x, y: pos.y, z: pos.z}}) //override the property panels value 
        props.updateComponent({id, data: Object.assign({}, props.data, {"position": {x: pos.x, y: pos.y, z: pos.z}})}) //update the component data
      }
    }, 
    onHover: ({ hovering }) => setHover(hovering)
  })

  useCursor(hover)


  return (
      <mesh {...bind()} userData={props.id} position={props.position} rotation={props.rotation} scale={props.scale} visible={props.visible}>

          {props.geometry === "cube" ? (
            <boxGeometry/>
          ) : props.geometry === "sphere" ? (
            <sphereGeometry/>
          ) : props.geometry === "isocahedron" ? (
            <icosahedronGeometry />
          ) : (
            <boxGeometry args={[1, 1, 1]} />
          )}
          <MaterialLibrary material={props.material} color={props.color}/>

          <mesh>
            <boxGeometry/>
            <meshBasicMaterial transparent opacity={0} />
            <Edges visible={props.selected || hover} scale={bbScale} renderOrder={1000}>
              <meshBasicMaterial transparent color="#3682df" depthTest={false} />
            </Edges>          
          </mesh>
          
      </mesh>
  );
}