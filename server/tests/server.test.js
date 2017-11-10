const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.js');
const {Todo} = require('./../models/todo.js');

var todos = [
    {_id: new ObjectID(), text: 'First test todo'}, 
    {_id: new ObjectID(), text: 'Second test todo'}
]

beforeEach((done) => {
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
});

//
// POST /todos/:id
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3);
                    expect(todos[2].text).toBe(text);
                    done();
                }, (err) => {
                    console.log('Error at fetching todos.')
                })
                .catch((e) => { done(e) });
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.text).toBe(undefined);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }, (err) => {
                    console.log('Error at fetching todos.')
                })
                .catch((e) => { done(e) });
            })
    });
});

//
// DELETE /todos
describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

//
// GET /todos/:id
describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return invalid id (400)', (done) => {
        request(app)
            .get('/todos/123')
            .expect(400)
            .expect((res) => {
                expect(res.body.status).toBe('ERROR');
            })
            .end(done);
    });

    it('should return not found (404)', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('NOT_FOUND');
            })
            .end(done);
    });
});

//
// DELETE /todos/:id
describe('DELETE /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .delete(`/todos/${todos[0]._id}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.status).toBe('OK');
                expect(res.body.deletedTodo._id).toBe(todos[0]._id.toHexString());
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                Todo.findById(todos[0]._id).then((todo) => {
                    expect(todo).toBe(null);
                    done();
                }).catch(done);
            }); 
    });

    it('should return invalid id (400)', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(400)
            .expect((res) => {
                expect(res.body.status).toBe('ERROR');
            })
            .end(done);
    });

    it('should return not found (404)', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID()}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('NOT_FOUND');
            })
            .end(done);
    });
});