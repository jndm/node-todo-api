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
app.post('/todos', authenticate, async (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        creator: req.user._id
    });
    
    try {
        const doc = await todo.save();
        res.status(201).send(doc);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /todos
// Returns todos that belongs to logged in user
app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({ creator: req.user._id });
        res.send({ status: 'OK', todos });
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /todos/:id
// Return todo with given ID
app.get('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            error: {
                message: 'Given ID is not valid.'
            }
        });
    }

    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            creator: req.user._id
        });

        if (!todo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                error: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', todo });
    } catch (error) {
        res.status(400).send({ status: 'ERROR', error });
    }
});

// DELETE /todos/:id
// Deletes todo with given ID
app.delete('/todos/:id', authenticate, async (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            error: {
                message: 'Given ID is not valid.'
            }
        });
    }

    try {
        const deletedTodo = await Todo.findOneAndRemove({
            _id: id,
            creator: req.user._id
        });

        if (!deletedTodo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                error: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', deletedTodo });
    } catch (error) {
        res.status(400).send({ status: 'ERROR', error });
    }
});

// PATCH /todos/:id
// Updates todo with given ID
app.patch('/todos/:id', authenticate, async (req, res) => {
    try {
        var id = req.params.id;
        var body = _.pick(req.body, ['text', 'completed']);

        if (!ObjectID.isValid(id)) {
            return res.status(400).send({
                status: 'ERROR',
                error: {
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

        const todo = await Todo.findOneAndUpdate({
            _id: id,
            creator: req.user._id
        }, { $set: body }, { new: true });

        if (!todo) {
            return res.status(404).send({
                status: 'NOT_FOUND',
                error: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({ status: 'OK', todo });
    } catch (error) {
        res.status(400).send({ status: 'ERROR', error });
    }
});

// POST /users
// Adds user
app.post('/users', async (req, res) => {
    try {
        const userData = _.pick(req.body, ['email', 'password']);
        const user = new User(userData);

        await user.save(user);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).status(201).send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /users/me
// Gets logged in user information
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST /users/login
// Login route
app.post('/users/login', async (req, res) => {
    try {
        const userData = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(userData.email, userData.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (error) {
        res.status(400).send();
    }
});

// DELETE /users/me/token
// Logout route (deletes users token)
app.delete('/users/me/token', authenticate, async (req, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (error) {
        res.status(400).send(error);
    }
});

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { app };