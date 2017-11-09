// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);
console.log(obj.getTimestamp());

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    
    if(err) {
        console.log('Unable to connect MongoDB server.');
        return;
    }

    console.log('Connected to MongoDB server');

    // db.collection('Todos').insertOne({
    //     text: 'something to do', 
    //     completed: false
    // }, (err, result) => {
    //     if(err) {
    //         console.log('Unable to insert todo.');
    //         return;
    //     }
        
    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // db.collection('Users').insertOne({
    //     name: 'Joonas',
    //     age: 26,
    //     location: 'Tampere'
    // }, (err, result) => {
    //     if(err) {
    //         console.log('Unable to insert user.');
    //         return;
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    db.close();
});