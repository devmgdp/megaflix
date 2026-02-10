// =========================
// AUTH
// =========================
const token = localStorage.getItem('token');
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
const deleteConfirm = document.getElementById("deleteConfirm");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

// se não estiver logado, manda pro login
if (!token) {
  window.location.href = 'login.html';
}

// =========================
// PLAN BUTTONS
// =========================
document.querySelectorAll('button[data-plan]').forEach(button => {
  button.addEventListener('click', async () => {
    const selectedPlan = button.dataset.plan;

    try {
      const res = await fetch('http://localhost:3000/choose-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (!res.ok) {
        alert('Erro ao selecionar o plano');
        return;
      }

      // salva o plano localmente
      localStorage.setItem('plan', selectedPlan);

      // volta para a home
      window.location.href = 'index.html';

    } catch (err) {
      alert('Erro de conexão com o servidor');
    }
  });
});

deleteAccountBtn.addEventListener("click", e => {
  e.stopPropagation();
  deleteConfirm.classList.remove("hidden");
});

cancelDelete.addEventListener("click", () => {
  deleteConfirm.classList.add("hidden");
});

confirmDelete.addEventListener("click", async () => {
  confirmDelete.disabled = true;
  confirmDelete.textContent = "Deleting...";

  try {
    const res = await fetch("http://localhost:3000/delete-account", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!res.ok) throw new Error();

    // limpar tudo
    localStorage.clear();

    // redirect final
    window.location.href = "login.html";
  } catch {
    confirmDelete.disabled = false;
    confirmDelete.textContent = "Yes, delete";
  }
});
