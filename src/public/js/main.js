document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  updateUIForAuthState(!!token);

  // Shorten URL form
  const shortenForm = document.getElementById("shorten-form");
  if (shortenForm) {
    shortenForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const longURL = document.getElementById("long-url").value;
      const customDomain = document.getElementById("custom-domain").value;
      try {
        const response = await fetch("/api/shorten", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ longURL, customDomain }),
        });
        const data = await response.json();
        if (response.ok) {
          document.getElementById("result").innerHTML =
            `Short URL: <a href="${data.shortURL}" target="_blank">${data.shortURL}</a>`;
        } else {
          showNotification(data.message || "Error shortening URL");
        }
      } catch (error) {
        showNotification("Error shortening URL");
      }
    });
  }

  // QR Code generation form
  const qrForm = document.getElementById("qr-form");
  if (qrForm) {
    qrForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const shortURL = document.getElementById("short-url").value;
      try {
        const response = await fetch("/api/qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shortURL }),
        });
        const data = await response.json();
        if (response.ok) {
          document.getElementById("qr-result").innerHTML =
            `<img src="${data.qrCode}" alt="QR Code">`;
        } else {
          showNotification(data.message || "Error generating QR code");
        }
      } catch (error) {
        showNotification("Error generating QR code");
      }
    });
  }

  // Sign up form
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = signupForm.username.value;
      const password = signupForm.password.value;
      try {
        const response = await fetch("/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
          showNotification("Sign up successful. Please log in.");
          window.location.href = "/login";
        } else {
          showNotification(data.message || "Error signing up");
        }
      } catch (error) {
        showNotification("Error signing up");
      }
    });
  }

  // Login form
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = loginForm.username.value;
      const password = loginForm.password.value;
      try {
        const response = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          showNotification("Logged in successfully");
          window.location.href = "/";
        } else {
          showNotification(data.message || "Error logging in");
        }
      } catch (error) {
        showNotification("Error logging in");
      }
    });
  }

  // Logout
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Get link history
  if (token) {
    getLinkHistory();
  }

  // URL Analytics form
  const analyticsForm = document.getElementById("analytics-form");
  if (analyticsForm) {
    analyticsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const shortCode = document.getElementById("analytics-shortcode").value;
      try {
        const response = await fetch(`/api/analytics/${shortCode}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          document.getElementById("analytics-result").innerHTML = `
            <p>Long URL: ${data.longURL}</p>
            <p>Short URL: ${data.shortURL}</p>
            <p>Clicks: ${data.clicks}</p>
            <p>Created At: ${new Date(data.createdAt).toLocaleString()}</p>
          `;
        } else {
          showNotification(data.message || "Error fetching analytics");
        }
      } catch (error) {
        showNotification("Error fetching analytics");
      }
    });
  }
});

function showNotification(message) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.classList.remove("hidden");
  setTimeout(() => {
    notification.classList.add("hidden");
  }, 3000);
}

function updateUIForAuthState(isLoggedIn) {
  const userDataSection = document.getElementById("user-data-section");
  const signupNav = document.getElementById("signup-nav");
  const loginNav = document.getElementById("login-nav");
  const logoutNav = document.getElementById("logout-nav");

  if (isLoggedIn) {
    userDataSection.classList.remove("hidden");
    signupNav.classList.add("hidden");
    loginNav.classList.add("hidden");
    logoutNav.classList.remove("hidden");
  } else {
    userDataSection.classList.add("hidden");
    signupNav.classList.remove("hidden");
    loginNav.classList.remove("hidden");
    logoutNav.classList.add("hidden");
  }
}

async function getLinkHistory() {
  try {
    const response = await fetch("/api/history", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    if (response.ok) {
      const historyHTML = data
        .map(
          (link) => `
        <div>
          <p>Short URL: <a href="${link.shortURL}" target="_blank">${link.shortURL}</a></p>
          <p>Long URL: ${link.longURL}</p>
          <p>Clicks: ${link.clicks}</p>
          <p>Created: ${new Date(link.createdAt).toLocaleString()}</p>
        </div>
      `
        )
        .join("");
      document.getElementById("link-history").innerHTML = historyHTML;
    } else {
      showNotification(data.message || "Error fetching link history");
    }
  } catch (error) {
    showNotification("Error fetching link history");
  }
}

function logout() {
  localStorage.removeItem("token");
  updateUIForAuthState(false);
  showNotification("Logged out successfully");
  window.location.href = "/";
}
