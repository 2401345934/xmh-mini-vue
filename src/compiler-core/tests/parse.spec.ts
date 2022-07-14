// import { NodeTypes } from "../src/ast";
import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {


  describe("interpolation", () => {
    test("simple interpolation", () => {
      const ast = baseParse("{{  message  }}")
      expect(ast.children[0]).toStrictEqual(
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        })
    });
  })


  describe("element", () => {
    it("simple element div", () => {
      const ast = baseParse("<div></div>");
      console.log(ast, '123122313131231')
      expect(ast.children[0]).toStrictEqual(
        {
          type: NodeTypes.ELEMENT,
          tag: "div"
        })
    });
  });
});
