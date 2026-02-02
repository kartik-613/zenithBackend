const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true }, // 'Blood Pressure', 'Heart Rate'
    value: { type: String, required: true },
    unit: { type: String, required: true },
    status: { type: String, default: 'normal' },
    trend: { type: String, default: 'stable' },
    history: [{ type: String }], // Array of previous values
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vital', vitalSchema);
