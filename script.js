const $ = (id) => document.getElementById(id);


const chat = $("chat");
const userInput = $("user-input");
const voiceStatus = $("voice-status");
const mic = $("mic");


let appointments = [];


function addMessage(role, text) {
  const element = document.createElement("div");


  element.className =
    role === "user" ? "message user" : "message bot";


  element.textContent = text;
  chat.appendChild(element);
  chat.scrollTop = chat.scrollHeight;
}


function speak(text) {
  if (!$("voice-enabled").checked) return;


  if (!("speechSynthesis" in window)) {
    voiceStatus.textContent =
      "Spoken replies are not supported in this browser.";
    return;
  }


  window.speechSynthesis.cancel();


  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 0.95;


  speech.onstart = () => {
    voiceStatus.textContent = "Nexi is speaking...";
  };


  speech.onend = () => {
    voiceStatus.textContent =
      "Ready. Click the microphone to ask another question.";
  };


  speech.onerror = () => {
    voiceStatus.textContent =
      "Speech stopped. Text chat is still available.";
  };


  window.speechSynthesis.speak(speech);
}


function getReply(question) {
  const text = question.toLowerCase().trim();
  const has = (pattern) => pattern.test(text);


  if (has(/\b(weather|news|prime minister)\b/)) {
    return "I am NEXI's demo receptionist, not a live information service. Ask about our services, pricing, office hours or appointments.";
  }


  if (
    has(/\b(appointments?|bookings?)\b/) &&
    has(/\b(my|show|list|count|how many)\b/)
  ) {
    const pending = appointments.filter(
      (item) => item.status === "Pending"
    ).length;


    $("requests").scrollIntoView({ behavior: "smooth" });


    return `There are ${appointments.length} appointment requests saved on the server. ${pending} are pending. You can see them in the Appointment Requests table.`;
  }


  if (has(/\b(price|prices|pricing|cost|costs|budget|quote|charges?)\b/)) {
    return "NEXI's fictional demo prices start at ₹25,000 for websites, ₹60,000 for mobile apps and ₹15,000 for chatbot prototypes. These are sample prices, not real quotations.";
  }


  if (has(/\b(book|booking|appointment|consultation|meeting|schedule)\b/)) {
    $("appointments").scrollIntoView({ behavior: "smooth" });


    return "Please fill in the consultation form with your name, email, service, date and time. Your request will be saved as Pending on the server.";
  }


  if (has(/\b(hours?|timings?|open|close|closed)\b/)) {
    return "NEXI's sample office hours are Monday to Friday, 10 AM to 7 PM, and Saturday, 10 AM to 3 PM. Sunday is closed.";
  }


  if (has(/\b(location|address|where)\b/)) {
    return "NEXI is a fictional company for this college project. Our sample location is 45 Demo Tech Park, Mumbai.";
  }


  if (has(/\b(contact|email|phone|number)\b/)) {
    return "Our sample contact email is hello@nexi.example. This is a placeholder, not a real contact address.";
  }


  if (
    has(/\b(services?|offer)\b/) ||
    text.includes("what do you do")
  ) {
    return "NEXI offers four demo service categories: Website Development, Mobile App Development, Chatbot and Automation, and IT Support.";
  }


  if (has(/\b(website|web|site)\b/)) {
    return "Our website service includes business websites, landing pages and web applications. Choose Website Development in the consultation form to create a request.";
  }


  if (has(/\b(app|apps|mobile|android|ios)\b/)) {
    return "Our mobile service covers Android and iOS app planning and development. Choose Mobile App Development in the consultation form.";
  }


  if (has(/\b(ai|chatbot|automation|automate)\b/)) {
    return "This demo receptionist uses predefined rules rather than a paid AI model. NEXI's sample chatbot service covers reception and customer support workflows.";
  }


  if (has(/\b(help|support|problem|issue)\b/)) {
    return "For a demo technical support request, choose IT Support in the consultation form. Your request will be saved on the server.";
  }


  if (
    has(/\b(company|business|nexi)\b/) &&
    has(/\b(name|about|what|tell)\b/)
  ) {
    return "Our company is called NEXI, spelled N E X I. It is a fictional technology company created for this college project.";
  }


  if (
    has(/\b(name|who|nexi)\b/) ||
    text.includes("introduce yourself")
  ) {
    return "I am Nexi, the demo receptionist for NEXI. I can help you with company information and consultation requests.";
  }


  if (has(/\b(thank|thanks)\b/)) {
    return "You're welcome! Is there anything else about NEXI I can help you with?";
  }


  if (has(/\b(bye|goodbye)\b/)) {
    return "Thank you for visiting NEXI. Have a great day!";
  }


  if (has(/\b(hello|hi|hey|namaste)\b/)) {
    return "Hello! I am Nexi, your NEXI receptionist. Ask me about our services, pricing, office hours or appointment requests.";
  }


  return "I can answer predefined NEXI questions. Try: What services do you provide? Or use one of the quick buttons above.";
}


