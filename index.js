const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

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
