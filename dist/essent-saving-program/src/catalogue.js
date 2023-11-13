var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var catalogue_exports = {};
__export(catalogue_exports, {
  products: () => products
});
module.exports = __toCommonJS(catalogue_exports);
const products = [
  {
    id: "solar",
    title: "Solar Panel",
    description: "Super duper Essent solar panel",
    stock: 10,
    price: 750
  },
  {
    id: "insulation",
    title: "Insulation",
    description: "Cavity wall insulation",
    stock: 10,
    price: 2500
  },
  {
    id: "heatpump",
    title: "Awesome Heatpump",
    description: "Hybrid heat pump",
    stock: 3,
    price: 5e3
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  products
});
//# sourceMappingURL=catalogue.js.map
