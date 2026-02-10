const form = document.getElementById("loginForm");
const messageBox = document.getElementById("loginMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  messageBox.textContent = "";
  messageBox.style.display = "none";

  const email = form[0].value;
  const password = form[1].value;

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageBox.textContent = data.error || "Invalid email or password";
      messageBox.className = "login-message error";
      messageBox.style.display = "block";
      return;
    }
    localStorage.setItem("token", data.token);

    if (!data.user.plan) {
      window.location.href = "plans.html";
    } else {
      localStorage.setItem("plan", data.user.plan);
      window.location.href = "index.html";
    }
  } catch {
    messageBox.textContent = "Erro ao conectar com o servidor";
    messageBox.style.display = "block";
  }
});
