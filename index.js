const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const port = process.env.location || 5000;
const cors = require('cors');
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.li11u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const sedanCollection = client.db("sedan_mela").collection("ourSedans");
        const testimonialCollection = client.db("sedan_mela").collection("testimonials");
        const userCollection = client.db("sedan_mela").collection("users");
        app.get("/sedans", async (req, res) => {
            const sedans = await sedanCollection.find({}).toArray();
            res.json(sedans);
        })
        app.get("/testimonials", async (req, res) => {
            const testimonials = await testimonialCollection.find({}).toArray();
            res.json(testimonials);
        })
        app.post("/users", async (req, res) => {

            const newUser = await userCollection.insertOne(req.body);
            res.json(newUser);
        })
        app.put("/users", async (req, res) => {
            const filter = { email: req.body.email };
            const options = { upsert: true }
            const user = { $set: req.body };
            const result = await userCollection.updateOne(filter, user, options);
            res.json(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    console.log("backend is working fine")
    res.json("Backend is working");
})
app.listen(port, () => {
    console.log("Listening to port ", port);
})