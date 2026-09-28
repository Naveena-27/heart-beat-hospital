require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'appointments.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------
function readAppointments() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeAppointments(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2));
}

// Sends a notification email if SMTP settings are present in .env.
// If they aren't configured, this silently no-ops so the form still
// works (submissions are always saved to disk regardless of email).
async function sendNotificationEmail(appointment) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return;
  }
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const to = process.env.NOTIFY_EMAIL || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Heart Beat Hospital Website" <${process.env.SMTP_USER}>`,
    to,
    subject: `New appointment request — ${appointment.name}`,
    text: [
      `Name: ${appointment.name}`,
      `Email: ${appointment.email}`,
      `Phone: ${appointment.phone}`,
      `Department: ${appointment.department}`,
      `Preferred doctor: ${appointment.doctor || 'No preference'}`,
      `Preferred date: ${appointment.date} ${appointment.time || ''}`,
      `Message: ${appointment.message || '-'}`
    ].join('\n')
  });
}

// ---------- routes ----------

// Submit a new appointment request
app.post('/api/appointments', async (req, res) => {
  const { name, email, phone, department, doctor, date, time, message } = req.body || {};

  if (!name || !email || !phone || !department || !date) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const appointment = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name,
    email,
    phone,
    department,
    doctor: doctor || '',
    date,
    time: time || '',
    message: message || '',
    createdAt: new Date().toISOString(),
    status: 'pending'
  };

  const appointments = readAppointments();
  appointments.push(appointment);
  writeAppointments(appointments);

  // Email is best-effort — a failure here should never break the
  // request, since the submission is already saved above.
  try {
    await sendNotificationEmail(appointment);
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }

  res.status(201).json({ message: 'Appointment request received.', id: appointment.id });
});

// List all appointment requests (simple admin view, protected by a token)
app.get('/api/appointments', (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(readAppointments());
});

app.listen(PORT, () => {
  console.log(`Heart Beat Hospital site running at http://localhost:${PORT}`);
});
