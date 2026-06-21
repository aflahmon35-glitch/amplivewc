let matchesData = [];
let currentTab = "today";

/* THEME */
const themeBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
  themeBtn.innerText = "☀️";
}

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    localStorage.setItem("theme", "light");
    themeBtn.innerText = "☀️";
  } else {
    localStorage.setItem("theme", "dark");
    themeBtn.innerText = "🌙";
  }
});

/* TABS */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentTab = tab.dataset.tab;
    loadMatches();
  });
});

/* FETCH DATA */
async function fetchMatches() {
  const res = await fetch("data/matches.json");
  matchesData = await res.json();
  loadMatches();
}

/* FILTER */
function filterMatches() {
  const now = new Date();

  return matchesData.filter(m => {
    const matchTime = new Date(m.kickoff);

    if (currentTab === "today") return isSameDay(now, matchTime);

    if (currentTab === "yesterday") {
      let y = new Date();
      y.setDate(now.getDate() - 1);
      return isSameDay(y, matchTime);
    }

    if (currentTab === "tomorrow") {
      let t = new Date();
      t.setDate(now.getDate() + 1);
      return isSameDay(t, matchTime);
    }
  });
}

function isSameDay(d1, d2) {
  return d1.getDate() === d2.getDate() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getFullYear() === d2.getFullYear();
}

/* STATUS */
function getStatus(time) {
  const now = new Date();
  const diff = new Date(time) - now;

  if (diff <= 0 && diff > -2 * 60 * 60 * 1000) return "live";
  if (diff > 0) return "upcoming";
  return "ft";
}

/* RENDER */
function loadMatches() {
  const grid = document.getElementById("matchGrid");
  grid.innerHTML = "";

  filterMatches().forEach(m => {
    const status = getStatus(m.kickoff);

    const card = document.createElement("div");
    card.className = `match-card ${status}`;

    card.innerHTML = `
      <div class="status-bar ${status}"></div>

      <div class="match-top">
        <div class="team">
          <img src="images/${m.home}.png">
          <span>${m.home}</span>
        </div>

        <div class="vs">VS</div>

        <div class="team">
          <img src="images/${m.away}.png">
          <span>${m.away}</span>
        </div>
      </div>

      <div class="match-info">
        <div class="time">${new Date(m.kickoff).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
        <div class="badge ${status}">${status.toUpperCase()}</div>
      </div>
    `;

    card.onclick = () => {
      localStorage.setItem("selectedMatch", JSON.stringify(m));
      window.location.href = "match.html";
    };

    grid.appendChild(card);
  });
}
/* =========================
   MATCH PAGE LOGIC
========================= */

if (window.location.pathname.includes("match.html")) {
  const match = JSON.parse(localStorage.getItem("selectedMatch"));

  if (match) {
    document.getElementById("homeTeam").innerText = match.home;
    document.getElementById("awayTeam").innerText = match.away;

    document.getElementById("competition").innerText = match.competition;
    document.getElementById("stadium").innerText = match.stadium;

    document.getElementById("homeFlag").src = `images/${match.home}.png`;
    document.getElementById("awayFlag").src = `images/${match.away}.png`;

    document.getElementById("kickoff").innerText =
      new Date(match.kickoff).toLocaleString();

    loadStreams(match.streams);
    startCountdown(match.kickoff);
  }
}

/* STREAMS */
function loadStreams(streams) {
  const container = document.getElementById("streamList");
  container.innerHTML = "";

  streams.forEach(s => {
    const btn = document.createElement("div");
    btn.className = "stream-btn";
    btn.innerText = s.text;

    btn.onclick = () => {
      localStorage.setItem("streamUrl", s.url);
      window.location.href = "player.html";
    };

    container.appendChild(btn);
  });
}

/* COUNTDOWN */
function startCountdown(time) {
  const el = document.getElementById("countdown");
  const badge = document.getElementById("statusBadge");

  function update() {
    const now = new Date().getTime();
    const target = new Date(time).getTime();
    const diff = target - now;

    if (diff <= 0) {
      badge.innerText = "LIVE";
      badge.style.background = "#ef4444";
      el.innerText = "LIVE NOW";
      return;
    }

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    el.innerText = `${h}h ${m}m ${s}s`;

    setTimeout(update, 1000);
  }

  update();
}

fetchMatches();

/* =========================
   PLAYER PAGE LOGIC
========================= */

if (window.location.pathname.includes("player.html")) {
  const url = localStorage.getItem("streamUrl");

  const frame = document.getElementById("streamFrame");

  if (url) {
    frame.src = url;
  } else {
    frame.innerHTML = "No stream selected";
  }
}

/* BACK */
function goBack() {
  window.history.back();
}

/* REFRESH */
function refreshStream() {
  const frame = document.getElementById("streamFrame");
  frame.src = frame.src;
}

/* FULLSCREEN */
function toggleFull() {
  const frame = document.getElementById("streamFrame");

  if (frame.requestFullscreen) {
    frame.requestFullscreen();
  }
}

/* SHARE */
function shareStream() {
  const url = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: "AMP LIVE Stream",
      url: url
    });
  } else {
    alert("Sharing not supported");
  }
}

/* WHATSAPP */
function openWhatsApp() {
  window.open("https://chat.whatsapp.com/JPj6VATmC1TLdunL4VisOs", "_blank");
}
