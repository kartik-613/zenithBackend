const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // Keeping as string "Dec 15, 2025" for simplicity consistent with frontend
    time: { type: String, required: true },
    type: { type: String, required: true }, // 'Regular Checkup', 'Fever', etc.
    mode: { type: String, enum: ['in-person', 'online'], default: 'in-person' },
    status: { type: String, enum: ['upcoming', 'completed', 'cancelled', 'today'], default: 'upcoming' },
    duration: { type: String }, // '30 min'
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
appointmentSchema.index({ patientId: 1 });
appointmentSchema.index({ doctorId: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ doctorId: 1, status: 1 }); // Compond for dashboard queries

module.exports = mongoose.model('Appointment', appointmentSchema);
