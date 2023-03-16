import {
  EyeSlashIcon,
  PlusIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  EyeIcon as EyeFilledIcon,
} from "@heroicons/react/24/solid";
import * as ContextMenu from "@radix-ui/react-context-menu";
import {
  Select,
  useCursor,
  Edges,
  OrbitControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";
import { Canvas, extend, useThree, useFrame} from "@react-three/fiber";
import clsx from "clsx";
import { set } from "immer/dist/internal";
import { button, Leva, useControls } from "leva";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import create from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import Mesh from './Mesh'
import WorldGrid from './WorldGrid'


const DEFAULT_DATA = { //default data for a component 
  "mesh": {
    "geometry": "cube",
    "material": "basic",
    "position": {x: 0, y: 0, z: 0}, 
    "rotation": {x: 0, y: 0, z: 0}, 
    "scale": {x: 1, y: 1, z: 1},
    "color": "#000000"
  }
}

let SET_CONTROLS = {}; //setter for leva controls

type Component = any;

type State = { //define a type for states to track
  components: Component[];  
  selectedComponentId: string | null;
  setSelectedComponentId: (selected: []) => void;
  setSelectedComponentIdOutliner: (id: string) => void;
  clearSelectedComponent: () => void;
  addComponent: (component: Component) => void;
  updateComponent: (component: Partial<Component>) => void;
  setComponentVisibleById: (id: string, visible: boolean) => void;
  toggleComponentVisibilityById: (id: string) => void;
  duplicateComponentById: (id: string) => void;
  removeComponentById: (id: string) => void;
  removeSelectedComponent: () => void;
  duplicateSelectedComponent: () => void;
};

const useStore = create<State>()( //states use persist and immer to track and remember data
  persist(
    immer(
      (set, get) =>
        ({
          components: [
            {
              name: `Component A`,
              id: (THREE.MathUtils.generateUUID()),
              type: "mesh",
              visible: true,
              data: DEFAULT_DATA["mesh"]
            },
          ],
          selectedComponentId: null,
          setSelectedComponentId: (selected: []) => {
            if (selected.length === 0) {
              set({ selectedComponentId: null });
            } else {
              set({ selectedComponentId: selected[0].userData });
            }
          },
          setSelectedComponentIdOutliner: (id: string) => set({ selectedComponentId: id }),
          clearSelectedComponent: () => {

            set({ selectedComponentId: null });
          },
          addComponent: (component: Component) =>
            set((state) => ({
              components: [...state.components, component],
            })),
          updateComponent: (component: Partial<Component>) =>
            set((state) => ({
              components: state.components.map((l: Component) =>
                l.id === component.id ? { ...l, ...component } : l
              ),
            })),
          setComponentVisibleById: (id: string, visible: boolean) => {
            const component = get().components.find((l) => l.id === id);
            if (component) {
              set((state) => {
                const component = state.components.find((l: Component) => l.id === id);
                if (component) {
                  component.visible = visible;
                }
              });
            }
          },
          toggleComponentVisibilityById: (id: string) => {
            const state = get();
            const component = state.components.find((l) => l.id === id);
            if (component) {
              state.setComponentVisibleById(id, !component.visible);
            }
          },
          duplicateComponentById: (id: string) => {
            const state = get();
            const component = state.components.find((l) => l.id === id);
            if (component) {
              const newComponent = {
                ...component,
                id: (THREE.MathUtils.generateUUID()),
                name: `${component.name} (copy)`,
                data: component.data
              };
              state.addComponent(newComponent);
            }
          },
          removeComponentById: (id: string) => {
            const state = get();
            const component = state.components.find((l) => l.id === id);
            if (component) {
              set((state) => ({
                components: state.components.filter((l) => l.id !== id),
                selectedComponentId:
                  state.selectedComponentId === id ? null : state.selectedComponentId,
              }));
            }
          },
          removeSelectedComponent: () => {
            const state = get();
            if (state.selectedComponentId) {
              state.removeComponentById(state.selectedComponentId);
            }
          },
          duplicateSelectedComponent: () => {
            const state = get();
            if (state.selectedComponentId) {
              state.duplicateComponentById(state.selectedComponentId);
            }
          },
        } as State)
    ),
    {
      name: "env-storage",
      version: 1,
      getStorage: () => localStorage,
    }
  )
);


export default function App() { //main function to define html of app

  return (
    <div
      style={{
        gridTemplateAreas: `
            "outliner scene properties"
            "outliner scene properties"
          `,
      }}
      className="bg-neutral-800 grid grid-cols-[250px_1fr_340px] grid-rows-[3fr_2fr] w-full h-full overflow-hidden gap-4 p-4 text-white"
    >
      <div //outliner to the left
        style={{ gridArea: "outliner" }}
        className="bg-neutral-900 rounded-lg"
      >
        <Outliner />
      </div>

      <div //scene in the center 
        style={{
          gridArea: "scene",
          backgroundSize: "20px 20px",
          backgroundImage:
            "linear-gradient(to right, #222222 1px, transparent 1px), linear-gradient(to bottom, #222222 1px, transparent 1px)",
        }}
        className="bg-neutral-900 rounded-lg overflow-hidden"
      >
        <ScenePreview />
      </div>

      <div //properties panel to the right
        style={{ gridArea: "properties" }}
        className="bg-neutral-900 rounded-lg overflow-y-auto"
      >
        <h2 className="p-4 uppercase font-light text-xs tracking-widest text-gray-300 border-b border-white/10">
          Properties
        </h2>
        <div className="p-2">
          <Leva
            neverHide
            fill
            flat
            titleBar={false}
            theme={{
              colors: {
                elevation1: "transparent",
                elevation2: "transparent",
                elevation3: "rgba(255, 255, 255, 0.1)",
              },
              sizes: {
                rootWidth: "100%",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}


function Outliner() { //left side outliner
  const components = useStore((state) => state.components); 
  const addComponent = useStore((state) => state.addComponent);
  return (
    <div>

      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="uppercase font-light text-xs tracking-widest text-gray-300">
          Components
        </h2>
        <button //button to add a new component
          className="rounded p-1 -m-1 hover:bg-white/20 transition-colors"
          onClick={() => {
            addComponent({
              name: `Component ${String.fromCharCode(components.length + 65)}`,
              id: (THREE.MathUtils.generateUUID()),
              type: "mesh",
              visible: true,
              data: DEFAULT_DATA["mesh"],
            });
          }}
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

        {components.map((component) => (
          <ComponentListItem key={component.id} component={component} />
        ))}
    </div>
  );
}

function ScenePreview() { //center scene preview canvas

  const containerRef = useRef<HTMLDivElement | null>(null);
  const view1Ref = useRef<HTMLDivElement | null>(null);

  const components = useStore((state) => state.components);

  const selectedComponentId = useStore((state) => state.selectedComponentId);
  const setSelectedComponentId = useStore((state) => state.setSelectedComponentId);
  const updateComponent = useStore((state) => state.updateComponent);

  const [orbit, setOrbit] = useState(true);
  const [grid, setGrid] = useState(false);

  const [
    {
      background,
      backgroundColor,
      autoRotate,
    },
  ] = useControls(
    () => ({
      // background: {
      //   label: "Show BG",
      //   value: true,
      //   render: () => selectedComponentId === null,
      // },
      backgroundColor: {
        label: "color",
        value: "#ffffff",
        render: () => selectedComponentId === null,
      },
      // autoRotate: {
      //   label: "Auto Rotate",
      //   value: false,
      //   render: () => selectedComponentId === null,
      // },
    }),
    [selectedComponentId]
  );
  
  return (
    <div
      ref={containerRef}
      className="flex flex-col w-full h-full overflow-hidden relative"
    >
      <div ref={view1Ref} className="w-full h-full" />

        <Canvas //threejs canvas
          className="!absolute top-0 left-0 pointer-events-none w-full h-full"
          gl={{ preserveDrawingBuffer: true }}
        >

            <GizmoHelper alignment="top-right" margin={[100, 100]}>
              <GizmoViewport labelColor="white" axisHeadScale={1} />
            </GizmoHelper>

            <OrbitControls enabled={orbit} minDistance={3} maxDistance={50} makeDefault/>
            <WorldGrid visible={grid}/>
            <Environment preset="city" background={false} />
              <color attach="background" args={[backgroundColor]} />

              <Select onChange={(e)=>(setSelectedComponentId(e))}>

              {components.map((component) => {
                const {
                  id,
                  type,
                  data,
                  visible
                } = component; 
                let comp = null;

                if (type === "mesh") {
                  comp = 
                        <Mesh 
                              id={id}
                              data={data}
                              geometry={data["geometry"]}
                              material={data["material"]}
                              position={[data["position"].x,data["position"].y,data["position"].z]}
                              rotation={[THREE.MathUtils.degToRad(data["rotation"].x),THREE.MathUtils.degToRad(data["rotation"].y),THREE.MathUtils.degToRad(data["rotation"].z)]}
                              scale={[data["scale"].x,data["scale"].y,data["scale"].z]}
                              visible={visible}
                              color={data["color"]} 
                              selected= {(selectedComponentId==id)}
                              updateComponent={updateComponent}
                              setControls={SET_CONTROLS[id]}
                              setOrbit={setOrbit}
                              setGrid={setGrid}
                          />
                }
                return (
                  comp
                );
              })}      
              </Select>
        </Canvas>
    </div>
  );
}


function ComponentListItem({ component }: { component: Component }) { //list out the components
  const {
    id,
    type,
    name,
    visible,
    data
  } = component;

  let selectedComponentId = useStore((state) => state.selectedComponentId);
  const updateComponent = useStore((state) => state.updateComponent);
  const duplicateComponentById = useStore((state) => state.duplicateComponentById);
  const removeComponentById = useStore((state) => state.removeComponentById);
  const setSelectedComponentIdOutliner = useStore((state) => state.setSelectedComponentIdOutliner);
  const clearSelectedComponent = useStore((state) => state.clearSelectedComponent);
  const toggleComponentVisibilityById = useStore((state) => state.toggleComponentVisibilityById);

  [,SET_CONTROLS[id]] = useControls(() => {
    if (selectedComponentId !== id) {
      return {};
    } else {
      return {
        [`name ~${id}`]: {
          label: "Name",
          value: name ?? "Component",
          onChange: (v) => updateComponent({ id, name: v }),
      },
        [`type ~${id}`]: {
          label: "Type",
          value: type ?? "mesh",
          options: ["mesh"],
          onChange: (v) => {
            // updateComponent({ id, type: })
            updateComponent({ id, data: DEFAULT_DATA[v], type: v })
          }
        },

        ...(() => {
          if (component.type === "mesh") {
            return {
              [`geometry ~${id}`]: {
                label: "geometry",
                value: "cube",
                options: ["cube","sphere","isocahedron"],
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"geometry": v})})
                }
              },
              [`material ~${id}`]: {
                label: "material",
                value: "basic",
                options: ["basic","glossy","glass"],
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"material": v})})
                }
              },
              [`position ~${id}`]: {
                label: "position",
                value: component.data["position"],
                step: 0.01,
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"position": v})})
                }              
              },
              [`rotation ~${id}`]: {
                label: "rotation",
                value: component.data["rotation"],
                min: 0,
                max: 360,
                step: 1,
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"rotation": v})})
                }
              },
              [`scale ~${id}`]: {
                label: "scale",
                value: component.data["scale"],
                step: 0.1,
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"scale": v})})
                }
              },
              [`color ~${id}`]: {
                label: "color",
                value: component.data["color"],
                onChange: (v) => {
                  updateComponent({id, data: Object.assign({}, component.data, {"color": v})})
                }
              },
            };
          } else {
            return {};
          }
        })(),
      };
    }
  }
  , [
    selectedComponentId,
    id,
    name,
    type,
    visible,
    data
  ]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <li
          key={id}
          role="button"
          className={clsx(
            "group flex list-none p-2 gap-2 rounded-md bg-transparent cursor-pointer transition-colors",
            selectedComponentId === id && "bg-white/20",
            selectedComponentId !== id && "hover:bg-white/10"
          )}
          onClick={() => {
            //set use select to none 
            if (selectedComponentId === id) {
              clearSelectedComponent();
            } else {
              setSelectedComponentIdOutliner(id);
            }
          }}
        >
          <CubeIcon
            className={clsx(
              "w-4 h-4 text-blue-400",
              !visible && "text-gray-300/50"
            )}
          />
          <input
            type="checkbox"
            hidden
            readOnly
            checked={selectedComponentId === id}
            className="peer"
          />

          <span
            className={clsx(
              "flex-1 text-xs font-mono text-gray-300 text-ellipsis overflow-hidden whitespace-nowrap",
              !visible && "text-gray-300/50 line-through"
            )}
          >
            {name}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleComponentVisibilityById(id);
            }}
            className={clsx(
              "text-white opacity-40 hover:opacity-100 group-hover:opacity-60 peer-checked:opacity-40 peer-checked:hover:opacity-100 transition-opacity",
              "disabled:cursor-not-allowed disabled:hover:opacity-0"
            )}
          >
            {visible ? (
              <EyeFilledIcon className="w-4 h-4" />
            ) : (
              <EyeSlashIcon className="w-4 h-4 " />
            )}
          </button>
        </li>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content className="flex flex-col gap-1 bg-neutral-800 text-gray-50 font-light p-1.5 rounded-md shadow-xl">
          <ContextMenu.Item
            className="outline-none select-none rounded px-2 py-0.5 highlighted:bg-white highlighted:text-gray-900 text-sm"
            onSelect={() => duplicateComponentById(id)}
          >
            Duplicate
          </ContextMenu.Item>
          <ContextMenu.Item
            className="outline-none select-none rounded px-2 py-0.5 text-white highlighted:bg-red-500 highlighted:text-white text-sm"
            onSelect={() => removeComponentById(id)}
          >
            Delete
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}

