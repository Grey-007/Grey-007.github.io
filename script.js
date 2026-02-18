const CONFIG = {
  githubUsername: "Grey-007",
  maxRepos: 12,
  typing: {
    text: "Grey",
    typeDelay: 140,
    deleteDelay: 75,
    holdDelay: 1200
  }
};

const repoContainer = document.getElementById("repo-container");
const typingTarget = document.getElementById("typing-name");
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll("nav a");

function initLoader() {
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;

    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";

      setTimeout(() => {
        loader.remove();
      }, 650);
    }, 650);
  });
}

function initTyping() {
  if (!typingTarget) return;

  const { text, typeDelay, deleteDelay, holdDelay } = CONFIG.typing;
  let index = 0;
  let deleting = false;

  const tick = () => {
    if (!deleting && index < text.length) {
      typingTarget.textContent += text[index];
      index += 1;
      setTimeout(tick, typeDelay);
      return;
    }

    if (!deleting && index === text.length) {
      deleting = true;
      setTimeout(tick, holdDelay);
      return;
    }

    if (deleting && index > 0) {
      index -= 1;
      typingTarget.textContent = text.slice(0, index);
      setTimeout(tick, deleteDelay);
      return;
    }

    deleting = false;
    setTimeout(tick, typeDelay * 1.5);
  };

  tick();
}

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function createRepoCard(repo) {
  const card = createNode("article", "repo-card");
  card.setAttribute("role", "listitem");

  const imageWrap = createNode("div", "repo-image");
  const img = document.createElement("img");
  img.src = `https://opengraph.githubassets.com/1/${repo.full_name}`;
  img.alt = `${repo.name} preview`;
  img.loading = "lazy";
  img.decoding = "async";
  imageWrap.appendChild(img);

  const content = createNode("div", "repo-content");
  const title = createNode("h3", "", repo.name);
  const description = createNode("p", "", repo.description || "No description provided.");
  const meta = createNode("div", "repo-meta", `Stars ${repo.stargazers_count} | Forks ${repo.forks_count}`);

  const link = createNode("a", "", "View Repository ->");
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  content.append(title, description, meta, link);
  card.append(imageWrap, content);

  return card;
}

function renderRepoState(message) {
  repoContainer.innerHTML = "";
  const info = createNode("p", "repo-status", message);
  repoContainer.appendChild(info);
}

async function fetchRepos() {
  const endpoint = `https://api.github.com/users/${CONFIG.githubUsername}/repos?per_page=100&sort=updated`;
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }

  const repos = await response.json();
  if (!Array.isArray(repos)) throw new Error("GitHub response was not an array");

  return repos
    .filter(repo => !repo.fork)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, CONFIG.maxRepos);
}

async function loadRepos() {
  if (!repoContainer) return;

  renderRepoState("Loading projects...");

  try {
    const repos = await fetchRepos();

    if (!repos.length) {
      renderRepoState("No public projects found yet.");
      return;
    }

    repoContainer.innerHTML = "";
    repos.forEach(repo => {
      repoContainer.appendChild(createRepoCard(repo));
    });
  } catch (error) {
    console.error("Failed to fetch repositories", error);
    renderRepoState("Failed to load projects. Please try again later.");
  }
}

function initNavScroll() {
  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const selector = link.getAttribute("href");
      if (!selector) return;

      const target = document.querySelector(selector);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initActiveSectionObserver() {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        if (!id) return;

        navLinks.forEach(link => {
          const isActive = link.getAttribute("href") === `#${id}`;
          if (isActive) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-10% 0px -45%"
    }
  );

  sections.forEach(section => observer.observe(section));
}

initLoader();
initTyping();
initNavScroll();
initActiveSectionObserver();
loadRepos();
