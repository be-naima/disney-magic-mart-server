const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 7000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.un7bp9y.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    const toysCollection = client.db('DisneyMagicMart').collection('toys');
    const feedbacksCollection = client.db('DisneyMagicMart').collection('feedbacks');
    app.get('/toys', async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { emai: req.query.email };
        }
    
        const sortOrder = req.query?.sortOrder || '';
    
        let cursor = toysCollection.find(query);
    
        if (sortOrder === 'asc') {
          cursor = cursor.sort({ price: 1 }); // Sort in ascending order by price
        } else if (sortOrder === 'desc') {
          cursor = cursor.sort({ price: -1 }); // Sort in descending order by price
        }
        
        cursor = cursor.limit(20);
    
        const result = await cursor.toArray();
        res.send(result);
      } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
    });
    
  app.get('/toys/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    
    const result = await toysCollection.findOne(query);
    res.send(result);
})
    app.get('/feedbacks', async (req, res) => {
      
      const cursor = feedbacksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })
  
  


app.post('/toys',async(req, res)=>{
   const product = req.body;
   const result = await toysCollection.insertOne(product)
   res.send(result);
})
app.post('/feedbacks',async(req, res)=>{
   const addFeedback = req.body;
   const result = await feedbacksCollection.insertOne(addFeedback)
   res.send(result);
})
app.put('/toys/:id', async(req, res) => {
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options = { upsert: true };
  const updatedToy = req.body;

  const Toy = {
      $set: {
          price: updatedToy.price, 
          quantity: updatedToy.quantity, 
          description: updatedToy.description, 
          
      }
  }

  const result = await toysCollection.updateOne(filter, Toy, options);
  res.send(result);
})


app.delete('/toys/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) }
  const result = await toysCollection.deleteOne(query);
  res.send(result);
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res)=>{
    res.send('Welcome to Disney Magic Mart')
})

app.listen(port, () => {
    console.log(` Server is running on port ${port}`)
})