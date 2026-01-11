const api = chrome; // MV3 is chrome-first

const setup = document.getElementById("setup");
const dashboard = document.getElementById("dashboard");
const statsDiv = document.getElementById("stats");

const cfInput = document.getElementById("cf");
const lcInput = document.getElementById("lc");
const ccInput = document.getElementById("cc");

const saveBtn = document.getElementById("save");
const editBtn = document.getElementById("edit");

// ---------- render ----------
function renderStats(data) {
  statsDiv.innerHTML = "";
  for (const key in data) {
    const p = document.createElement("p");
    p.textContent = `${key}: ${data[key]}`;
    statsDiv.appendChild(p);
  }
}

// ---------- on popup open ----------
document.addEventListener("DOMContentLoaded", async () => {
  const res = await api.storage.local.get(["users", "stats"]);

  if (!res.users) {
    setup.style.display = "block";
    dashboard.style.display = "none";
    return;
  }

  setup.style.display = "none";
  dashboard.style.display = "block";

  if ((res.stats?.data)) {
    renderStats(res.stats.data);
  } else {
    statsDiv.textContent = "Loading...";
  }

  // 🔥 fire-and-forget refresh
  api.runtime.sendMessage({ type: "REFRESH_STATS" });
});

// ---------- save usernames ----------
saveBtn.onclick = async () => {
  const users = {
    codeforces: cfInput.value.trim(),
    leetcode: lcInput.value.trim(),
    codechef: ccInput.value.trim()
  };

  await api.storage.local.set({ users });

  setup.style.display = "none";
  dashboard.style.display = "block";
  statsDiv.textContent = "Loading...";

  api.runtime.sendMessage({ type: "REFRESH_STATS" });
};
api.runtime.onMessage.addListener((msg) => {
  if(msg.type==="STATS_DONE"){
    renderStats(msg.data);
  }
});

editBtn.onclick = () => {
  dashboard.style.display = "none";
  setup.style.display = "block";
};
