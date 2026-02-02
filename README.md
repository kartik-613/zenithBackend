# 🏥 Zenith Healthcare Backend API

Complete Node.js + MongoDB backend for Zenith Healthcare mobile application.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is already configured:
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/zenith_db
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community
```

### 4. Seed Database
Populate the database with sample data:
```bash
npm run seed
```

### 5. Start Server
```bash
npm start
```

Server will run on: **http://localhost:3000**

---

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Patient Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patient/dashboard/:id` | Get patient dashboard data |
| GET | `/patient/appointments/:id` | Get all appointments |
| POST | `/patient/book` | Book new appointment |
| GET | `/patient/payments/:id` | Get payment history |
| GET | `/patient/profile/:id` | Get patient profile |
| GET | `/patient/notifications/:id` | Get notifications |
| GET | `/patient/vitals/:id` | Get health vitals |
| GET | `/patient/prescriptions/:id` | Get prescriptions |
| GET | `/patient/documents/:id` | Get medical documents |
| POST | `/patient/register` | Register new patient |

### Doctor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctor/dashboard/:id` | Get doctor dashboard |
| GET | `/doctor/appointments/:id` | Get appointments |
| GET | `/doctor/patients/:id` | Get patient list |
| GET | `/doctor/payments/:id` | Get payment history |
| GET | `/doctor/profile/:id` | Get doctor profile |
| GET | `/doctor/notifications/:id` | Get notifications |
| GET | `/doctor/patient/:id/history` | Get patient history |
| POST | `/doctor/prescription` | Create prescription |

---

## 📊 Database Models

### User
- Patients and Doctors
- Fields: name, role, email, image, specialization, rating, reviews, experience

### Appointment
- Medical appointments
- Fields: patientId, doctorId, date, time, type, status, mode

### Payment
- Payment transactions
- Fields: userId, relatedUserId, amount, date, time, mode, status, type

### Notification
- User notifications
- Fields: userId, type, title, message, time

### Vital
- Patient vital signs
- Fields: patientId, label, value, unit, status, history

### Document
- Medical documents
- Fields: patientId, name, type, size, date, extension, color

### MedicalPrescription
- Prescriptions and medicines
- Fields: patientId, doctorId, date, diagnosis, status, medicines

---

## 🧪 Testing the API

### Using cURL

**Get Patient Dashboard:**
```bash
curl http://localhost:3000/api/patient/dashboard/PATIENT_ID
```

**Book Appointment:**
```bash
curl -X POST http://localhost:3000/api/patient/book \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID",
    "doctorId": "DOCTOR_ID",
    "date": "Dec 20, 2025",
    "time": "10:00 AM",
    "type": "Regular Checkup",
    "mode": "in-person"
  }'
```

**Get Doctor Dashboard:**
```bash
curl http://localhost:3000/api/doctor/dashboard/DOCTOR_ID
```

---

## 📁 Project Structure

```
zenith-backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── patientController.js
│   │   └── doctorController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Appointment.js
│   │   ├── Payment.js
│   │   ├── Notification.js
│   │   ├── Vital.js
│   │   ├── Document.js
│   │   └── MedicalPrescription.js
│   ├── routes/
│   │   ├── mainRoutes.js
│   │   ├── patientRoutes.js
│   │   └── doctorRoutes.js
│   └── utils/              # Utility functions
├── .env                    # Environment variables
├── server.js              # Express server
├── seed.js                # Database seeding
└── package.json
```

---

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `MONGO_URI` - MongoDB connection string

### CORS
CORS is enabled for all origins (development mode)

---

## 📝 Sample Data

After running `npm run seed`, you'll have:

**Users:**
- 1 Doctor: Dr. Amit Verma
- 3 Patients: Rahul Sharma, Neha Gupta, Suresh Yadav

**Data:**
- Sample appointments
- Payment records
- Notifications
- Vital signs
- Medical documents
- Prescriptions

---

## 🔌 Frontend Integration

### For React Native (Expo)

1. **Find your computer's IP:**
```bash
ifconfig | grep "inet "
```

2. **Update API URL in frontend:**
```javascript
const API_URL = 'http://192.168.x.x:3000/api';
```

3. **Make sure both devices are on same WiFi**

### Example API Call
```javascript
const getDashboard = async (patientId) => {
  const response = await fetch(`http://localhost:3000/api/patient/dashboard/${patientId}`);
  return response.json();
};
```

---

## 🛠️ Development

### Available Scripts

- `npm start` - Start server with nodemon (auto-reload)
- `npm run seed` - Seed database with sample data

### Adding New Endpoints

1. Create controller function in `src/controllers/`
2. Add route in `src/routes/`
3. Test with cURL or Postman

---

## ✅ Features

- ✅ RESTful API design
- ✅ MongoDB integration
- ✅ Express.js server
- ✅ CORS enabled
- ✅ Error handling
- ✅ Environment configuration
- ✅ Database seeding
- ✅ Modular structure

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **nodemon** - Development auto-reload

---

## 🎯 API Response Format

### Success Response
```json
{
  "id": "...",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## 🚨 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB
brew services start mongodb-community

# Check status
brew services list
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📞 Support

For issues or questions, check:
- MongoDB is running
- .env file is configured
- Dependencies are installed
- Port is available

---

## 🎉 Ready to Use!

Your backend is fully configured and ready for production use!

**Total APIs: 18**
- Patient APIs: 10
- Doctor APIs: 8

Happy Coding! 🚀
