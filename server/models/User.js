const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
      },
      role: {
        type: String,
        required: true,
        enum: ['Admin', 'User'], // Role can be either 'Admin' or 'User'
      },
 email: { type: String, unique: true, required: true },
 password: { type: String, required: true },
 });
module.exports = mongoose.model('User', userSchema);