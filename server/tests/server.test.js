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
            .set('x-auth', users[0].tokens[0].token)
            .send({ text })
            .expect(201)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todos = await Todo.find();
                    expect(todos.length).toBe(3);
                    expect(todos[2].text).toBe(text);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .expect((res) => {
                expect(res.body.text).toBe(undefined);
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todos = await Todo.find();
                    expect(todos.length).toBe(2);
                    done();
                } catch (error) {
                    done(error);
                }
            })
    });
});

//
// GET /todos
describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('NOT_FOUND');
            })
            .end(done);
    });

    it('should return invalid id (400)', (done) => {
        request(app)
            .get('/todos/123')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body.status).toBe('ERROR');
            })
            .end(done);
    });

    it('should return not found (404)', (done) => {
        request(app)
            .get(`/todos/${new ObjectID()}`)
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect((res) => {
                expect(res.body.status).toBe('OK');
                expect(res.body.deletedTodo._id).toBe(todos[0]._id.toHexString());
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }

                try {
                    var todo = await Todo.findById(todos[0]._id);
                    expect(todo).toBe(null);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should not delete todo doc created by other user', (done) => {
        request(app)
            .delete(`/todos/${todos[1]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .expect((res) => {
                expect(res.body.status).toBe('NOT_FOUND');
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todo = await Todo.findById(todos[1]._id);
                    expect(todo).toBeTruthy();
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should return invalid id (400)', (done) => {
        request(app)
            .delete('/todos/123')
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body.status).toBe('ERROR');
            })
            .end(done);
    });

    it('should return not found (404)', (done) => {
        request(app)
            .delete(`/todos/${new ObjectID()}`)
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text: updatedText,
                completed: true
            })
            .expect(200)
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todo = await Todo.findById(todos[0]._id);
                    expect(todo.text).toBe(updatedText);
                    expect(todo.completed).toBe(true);
                    expect(typeof (todo.completedAt)).toBe('object');
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should not update other users todo', (done) => {
        var updatedText = 'updated text 1';

        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text: updatedText,
                completed: false
            })
            .expect(404)
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todo = await Todo.findById(todos[1]._id);
                    expect(todo.text).toBe(todos[1].text);
                    expect(todo.completed).toBe(true);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var updatedText = 'not yet completed';
        request(app)
            .patch(`/todos/${todos[1]._id}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: updatedText,
                completed: false
            })
            .expect(200)
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }
                try {
                    var todo = await Todo.findById(todos[1]._id);
                    expect(todo.text).toBe(updatedText);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBe(null);
                    done();
                } catch (error) {
                    done(error);
                }
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
            .send({ email, password })
            .expect(201)
            .expect((res) => {
                expect(typeof (res.headers['x-auth'])).toBeTruthy();
                expect(typeof (res.body._id)).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end(async (err) => {
                if (err) {
                    return done(err);
                }
                try {
                    var user = await User.findOne({ email });
                    expect(user).toBeTruthy();
                    expect(user.password).not.toBe(password);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'dATexample.com';
        var password = 'userInvalidPass';

        request(app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
    });

    it('should not create user if email is in use', (done) => {
        var id = new ObjectID();
        var password = 'userTestingPass';

        request(app)
            .post('/users')
            .send({ _id: id, email: users[0].email, password })
            .expect(400)
            .end(async (err) => {
                if (err) {
                    return done(err);
                }

                try {
                    var user = await User.findOne({ id });
                    expect(user).toBeFalsy();
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }

                try {
                    var user = await User.findById(users[1]._id);
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: 'wrongPassword'
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-path']).toBeFalsy();
                expect(res.body).toEqual({});
            })
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }

                try {
                    var user = await User.findById(users[1]._id);
                    expect(user.tokens.length).toBe(1);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end(async (err, res) => {
                if (err) {
                    return done(err);
                }

                try {
                    var user = await User.findById(users[0]._id);
                    expect(user.tokens.length).toBe(0);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });
});