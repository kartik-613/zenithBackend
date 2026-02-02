const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Doctor or Patient receiving/paying
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The other party
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    time: { type: String },
    mode: { type: String, enum: ['UPI', 'Cash', 'Card'], default: 'UPI' },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    type: { type: String }, // 'Consultation', 'Follow-up'
    category: { type: String }, // 'today', 'week', 'month' - helper for filtering or just use date
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
