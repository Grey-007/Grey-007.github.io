const CONFIG = {
  typing: {
    text: "Grey",
    typeDelay: 140,
    deleteDelay: 75,
    holdDelay: 1200
  },
  carousel: {
    autoplayDelay: 5000,
    swipeThreshold: 50
  }
};

const PROJECTS = [
  {
    title: "Project Alpha",
    description: "A web application for tracking and managing personal projects, built with a focus on clean UI and fast performance.",
    images: ["images/project-1.png", "images/project-2.png"],
    tags: ["JavaScript", "React", "Node.js", "UI/UX"],
    url: "#"
  },
  {
    title: "Project Beta",
    description: "A mobile-first social media concept with a unique take on content sharing. Designed for privacy and user control.",
    images: ["images/project-2.png", "images/project-3.png", "images/project-1.png"],
    tags: ["Flutter", "Firebase", "Mobile App"],
    url: "#"
  },
  {
    title: "Project Gamma",
    description: "An open-source data visualization library that makes it easy to create beautiful, interactive charts and graphs.",
    images: ["images/project-3.png", "images/project-4.png"],
    tags: ["D3.js", "TypeScript", "Data Viz"],
    url: "#"
  },
  {
    title: "Project Delta",
    description: "A command-line tool for developers to automate repetitive tasks and streamline their workflow.",
    images: ["images/project-4.png"],
    tags: ["Python", "CLI", "Developer Tools"],
    url: "#"
  }
];

const typingTarget = document.getElementById("typing-name");
const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll("nav a");

function setActiveNav(id) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (href === `#${id}`) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initLoader() {
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    setTimeout(() => {
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      setTimeout(() => loader.remove(), 650);
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
      index++;
      setTimeout(tick, typeDelay);
    } else if (!deleting && index === text.length) {
      deleting = true;
      setTimeout(tick, holdDelay);
    } else if (deleting && index > 0) {
      index--;
      typingTarget.textContent = text.slice(0, index);
      setTimeout(tick, deleteDelay);
    } else {
      deleting = false;
      setTimeout(tick, typeDelay * 1.5);
    }
  };

  tick();
}

function createNode(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderProjects() {
    const track = document.getElementById("carousel-track");
    if (!track) return;

    const fragment = document.createDocumentFragment();
    PROJECTS.forEach((project, index) => {
        const card = createNode("div", "project-card");
        card.dataset.index = String(index);
        card.tabIndex = 0;
        card.setAttribute("role", "group");
        card.setAttribute("aria-label", project.title);
        
        const imageWrapper = createNode("div", "project-image-wrapper");
        const imageTrack = createNode("div", "project-image-track");
        
        project.images.forEach(src => {
            const imgContainer = createNode("div", "project-image");
            const img = createNode("img");
            img.src = src;
            img.alt = `${project.title} screenshot`;
            img.loading = "lazy";
            img.decoding = "async";
            img.addEventListener("error", () => {
              imgContainer.classList.add("image-failed");
              img.remove();
            });
            imgContainer.appendChild(img);
            imageTrack.appendChild(imgContainer);
        });
        
        imageWrapper.appendChild(imageTrack);

        if (project.images.length > 1) {
            const nav = createNode("div", "image-nav");
            const prevBtn = createNode("button", "image-nav-btn prev");
            prevBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
            const nextBtn = createNode("button", "image-nav-btn next");
            nextBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';
            nav.append(prevBtn, nextBtn);
            imageWrapper.appendChild(nav);

            let currentImg = 0;
            const updateImagePos = () => {
                imageTrack.style.transform = `translateX(-${currentImg * 100}%)`;
            }

            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImg = (currentImg + 1) % project.images.length;
                updateImagePos();
            });
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentImg = (currentImg - 1 + project.images.length) % project.images.length;
                updateImagePos();
            });
        }

        const content = createNode("div", "project-content");
        content.appendChild(createNode("h3", null, project.title));
        content.appendChild(createNode("p", null, project.description));

        const tags = createNode("div", "project-tags");
        project.tags.forEach(tag => tags.appendChild(createNode("span", "project-tag", tag)));
        content.appendChild(tags);

        const link = createNode("a", "project-link", "View Project ->");
        link.href = project.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        content.appendChild(link);

        card.append(imageWrapper, content);
        fragment.appendChild(card);
    });

    track.appendChild(fragment);
}


