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

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var user1 = new User(users[0]).save();
        var user2 = new User(users[1]).save();

        Promise.all([user1, user2])
            .then(() => { done(); })
            .catch((e) => done(e));
    }).catch((e) => {
        done(e);
    });
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

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }, (err) => {
        console.log('Could not clear todos before testing.', err);
    })
        .then(() => {
            done();
        }, (err) => {
            console.log('Unable to seed todos before testing.', err);
        });
};

module.exports = { todos, users, populateTodos, populateUsers }

