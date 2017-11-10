const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

// Todo.remove({}).then((result) => {
//     console.log(result);
// }, (err) => {
//     console.log(err);
// });


var id = '5a05b00c47b28f39207e3e6c'

Todo.findOneAndRemove({_id: id}).then((deletedDoc) => {
    console.log(deletedDoc);
}, (err) => {
    console.log(err);
});


Todo.findByIdAndRemove(id).then((deletedDoc) => {
    console.log(deletedDoc);
}, (err) => {
    console.log(err);
});