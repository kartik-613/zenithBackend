const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Vital = require('../models/Vital');
const Document = require('../models/Document');
const MedicalPrescription = require('../models/MedicalPrescription');

// @desc    Get Patient Dashboard Data
// @route   GET /api/patient/dashboard/:id
exports.getPatientDashboard = async (req, res) => {
    try {
        const patient = await User.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const upcoming = await Appointment.findOne({ patientId: req.params.id, status: 'upcoming' })
            .populate('doctorId', 'name specialization rating reviews image')
            .sort({ date: 1, time: 1 }); // Next scheduled

        res.json({
            patientName: patient.name,
            patientImage: patient.image,
            upcomingAppointment: upcoming ? {
                id: upcoming._id,
                doctorName: upcoming.doctorId.name,
                specialty: upcoming.doctorId.specialization,
                rating: upcoming.doctorId.rating,
                reviews: upcoming.doctorId.reviews,
                doctorImage: upcoming.doctorId.image,
                date: upcoming.date,
                time: upcoming.time,
                type: upcoming.type
            } : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Patient Appointments
// @route   GET /api/patient/appointments/:id
exports.getPatientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.id })
            .populate('doctorId', 'name specialization rating image')
            .sort({ _id: -1 });

        const formatted = appointments.map(a => ({
            id: a._id,
            doctorName: a.doctorId.name,
            specialty: a.doctorId.specialization,
            doctorImage: a.doctorId.image,
            rating: a.doctorId.rating || 4.9,
            date: a.date,
            time: a.time,
            status: a.status,
            type: a.mode, // matching frontend expectations for 'type' icon (video/in-person)
            fee: 800 // Mock base fee or pull from doctor model if available
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Book Appointment
// @route   POST /api/patient/book
exports.bookAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time, type, mode } = req.body;
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            type,
            mode,
            status: 'upcoming'
        });

        // Notify Doctor
        await Notification.create({
            userId: doctorId,
            type: 'appointment',
            title: 'New Booking',
            message: 'You have a new appointment request.',
            time: 'Just now', // ideally computed
            unread: true
        });

        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payments
// @route   GET /api/patient/payments/:id
exports.getPatientPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.params.id }) // or relatedUserId if patient paid
            .populate('relatedUserId', 'name') // Doctor name
            .sort({ createdAt: -1 });

        // Note: In seed, patient pays doctor. So userId=doctor, relatedUserId=patient.
        // Or if logic is "userId is who the record belongs to", we need to check both fields?
        // Let's assume for patient view, we look for payments where relatedUserId == patientId (if doctor record) OR userId == patientId

        // However, looking at seed.js:
        // Payment.create({ userId: doctor._id, relatedUserId: patient1._id ... }) 
        // This implies the record belongs to the doctor's ledger.
        // So for patient to see it, we search by relatedUserId.

        let relatedPayments = await Payment.find({ relatedUserId: req.params.id }).populate('userId', 'name');

        const formatted = relatedPayments.map(p => ({
            id: p._id,
            doctorName: p.userId ? p.userId.name : 'Unknown Doctor',
            amount: p.amount,
            date: p.date,
            time: p.time,
            mode: p.mode,
            status: p.status,
            type: p.type || 'Consultation'
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Profile
// @route   GET /api/patient/profile/:id
exports.getPatientProfile = async (req, res) => {
    try {
        const patient = await User.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Profile
// @route   PUT /api/patient/profile/:id
exports.updatePatientProfile = async (req, res) => {
    try {
        const { name, email, phone, gender, age, address, bio, image } = req.body;
        const patient = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, gender, age, address, bio, image },
            { new: true, runValidators: true }
        );
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Notifications
// @route   GET /api/patient/notifications/:id
exports.getPatientNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark Notification Read
// @route   PUT /api/patient/notifications/:id/read
exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { unread: false },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Notification
// @route   DELETE /api/patient/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark All Read
// @route   PUT /api/patient/notifications/user/:id/read-all
exports.markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.params.id }, { unread: false });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Vitals
// @route   GET /api/patient/vitals/:id
exports.getPatientVitals = async (req, res) => {
    try {
        const vitals = await Vital.find({ patientId: req.params.id }).sort({ createdAt: -1 });
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add Vital
// @route   POST /api/patient/vitals/:id
exports.addPatientVital = async (req, res) => {
    try {
        const { label, value, unit, status, trend, history } = req.body;
        const vital = await Vital.create({
            patientId: req.params.id,
            label,
            value,
            unit,
            status,
            trend,
            history
        });
        res.status(201).json(vital);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- NEW APIS ---

// @desc    Get Patient Prescriptions
// @route   GET /api/patient/prescriptions/:id
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await MedicalPrescription.find({ patientId: req.params.id })
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        const formatted = prescriptions.map(p => ({
            id: p._id,
            date: p.date,
            doctor: p.doctorId.name,
            diagnosis: p.diagnosis,
            medicines: p.medicines.length,
            status: p.status,
            details: p.medicines // Including details for View
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Patient Documents (Health Records)
// @route   GET /api/patient/documents/:id
exports.getPatientDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ patientId: req.params.id })
            .populate('doctorId', 'name')
            .sort({ createdAt: -1 });

        const formatted = documents.map(d => {
            // Helper to generate gradients based on type
            let colors = ['#3B82F6', '#9333EA']; // Default Blue/Purple
            if (d.type === 'Lab Report') colors = ['#EF4444', '#DB2777']; // Red/Pink
            if (d.type === 'Prescription') colors = ['#0A6659', '#0D8B7A']; // Teal

            return {
                id: d._id,
                title: d.name,
                type: d.type,
                doctorName: d.doctorId ? d.doctorId.name : 'Unknown Doctor',
                date: d.date,
                fileSize: d.size,
                color: colors
            };
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add New Patient (Register)
// @route   POST /api/patient/register
exports.registerPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, email, condition } = req.body;
        // Basic user creation
        const patient = await User.create({
            name,
            role: 'patient',
            email, // Optional check if needed
            image: 'https://images.unsplash.com/photo-1755189118414-14c8dacdb082?w=100&h=100&fit=crop' // Default
        });

        // Could also add initial "New patient" appointment request or record here

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
