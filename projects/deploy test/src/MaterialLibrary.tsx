import {Color, Gradient, Depth, LayerMaterial, Fresnel, Noise, Texture } from "lamina";


export default function MaterialLibrary(props) {
    let roughness = 1;
    let transmission = 0;
    if (props.material === "glass") {
      roughness = 0.3;
      transmission = 1;
    } else if (props.material === "glossy") {
      roughness = 0.1;
    }

    return (
      <LayerMaterial
        lighting={'physical'}
        color={props.color}
        transmission={transmission}
        roughness={roughness}
        thickness={2}
      > 
        {props.material === "basic" ? (
          <Depth
            near={1.14}
            far={0.9449999999999992}
            origin={[0.5200000000000002, -0.2900000000000002, -0.18999999999999995]}
            colorA={'#ffffff'}
            colorB={'#000000'}
            alpha={0.1}
            mode={'multiply'}
          />
        ) : props.material === "glossy" ? (
          <Depth
            near={1.14}
            far={0.9449999999999992}
            origin={[0.5200000000000002, -0.2900000000000002, -0.18999999999999995]}
            colorA={'#ffffff'}
            colorB={'#000000'}
            alpha={0.1}
            mode={'multiply'}
          />
        ) : props.material === "glass" ? (
          <Depth
            near={0.4854}
            far={0.7661999999999932}
            origin={[-0.4920000000000004, 0.4250000000000003, 0]}
            colorA={props.color}
            colorB={props.color}
          >
            <Fresnel
              color={'#ffffff'}
              bias={-0.3430000000000002}
              intensity={3.8999999999999946}
              power={3.3699999999999903}
              factor={1.119999999999999}
              mode={'screen'}
            />
          </Depth>
        ): (
          <Depth
            near={1.14}
            far={0.9449999999999992}
            origin={[0.5200000000000002, -0.2900000000000002, -0.18999999999999995]}
            colorA={'#ffffff'}
            colorB={'#000000'}
            alpha={0.1}
            mode={'multiply'}
          />
        )}
      </LayerMaterial>
  );
}

