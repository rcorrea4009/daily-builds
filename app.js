const GITHUB_REPO = "https://github.com/rcorrea4009/daily-builds";

const grid = document.getElementById("grid");
const filtersEl = document.getElementById("filters");

let projects = [];
let activeCategory = "All";

function cardHtml(project) {
  const codeUrl = `${GITHUB_REPO}/tree/main/${project.repoPath}`;
  const demoLink = project.demo
    ? `<a class="primary" href="${project.path}" target="_blank" rel="noopener">Play</a>`
    : "";
  return `
    <article class="card">
      <span class="day-tag">Day ${String(project.day).padStart(2, "0")}</span>
      <h2>${project.title}</h2>
      <span class="category">${project.category}</span>
      <p class="desc">${project.description}</p>
      <div class="tags">${project.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      <div class="actions">
        ${demoLink}
        <a href="${codeUrl}" target="_blank" rel="noopener">View Code</a>
      </div>
    </article>
  `;
}

function render() {
  const filtered = activeCategory === "All" ? projects : projects.filter((p) => p.category === activeCategory);
  grid.innerHTML = filtered
    .slice()
    .sort((a, b) => b.day - a.day)
    .map(cardHtml)
    .join("");
}

function renderFilters() {
  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  filtersEl.innerHTML = categories
    .map((c) => `<button data-category="${c}" class="${c === activeCategory ? "active" : ""}">${c}</button>`)
    .join("");

  filtersEl.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      renderFilters();
      render();
    });
  });
}

fetch("manifest.json")
  .then((res) => res.json())
  .then((data) => {
    projects = data;
    renderFilters();
    render();
  })
  .catch(() => {
    grid.innerHTML = `<p style="color:#8b90b5">Could not load manifest.json — if you opened this file directly, serve it over a local server instead (file:// blocks fetch).</p>`;
  });
