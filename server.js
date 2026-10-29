import express from "express";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";


const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(root, "data");
const dataFile = path.join(dataDirectory, "appointments.json");
const PORT = process.env.PORT || 3000;


const services = [
  "Website Development",
  "Mobile App Development",
  "Chatbot & Automation",
  "IT Support"
];


app.disable("x-powered-by");
app.use(express.json({ limit: "20kb" }));


fs.mkdirSync(dataDirectory, { recursive: true });


if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]", "utf8");
}


let appointments;


try {
  appointments = JSON.parse(fs.readFileSync(dataFile, "utf8"));


  if (!Array.isArray(appointments)) {
    throw new Error("Appointment data must be an array.");
  }
} catch (error) {
  console.error("Cannot read data/appointments.json:", error.message);
  console.error("Please restore a valid JSON array. Existing data was not overwritten.");
  process.exit(1);
}


function commitAppointments(nextAppointments) {
  const temporaryFile = `${dataFile}.tmp`;


  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(nextAppointments, null, 2),
    "utf8"
  );


  fs.renameSync(temporaryFile, dataFile);
  appointments = nextAppointments;
}


function getStats() {
  return {
    total: appointments.length,
    pending: appointments.filter(a => a.status === "Pending").length,
    confirmed: appointments.filter(a => a.status === "Confirmed").length
  };
}


function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}


function getChatReply(question) {
  const text = question.toLowerCase().trim();
  const has = pattern => pattern.test(text);


  if (has(/\b(weather|news|prime minister)\b/)) {
    return "I am NEXI's rule-based receptionist, not a live information service. Ask about services, pricing, hours or consultation requests.";
  }


  if (
    has(/\b(appointments?|bookings?)\b/) &&
    has(/\b(my|show|list|count|how many)\b/)
  ) {
    const stats = getStats();


    return `This demo server has ${stats.total} appointment requests: ${stats.pending} pending and ${stats.confirmed} confirmed. See the Appointment Requests table.`;
  }


  if (has(/\b(price|prices|pricing|cost|costs|budget|quote|charges?)\b/)) {
    return "NEXI's fictional sample prices start at ₹25,000 for websites, ₹60,000 for mobile apps and ₹15,000 for chatbot prototypes. These are demo prices, not real quotations.";
  }


  if (has(/\b(book|booking|appointment|consultation|meeting|schedule)\b/)) {
    return "Please complete the consultation form. The backend will save your request with Pending status. This is a college demo; no real booking or email is sent.";
  }


  if (has(/\b(hours?|timings?|open|close|closed)\b/)) {
    return "Our sample office hours are Monday to Friday, 10 AM to 7 PM, and Saturday, 10 AM to 3 PM. Sunday is closed.";
  }


  if (has(/\b(location|address|where)\b/)) {
    return "NEXI is fictional for this college demonstration. Its sample address is 45 Demo Tech Park, Mumbai.";
  }


  if (has(/\b(contact|email|phone|number)\b/)) {
    return "Our placeholder contact email is hello@nexi.example. This is not a real contact address.";
  }


  if (has(/\b(services?|offer)\b/) || text.includes("what do you do")) {
    return "NEXI offers four demo services: Website Development, Mobile App Development, Chatbot and Automation, and IT Support.";
  }


  if (has(/\b(website|web|site)\b/)) {
    return "Our website service includes business websites, landing pages and web applications. Choose Website Development in the consultation form.";
  }


  if (has(/\b(app|apps|mobile|android|ios)\b/)) {
    return "Our mobile application service covers Android and iOS app planning and development. Select Mobile App Development to request a consultation.";
  }


  if (has(/\b(ai|chatbot|automation|automate)\b/)) {
    return "This receptionist uses predefined backend rules, not a paid AI model. Our sample automation service covers reception and customer support workflows.";
  }


  if (has(/\b(help|support|problem|issue)\b/)) {
    return "For a demo support enquiry, select IT Support in the consultation form. The request will be saved on this project's server.";
  }


  if (
    has(/\b(company|business|nexi)\b/) &&
    has(/\b(name|about|what|tell)\b/)
  ) {
    return "The company is NEXI, spelled N E X I. It is a fictional technology company created for this college project.";
  }


  if (
    has(/\b(name|who|nexi)\b/) ||
    text.includes("introduce yourself")
  ) {
    return "I am Nexi, the receptionist for NEXI. I can answer company questions and help with consultation requests.";
  }


  if (has(/\b(thank|thanks)\b/)) {
    return "You're welcome! What else about NEXI can I help you with?";
  }


  if (has(/\b(bye|goodbye)\b/)) {
    return "Thank you for visiting NEXI. Have a great day!";
  }


  if (has(/\b(hello|hi|hey|namaste)\b/)) {
    return "Hello! I am Nexi, your NEXI receptionist. Ask about services, pricing, office hours or consultations.";
  }


  return "I answer predefined NEXI questions. Try asking about services, pricing, office hours or appointment requests.";
}


