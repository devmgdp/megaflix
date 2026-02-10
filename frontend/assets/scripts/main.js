// =========================
// ELEMENTS
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const genreSelect = document.querySelector(".filter-dropdowns .genre");
  const yearSelect = document.querySelector(".filter-dropdowns .year");
  const radios = document.querySelectorAll('input[name="grade"]');
  const grid = document.querySelector(".movies-grid");
  const movieCards = Array.from(document.querySelectorAll(".movie-card"));
  const movies = document.querySelectorAll(".movie-card");
  const searchInput = document.querySelector(".navbar-form-search");
  const searchResults = document.querySelector(".search-results");
  const closeSearchBtn = document.querySelector(".navbar-form-close");
  const searchForm = document.querySelector(".navbar-form");
  const userDropdown = document.getElementById("userDropdown");
  const userPlanText = document.getElementById("userPlan");
  const changePlanBtn = document.getElementById("changePlanBtn");
  const cancelPlanBtn = document.getElementById("cancelPlanBtn");
  const cancelConfirm = document.getElementById("cancelConfirm");
  const confirmCancelBtn = document.getElementById("confirmCancelBtn");
  const cancelCancelBtn = document.getElementById("cancelCancelBtn");

  const signinBtn = document.getElementById("signinBtn");
  const userMenu = document.getElementById("userMenu");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  const token = localStorage.getItem("token");
  const plan = localStorage.getItem("plan");

  // =========================
  // STATE (controle central)
  // =========================
  let currentGenre = "all genres";
  let currentYear = "all years";
  let currentSort = "featured";
  let showOnlyFavorites = false;

  // =========================
  // Token and Plans Verify
  // =========================
  if (!token) {
    window.location.href = "login.html";
  }

  if (token && !plan) {
    window.location.href = "plans.html";
  }

  // =========================
  // AUTH UI
  // =========================
  function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  }

  async function loadUser() {
    if (!token) return;

    const res = await fetch("http://localhost:3000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    const user = await res.json();

    signinBtn.style.display = "none";
    userMenu.style.display = "flex";

    userName.textContent = `Hello, ${user.username}`;
    if (mobileUserName) {
      mobileUserName.textContent = `Hello, ${user.username}. Your plan is ${user.plan ?? "None"}`;
    }
    userPlanText.textContent = `Plan: ${user.plan ?? "None"}`;
  }

  loadUser();

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.reload();
  });

  // =========================
  // FILTER + SORT (CORE)
  // =========================
  function applyFilters() {
    movieCards.forEach((card) => {
      let visible = true;

      // GENRE
      if (currentGenre !== "all genres") {
        const genres = card.dataset.genre.split(",");
        if (!genres.includes(currentGenre)) visible = false;
      }

      // YEAR
      if (currentYear !== "all years") {
        const year = Number(card.dataset.year);
        const [start, end] = currentYear.split("-").map(Number);
        if (year < start || year > end) visible = false;
      }

      // FAVORITES
      if (showOnlyFavorites && !card.classList.contains("favorite")) {
        visible = false;
      }

      card.hidden = !visible;
    });

    applySort();
  }

  function applySort() {
    if (currentSort === "favorites") return;

    const visibleCards = movieCards.filter((card) => !card.hidden);

    visibleCards.sort((a, b) => {
      if (currentSort === "newest") {
        return b.dataset.year - a.dataset.year;
      }

      if (currentSort === "popular") {
        return b.dataset.rating - a.dataset.rating;
      }

      if (currentSort === "featured") {
        return (
          (b.dataset.featured === "true") - (a.dataset.featured === "true")
        );
      }

      return 0;
    });

    visibleCards.forEach((card) => grid.appendChild(card));
  }

  // abrir / fechar menu ao clicar no nome
  userName.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle("hidden");
  });

  // fechar clicando fora
  document.addEventListener("click", () => {
    userDropdown.classList.add("hidden");
  });

  // mudar plano
  changePlanBtn.addEventListener("click", () => {
    window.location.href = "plans.html";
  });

  // abrir confirmação
  cancelPlanBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cancelConfirm.classList.remove("hidden");
    cancelPlanBtn.classList.add("hidden");
  });

  // NÃO fechar dropdown ao clicar dentro
  cancelConfirm.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // confirmar cancelamento
  confirmCancelBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    confirmCancelBtn.disabled = true;
    confirmCancelBtn.textContent = "Cancelling...";

    try {
      const res = await fetch("http://localhost:3000/cancel-plan", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed");

      localStorage.removeItem("plan");
      window.location.href = "plans.html";
    } catch (err) {
      confirmCancelBtn.disabled = false;
      confirmCancelBtn.textContent = "Yes";
      console.error(err);
    }
  });

  // cancelar ação
  cancelCancelBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    cancelConfirm.classList.add("hidden");
    cancelPlanBtn.classList.remove("hidden");
  });

  // =========================
  // EVENTS
  // =========================
  genreSelect.addEventListener("change", () => {
    currentGenre = genreSelect.value;
    applyFilters();
  });

  yearSelect.addEventListener("change", () => {
    currentYear = yearSelect.value;
    applyFilters();
  });

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      currentSort = radio.id;
      showOnlyFavorites = radio.id === "favorites";
      applyFilters();
    });
  });

  // =========================
  // FAVORITES (API)
  // =========================
  document.querySelectorAll(".bookmark").forEach((bookmark) => {
    bookmark.addEventListener("click", async (e) => {
      if (!token) {
        window.location.href = "login.html";
        return;
      }

      const card = e.target.closest(".movie-card");
      const movieId = card.dataset.movieId;
      const icon = bookmark.querySelector("ion-icon");

      const isFav = icon.name === "bookmark";

      const method = isFav ? "DELETE" : "POST";
      const url = isFav
        ? `http://localhost:3000/favorites/${movieId}`
        : `http://localhost:3000/favorites`;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: isFav ? null : JSON.stringify({ movieId }),
      });

      if (isFav) {
        icon.name = "bookmark-outline";
        card.classList.remove("favorite");
      } else {
        icon.name = "bookmark";
        card.classList.add("favorite");
      }

      applyFilters();
    });
  });

  // =========================
  // LOAD FAVORITES
  // =========================
  async function loadFavorites() {
    if (!token) return;

    const res = await fetch("http://localhost:3000/favorites", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const favorites = await res.json();

    movieCards.forEach((card) => {
      if (favorites.includes(card.dataset.movieId)) {
        card.classList.add("favorite");
        card.querySelector(".bookmark ion-icon").name = "bookmark";
      }
    });

    applyFilters();
  }

  loadFavorites();

  // impede submit
  searchForm.addEventListener("submit", (e) => e.preventDefault());

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (!query) {
      searchResults.classList.add("hidden");
      return;
    }

    const matches = movieCards.filter((card) =>
      card.dataset.title.toLowerCase().includes(query),
    );

    if (!matches.length) {
      searchResults.innerHTML = `<p style="color:#aaa;padding:8px;">No results</p>`;
      searchResults.classList.remove("hidden");
      return;
    }

    matches.slice(0, 6).forEach((card) => {
      const img = card.querySelector("img").src;
      const title = card.dataset.title;

      const item = document.createElement("div");
      item.className = "search-item";

      item.innerHTML = `
      <img src="${img}">
      <span>${title}</span>
    `;

      item.addEventListener("click", () => {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        searchResults.classList.add("hidden");
        searchInput.value = "";
      });

      searchResults.appendChild(item);
    });

    searchResults.classList.remove("hidden");
  });

  // botão fechar
  closeSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchResults.classList.add("hidden");
  });

  // fecha ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar-form")) {
      searchResults.classList.add("hidden");
    }
  });

  // =========================
  // MOBILE MENU
  // =========================
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMobileMenu = document.getElementById("closeMobileMenu");

  const mobileUserName = document.getElementById("mobileUserName");
  const mobileChangePlan = document.getElementById("mobileChangePlan");
  const mobileCancelPlan = document.getElementById("mobileCancelPlan");
  const mobileLogout = document.getElementById("mobileLogout");

  // abrir menu
  menuBtn?.addEventListener("click", () => {
    mobileMenu.classList.remove("hidden");
  });

  // fechar menu (X)
  closeMobileMenu?.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
  });

  // fechar ao clicar em qualquer link
  mobileMenu?.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("mobile-link") ||
      e.target.tagName === "BUTTON"
    ) {
      mobileMenu.classList.add("hidden");
    }
  });

  mobileChangePlan?.addEventListener("click", () => {
    changePlanBtn.click();
  });

  mobileCancelPlan?.addEventListener("click", async () => {
    const confirmCancel = confirm("Do you want to cancel your plan?");
    if (!confirmCancel) return;

    try {
      const res = await fetch("http://localhost:3000/cancel-plan", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed");

      localStorage.removeItem("plan");
      window.location.href = "plans.html";
    } catch (err) {
      alert("Error cancelling plan");
      console.error(err);
    }
  });

  mobileLogout?.addEventListener("click", () => {
    logoutBtn.click();
  });
});
