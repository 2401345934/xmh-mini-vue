import { NodeTypes } from "./ast"

export function transform(root: any, options?: any) {
  const context = creaetTransformContext(root, options)
  // 深度优先遍历
  traversNode(root, context)

  // 修改text


}

function traversNode(node: any, context: any) {
  const nodeTransforms = context.nodeTransforms
  for (let i = 0; i < nodeTransforms.length; i++) {
    const ntransforms = nodeTransforms[i]
    ntransforms(node)
  }
  traversChildren(node, context)

}

function traversChildren(node: any, context: any) {
  const children = node.children
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const n = children[i]
      traversNode(n, context)
    }
  }
}

function creaetTransformContext(root: any, options: any) {
  const context = {
    root,
    nodeTransforms: options.nodeTransforms || []
  }
  return context
}

