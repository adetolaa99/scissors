// Utility function for showing notifications
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden", "success", "error");
  notification.classList.add(type, "show");
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.classList.add("hidden"), 300);
  }, 3000);
}

// Function to handle form submission
async function handleFormSubmit(formId, url, successMessage) {
  const form = document.getElementById(formId);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showNotification(successMessage, "success");
      return result;
    } catch (error) {
      console.error("Error:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  });
}

// URL Shortening
handleFormSubmit(
  "shorten-form",
  "/api/shorten",
  "URL shortened successfully"
).then((result) => {
  if (result && result.shortURL) {
    document.getElementById("result").innerHTML =
      `Shortened URL: <a href="${result.shortURL}" target="_blank">${result.shortURL}</a>`;
  }
});

// QR Code Generation
handleFormSubmit(
  "qr-form",
  "/api/qrcode",
  "QR Code generated successfully"
).then((result) => {
  if (result && result.qrCode) {
    document.getElementById("qr-result").innerHTML =
      `<img src="${result.qrCode}" alt="QR Code">`;
  }
});

// User Sign Up
handleFormSubmit("signup-form", "/auth/signup", "Signed up successfully");

// User Login
handleFormSubmit("login-form", "/auth/login", "Logged in successfully").then(
  (result) => {
    if (result) {
      document.querySelector(".auth").classList.add("hidden");
      document.querySelector(".user-data").classList.remove("hidden");
      document.getElementById("logout-button").classList.remove("hidden");
      fetchLinkHistory();
    }
  }
);

// User Logout
document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    const response = await fetch("/auth/logout");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    document.querySelector(".auth").classList.remove("hidden");
    document.querySelector(".user-data").classList.add("hidden");
    document.getElementById("logout-button").classList.add("hidden");
    showNotification("Logged out successfully", "success");
  } catch (error) {
    console.error("Error:", error);
    showNotification(`Error logging out: ${error.message}`, "error");
  }
});

// Fetch Link History
async function fetchLinkHistory() {
  try {
    const response = await fetch("/api/history");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const historyHtml = data
      .map(
        (link) => `
            <p>Short URL: <a href="${link.shortURL}" target="_blank">${link.shortURL}</a>, Clicks: ${link.clicks}</p>
        `
      )
      .join("");
    document.getElementById("link-history").innerHTML =
      historyHtml || "No link history available.";
  } catch (error) {
    console.error("Error fetching link history:", error);
    document.getElementById("link-history").innerHTML =
      "Error fetching link history.";
    showNotification(`Error fetching link history: ${error.message}`, "error");
  }
}

// URL Analytics
document
  .getElementById("analytics-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const shortCode = document.getElementById("analytics-shortcode").value;

    try {
      const response = await fetch(`/api/analytics/${shortCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      document.getElementById("analytics-result").innerHTML = `
            <p>Long URL: ${data.longURL}</p>
            <p>Short URL: <a href="${data.shortURL}" target="_blank">${data.shortURL}</a></p>
            <p>Clicks: ${data.clicks}</p>
            <p>Created At: ${new Date(data.createdAt).toLocaleString()}</p>
        `;
      showNotification("Analytics fetched successfully", "success");
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("analytics-result").innerHTML =
        "Error fetching analytics.";
      showNotification(`Error fetching analytics: ${error.message}`, "error");
    }
  });
