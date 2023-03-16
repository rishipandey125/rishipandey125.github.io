export default function WorldGrid(props) {
  // this is the bb blue #3682df
  return (
    <group>
    <gridHelper visible={props.visible} args={[30,10,'#FF2060','#FF2060']} />
    <gridHelper visible={props.visible} rotation-x={Math.PI /2} args={[30,10,'#20DF80','#20DF80']} />
    <gridHelper visible={props.visible} rotation-z={Math.PI /2} args={[30,10,'#2080FF','#2080FF']} />
    </group>
  )
}
