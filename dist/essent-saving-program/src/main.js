var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var import_express = __toESM(require("express"));
var import_uuid = require("uuid");
var import_catalogue = require("./catalogue");
const app = (0, import_express.default)();
app.use(import_express.default.json());
const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3e3;
;
const accounts = [];
let simulatedDay;
const deposit = [];
app.get("/accounts", (req, res) => {
  console.log("inside get accounts");
  if (deposit.length > 0) {
    let balanceResetFlag = false;
    for (const depositVal of deposit) {
      const tmpDeposit = {
        accId: depositVal.accountId,
        simulatedDay: depositVal.simulatedDay,
        arrOfDeposits: depositVal.deposits
      };
      if (Number(req.headers["simulated-day"]) > Number(tmpDeposit.simulatedDay)) {
        const initialValue = 0;
        const totalPrice = tmpDeposit.arrOfDeposits.reduce((total, depositVal2) => total + depositVal2.amount, initialValue);
        const tmpAccount = accounts.filter((account) => account.id === tmpDeposit.accId);
        if (tmpAccount.length > 0) {
          tmpAccount[0].balance = tmpAccount[0].balance + totalPrice;
        }
        balanceResetFlag = true;
      }
    }
    if (balanceResetFlag) {
      deposit.splice(0, deposit.length);
    }
    res.status(200).send({ message: accounts });
  } else {
    res.status(201).send({ message: accounts });
  }
});
app.get("/accounts/:accountId", (req, res) => {
  try {
    if (accounts.length >= 0) {
      const tmpAccount = accounts.filter((account) => account.id === req.params.accountId);
      if (tmpAccount.length > 0) {
        res.status(200).send({ message: tmpAccount });
      } else {
        const err = new Error();
        err.name = "Not Found";
        err.message = "Please enter a valid id";
        throw err;
      }
    }
  } catch (error) {
    res.status(400).send({ error });
  }
});
app.post("/accounts", (req, res) => {
  try {
    if (req.body["name"]) {
      const tmpAccount = {
        id: (0, import_uuid.v4)(),
        name: req.body["name"],
        balance: 0,
        latestPurchaseDate: 0
      };
      accounts.push(tmpAccount);
      res.send({ message: accounts });
    } else {
      const err = new Error();
      err.name = "Invalid Input";
      err.message = "Please enter a valid name";
      throw err;
    }
  } catch (error) {
    res.status(400).send({ error });
  }
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
app.post("/accounts/:accountId/deposits", (req, res) => {
  try {
    if (accounts.length > 0) {
      const tmpAccount = accounts.find((account) => account.id === req.params.accountId);
      if (tmpAccount) {
        const tmpDepositList = [{
          amount: req.body["amount"],
          depositId: (0, import_uuid.v4)()
        }];
        const tmpDeposit = deposit.find((deposit2) => deposit2.accountId === req.params.accountId);
        if (tmpDeposit) {
          tmpDeposit.deposits.push(tmpDepositList[0]);
        } else {
          const newDeposit = {
            accountId: req.params.accountId,
            simulatedDay: Number(req.headers["simulated-day"]),
            deposits: tmpDepositList
          };
          deposit.push(newDeposit);
        }
        res.status(200).send({ message: deposit });
      } else {
        console.log("else");
        const err = new Error("Id not found: Cannot update balance amount for an invalid id. Please enter a valid ID.");
        err.name = "Invalid Input";
        throw err;
      }
    } else {
      const err = new Error("Id not found: Cannot update balance amount for an invalid id. Please enter a valid ID.");
      err.name = "Invalid Input";
      throw err;
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).send({ error: error.message });
  }
});
app.post("/accounts/:accountId/purchases", (req, res) => {
  try {
    if (accounts.length >= 0) {
      let productPrice = 0;
      let balance = 0;
      let stock = 0;
      const tmpAccount = accounts.filter((account) => account.id === req.params.accountId);
      if (tmpAccount.length > 0) {
        balance = tmpAccount[0].balance;
      }
      const tmpProduct = import_catalogue.products.filter((product) => product.id === req.body["productId"]);
      if (tmpProduct.length > 0) {
        productPrice = tmpProduct[0].price;
      }
      if (tmpProduct.length > 0) {
        stock = tmpProduct[0].stock;
      }
      if (tmpAccount.length === 0 || tmpProduct.length === 0) {
        res.status(400).send({ message: "Invalid input" });
      } else if (Number(req.headers["simulated-day"]) < Number(tmpAccount[0].latestPurchaseDate)) {
        return res.status(400).send({ message: "Illegal purchase date" });
      } else if (balance >= productPrice && stock > 0) {
        tmpAccount[0].balance = tmpAccount[0].balance - productPrice;
        tmpProduct[0].stock = tmpProduct[0].stock - 1;
        tmpAccount[0].latestPurchaseDate = Number(req.headers["simulated-day"]);
        res.status(201).send({ message: "Order success" });
      } else if (stock <= 0) {
        res.status(409).send({ message: "Not enough stock" });
      } else if (balance < productPrice) {
        res.status(409).send({ message: "Not enough funds" });
      }
    } else {
      const err = new Error();
      err.name = "Error";
      err.message = "Cannot place the order";
      throw err;
    }
  } catch (error) {
    res.status(400).send({ error });
  }
});
app.post("/products", (req, res) => {
  try {
    if (req.body["title"]) {
      const tmpProduct = {
        id: (0, import_uuid.v4)(),
        title: req.body["title"],
        description: req.body["description"],
        stock: req.body["stock"],
        price: req.body["price"]
      };
      import_catalogue.products.push(tmpProduct);
      res.status(200).send({ message: import_catalogue.products });
    } else {
      const err = new Error();
      err.name = "Invalid Input";
      err.message = "Please enter a valid product";
      throw err;
    }
  } catch (error) {
    res.status(400).send({ error });
  }
});
app.get("/products", (req, res) => {
  res.status(200).send({ message: import_catalogue.products });
});
app.get("/products/:productId", (req, res) => {
  try {
    if (import_catalogue.products.length >= 0) {
      const tmpProduct = import_catalogue.products.filter((product) => product.id === req.params.productId);
      if (tmpProduct.length > 0) {
        res.status(200).send({ message: tmpProduct });
      } else {
        const err = new Error();
        err.name = "Product Not Found";
        err.message = "Please enter a valid product id";
        throw err;
      }
    }
  } catch (error) {
    res.status(404).send({ error });
  }
});
setInterval(function() {
  const date = /* @__PURE__ */ new Date();
  if (date.getHours() === 23 && date.getMinutes() === 30) {
    console.log("** call the below /checkBalance function/code to update the new balance **");
  }
}, 18e5);
app.get("/checkBalance", (req, res) => {
  try {
    console.log("balance check", deposit.length);
    let balanceResetFlag = false;
    if (deposit.length > 0) {
      for (const depositVal of deposit) {
        const tmpDeposit = {
          accId: depositVal.accountId,
          simulatedDay: depositVal.simulatedDay,
          arrOfDeposits: depositVal.deposits
        };
        if (Number(req.headers["simulated-day"]) > Number(tmpDeposit.simulatedDay)) {
          const initialValue = 0;
          const totalPrice = tmpDeposit.arrOfDeposits.reduce((total, depositVal2) => total + depositVal2.amount, initialValue);
          const tmpAccount = accounts.filter((account) => account.id === tmpDeposit.accId);
          if (tmpAccount.length > 0) {
            tmpAccount[0].balance = tmpAccount[0].balance + totalPrice;
          }
          balanceResetFlag = true;
        }
      }
      if (balanceResetFlag) {
        deposit.splice(0, deposit.length);
      }
      res.status(200).send({ message: accounts });
    } else {
      res.status(201).send({ message: accounts });
    }
  } catch (error) {
    res.status(400).send({ error });
  }
});
async function getAccountDetails() {
  const response = fetch(`http://localhost:3000/accounts`);
  console.log("hey hi", await response);
  return (await response).json();
}
getAccountDetails();
//# sourceMappingURL=main.js.map