function sendMessage(text) {
  const question = text.trim();
  if (!question) return;


  addMessage("user", question);
  userInput.value = "";


  const reply = getReply(question);


  addMessage("assistant", reply);
  speak(reply);
}


$("chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(userInput.value);
});


document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.question);
  });
});


$("stop-voice").addEventListener("click", () => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }


  voiceStatus.textContent = "Speaking stopped.";
});


$("voice-enabled").addEventListener("change", () => {
  if (!$("voice-enabled").checked && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
});


const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;


if (SpeechRecognition) {
  const recognition = new SpeechRecognition();


  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;


  let recognitionFailed = false;


  recognition.onstart = () => {
    recognitionFailed = false;
    mic.disabled = true;
    mic.classList.add("listening");


    voiceStatus.textContent =
      "Listening... Speak your question in English.";
  };


  recognition.onresult = (event) => {
    sendMessage(event.results[0][0].transcript);
  };


  recognition.onerror = (event) => {
    recognitionFailed = true;


    const errors = {
      "not-allowed":
        "Microphone blocked. Allow microphone access in Chrome.",
      "audio-capture":
        "No microphone found. Check your laptop microphone.",
      "network":
        "Voice recognition connection failed. Check internet or use text chat.",
      "no-speech":
        "No speech detected. Click the microphone and try again."
    };


    voiceStatus.textContent =
      errors[event.error] ||
      "Voice input failed. Please use text chat.";
  };


  recognition.onend = () => {
    mic.disabled = false;
    mic.classList.remove("listening");


    if (
      !recognitionFailed &&
      !window.speechSynthesis?.speaking
    ) {
      voiceStatus.textContent =
        "Ready. Click the microphone to speak.";
    }
  };


  mic.addEventListener("click", () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }


    try {
      recognition.start();
    } catch {
      voiceStatus.textContent =
        "Voice input is busy. Please try again.";
    }
  });
} else {
  mic.disabled = true;


  voiceStatus.textContent =
    "Voice input is unavailable here. Try desktop Chrome or use text chat.";
}


async function loadAppointments() {
  try {
    const response = await fetch("/api/appointments");
    const data = await response.json();


    appointments = Array.isArray(data.appointments)
      ? data.appointments
      : [];


    renderAppointments();
  } catch {
    $("booking-status").textContent =
      "Could not load appointments from the server.";
  }
}


async function createAppointment(appointment) {
  const response = await fetch("/api/appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(appointment)
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(data.error || "Could not save appointment.");
  }


  return data;
}


async function confirmAppointment(id) {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      status: "Confirmed"
    })
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(data.error || "Could not confirm appointment.");
  }


  return data;
}


async function deleteAppointment(id) {
  const response = await fetch(`/api/appointments/${id}`, {
    method: "DELETE"
  });


  const data = await response.json();


  if (!response.ok) {
    throw new Error(data.error || "Could not delete appointment.");
  }


  return data;
}


function addCell(row, text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  row.appendChild(cell);
  return cell;
}


