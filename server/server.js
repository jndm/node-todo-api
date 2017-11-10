const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose.js');
const {Todo} = require('./models/todo.js');
const {User} = require('./models/user.js');

var app = express();

app.use(bodyParser.json());

// POST /todos
// Add new todo
app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.status(201).send(doc);
    }, (err) => {
        res.status(400).send(err);
    });
});

// GET /todos
// Returns all todos
app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({status: 'OK', todos});
    }, (err) => { 
        res.status(400).send(err);
    });
});

// GET /todos/:id
// Return todo with given ID
app.get('/todos/:id', (req, res) => {

    var id = req.params.id;

    if(!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            err: {
                message: 'Given ID is not valid.'
            }
        });
    }

    Todo.findById(req.params.id).then((todo) => {       
        if(!todo) {
            return res.status(404).send({
                status: 'NOT_FOUND', 
                err: {
                    message: `Could not find todo with id: ${id}`
                }
            });
        }

        res.send({status: 'OK', todo});
    }, (err) => {
        res.status(400).send({status: 'ERROR', err});
    });
});

// DELETE /todos/:id
// Deletes todo with given ID
app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    
    if(!ObjectID.isValid(id)) {
        return res.status(400).send({
            status: 'ERROR',
            err: {
                message: 'Given ID is not valid.'
            }
        });
    }

    Todo.findByIdAndRemove(id).then((deletedTodo) => {
        if(!deletedTodo) {
            return res.status(404).send({
                status: 'NOT_FOUND', 
                err: {
                    message: `Could not find todo with id: ${id}`
                }
            }); 
        }

        res.send({status: 'OK', deletedTodo});
    }, (err) => {
        res.status(400).send({status: 'ERROR', err});
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = {app};