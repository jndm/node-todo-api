# Node-todo-api

This is a REST API for todo webclient. This project was created as part of Udemy course [The Complete NodeJS Developer Course (2nd edition)](https://www.udemy.com/the-complete-nodejs-developer-course-2) by Andrew Mead and Rob Percival.

Project includes 2 versions of this API. "Master"-branch is created using Node 8+ async and await calls and "non-async-version"-branch is (as naming suggest) created without those tools.

# Installation

Download project and then using npm run:
```
npm install
```

Create config.json file to /server/config/ and put inside (fill fields with values you want to use):
```
{
    "development": {
        "PORT": 3000,
        "MONGODB_URI": "mongodb://localhost:27017/TodoApp",
        "JWT_SECRET": "abc123"
    }
}
``` 

To run tests also add test environment configurations to config.json:
```
"test": {
        "PORT": 3000,
        "MONGODB_URI": "mongodb://localhost:27017/TodoAppTest",
        "JWT_SECRET": "abc123"
    }
```

Tests can be run with commands:
```
npm test -- run tests once
npm run test-watch -- starts nodemon and runs test everytime server is restarted
```


#### Database handling
Project uses MongoDB as database and mongoose to help with handling database calls. To use this project you must run your own MongoDB locally.

# API description
Todo

