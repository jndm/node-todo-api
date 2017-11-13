const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
console.log('CONNECTED TO: ' + process.env.MONGODB_URI);


module.exports = {mongoose};