import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { products, Product } from './catalogue';


const app = express();
app.use(express.json());



const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

interface Account {
  id : string;
  name : string;  
  balance: number;
  latestPurchaseDate: number;
}

interface Deposit {
  accountId: string;
  simulatedDay: number;
  deposits: depositsType[]
};

type depositsType = {
  amount:number;
  depositId: string;
};

/*  Below code is to handle the accounts related stuff */
const accounts: Account[] = [];
let simulatedDay: number;
const deposit: Deposit[] = [];

/*  get all the accounts */
app.get('/accounts', (req, res) => {
  console.log('inside get accounts');
  if(deposit.length > 0) {
    let balanceResetFlag = false;
    for(const depositVal of deposit){
      const tmpDeposit = {
        accId : depositVal.accountId,
        simulatedDay : depositVal.simulatedDay,
        arrOfDeposits : depositVal.deposits
      }
      if(Number(req.headers['simulated-day']) > Number(tmpDeposit.simulatedDay)){
        const initialValue = 0;
        const totalPrice = tmpDeposit.arrOfDeposits.reduce((total, depositVal) => total + depositVal.amount, initialValue);
        const tmpAccount = accounts.filter((account) => account.id === tmpDeposit.accId);
       
        if(tmpAccount.length > 0){
          tmpAccount[0].balance = tmpAccount[0].balance + totalPrice;
        }
        balanceResetFlag = true;
      }
    }
    if(balanceResetFlag){
      deposit.splice(0, deposit.length);
    }
    
    res.status(200).send({ message: accounts });  
  }else {
    res.status(201).send({ message: accounts });
}
}); 

/*  get a specific account based on the id */
app.get('/accounts/:accountId', (req, res) => {
  try {
    if(accounts.length >= 0) {
      const tmpAccount = accounts.filter((account) => account.id === req.params.accountId);
      if(tmpAccount.length > 0){
        res.status(200).send({ message: tmpAccount });
      }else{
        const err = new Error();
        err.name = 'Not Found';
        err.message = 'Please enter a valid id';
        throw err;
      }
    }
  }catch (error){
    res.status(400).send({error});
  }
}); 

