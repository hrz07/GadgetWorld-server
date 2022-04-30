const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        app.post('/items', async (req,res) => {
            const item = req.body;
            const result = await itemCollection.insertOne(item)
            res.send(result)
        })

        // get all item

        app.get('/items', async (req, res) => {
            const result = await itemCollection.find({}).toArray()
            res.send(result).status(200)
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