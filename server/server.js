require('./config/config.js');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose } = require('./db/mongoose.js');
const { Todo } = require('./models/todo.js');
const { User } = require('./models/user.js');
const { authenticate } = require('./middleware/authenticate.js');

var app = express();

app.use(bodyParser.json());

// POST /todos
// Add new todo
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        creator: req.user._id
    });

    todo.save().then((doc) => {
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /todos
// Returns todos that belongs to logged in user
app.get('/todos', authenticate, (req, res) => {
    Todo.find({creator: req.user._id}).then((todos) => {
        res.send({ status: 'OK', todos });
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /todos/:id
// Return todo with given ID
app.get('/todos/:id', authenticate, (req, res) => {

    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            err: {
                message: 'Given ID is not valid.'
            }
        });
    }

    Todo.findOne({
        _id: req.params.id,
        creator: req.user._id
    })
    .then((todo) => {
        if (!todo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                err: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', todo });
    }, (err) => {
        res.status(400).send({ status: 'ERROR', err });
    });
});

// DELETE /todos/:id
// Deletes todo with given ID
app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            err: {
                message: 'Given ID is not valid.'
            }
        });
    }

    Todo.findOneAndRemove({
        _id: id, 
        creator: req.user._id
    }).then((deletedTodo) => {
        if (!deletedTodo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                err: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', deletedTodo });
    }, (err) => {
        res.status(400).send({ status: 'ERROR', err });
    });
});

// PATCH /todos/:id
// Updates todo with given ID
app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            err: {
                message: 'Given ID is not valid.'
            }
        });
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = Date.now();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id: id, 
        creator: req.user._id 
    }, { $set: body }, { new: true }).then((todo) => {
        if (!todo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                err: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', todo });
    }, (err) => {
        res.status(400).send({ status: 'ERROR', err });
    });
});

// POST /users
// Adds user
app.post('/users', (req, res) => {
    var userData = _.pick(req.body, ['email', 'password']);

    var user = new User(userData);

    user.save(user).then(() => {
        return user.generateAuthToken();
    })
        .then((token) => {
            res.header('x-auth', token).status(201).send(user);
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});

// GET /users/me
// Gets logged in user information
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login
// Login route
app.post('/users/login', (req, res) => {
    var userData = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(userData.email, userData.password)
        .then((user) => {
            user.generateAuthToken().then((token) => {
                res.header('x-auth', token).send(user);
            });
        }).catch((err) => {
            res.status(400).send();
        });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, (err) => {
        res.status(400).send(err);
    });
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };