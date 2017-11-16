const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true}, function (err) {
    if(err) {
        console.log('Failed to connect MongoDB');
    }
});
console.log('CONNECTED TO: ' + process.env.MONGODB_URI);


module.exports = {mongoose};