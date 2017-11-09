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

    // db.collection('Todos')
    //     .deleteMany({text: 'syö lounasta'})
    //     .then((result) => {
    //         console.log(result); // result is diipadaapa with info of deleted row count
    //     }, (err) => {
    //         console.log('Delete failed.')
    // });

    
    // db.collection('Todos')
    // .deleteOne({text: 'syö lounasta'})
    // .then((result) => {
    //     console.log(result);  // result is diipadaapa with info of deleted row count (1)
    // }, (err) => {
    //     console.log('Delete failed.')
    // });

    db.collection('Todos')
        .findOneAndDelete({text: 'syö lounasta'})
        .then((result) => {
            console.log(result); // Result is deleted row count (1) and deleted document-object
        }, (err) => {
            console.log('Delete failed.')
    });

    db.close();
});