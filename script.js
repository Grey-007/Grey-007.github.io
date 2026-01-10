/* ============================
   CONFIG
============================ */
const GITHUB_USERNAME = "Grey-007"; // ← change if needed
const REPO_CONTAINER = document.getElementById("repo-container");
const TYPING_TARGET = document.getElementById("typing-name");
const TOTAL_REPOS = document.getElementById("total-repos");
const TOTAL_STARS = document.getElementById("total-stars");
const TOTAL_COMMITS = document.getElementById("total-commits");

function saveStat(key, value) {
  localStorage.setItem(key, value);
}

function loadStat(key, fallback = 0) {
  return Number(localStorage.getItem(key)) || fallback;
}

/* ============================
   LOADER
============================ */
window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
  }, 900);
});

/* ===== TYPING LOOP ===== */
const nameText = "Grey";
const el = document.getElementById("typing-name");
let i = 0;
let deleting = false;

function typing() {
  if (!deleting && i < nameText.length) {
    el.textContent += nameText[i++];
  } else if (deleting && i > 0) {
    el.textContent = nameText.slice(0, --i);
  } else {
    deleting = !deleting;
  }
  setTimeout(typing, deleting ? 80 : 300);
}
typing();

/* ============================
   FETCH GITHUB REPOS (ONLY)
============================ */
async function fetchReposAndStats() {
  try {
    const repoRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`
    );

    if (!repoRes.ok) throw new Error("Rate limited");

    const repos = await repoRes.json();
    if (!Array.isArray(repos)) throw new Error("Invalid response");

    REPO_CONTAINER.innerHTML = "";

    repos.forEach(repo => {
      if (repo.fork) return;
      REPO_CONTAINER.appendChild(createRepoCard(repo));
    });

  } catch (err) {
    console.error("Failed to fetch repositories", err);
    REPO_CONTAINER.innerHTML =
      "<p style='opacity:0.6;text-align:center'>Failed to load projects.</p>";
  }
}

/* ============================
   CREATE REPO CARD
============================ */
function createRepoCard(repo) {
  const card = document.createElement("div");
  card.className = "repo-card";

  // GitHub OpenGraph screenshot
  const screenshot = `https://opengraph.githubassets.com/1/${repo.full_name}`;

  card.innerHTML = `
    <div class="repo-image">
      <img src="${screenshot}" alt="${repo.name} preview" loading="lazy">
    </div>

    <div class="repo-content">
      <h3>${repo.name}</h3>
      <p>${repo.description || "No description provided."}</p>

      <div class="repo-meta">
        ⭐ ${repo.stargazers_count}
        · 🍴 ${repo.forks_count}
      </div>

      <a href="${repo.html_url}" target="_blank" rel="noopener">
        View Repository →
      </a>
    </div>
  `;

  return card;
}

/* ============================
   SMOOTH HEADER SCROLL
============================ */
document.querySelectorAll("nav a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/* ============================
   INIT
============================ */
fetchReposAndStats()


