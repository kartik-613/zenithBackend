const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if uploaded by doc
    name: { type: String, required: true }, // "Chest X-Ray"
    type: { type: String, required: true }, // "X-Ray", "Lab Report", "Prescription"
    size: { type: String }, // "2.4 MB"
    date: { type: String }, // "Nov 15, 2025" - consistent format
    fileUrl: { type: String }, // URL to file
    extension: { type: String }, // "JPG", "PDF"
    color: { type: String }, // UI color helper
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
