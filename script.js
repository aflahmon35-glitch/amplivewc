/* =========================
   AMP LIVE V1 SCRIPT
   ========================= */

/* -------------------------
   THEME SYSTEM
------------------------- */

const themeBtn = document.getElementById("themeToggle");

// Load saved theme
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

/* -------------------------
   TAB SYSTEM
------------------------- */

const tabs = document.querySelectorAll(".tab");
let currentTab = "today";

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    currentTab = tab.dataset.tab;
    loadMatches();
  });
});

/* -------------------------
   FETCH MATCH DATA
------------------------- */

let matchesData = [];

async function fetchMatches() {
  try {
    const res = await fetch("data/matches.json");
    matchesData = await res.json();
    loadMatches();
  } catch (err) {
    console.log("Error loading matches.json", err);
  }
}

/* -------------------------
   FILTER MATCHES BY TAB
------------------------- */

function filterMatches() {
  const now = new Date();

  return matchesData.filter(match => {
    const matchTime = new Date(match.kickoff);

    if (currentTab === "today") {
      return isSameDay(now, matchTime);
    }

    if (currentTab === "yesterday") {
      const y = new Date();
      y.setDate(now.getDate() - 1);
      return isSameDay(y, matchTime);
    }

    if (currentTab === "tomorrow") {
      const t = new Date();
      t.setDate(now.getDate() + 1);
      return isSameDay(t, matchTime);
    }

    return true;
  });
}

function isSameDay(d1, d2) {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

/* -------------------------
   STATUS CALCULATION
------------------------- */

function getMatchStatus(matchTime) {
  const now = new Date();
  const diff = new Date(matchTime) - now;

  if (diff <= 0 && diff > -2 * 60 * 60 * 1000) {
    return "live";
  }

  if (diff > 0) {
    return "upcoming";
  }

  return "ft";
}

/* -------------------------
   RENDER MATCHES
------------------------- */

function loadMatches() {
  const grid = document.getElementById("matchGrid");
  grid.innerHTML = "";

  const matches = filterMatches();

  matches.forEach(match => {
    const status = getMatchStatus(match.kickoff);

    const card = document.createElement("div");
    card.className = `match-card ${status}`;

    card.innerHTML = `
      <div class="status-bar ${status}"></div>

      <div class="match-top">
        <div class="team">
          <img src="images/${match.home}.png" />
          <span>${match.home}</span>
        </div>

        <div class="vs">VS</div>

        <div class="team">
          <img src="images/${match.away}.png" />
          <span>${match.away}</span>
        </div>
      </div>

      <div class="match-info">
        <div class="time">${formatTime(match.kickoff)}</div>
        <div class="badge ${status}">${status.toUpperCase()}</div>
      </div>
    `;

    // Click → go to match page
    card.addEventListener("click", () => {
      localStorage.setItem("selectedMatch", JSON.stringify(match));
      window.location.href = "match.html";
    });

    grid.appendChild(card);
  });
}

/* -------------------------
   TIME FORMAT
------------------------- */

function formatTime(time) {
  const date = new Date(time);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* -------------------------
   INIT
------------------------- */

fetchMatches();
