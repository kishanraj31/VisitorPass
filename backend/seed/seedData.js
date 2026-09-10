require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const crypto = require("crypto");
const QRCode = require("qrcode");

const User = require("../models/User");
const Visitor = require("../models/Visitor");
const Appointment = require("../models/Appointment");
const Pass = require("../models/Pass");
const CheckLog = require("../models/CheckLog");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/visitorpass";

// Simple, memorable preset accounts — no human names, easy to log in
const seedUsers = [
  { name: "Admin",     email: "admin@vps.com",     password: "Admin@123",     role: "admin",     phone: "+910000000001" },
  { name: "Frontdesk", email: "frontdesk@vps.com", password: "Frontdesk@123", role: "frontdesk", phone: "+910000000002" },
  { name: "Host",      email: "host@vps.com",       password: "Host@123",      role: "host",      phone: "+910000000003" },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...\n");

  await CheckLog.deleteMany({});
  await Pass.deleteMany({});
  await Appointment.deleteMany({});
  await Visitor.deleteMany({});
  await User.deleteMany({});
  console.log("Cleared all existing data.\n");

  // Create preset users (passwords hashed by pre-save hook)
  const users = await User.create(seedUsers);
  const host = users.find((u) => u.role === "host");
  const frontdeskUser = users.find((u) => u.role === "frontdesk");

  // Visitor 1: Checked In (On-Site)
  const visitor1 = await Visitor.create({
    name: "Alice OnSite",
    email: "alice@example.com",
    phone: "+911111111111",
    company: "Acme Corp",
    purpose: "Meeting",
    hostId: host._id,
  });

  const appt1 = await Appointment.create({
    visitorId: visitor1._id,
    hostId: host._id,
    scheduledTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: "approved",
    purpose: "Meeting",
  });

  const qrCodeData1 = crypto.randomBytes(32).toString("hex");
  const qrCodeImage1 = await QRCode.toDataURL(qrCodeData1, { width: 300, margin: 2 });
  const pass1 = await Pass.create({
    appointmentId: appt1._id,
    qrCodeData: qrCodeData1,
    qrCodeImage: qrCodeImage1,
    issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 22 * 60 * 60 * 1000),
    status: "used", // checked in
  });

  await CheckLog.create({
    passId: pass1._id,
    checkInTime: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
    checkOutTime: null,
    scannedBy: frontdeskUser._id,
  });

  // Visitor 2: Pending Approval
  const visitor2 = await Visitor.create({
    name: "Bob Pending",
    email: "bob@example.com",
    phone: "+912222222222",
    company: "Beta LLC",
    purpose: "Interview",
    hostId: host._id,
  });

  await Appointment.create({
    visitorId: visitor2._id,
    hostId: host._id,
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    status: "pending",
    purpose: "Interview",
  });

  // Visitor 3: Approved but not checked in yet
  const visitor3 = await Visitor.create({
    name: "Charlie Approved",
    email: "charlie@example.com",
    phone: "+913333333333",
    company: "Gamma Inc",
    purpose: "Vendor Sync",
    hostId: host._id,
  });

  const appt3 = await Appointment.create({
    visitorId: visitor3._id,
    hostId: host._id,
    scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    status: "approved",
    purpose: "Vendor Sync",
  });

  const qrCodeData3 = crypto.randomBytes(32).toString("hex");
  const qrCodeImage3 = await QRCode.toDataURL(qrCodeData3, { width: 300, margin: 2 });
  await Pass.create({
    appointmentId: appt3._id,
    qrCodeData: qrCodeData3,
    qrCodeImage: qrCodeImage3,
    issuedAt: new Date(),
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: "active",
  });

  // Visitor 4: Checked Out
  const visitor4 = await Visitor.create({
    name: "Dave Done",
    email: "dave@example.com",
    phone: "+914444444444",
    company: "Delta Tech",
    purpose: "Delivery",
    hostId: host._id,
  });

  const appt4 = await Appointment.create({
    visitorId: visitor4._id,
    hostId: host._id,
    scheduledTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    status: "completed",
    purpose: "Delivery",
  });

  const qrCodeData4 = crypto.randomBytes(32).toString("hex");
  const qrCodeImage4 = await QRCode.toDataURL(qrCodeData4, { width: 300, margin: 2 });
  const pass4 = await Pass.create({
    appointmentId: appt4._id,
    qrCodeData: qrCodeData4,
    qrCodeImage: qrCodeImage4,
    issuedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 19 * 60 * 60 * 1000),
    status: "used",
  });

  await CheckLog.create({
    passId: pass4._id,
    checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
    checkOutTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    scannedBy: frontdeskUser._id,
  });

  console.log("=".repeat(60));
  console.log("SEEDED LOGIN CREDENTIALS");
  console.log("=".repeat(60));
  console.log("Role".padEnd(12) + "Email".padEnd(28) + "Password");
  console.log("-".repeat(60));
  seedUsers.forEach((u) => {
    console.log(u.role.padEnd(12) + u.email.padEnd(28) + u.password);
  });
  console.log("=".repeat(60));
  console.log("\nSeed complete: 3 users, 4 visitors, 4 appointments, 3 passes, 2 check-in logs.\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
