const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Appointment = require('./src/models/Appointment');
const Payment = require('./src/models/Payment');
const Notification = require('./src/models/Notification');
const Vital = require('./src/models/Vital');
const Document = require('./src/models/Document');
const MedicalPrescription = require('./src/models/MedicalPrescription');
const connectDB = require('./src/config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        await User.deleteMany();
        await Appointment.deleteMany();
        await Payment.deleteMany();
        await Notification.deleteMany();
        await Vital.deleteMany();
        await Document.deleteMany();
        await MedicalPrescription.deleteMany();

        // ================= USERS =================

        const doctor = await User.create({
            _id: '697ed7dee139a53fec9308df',
            name: 'Dr. Amit Verma',
            role: 'doctor',
            email: 'amit.verma@zenith.com',
            phone: '+91 98765 43210',
            gender: 'Male',
            age: 42,
            address: 'Verma Clinic, Vijay Nagar, Indore',
            bio: 'General physician with 14+ years of experience.',
            image: 'https://i.pinimg.com/736x/47/a4/44/47a4448f2df0046ee1f7bed28f87e551.jpg',
            specialization: 'General Medicine',
            hospital: 'Zenith Multi-specialty Hospital',
            rating: 4.8,
            reviews: 210,
            experience: '14 yrs',
            totalPatients: 1100
        });

        const patient1 = await User.create({
            _id: '697ed7dee139a53fec9308e1',
            name: 'Rahul Sharma',
            role: 'patient',
            email: 'rahul.sharma@gmail.com',
            phone: '+91 88888 77777',
            gender: 'Male',
            age: 27,
            address: 'Vijay Nagar, Indore',
            bio: 'IT professional and fitness enthusiast.',
            image: 'https://i.pinimg.com/1200x/fb/a6/4b/fba64b5c2a843b3f68d5cf04e4e9913b.jpg'
        });

        const patient2 = await User.create({
            _id: '697ed7dee139a53fec9308e3',
            name: 'Neha Gupta',
            role: 'patient',
            email: 'neha.gupta@gmail.com',
            phone: '+91 99999 00000',
            gender: 'Female',
            age: 31,
            address: 'Palasia, Indore',
            bio: 'Marketing executive, yoga lover.',
            image: 'https://i.pinimg.com/736x/24/0f/10/240f10fc470a4830af234d1fdf2ba6ed.jpg'
        });

        const patient3 = await User.create({
            _id: '697ed7dee139a53fec9308e5',
            name: 'Suresh Yadav',
            role: 'patient',
            email: 'suresh.yadav@gmail.com',
            phone: '+91 77777 66666',
            gender: 'Male',
            age: 44,
            address: 'Bhawarkua, Indore',
            bio: 'Small business owner.',
            image: 'https://i.pinimg.com/736x/34/a7/9f/34a79ffb957216f5ab1fde3a760a903b.jpg'
        });

        // ================= APPOINTMENTS =================

        await Appointment.create([
            {
                patientId: patient1._id,
                doctorId: doctor._id,
                date: 'Feb 5, 2026',
                time: '10:00 AM',
                type: 'General Checkup',
                status: 'upcoming',
                mode: 'in-person'
            },
            {
                patientId: patient2._id,
                doctorId: doctor._id,
                date: 'Feb 2, 2026',
                time: '10:30 AM',
                type: 'Cold & Fever',
                status: 'today',
                mode: 'in-person'
            },
            {
                patientId: patient3._id,
                doctorId: doctor._id,
                date: 'Feb 2, 2026',
                time: '11:00 AM',
                type: 'Stomach Pain',
                status: 'today',
                mode: 'in-person'
            },
            {
                patientId: patient1._id,
                doctorId: doctor._id,
                date: 'Jan 20, 2026',
                time: '9:00 AM',
                type: 'Online Consultation',
                status: 'completed',
                mode: 'online'
            }
        ]);

        // ================= PAYMENTS =================

        await Payment.create([
            {
                userId: doctor._id,
                relatedUserId: patient1._id,
                amount: 800,
                date: 'Feb 2, 2026',
                time: '10:30 AM',
                mode: 'UPI',
                status: 'completed',
                type: 'Consultation',
                category: 'today'
            },
            {
                userId: doctor._id,
                relatedUserId: patient2._id,
                amount: 600,
                date: 'Feb 2, 2026',
                time: '11:15 AM',
                mode: 'UPI',
                status: 'completed',
                type: 'Consultation',
                category: 'today'
            },
            {
                userId: doctor._id,
                relatedUserId: patient3._id,
                amount: 1000,
                date: 'Feb 2, 2026',
                time: '12:00 PM',
                mode: 'UPI',
                status: 'completed',
                type: 'Consultation',
                category: 'today'
            }
        ]);

        // ================= NOTIFICATIONS =================

        await Notification.create([
            {
                userId: doctor._id,
                type: 'appointment',
                title: 'New Appointment',
                message: 'Rahul Sharma booked an appointment.',
                time: '1 hour ago',
                unread: true
            },
            {
                userId: doctor._id,
                type: 'patient',
                title: 'Patient Checked In',
                message: 'Neha Gupta has arrived for consultation.',
                time: '10 mins ago',
                unread: true
            },
            {
                userId: patient1._id,
                type: 'appointment',
                title: 'Appointment Confirmed',
                message: 'Your appointment with Dr. Amit Verma is confirmed.',
                time: '2 hours ago',
                unread: false
            }
        ]);

        // ================= VITALS =================

        await Vital.create([
            {
                patientId: patient1._id,
                label: 'Blood Pressure',
                value: '120/80',
                unit: 'mmHg',
                status: 'normal',
                trend: 'stable',
                history: ['118/78', '120/80']
            },
            {
                patientId: patient2._id,
                label: 'Blood Pressure',
                value: '122/82',
                unit: 'mmHg',
                status: 'normal',
                trend: 'stable',
                history: ['120/80', '122/82']
            },
            {
                patientId: patient3._id,
                label: 'Blood Pressure',
                value: '130/85',
                unit: 'mmHg',
                status: 'high',
                trend: 'up',
                history: ['125/82', '130/85']
            }
        ]);

        // ================= DOCUMENTS =================

        await Document.create([
            {
                patientId: patient1._id,
                name: 'Blood Test Report',
                type: 'Lab Report',
                size: '1.8 MB',
                date: 'Jan 18, 2026',
                extension: 'PDF',
                color: '#EF4444'
            },
            {
                patientId: patient2._id,
                name: 'X-Ray Report',
                type: 'Lab Report',
                size: '2.1 MB',
                date: 'Jan 10, 2026',
                extension: 'PDF',
                color: '#3B82F6'
            }
        ]);

        // ================= PRESCRIPTIONS =================

        await MedicalPrescription.create([
            {
                patientId: patient1._id,
                doctorId: doctor._id,
                date: 'Feb 2, 2026',
                diagnosis: 'Viral Fever',
                status: 'active',
                medicines: [
                    {
                        name: 'Paracetamol 500mg',
                        type: 'Tablet',
                        dosage: '1-0-1',
                        timing: 'After meals',
                        duration: '5 days'
                    }
                ],
                notes: 'Drink plenty of fluids and rest.'
            }
        ]);

        console.log('\n✅ DATABASE SEEDED SUCCESSFULLY\n');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
