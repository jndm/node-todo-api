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

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('5a044ef1ef25551bc0420ac1')
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }, {
    //     returnOriginal:false    // should old object be returned or updated one
    // })
    // .then((result) => {
    //     console.log(result);
    // }, (err) => {
    //     console.log('Could not update.');
    // });

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('5a045043a389c93c083a7dac')
    }, {
        $set: {
            name: 'Jari',
            
        },
        $inc: {
            age: -2
        }
    }, {
        returnOriginal:false    // should old object be returned or updated one
    })
    .then((result) => {
        console.log(result);
    }, (err) => {
        console.log('Could not update.');
    });


    db.close();
});