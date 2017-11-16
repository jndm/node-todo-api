const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo.js');
const { User } = require('./../../models/user.js');

var user1ID = new ObjectID();
var user2ID = new ObjectID();

const users = [{
    _id: user1ID,
    email: 'a@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: user1ID, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
}, {
    _id: user2ID,
    email: 'b@example.com',
    password: 'userTwoPass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({ _id: user2ID, access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
}];

const populateUsers = async () => {
    await User.remove({});
    var user1 = await new User(users[0]).save();
    var user2 = await new User(users[1]).save();
};

var completedTimeStamp = Date.now();

var todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo',
        creator: user1ID
    },
    {
        _id: new ObjectID(), text: 'Second test todo',
        completed: true,
        completedAt: completedTimeStamp,
        creator: user2ID
    }
]

const populateTodos = async () => {
    await Todo.remove({});
    await Todo.insertMany(todos);
};

module.exports = { todos, users, populateTodos, populateUsers }

