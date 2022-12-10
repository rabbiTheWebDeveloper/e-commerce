const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// Iv0O1ecUkMwa5iJP

const uri = 'mongodb+srv://safrian:Y0EWTkdW0JWMgaEG@cluster0.1rljf5u.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("argonOnlineShop");
    const productCollection = database.collection("products");
    const purchasedCollection = database.collection("purchased");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");
    const userActionsProducts = database.collection("user_actions");

    //****************PRODUCTS****************//
    //get all products_____________
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });
    // Create a new product_____________
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    // search by ID
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {key: id };
      const result = await productCollection.findOne(query);
      res.send(result);
    });
    // Manage Products______
    app.delete("/manageProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.deleteOne(query);
      res.send(product);
    });

    // **********************************Here All cart Function
    // Get all cart items_____________
    app.get("/cartCollection", async (req, res) => {
      const cursor = userActionsProducts.find({ status: "cart" });
      const carts = await cursor.toArray();
      res.send(carts);
    });
    // Post to cart______
    app.post("/cart", async (req, res) => {
      const cursor = req.body;
      const result = await userActionsProducts.insertOne(cursor);
      res.json(result);
      console.log(result);
    });
    // Manage by delete All User and Admin action items Items
    app.delete("/cartDel/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await userActionsProducts.deleteOne(query);
      res.send(product);
    });
    // Manage by OrderConfirm Cart Items
    app.put("/cartOrder/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const product = await userActionsProducts.updateOne(query, {
          $set: { status: "pending" },
        });
        res.send(product);
    });
    // Get all Order items_____________
    app.get("/orderCollections", async (req, res) => {
      const cursor = userActionsProducts.find({ status: "pending" });
      const carts = await cursor.toArray();
      res.send(carts);
    });
    // **********************************Here All purchased Function
    //find all the order
    app.get("/purchased/allorder", async (req, res) => {
      const cursor = purchasedCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    });
    //find order using email
    app.get("/purchased", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = purchasedCollection.find(query);
      const buy = await cursor.toArray();
      res.json(buy);
    });

    //cancel order
    app.delete("/purchased/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await purchasedCollection.deleteOne(query);
      res.json(result);
    });
    //set user in database
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // get user from database
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.json(result);
    });
    //set user in database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    //make admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    app.get("/user/admin", async (req, res) => {
      const cursor = usersCollection.find({ role: "admin" });
      const users = await cursor.toArray();
      res.send(users);
    });

    app.delete("/cartCollection", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userActionsProducts.deleteOne(query);
      res.json(result);
    });
    //find admin role
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    //confirmed order
    app.put("/purchased/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await purchasedCollection.updateOne(query, updateDoc);
      res.json(result);
    });
    //add product
    app.post("/services", async (req, res) => {
      const cursor = req.body;
      const result = await serviceCollection.insertOne(cursor);
      res.json(result);
    });
    //set review
    app.post("/reviews", async (req, res) => {
      const cursor = req.body;
      const result = await reviewsCollection.insertOne(cursor);
      res.json(result);
    });
    //find all the order
    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //cancel review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server run");
});
app.listen(port, () => {
  console.log("Server run:", port);
});
