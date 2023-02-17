const { ObjectID } = require('bson');
const express = require ('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const path = require("path");
const fs = require("fs");

// Cross-Origin Resource Sharing
const cors = require("cors");
app.use(cors());

app.use(express.json())
app.set('port',3000)
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    next();
})

//Connect to the MongoDB
let db;
MongoClient.connect('mongodb+srv://naadir:naadir123@cluster0.guegops.mongodb.net', (err, client) => {    
    db = client.db('app')
})

//Displaying the message for root path to show that API is working
app.get('/',(req,res,next)=>{
    res.send('Select a Collection, e.g., /collection/messages')
})

// GET the collection name
app.param('collectionName', (req,res,next,collectionName)=>{
    req.collection= db.collection(collectionName);
    return next();
})

// Retrive all the objects from Lesson collection
app.get('/collection/:collectionName',(req,res,next)=>{
    req.collection.find({}).toArray((e,results) => {
        if (e) return next(e)
        res.send(results)
    })
    console.log("Getting the Data from Lesson Collection")
})

//Retrive Images
app.use('/collection/:collectionName', (req, res, next) => {
    var filePath = path.join(__dirname, "static/images" , req.url);
    fs.stat(filePath, function(err, fileInfo){
        if(err){
            res.status(404);
            res.send("Image file not found!");
            return;
        }
        if(fileInfo.isFile()){
            res.sendFile(filePath);
            console.log("GET/" + req.url)
        }
        else next();
    });
});

// Add the Items to Orders Collection
app.post('/collection/:collectionName', (req, res, next) => {  
    req.collection.insertOne(req.body, (e, results) =>
    {
        if (e) return next(e)    
        res.send(results.ops)
    })
})

// If it is not a GET request, also servers a 404 error.
app.use(function(request, response) {response.status(404).send("Page not found!");});

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})