app.get("/api/appointments", (req, res) => {
  res.set("Cache-Control", "no-store");


  res.json({
    appointments,
    stats: getStats()
  });
});


app.post("/api/appointments", (req, res) => {
  const body = req.body || {};


  const customer = cleanString(body.customer);
  const email = cleanString(body.email);
  const service = cleanString(body.service);
  const date = cleanString(body.date);
  const time = cleanString(body.time);
  const startsAt = cleanString(body.startsAt);


  if (
    !customer ||
    customer.length > 80 ||
    !email ||
    email.length > 120 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !services.includes(service)
  ) {
    return res.status(400).json({
      error: "Enter a valid name, email and service."
    });
  }


  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return res.status(400).json({
      error: "Choose a valid date and time."
    });
  }


  const localDate = new Date(`${date}T${time}:00`);


  if (
    Number.isNaN(localDate.getTime()) ||
    localDate.getFullYear() !== Number(date.slice(0, 4)) ||
    localDate.getMonth() + 1 !== Number(date.slice(5, 7)) ||
    localDate.getDate() !== Number(date.slice(8, 10)) ||
    localDate.getHours() !== Number(time.slice(0, 2)) ||
    localDate.getMinutes() !== Number(time.slice(3, 5))
  ) {
    return res.status(400).json({
      error: "The date or time is invalid."
    });
  }


  const instant = new Date(startsAt);


  if (
    Number.isNaN(instant.getTime()) ||
    instant.getTime() <= Date.now()
  ) {
    return res.status(400).json({
      error: "Choose a future date and time."
    });
  }


  const appointment = {
    id: randomUUID(),
    customer,
    email,
    service,
    date,
    time,
    startsAt: instant.toISOString(),
    status: "Pending",
    createdAt: new Date().toISOString()
  };


  commitAppointments([...appointments, appointment]);


  res.status(201).json({
    appointment,
    message: "Demo request saved on the server."
  });
});


app.patch("/api/appointments/:id", (req, res) => {
  const existing = appointments.find(a => a.id === req.params.id);


  if (!existing) {
    return res.status(404).json({
      error: "Appointment not found."
    });
  }


  if (req.body?.status !== "Confirmed") {
    return res.status(400).json({
      error: "Supported status: Confirmed."
    });
  }


  const updated = { ...existing, status: "Confirmed" };


  commitAppointments(
    appointments.map(a => a.id === existing.id ? updated : a)
  );


  res.json({ appointment: updated });
});


app.delete("/api/appointments/:id", (req, res) => {
  if (!appointments.some(a => a.id === req.params.id)) {
    return res.status(404).json({
      error: "Appointment not found."
    });
  }


  commitAppointments(
    appointments.filter(a => a.id !== req.params.id)
  );


  res.json({ message: "Demo request deleted." });
});


app.post("/api/chat", (req, res) => {
  const message = cleanString(req.body?.message);


  if (!message || message.length > 500) {
    return res.status(400).json({
      error: "Enter a question between 1 and 500 characters."
    });
  }


  res.json({ reply: getChatReply(message) });
});


app.use("/api", (req, res) => {
  res.status(404).json({ error: "API route not found." });
});


app.use(express.static(path.join(root, "public")));


app.use((error, req, res, next) => {
  console.error(error);


  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON request." });
  }


  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request is too large." });
  }


  res.status(500).json({
    error: "The server could not complete the request. Check its terminal."
  });
});


const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`NEXI Full-Stack Receptionist: http://localhost:${PORT}`);
  console.log("Appointments are saved in data/appointments.json");
  console.log("Keep this terminal open.");
});


server.on("error", error => {
  if (error.code === "EADDRINUSE") {
    console.error(
      "Port 3000 is busy. Stop the old project in its terminal with Ctrl+C."
    );
  } else {
    console.error(error.message);
  }


  process.exit(1);
});