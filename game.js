/* ===== Daily Cookie ===== */
const RESET_HOUR_UTC = 8; // daily reset at 08:00 UTC

const cookieBtn = document.getElementById("cookie");
const bittenDiv = document.getElementById("bitten");
const countEl = document.getElementById("count");
const statusText = document.getElementById("status-text");
const countdownEl = document.getElementById("countdown");
const crumbLayer = document.getElementById("crumb-layer");
const resetBtn = document.getElementById("reset-data");

// ---- persistent state ----
let state = loadState();

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem("dailyCookie"));
    if (s && typeof s.count === "number" && typeof s.lastEatenUTC === "number") return s;
  } catch (e) { /* corrupted -> fresh */ }
  return { count: 0, lastEatenUTC: null };
}

function saveState() {
  localStorage.setItem("dailyCookie", JSON.stringify(state));
}

// ---- reset window logic ----
function nextResetTime(now) {
  const d = new Date(now);
  const reset = new Date(d.getTime());
  reset.setUTCHours(RESET_HOUR_UTC, 0, 0, 0);
  if (reset <= now) reset.setUTCDate(reset.getUTCDate() + 1);
  return reset.getTime();
}

function lastResetTime(now) {
  return nextResetTime(now) - 24 * 60 * 60 * 1000;
}

function hasEatenToday(now) {
  if (state.lastEatenUTC === null) return false;
  return state.lastEatenUTC >= lastResetTime(now);
}

function refresh(now) {
  countEl.textContent = state.count;
  const eaten = hasEatenToday(now);
  cookieBtn.classList.toggle("hidden", eaten);
  bittenDiv.classList.toggle("hidden", !eaten);
  statusText.textContent = eaten
    ? "You already ate today's cookie 🍪"
    : "Your cookie is ready! Click it!";
}

// ---- countdown to next reset ----
function tick() {
  const now = Date.now();
  const msLeft = nextResetTime(now) - now;
  const h = String(Math.floor(msLeft / 3600000)).padStart(2, "0");
  const m = String(Math.floor((msLeft % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((msLeft % 60000) / 1000)).padStart(2, "0");
  countdownEl.textContent = `Next cookie in ${h}:${m}:${s}`;

  // re-check state each second so the cookie reappears right after a reset
  refresh(now);
}

// ---- click handler ----
cookieBtn.addEventListener("click", (e) => {
  const now = Date.now();
  if (hasEatenToday(now)) return; // one click per day only

  state.count += 1;
  state.lastEatenUTC = now;
  saveState();
  spawnCrumbs(e.clientX, e.clientY);
  refresh(now);
});

function spawnCrumbs(x, y) {
  for (let i = 0; i < 14; i++) {
    const c = document.createElement("div");
    c.className = "crumb";
    c.style.left = x + "px";
    c.style.top = y + "px";
    c.style.width = c.style.height = 4 + Math.random() * 8 + "px";
    crumbLayer.appendChild(c);

    const dx = (Math.random() - 0.5) * 260;
    const dy = -(60 + Math.random() * 140);
    c.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 320}px)`, opacity: 0 }
      ],
      { duration: 700 + Math.random() * 500, easing: "cubic-bezier(.2,.6,.6,1)" }
    ).onfinish = () => c.remove();
  }
}

// ---- optional: clear progress ----
resetBtn.addEventListener("click", () => {
  if (confirm("Reset your cookie count?")) {
    state = { count: 0, lastEatenUTC: null };
    saveState();
    refresh(Date.now());
  }
});

// ---- init ----
refresh(Date.now());
tick();
setInterval(tick, 1000);