function carouselController() {
  const track = document.getElementById("carousel-track");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let isTransitioning = false;
  let autoplayInterval;
  let touchStartX = 0;
  let touchEndX = 0;
  let pointerStartX = 0;
  let pointerEndX = 0;
  let pointerIsDown = false;

  const getCards = () => Array.from(track.children);
  const totalCards = PROJECTS.length;

  const activateIndex = (nextIndex, { shouldResetAutoplay = true } = {}) => {
    if (isTransitioning) return;
    currentIndex = Math.min(Math.max(nextIndex, 0), totalCards - 1);
    updateCarousel();
    if (shouldResetAutoplay) resetAutoplay();
  };

  const updateCarousel = () => {
    isTransitioning = true;
    const card = getCards()[0];
    const cardWidth = card.offsetWidth;
    const margin = parseFloat(getComputedStyle(card).marginRight); // Only right margin
    const totalCardWidth = cardWidth + margin * 2; // Symmetrical margins
    const viewportWidth = track.parentElement.offsetWidth;
    
    // Center the active card
    const newTransform = (viewportWidth / 2) - (cardWidth / 2) - (currentIndex * totalCardWidth);

    track.style.transform = `translateX(${newTransform}px)`;

    getCards().forEach((card, index) => {
      card.classList.toggle("active", index === currentIndex);
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 600);
  };

  const showNext = () => {
    if (isTransitioning) return;
    currentIndex = (currentIndex + 1) % totalCards;
    updateCarousel();
    resetAutoplay();
  };

  const showPrev = () => {
    if (isTransitioning) return;
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
    updateCarousel();
    resetAutoplay();
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayInterval = setInterval(showNext, CONFIG.carousel.autoplayDelay);
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  const handleVisibilityChange = () => {
    document.hidden ? stopAutoplay() : resetAutoplay();
  };

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  };

  const handleTouchMove = (e) => {
    touchEndX = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > CONFIG.carousel.swipeThreshold) {
      diff > 0 ? showNext() : showPrev();
    }
    startAutoplay();
  };

  const handlePointerDown = (e) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    if (e.button !== 0) return;
    if (e.target?.closest?.("a, button")) return;
    pointerIsDown = true;
    pointerStartX = e.clientX;
    pointerEndX = e.clientX;
    stopAutoplay();
    track.classList.add("dragging");
    track.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!pointerIsDown) return;
    pointerEndX = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (!pointerIsDown) return;
    pointerIsDown = false;
    track.classList.remove("dragging");
    const diff = pointerStartX - pointerEndX;
    if (Math.abs(diff) > CONFIG.carousel.swipeThreshold) {
      diff > 0 ? showNext() : showPrev();
    } else {
      startAutoplay();
    }
    track.releasePointerCapture?.(e.pointerId);
  };

  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  track.addEventListener("touchstart", handleTouchStart, { passive: true });
  track.addEventListener("touchmove", handleTouchMove, { passive: true });
  track.addEventListener("touchend", handleTouchEnd);
  track.addEventListener("pointerdown", handlePointerDown);
  track.addEventListener("pointermove", handlePointerMove);
  track.addEventListener("pointerup", handlePointerUp);
  track.addEventListener("pointercancel", handlePointerUp);

  renderProjects();
  track.addEventListener("click", (e) => {
    const card = e.target?.closest?.(".project-card");
    if (!card || e.target?.closest?.("a, button")) return;
    const index = Number(card.dataset.index);
    if (Number.isFinite(index) && index !== currentIndex) activateIndex(index);
  });
  track.addEventListener("keydown", (e) => {
    const card = e.target?.closest?.(".project-card");
    if (!card) return;
    const index = Number(card.dataset.index);
    if (!Number.isFinite(index)) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (index !== currentIndex) activateIndex(index);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      showPrev();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      showNext();
    }
  });
  updateCarousel();
  startAutoplay();
  window.addEventListener("resize", updateCarousel);
}


function initNavScroll() {
  const header = document.querySelector(".site-header");
  const headerOffset = (header?.offsetHeight ?? 0) + 12;

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const selector = link.getAttribute("href");
      if (!selector) return;
      const target = document.querySelector(selector);
      if (!target) return;

      const top = Math.max(0, target.offsetTop - headerOffset);
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

function initActiveSectionObserver() {
  if (!("IntersectionObserver" in window)) return;
  const header = document.querySelector(".site-header");
  const headerOffset = (header?.offsetHeight ?? 0) + 12;

  const sectionState = new Map();
  const pickBest = () => {
    let bestId = null;
    let bestRatio = 0;

    sections.forEach(section => {
      const id = section.getAttribute("id");
      if (!id) return;
      const state = sectionState.get(id);
      if (!state?.isIntersecting) return;
      if (state.ratio > bestRatio) {
        bestRatio = state.ratio;
        bestId = id;
      }
    });

    if (bestId) setActiveNav(bestId);
  };

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute("id");
        if (!id) return;
        sectionState.set(id, { isIntersecting: entry.isIntersecting, ratio: entry.intersectionRatio });
      });
      pickBest();
    },
    {
      threshold: [0.1, 0.25, 0.45, 0.65],
      rootMargin: `-${headerOffset}px 0px -55% 0px`
    }
  );

  sections.forEach(section => observer.observe(section));
  pickBest();
}

function initReveal() {
  const revealElements = document.querySelectorAll(".hidden-section");
  if (revealElements.length === 0 || !("IntersectionObserver" in window)) return;

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach(el => {
    el.classList.add("hidden-section");
    revealObserver.observe(el);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initTyping();
  initNavScroll();
  initActiveSectionObserver();
  carouselController();
  initReveal();
});
