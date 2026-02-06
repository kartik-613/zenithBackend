const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Vital = require('../models/Vital');
const Document = require('../models/Document');
const MedicalPrescription = require('../models/MedicalPrescription');

// @desc    Get Doctor Dashboard Data
// @route   GET /api/doctor/dashboard/:id
exports.getDoctorDashboard = async (req, res) => {
    try {
        const [doctor, todayAppointments, upcoming] = await Promise.all([
            User.findById(req.params.id),
            Appointment.find({ doctorId: req.params.id, status: 'today' }).populate('patientId', 'name image gender age'),
            Appointment.findOne({ doctorId: req.params.id, status: 'upcoming' }).sort({ date: 1, time: 1 }).populate('patientId', 'name image age gender')
        ]);

        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Stats
        const stats = {
            patientsWaiting: todayAppointments.length,
            nextApptTime: upcoming ? upcoming.time : 'None'
        };

        const checkedInPatients = todayAppointments.map(app => ({
            id: app.patientId._id,
            name: app.patientId.name,
            image: app.patientId.image,
            gender: app.patientId.gender,
            case: app.type,
            status: 'checked-in',
            waitTime: '10 min',
            age: app.patientId.age || 30
        }));

        // Mock Earnings Chart (Can be real if we aggregate payments)
        const earningsChart = [
            { time: '9AM', amount: 50 },
            { time: '10AM', amount: 75 },
            { time: '11AM', amount: 60 },
            { time: '12PM', amount: 90 },
            { time: '1PM', amount: 70 },
            { time: '2PM', amount: 85 }
        ];

        res.json({
            doctorName: doctor.name,
            doctorImage: doctor.image,
            stats, // Added stats for dashboard summary
            checkedInPatients,
            upcomingAppointment: upcoming ? {
                patientName: upcoming.patientId.name,
                patientImage: upcoming.patientId.image,
                patientGender: upcoming.patientId.gender,
                time: upcoming.time,
                date: upcoming.date,
                type: upcoming.type,
                age: upcoming.patientId.age || 28
            } : null,
            earningsChart
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Doctor Appointments
// @route   GET /api/doctor/appointments/:id
exports.getDoctorAppointments = async (req, res) => {
    try {
        const { type } = req.query; // today, upcoming, online, past
        const query = { doctorId: req.params.id };

        if (type === 'today') query.status = 'today';
        else if (type === 'upcoming') query.status = 'upcoming';
        else if (type === 'online') query.mode = 'online';
        else if (type === 'past') query.status = 'completed';

        const appointments = await Appointment.find(query)
            .populate('patientId', 'name image age gender')
            .sort({ _id: -1 });

        const formatted = appointments.map(a => ({
            id: a._id,
            patientId: a.patientId._id,
            patientName: a.patientId.name,
            patientImage: a.patientId.image,
            time: a.time,
            date: a.date,
            type: a.type,
            mode: a.mode,
            duration: a.duration || '30 min',
            status: a.status,
            age: a.patientId.age || 28
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get List of Patients
// @route   GET /api/doctor/patients/:id
exports.getDoctorPatients = async (req, res) => {
    try {
        // Find all patients (could filter by those who have had appts with this doc)
        const patients = await User.find({ role: 'patient' });

        const categories = ['followup', 'new', 'today'];
        const statuses = ['active', 'inactive'];

        const formatted = patients.map((p, idx) => ({
            id: p._id,
            name: p.name,
            age: p.age || (25 + (idx % 20)),
            lastVisit: 'Feb 1, 2026',
            condition: p.condition || (idx % 2 === 0 ? 'Fever & Cold' : 'Regular Checkup'),
            image: p.image,
            status: statuses[idx % statuses.length],
            category: categories[idx % categories.length]
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Payment History
// @route   GET /api/doctor/payments/:id
exports.getDoctorPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.params.id })
            .populate('relatedUserId', 'name')
            .sort({ createdAt: -1 });

        const formatted = payments.map(p => ({
            id: p._id,
            patientName: p.relatedUserId ? p.relatedUserId.name : 'Unknown Patient',
            amount: p.amount,
            date: p.date,
            time: p.time,
            mode: p.mode,
            status: p.status,
            type: p.type || 'Consultation',
            category: p.category || 'today'
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Profile
// @route   GET /api/doctor/profile/:id
exports.getDoctorProfile = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Profile
// @route   PUT /api/doctor/profile/:id
exports.updateDoctorProfile = async (req, res) => {
    try {
        const { name, email, phone, gender, age, address, bio, image, specialization, hospital, experience, isAvailable, qualification, consultationFee, registrationNumber, languages } = req.body;

        const doctor = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, gender, age, address, bio, image, specialization, hospital, experience, isAvailable, qualification, consultationFee, registrationNumber, languages },
            { new: true, runValidators: true }
        );

        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Notifications
// @route   GET /api/doctor/notifications/:id
exports.getDoctorNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark Notification Read
// @route   PUT /api/doctor/notifications/:id/read
exports.markDoctorNotificationRead = async (req, res) => {
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
// @route   DELETE /api/doctor/notifications/:id
exports.deleteDoctorNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark All Read
// @route   PUT /api/doctor/notifications/user/:id/read-all
exports.markAllDoctorNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.params.id }, { unread: false });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Patient History Statistics (Vitals, Visits, Documents for a specific patient)
// @route   GET /api/doctor/patient/:id/history
exports.getPatientHistory = async (req, res) => {
    try {
        const patientId = req.params.id;

        const [vitals, visits, documents] = await Promise.all([
            Vital.find({ patientId }),
            Appointment.find({ patientId, status: { $in: ['completed', 'today'] } }).sort({ _id: -1 }),
            Document.find({ patientId })
        ]);

        // Summary (Mock AI)
        const summary = `Patient has been under regular care. Recent vitals are stable.`;

        res.json({
            summary,
            vitals,
            visits: visits.map(v => ({ title: v.type, date: `${v.date} • ${v.time}`, status: 'Healthy', fee: '₹800' })),
            documents: documents.map(d => ({ name: d.name, size: d.size || '1MB', date: d.date, type: d.type, ext: d.extension || 'PDF', color: d.color || '#3B82F6' }))
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Prescription
// @route   POST /api/doctor/prescription
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, doctorId, diagnosis, medicines, notes } = req.body;
        const prescription = await MedicalPrescription.create({
            patientId,
            doctorId,
            diagnosis,
            medicines,
            notes,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Create Appointment (by Doctor)
// @route   POST /api/doctor/appointments
exports.createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time, type, mode, duration } = req.body;
        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            type,
            mode,
            duration: duration || '30 min',
            status: 'upcoming'
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
