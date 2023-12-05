const express = require('express');
const app = express();
const cors = require('cors');
const port = 8000;
const {login, register, search, getProducts, placeOrder, getOrder, getOrders, update, profile, client} = require('./db.js');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser')
require('dotenv').config({path: './.env.prod'});

app.use(cors());
app.use(bodyParser.json());

/*
const auth = async (req, res, next) => {
  try {
    //   get the token from the authorization header
    const token = await req.headers.authorization.split(" ")[1];

    //check if the token matches the supposed origin
    const decodedToken = await jwt.verify(token, "RANDOM-TOKEN");

    // retrieve the user details of the logged in user
    const user = await decodedToken;

    // pass the the user down to the endpoints here
    req.user = user;

    // pass down functionality to the endpoint
    next();
    
  } catch (error) {
    res.status(401).json({
      error: "You need to login first to access this page"
    });
  }
};
*/
app.get('/', (req, res) => {
  res.send('Server functioning correctly');
})

app.get('/products', async (req, res) => {
  const products = await getProducts();
  res.send(products);
})

app.post('/orders', async (req, res) => {
  const {user} = req.body;
  const orders = await getOrders(user.email);
  if(orders.message){
    res.status(500).send("Error querying orders database, please try again later");
  }else if(!orders){
    res.status(404).send("No orders were found");
  }else{
    res.send(orders);
  }
})

app.post('/order', async (req, res) => {
  const id = req.body.id;
  const order = await getOrders(id);
  if(order.message){
    res.status(500).send("Error querying orders database, please try again later");
  }else if(!order.orderID){
    res.status(404).send("Error querying this order");
  }else{
    res.send(order);
  }
})

app.post('/placeOrder', async (req, res) => {
  const {order} = req.body;
  const result = await placeOrder(order);
  if(result.error){
    res.status(500).send({error: result.error});
  }else{
    res.send(result);
  }
})

app.post('/login', async (req, res) => {
  const {user} = req.body;
  const password = await login(user);
  if(!password){
    res.status(404).send('User not found, please check that the email address entered is correct')
    return;
  }
  const passwordsMatch = await bcrypt.compare(user.password, password);
  if(!passwordsMatch){
    res.status(400).send('Incorrect password');
    return;
  }else{
    const token = jwt.sign(
      {
        email: user.email,
      },
      "RANDOM-TOKEN",
      { expiresIn: "24h" }
    );
    res.status(200).send({response: "Login successful", email: user.email, token});
  }
  
})

app.post('/password', async (req, res) => {
  const {user} = req.body;
  const password = await login(user);
  if(!password){
    res.status(404).send('User not found, please check that the email address entered is correct')
    return;
  }
  const passwordsMatch = await bcrypt.compare(user.password, password);
  if(!passwordsMatch){
    res.status(400).send({failed: 'Incorrect password'});
    return;
  }else{
    res.status(200).send({success: 'Correct password'});
    return
  }
})

app.post('/register', async (req, res) => {
  const {user} = req.body;
  const address = await search(user);
  if(address){
    res.status(400).send('Email address already exists');
    return;
  }
  const hpassword = await bcrypt.hash(user.password, parseInt(process.env.SALT, 10))
  user.password = hpassword;
  const response = await register(user);
  res.send('User registered successfully');
})


app.post('/update', async (req, res) => {
  const {user} = req.body;
  if(user.password){
    const hpassword = await bcrypt.hash(user.password, parseInt(process.env.SALT, 10))
    user.password = hpassword;
  }
  const result = await update(user);
  if(result === "User updated successfully"){
    res.status(200).send(result);
  }else{
    res.status(500).send(result);
  }

})

app.post('/profile', async (req, res) => {
  const {user} = req.body;
  const result = await profile(user);
  if(result){
    res.status(200).send(result);
  }else{
    res.status(500).send(result);
  }

})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})

const shutDown = async () => {
  await client.close();
  console.log("MongoDB client closed");
  process.exit(0);
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
