const mongoose = require('mongoose');

const medicalPrescriptionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    diagnosis: { type: String },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    medicines: [{
        name: { type: String, required: true },
        type: { type: String }, // 'Tablet', 'Syrup'
        dosage: { type: String }, // '1-0-1'
        timing: { type: String }, // 'After meals'
        duration: { type: String } // '5 days'
    }],
    notes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalPrescription', medicalPrescriptionSchema);
