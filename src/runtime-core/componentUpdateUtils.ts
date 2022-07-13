export function shouldUpdateComponent(prevVnode: any, nextVnode: any) {

  const { props: preProps } = prevVnode
  const { props: nextProps } = nextVnode

  for (const k in nextProps) {
    if (nextProps[k] !== preProps[k]) {
      return true
    }
  }
  return false
}