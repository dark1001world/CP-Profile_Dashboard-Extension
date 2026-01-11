

async function getUsers() {
  const res = await chrome.storage.local.get("users");
  return res.users;
}

async function fetchCodeforces(handle) {
  const res = await fetch(
    `https://codeforces.com/api/user.info?handles=${handle}`
  );
  const data = await res.json();
  return `Rating: ${data.result[0].rating}`;
}

async function fetchLeetCode(username) {
  const body = {
    query: `
      query {
        matchedUser(username: "${username}") {
          submitStats {
            acSubmissionNum {
              count
            }
          }
        }
      }
    `
  };

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  const solved =
    data.data.matchedUser.submitStats.acSubmissionNum[0].count;

  return `Solved: ${solved}`;
}

async function fetchCodeChef(username) {
  const res = await fetch(`https://www.codechef.com/users/${username}`);
  const html = await res.text();
  const ratingMatch = html.match(/class="rating-number">\s*([0-9]+)/i);
  const rating = ratingMatch ? ratingMatch[1] : "N/A";
  return rating;
}

async function refreshStats() {
  try {
    const users = await getUsers();
    if (!users) return;

    const data = {
      Codeforces: await fetchCodeforces(users.codeforces),
      LeetCode: await fetchLeetCode(users.leetcode),
      CodeChef: await fetchCodeChef(users.codechef)
    };

    await chrome.storage.local.set({
      stats: {
        data,
        updatedAt: Date.now()
      }
    });
    console.log("Stats updated:", data);
    chrome.runtime.sendMessage({
      type:"STATS_DONE",
      data
    });
  } catch (e) {
    console.error("Failed to refresh stats:", e);
  }
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "REFRESH_STATS") {
    refreshStats(); 
  }
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refreshStats", {
    periodInMinutes: 60 
  });
});
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshStats") {
    refreshStats();
  }
});