function renderAppointments() {
  $("total-count").textContent = appointments.length;


  $("pending-count").textContent = appointments.filter(
    (item) => item.status === "Pending"
  ).length;


  $("confirmed-count").textContent = appointments.filter(
    (item) => item.status === "Confirmed"
  ).length;


  const list = $("appointment-list");
  list.replaceChildren();


  if (appointments.length === 0) {
    const row = document.createElement("tr");


    const cell = addCell(
      row,
      "No requests yet. Create your first demo consultation."
    );


    cell.colSpan = 5;
    list.appendChild(row);
    return;
  }


  [...appointments].reverse().forEach((appointment) => {
    const row = document.createElement("tr");


    const customer = addCell(row, appointment.customer);


    const email = document.createElement("small");
    email.textContent = appointment.email;
    customer.appendChild(email);


    addCell(row, appointment.service);
    addCell(row, `${appointment.date} · ${appointment.time}`);


    const statusCell = addCell(row, "");
    const badge = document.createElement("span");


    badge.className =
      appointment.status === "Confirmed"
        ? "badge confirmed"
        : "badge";


    badge.textContent = appointment.status;
    statusCell.appendChild(badge);


    const actions = addCell(row, "");


    if (appointment.status === "Pending") {
      const confirmButton = document.createElement("button");


      confirmButton.type = "button";
      confirmButton.className = "action";
      confirmButton.textContent = "Confirm";


      confirmButton.addEventListener("click", async () => {
        confirmButton.disabled = true;


        try {
          await confirmAppointment(appointment.id);
          await loadAppointments();
        } catch (error) {
          confirmButton.disabled = false;
          $("booking-status").textContent = error.message;
        }
      });


      actions.appendChild(confirmButton);
    }


    const deleteButton = document.createElement("button");


    deleteButton.type = "button";
    deleteButton.className = "action delete";
    deleteButton.textContent = "Delete";


    deleteButton.addEventListener("click", async () => {
      if (!window.confirm("Delete this appointment request?")) {
        return;
      }


      deleteButton.disabled = true;


      try {
        await deleteAppointment(appointment.id);
        await loadAppointments();
      } catch (error) {
        deleteButton.disabled = false;
        $("booking-status").textContent = error.message;
      }
    });


    actions.appendChild(deleteButton);
    list.appendChild(row);
  });
}


function todayString() {
  const date = new Date();


  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");


  return `${date.getFullYear()}-${month}-${day}`;
}


$("booking-date").min = todayString();


$("appointment-form").addEventListener("submit", async (event) => {
  event.preventDefault();


  const form = event.currentTarget;
  const values = new FormData(form);


  const customer = String(values.get("customer") || "").trim();
  const email = String(values.get("email") || "").trim();
  const service = String(values.get("service") || "");
  const date = String(values.get("date") || "");
  const time = String(values.get("time") || "");


  if (!customer || !email || !service || !date || !time) {
    $("booking-status").textContent =
      "Please complete every field.";


    return;
  }


  const appointmentTime = new Date(`${date}T${time}:00`);


  if (
    Number.isNaN(appointmentTime.getTime()) ||
    appointmentTime <= new Date()
  ) {
    $("booking-status").textContent =
      "Please choose a future date and time.";


    return;
  }


  const startsAt = appointmentTime.toISOString();


  try {
    await createAppointment({
      customer,
      email,
      service,
      date,
      time,
      startsAt
    });


    await loadAppointments();


    $("booking-status").textContent =
      "Request saved on the server! Check the appointment table below.";
  } catch (error) {
    $("booking-status").textContent = error.message;
    return;
  }


  const reply =
    `Thank you, ${customer}. Your NEXI demo request for ${service} on ${date} at ${time} is now Pending. No real booking or email has been sent.`;


  addMessage("assistant", reply);
  speak(reply);


  form.reset();
  $("booking-date").min = todayString();
});


loadAppointments();


addMessage(
  "assistant",
  "Hello! I am Nexi, your NEXI demo receptionist. Type a question or use the microphone. I can help with services, sample pricing, office hours and consultation requests."
);