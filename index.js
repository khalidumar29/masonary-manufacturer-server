const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

/** middleware */
app.use(cors());
app.use(express());

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

    /**get all products */
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    /** get product by id */
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
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
