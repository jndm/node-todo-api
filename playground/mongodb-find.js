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

    // db.collection('Todos').find({$or: [{completed: true},{completed: false}]}).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, null, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos.');
    // });
    
    // db.collection('Todos').find().count().then((count) => {
    //     console.log('Todos count: ' + count);
    // }, (err) => {
    //     console.log('Unable to fetch todos.');
    // });

    db.collection('Users').find({
        $or: [
            {name: 'Joonas'},
            {name: 'Seppo'}
        ]
    }).toArray()
    .then((docs) => {
        console.log('Users');
        console.log(JSON.stringify(docs, null, 2));
    }, (err) => {
        console.log('Unable to fetch users.');
    });

    db.close();
});