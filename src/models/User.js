const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    email: { type: String, unique: true },
    image: { type: String },
    phone: { type: String },
    gender: { type: String },
    age: { type: Number },
    dob: { type: String },
    address: { type: String },
    bio: { type: String },
    condition: { type: String },
    // Patient specific fields
    height: { type: String },
    weight: { type: String },
    bloodGroup: { type: String },
    emergencyContact: { type: String },
    emergencyName: { type: String },
    // Doctor specific fields
    specialization: { type: String },
    qualification: { type: String },
    consultationFee: { type: String },
    registrationNumber: { type: String },
    languages: { type: String },
    rating: { type: Number },
    reviews: { type: Number },
    experience: { type: String },
    totalPatients: { type: Number, default: 0 },
    hospital: { type: String },
    isAvailable: { type: Boolean, default: true }, // Added for Doctor Availability
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
