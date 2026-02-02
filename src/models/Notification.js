const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recipient
    type: { type: String, enum: ['appointment', 'patient', 'message', 'alert'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: String }, // '1 hour ago' - ideally calculate from createdAt but string for UI match
    unread: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
