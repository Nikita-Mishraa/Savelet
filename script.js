let links = JSON.parse(localStorage.getItem("links")) || [];

const cardContainer = document.getElementById("cardContainer");
const filterSection = document.getElementById("filterSection");

document.getElementById("saveBtn").addEventListener("click", () => {
  const url = linkUrl.value;
  const title = linkTitle.value;
  const tag = linkTag.value.toLowerCase();

  if (!url || !title || !tag) return alert("Fill all fields");

  links.push({ url, title, tag });
  localStorage.setItem("links", JSON.stringify(links));

  linkUrl.value = "";
  linkTitle.value = "";
  linkTag.value = "";

  render();
});

function render(filter = "all") {
  cardContainer.innerHTML = "";
  let filtered = filter === "all" ? links : links.filter(l => l.tag === filter);

  filtered.forEach((link, index) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span class="delete" onclick="deleteLink(${index})">🗑</span>
      <h3>${link.title}</h3>
      <p class="tag">#${link.tag}</p>
      <a href="${link.url}" target="_blank">Open</a>
    `;

    cardContainer.appendChild(card);
  });

  renderFilters();
}

function deleteLink(index) {
  links.splice(index, 1);
  localStorage.setItem("links", JSON.stringify(links));
  render();
}

function renderFilters() {
  const tags = ["all", ...new Set(links.map(l => l.tag))];
  filterSection.innerHTML = "";

  tags.forEach(tag => {
    const btn = document.createElement("button");
    btn.innerText = tag;
    btn.onclick = () => render(tag);
    filterSection.appendChild(btn);
  });
}

render();
