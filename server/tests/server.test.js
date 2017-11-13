const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server.js');
const { Todo } = require('./../models/todo.js');
const { User } = require('./../models/user.js');
const { todos, users, populateTodos, populateUsers } = require('./seed/seed.js');

beforeEach(populateUsers);
beforeEach(populateTodos);

//
// POST /todos/:id
describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
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
                if (err) {
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
                if (err) {
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

//
// PATCH /todos/:id
describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var updatedText = 'updated text 1';

        request(app)
            .patch(`/todos/${todos[0]._id}`)
            .send({
                text: updatedText,
                completed: true
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(todos[0]._id).then((todo) => {
                    expect(todo.text).toBe(updatedText);
                    expect(todo.completed).toBe(true);
                    expect(typeof (todo.completedAt)).toBe('object');
                    done();
                }, (err) => {
                    console.log('Error at fetching todos.')
                })
                    .catch((e) => { done(e) });
            });
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var updatedText = 'not yet completed';
        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .send({
                text: updatedText,
                completed: false
            })
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(todos[1]._id).then((todo) => {
                    expect(todo.text).toBe(updatedText);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBe(null);
                    done();
                }, (err) => {
                    console.log('Error at fetching todos.')
                })
                    .catch((e) => { done(e) });
            });
    });
});

//
// GET /users/me
describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

//
// POST /users/
describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'c@example.com';
        var password = 'userThreePass';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(201)
            .expect((res) => {
                expect(typeof(res.headers['x-auth'])).toBeTruthy();
                expect(typeof(res.body._id)).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if(err) {
                    return done(err);
                }
                
                User.findOne({email}).then((user) => {
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                })
                .catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'dATexample.com';
        var password = 'userInvalidPass';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email is in use', (done) => {
        var id = new ObjectID();
        var password = 'userTestingPass';

        request(app)
        .post('/users')
        .send({_id: id, email: users[0].email, password})
        .expect(400)
        .end((err) => {
            if(err) {
                return done(err);
            }
            
            User.findOne({id}).then((user) => {
                expect(user).toBeFalsy();
                done();
            })
            .catch((e) => done(e));
        });
    });
});