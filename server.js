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

// logger middleware which outputs all requests to the server
let logger = (req,res,next) => {
    let method = req.method;
    let url = req.url;
    let status = res.statusCode;
    let log = `${method}:${url} ${status}`;
    console.log(log);
    next();
  };
  
app.use(logger);

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

// Add the Items to Orders Collection
app.post('/collection/:collectionName', (req, res, next) => {  
    req.collection.insertOne(req.body, (e, results) =>
    {
        if (e) return next(e)    
        res.send(results ? {msg:'success'} : {msg:'error'})
        res.send(results.ops)
    })
})

//Return with objectID
const Objectid = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id' , (req, res, next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)} , (e,results) => {
        if (e) return next(e)
        res.send(results)
    })
})

//Update
app.put('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe:true, multi:false}, (e,results) => {
            if (e) return next(e)
            res.send((results = 1) ? {msg:'success'} : {msg:'error'})
        })
})

//Delete
app.delete('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)},
        (e,results) => {
            if (e) return next(e)
            res.send(results ? {msg:'success'} : {msg:'error'})
        })
})

// If it is not a GET request, also servers a 404 error.
app.use(function(request, response) {response.status(404).send("Page not found!");});

app.listen(3000, () => {
    console.log('Express.js server running at localhost:3000')
})