/*  add a new account */
app.post('/accounts', (req, res) => {
  try {
    if(req.body['name']){
      const tmpAccount: Account= {
        id : uuidv4(),
        name : req.body['name'],
        balance: 0,
        latestPurchaseDate: 0
      }
      accounts.push(tmpAccount); 
      res.send({ message: accounts });
    }else{
      const err = new Error();
      err.name = 'Invalid Input';
      err.message = 'Please enter a valid name';
      throw err;
    }
  }catch (error){
    res.status(400).send({error});
  }
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

/*  update the balance of any existing account */
app.post('/accounts/:accountId/deposits', (req, res) => {
  try {
    if (accounts.length > 0) {
        const tmpAccount = accounts.find(account => account.id === req.params.accountId);
        if (tmpAccount) {
            const tmpDepositList: depositsType[] = [{
                amount: req.body['amount'],
                depositId: uuidv4(),
            }];
            const tmpDeposit = deposit.find(deposit => deposit.accountId === req.params.accountId);
            if (tmpDeposit) {
                tmpDeposit.deposits.push(tmpDepositList[0]);
            } else {
                const newDeposit: Deposit = {
                    accountId: req.params.accountId,
                    simulatedDay: Number(req.headers['simulated-day']),
                    deposits: tmpDepositList
                };
                deposit.push(newDeposit);
            }
            res.status(200).send({ message: deposit });
        } else {
            console.log('else');
            const err = new Error('Id not found: Cannot update balance amount for an invalid id. Please enter a valid ID.');
            err.name = 'Invalid Input';
            throw err;
        }
    }else {
      const err = new Error('Id not found: Cannot update balance amount for an invalid id. Please enter a valid ID.');
      err.name = 'Invalid Input';
      throw err;
  }
} catch (error) {
    console.error('Error:', error.message);
    res.status(400).send({ error: error.message });
}

}); 

/*  place an order */
app.post('/accounts/:accountId/purchases', (req, res) => {
  try {
    if(accounts.length >= 0) {
        let productPrice = 0;
        let balance = 0;
        let stock = 0;
        const tmpAccount = accounts.filter((account) => account.id === req.params.accountId);
        if(tmpAccount.length > 0){
          balance = tmpAccount[0].balance;
        }
        const tmpProduct = products.filter((product) => product.id === req.body['productId']);
        if(tmpProduct.length > 0){
          productPrice = tmpProduct[0].price;
        }
        if(tmpProduct.length > 0){
          stock = tmpProduct[0].stock;
        }
        if (tmpAccount.length === 0 || tmpProduct.length === 0) {
          res.status(400).send({ message: 'Invalid input' });
        }else if (Number(req.headers['simulated-day']) < Number(tmpAccount[0].latestPurchaseDate)) {
          return res.status(400).send({ message: 'Illegal purchase date' });
        }else if (balance >= productPrice && stock > 0){
          tmpAccount[0].balance = tmpAccount[0].balance - productPrice;
          tmpProduct[0].stock = tmpProduct[0].stock - 1;
          tmpAccount[0].latestPurchaseDate = Number(req.headers['simulated-day']);
          res.status(201).send({ message: 'Order success' });
        }else if (stock <= 0) {
          res.status(409).send({ message: 'Not enough stock' });
        }else if (balance < productPrice) {
          res.status(409).send({ message: 'Not enough funds' });
        }
      }else{  
        const err = new Error();
        err.name = 'Error';
        err.message = 'Cannot place the order';
        throw err;
      }
  }catch (error){
    res.status(400).send({error});
  }
});

/*  Below code is to handle the prodcuts related stuff */
/*  add a new product */
app.post('/products', (req, res) => {
  try {
    if(req.body['title']){
      const tmpProduct: Product= {
        id : uuidv4(),
        title : req.body['title'],
        description: req.body['description'],
        stock: req.body['stock'],
        price: req.body['price'],
      }
      products.push(tmpProduct); 
      res.status(200).send({ message: products });
    }else{
      const err = new Error();
      err.name = 'Invalid Input';
      err.message = 'Please enter a valid product';
      throw err;
    }
  }catch (error){
    res.status(400).send({error});
  }
});

/*  get list of all products */
app.get('/products', (req, res) => {
  res.status(200).send({ message: products });
}); 

/*  get a specific product based on the product id */
app.get('/products/:productId', (req, res) => {
  try {
    if(products.length >= 0) {
      const tmpProduct = products.filter((product) => product.id === req.params.productId);
      if(tmpProduct.length > 0){
        res.status(200).send({ message: tmpProduct });
      }else{
        const err = new Error();
        err.name = 'Product Not Found';
        err.message = 'Please enter a valid product id';
        throw err;
      }
    }
  }catch (error){
    res.status(404).send({error});
  }
}); 

/*  below code is to update the balance of all the accounts with the latest deposited amount at the end the day. 
the functon is called every 30 minutes but will only execute at 23:30.
 Ideally should call the below end point /checkbalance but not sure on how to call it from within the code  */
setInterval(function(){ 
  const date = new Date(); 
  if(date.getHours() === 23 && date.getMinutes() === 30){ 
    console.log('** call the below /checkBalance function/code to update the new balance **');
  }
}, 1800000);


app.get('/checkBalance', (req, res) => {
  try {
    console.log('balance check',deposit.length);
    let balanceResetFlag = false;
    if(deposit.length > 0) {
      for(const depositVal of deposit){
        const tmpDeposit = {
          accId : depositVal.accountId,
          simulatedDay : depositVal.simulatedDay,
          arrOfDeposits : depositVal.deposits
        }
        if(Number(req.headers['simulated-day']) > Number(tmpDeposit.simulatedDay)){
          const initialValue = 0;
          const totalPrice = tmpDeposit.arrOfDeposits.reduce((total, depositVal) => total + depositVal.amount, initialValue);
          const tmpAccount = accounts.filter((account) => account.id === tmpDeposit.accId);
         
          if(tmpAccount.length > 0){
            tmpAccount[0].balance = tmpAccount[0].balance + totalPrice;
          }
          balanceResetFlag = true;
        }
      }
      if(balanceResetFlag){
        deposit.splice(0, deposit.length);
      }
      
      res.status(200).send({ message: accounts });  
    }else {
      res.status(201).send({ message: accounts });  
  }
  }catch (error){
    res.status(400).send({error});
  }
}); 



/*  Functions for Test cases */

async function getAccountDetails(): Promise<Account[]> {
  const response = fetch(`http://localhost:3000/accounts`);
  console.log('hey hi',(await response));
  return (await response).json();
}

getAccountDetails();