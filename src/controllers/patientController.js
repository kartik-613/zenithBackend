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
        const [patient, upcoming] = await Promise.all([
            User.findById(req.params.id),
            Appointment.findOne({
                patientId: req.params.id,
                status: { $in: ['upcoming', 'scheduled', 'today'] }
            })
                .populate('doctorId', 'name specialization rating reviews image')
                .sort({ date: 1, time: 1 })
        ]);

        if (!patient) return res.status(404).json({ message: 'Patient not found' });

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
        const { name, email, phone, gender, age, address, bio, image, height, weight, bloodGroup, emergencyContact, emergencyName, dob } = req.body;

        // Handle mapping dateOfBirth from frontend to age or dob if we add it
        const updateData = {
            name, email, phone, gender, age, address, bio, image,
            height, weight, bloodGroup, emergencyContact, emergencyName
        };

        const patient = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
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

// @desc    Reschedule Appointment
// @route   PUT /api/patient/reschedule/:id
exports.rescheduleAppointment = async (req, res) => {
    try {
        console.log('Rescheduling appointment ID:', req.params.id);
        console.log('Request body:', req.body);
        const { date, time, reason } = req.body;
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { date, time, status: 'upcoming' }, // Standardize on 'upcoming'
            { new: true }
        );
        if (!appointment) {
            console.log('Appointment not found for ID:', req.params.id);
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    } catch (error) {
        console.error('Error in rescheduleAppointment:', error);
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
            _id: p._id,
            date: p.date,
            doctorName: p.doctorId?.name || 'Dr. Mehta',
            doctor: p.doctorId?.name,
            diagnosis: p.diagnosis,
            medicines: p.medicines,
            status: p.status
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

// @desc    Upload Document
// @route   POST /api/patient/documents/:id
exports.uploadDocument = async (req, res) => {
    try {
        const { name, type, size, date, fileUrl, extension } = req.body;
        const document = await Document.create({
            patientId: req.params.id,
            name,
            type,
            size: size || '1.2 MB',
            date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            fileUrl: fileUrl || 'https://example.com/mock-file.pdf',
            extension: extension || 'PDF'
        });

        const colors = type === 'Lab Report' ? ['#EF4444', '#DB2777'] : ['#3B82F6', '#9333EA'];

        res.status(201).json({
            id: document._id,
            title: document.name,
            type: document.type,
            doctorName: 'Self Uploaded',
            date: document.date,
            fileSize: document.size,
            color: colors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add New Patient (Register)
// @route   POST /api/patient/register
exports.registerPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, email, condition, image, mode } = req.body;

        // Default avatars if not provided
        let patientImage = image;
        if (!patientImage) {
            patientImage = gender === 'Female'
                ? 'https://i.pinimg.com/736x/c4/ee/1e/c4ee1e8a63ad02db5faf5827d4fcc083.jpg'
                : 'https://i.pinimg.com/1200x/fb/a6/4b/fba64b5c2a843b3f68d5cf04e4e9913b.jpg';
        }

        // Basic user creation
        const patient = await User.create({
            name,
            role: 'patient',
            email,
            age,
            gender,
            phone,
            condition,
            image: patientImage
        });

        // If condition/mode provided, create an initial "today" appointment
        if (condition && mode) {
            await Appointment.create({
                patientId: patient._id,
                doctorId: req.body.doctorId || '697ed7dee139a53fec9308df', // Default doctor if not sent
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                type: condition,
                status: 'today',
                mode: mode.toLowerCase().includes('video') ? 'online' : 'in-person'
            });
        }

        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
