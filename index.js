const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRATE_KEY);
const app = express();
const port = process.env.PORT || 5000;
const jwt = require("jsonwebtoken");

/** middle ware */
app.use(cors());
app.use(express.json());

/** middleware */
app.use(cors());
app.use(express());
//
/** jwt token verigication */
const verifyJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("Unatohorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.secrateToken, (err, decoded) => {
    if (err) {
      return res.status(403).send("Forbidden access");
    }
    req.decoded = decoded;
    next();
  });
};

/** database connection (mongodb) */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mflju.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/** API OPERATION */
const run = async () => {
  try {
    /** data collection */
    await client.connect();
    const productCollection = client
      .db("manufactuer")
      .collection("allproducts");
    const userCollection = client.db("manufactuer").collection("user");
    const orderCollection = client.db("manufactuer").collection("orders");
    const reviewCollection = client.db("manufactuer").collection("review");
    const paymentCollection = client.db("manufactuer").collection("payments");

    /**get all products */
    app.get("/products", verifyJwt, async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    /** post products */
    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productCollection.insertOne(products);
      res.send(result);
    });

    /** get product by id */
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    /**get order */
    app.get("/order", verifyJwt, async (req, res) => {
      const query = {};
      const cursor = orderCollection.find(query);
      const order = await cursor.toArray();
      res.send(order);
    });

    /** get order using id */
    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const order = await orderCollection.findOne(query);
      res.send(order);
    });

    /** add order */
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    /** delete products by id */
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    /** post review  */
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    /** get review */
    app.get("/review", verifyJwt, async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    /** user insert using put method */
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email };
      const option = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, option);
      const token = jwt.sign({ email }, process.env.secrateToken, {
        expiresIn: "1d",
      });
      res.send({ result, token });
    });

    /** get all user */
    app.get("/user", verifyJwt, async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const user = await cursor.toArray();
      res.send(user);
    });

    /** verify admin */
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    /** payment informtion update */
    app.patch("/order/:id", async (req, res) => {
      const id = req.params;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          paid: true,
          trxid: payment.trxid,
        },
      };
      const result = await paymentCollection.insertOne(payment);
      const updateBooking = await orderCollection.updateOne(filter, updateDoc);
      res.send(updateBooking);
    });

    /** make an user admin */
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    /** payment itent api */
    app.post("/create-payment-intent", async (req, res) => {
      const { orderPrice } = req.body;
      const amount = orderPrice * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });
  } finally {
    //nothing to be happen here
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("server e mutamuti vab ayce 🤠");
});

app.listen(port, () => {
  console.log(port, "port running");
});
