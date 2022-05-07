const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const PORT = 4000




app.use(cors())
app.use(express.json())

const uri = "mongodb+srv://dbUser:aInjbamqwHeHdGYI@cluster0.nwarn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {
        await client.connect();
        const itemCollection = client.db("gadget").collection("items");


        // post item
        app.post('/items', async (req, res) => {
            const item = req.body;
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo?.split(" ")
            const decoded = verifyToken(accessToken)
            if (email === decoded.email) {
                const result = await itemCollection.insertOne(item)
                res.send(result).status(200)
            } else {
                res.send({success : 'UnAuthorized Access'}).status(403)
            }

        })

        // get all item

        app.get('/items', async (req, res) => {
            const result = await itemCollection.find({}).toArray()
            res.send(result).status(200)
        })

        //get item by id

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await itemCollection.findOne(query)
            res.send(result);
        })

        // delete an item
        app.delete('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await itemCollection.deleteOne(query)
            res.send(result);

        })

        // get specific users item
        app.get('/item', async (req, res) => {
            const email = req.query.email;
            const tokenInfo = req.headers.authorization;
            const [email1, accessToken] = tokenInfo?.split(" ")
            const decoded = verifyToken(accessToken)

            const query = { supplierEmail: email }

            if (email1 === decoded.email) {
                const result = await itemCollection.find(query).toArray()
                res.send(result).status(200)
            } else {
                res.send({success : 'UnAuthorized Access'}).status(403)
            }
            
        })

        //update quantity
        app.patch('/item/:id', async (req, res) => {
            const id = req.params.id;
            const updatedQuantity = req.body.amount;

            const query = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedQuantity
                }
            };
            const result = await itemCollection.updateOne(query, updatedDoc, options);
            res.send(result);

        })

        // login jwt
        app.post('/login', async (req, res) => {
            const email = req.body;
            const token = jwt.sign(email, process.env.ACCESS_TOKEN)
            res.send({ token })
        })

    }
    finally {

    }
}

run().catch(console.dir);



// server run

app.listen(process.env.PORT || PORT, () => {
    console.log('server started');
})



function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, (err,decoded) => {
        if (err) {
            email = 'Invalid email'
        }
        if (decoded) {
            email = decoded
        }
    })
    return email;
}