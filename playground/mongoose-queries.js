const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/user.js');

// var id = '5a059171f8a5e2236033437a';

// if(!ObjectID.isValid(id)) {
//     console.log('ID not valid.');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// }, (err) => {
//     console.log('Unable to get todo');
// });

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// }, (err) => {
//     console.log('Unable to get todo');
// });

// Todo.findById(id)
// .then((todo) => {
//     if(!todo) {
//         console.log(`Todo with ID ${id} not found.`);
//         return;
//     }

//     console.log('Todo by ID', todo);

// }).catch((e) => {
//     console.log(e)
// });

var id = '5a0556b45d846e19c41d00e4';

User.findById(id).then((user) => {
    if(!user) {
        console.log(`User not found with ID ${id}`);
        return;
    }

    console.log('User by ID\n', JSON.stringify(user, undefined, 2));
}, (err) => {
    console.log(err);
});