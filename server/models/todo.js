const mongoose = require('mongoose');

var SchemaTypes = mongoose.Schema.Types;

var Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required: true,
        minLength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: SchemaTypes.Date,
        default: null
    }
});

module.exports = { Todo };