const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const port = process.env.location || 5000;
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
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
        const purchasedSedanCollection = client.db("sedan_mela").collection("purchasedSedan");


        app.get("/sedans", async (req, res) => {
            const sedans = await sedanCollection.find({}).toArray();
            res.json(sedans);
        })
        app.get("/testimonials", async (req, res) => {
            const testimonials = await testimonialCollection.find({}).toArray();
            res.json(testimonials);
        })
        app.get("/sedan/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await sedanCollection.findOne(query);
            res.json(result);
        })
        app.get("/purchasedSedan/All", async (req, res) => {
            const result = await purchasedSedanCollection.find({}).toArray();
            res.json(result);
        })
        app.get("/purchasedSedan", async (req, res) => {

            const email = req.query.email;
            const query = { email: email };
            const result = await purchasedSedanCollection.find(query).toArray();
            res.json(result);
        })
        app.get("/users", async (req, res) => {
            const allUsers = await userCollection.find({}).toArray();
            res.json(allUsers);
        })
        app.get("/users/single", async (req, res) => {
            console.log(req.query.email);
            const particularUser = await userCollection.findOne({ email: req.query.email });
            res.json(particularUser);
        })
        app.get("/users/admin", async (req, res) => {
            const email = req.query.email;
            const particularUser = await userCollection.findOne({ email: email });


            let isAdmin = false;
            if (particularUser?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        app.put("/users", async (req, res) => {
            const email = req.query.email;
            const filter = { email: email };
            const options = { upsert: false };
            const updateDoc = { $set: { role: "admin" } };
            const newAdmin = await userCollection.updateOne(filter, updateDoc, options);
            res.json(newAdmin);

        })
        app.post("/users", async (req, res) => {

            const newUser = await userCollection.insertOne(req.body);
            res.json(newUser);
        })
        app.post("/sedans", async (req, res) => {
            const newSedan = await sedanCollection.insertOne(req.body);
            res.json(newSedan);
        })

        app.post('/purchasedSedan', async (req, res) => {
            const body = req.body;
            const result = await purchasedSedanCollection.insertOne(body);
            res.json(result);
        })
        app.post("/testimonials", async (req, res) => {
            const testimonial = await testimonialCollection.insertOne(req.body);
            res.json(testimonial);
        })
        app.put("/users", async (req, res) => {
            const filter = { email: req.body.email };
            const options = { upsert: true }
            const user = { $set: req.body };
            const result = await userCollection.updateOne(filter, user, options);
            res.json(result);
        })
        app.put("/purchasedSedan/All/:id", async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const updateDoc = { $set: { status: "shipped" } };
            const options = { upsert: false };
            const updatedStatus = await purchasedSedanCollection.updateOne(query, updateDoc, options);
            res.json(updatedStatus);
        })
        app.delete("/purchasedSedan/All/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deletedOrder = await purchasedSedanCollection.deleteOne(query);
            res.json(deletedOrder);
        })
        app.delete("/sedans/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deletedSedan = await sedanCollection.deleteOne(query);
            res.json(deletedSedan);
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