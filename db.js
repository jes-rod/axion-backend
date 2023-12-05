const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config({path: './.env.prod'});

const uri = process.env.DB_URL;
const client =  new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const connectClient = async () => {
  await client.connect()
  console.log("Client connected")
}

connectClient();


const login = async (user) => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const users = database.collection("users");
    const result = await users.findOne({email: user.email});
    if (result === null){
  //    await client.close();
      return false;
    }
 //   await client.close();
    return result.password;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const register = async (user) => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const users = database.collection("users");
    const result = await users.insertOne({fullName: user.fullName,  email: user.email, password: user.password, phone: user.phone, address: user.address});
 //   await client.close();
    return 'User added successfully';
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const update = async (user) => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const users = database.collection("users");
    const {name, email, password, phone, address} = user;
    if(name) await users.updateOne({email: user.email}, {"$set": {fullName: user.name}});
    if(email) await users.updateOne({email: user.email}, {"$set":{email: user.email}});
    if(password) await users.updateOne({email: user.email}, {"$set":{password: user.password}});
    if(phone) await users.updateOne({email: user.email}, {"$set":{phone: user.phone}});
    if(address) await users.updateOne({email: user.email}, {"$set":{address: user.address}});
  //  await client.close();
    return 'User updated successfully';
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const profile = async (user) => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const users = database.collection("users");
    const {email} = user;
    const result = await users.findOne({email: email});
//  await client.close();
    return result;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}


const placeOrder = async (order) => {
  try {
   // await client.connect();
    const database = client.db("axion");
    const orders = database.collection("orders");
    await orders.insertOne({orderID: order.orderID,  email: order.email, products: order.products, address: order.address, arrival: order.arrival, totalCost: order.totalCost});
  //  await client.close();
    return "Order added successfully";
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const getOrders = async (email) => {
  try {
   // await client.connect();
    const database = client.db("axion");
    const orders = database.collection("orders");
    const result = await orders.find({email: email}).toArray();
  //  await client.close();
    return result;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const getOrder = async (orderID) => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const orders = database.collection("orders");
    const result = await orders.find({order: orderID});
  //  await client.close();
    return result;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const getProducts = async () => {
  try {
  //  await client.connect();
    const database = client.db("axion");
    const products = database.collection("products");
    const result = await products.find({}).toArray();
  //  await client.close();
    return result;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}

const search = async (user) => {
  try {
 //   await client.connect();
    const database = client.db("axion");
    const users = database.collection("users");
    const result = await users.findOne({email: user.email});
    if (result === null){
 //     await client.close();
      return false;
    }
 //   await client.close();
    return result.email;
  }
  catch(error){
    console.log(error)
    return {error: error.message}
  }    
}


module.exports = {login, register, search, placeOrder, getOrder, getOrders, getProducts, update, profile, client}