import reloadOnUpdate from "virtual:reload-on-update-in-background-script";
import browser from "webextension-polyfill";
import { onMessage, sendMessage } from "webext-bridge/background";

import { ThreadsAPI } from "./threadsAPI";

reloadOnUpdate("pages/background");

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate("pages/content/style.scss");

console.log("background loaded");

const threadsAPI = new ThreadsAPI();

let data = {
  username: "",
  milestones: [],
  followers: 0,
  followerHistory: [],
  followerThreshold: 2,
};

// Listens for data requests from the popup script
onMessage("getData", () => {
  return data;
});

// Listens for setting followerThreshold
onMessage("setFollowerThreshold", ({ data: received }) => {
  data.followerThreshold = received.followerThreshold;
  // Save the whole data object
  saveData();
});

// Listens for changes from the popup script
onMessage("setUsername", ({ data: received }) => {
  console.log(received);
  data.username = received.username;
  saveData();
  fetchData();
});

onMessage("setMilestones", ({ data: received }) => {
  data.milestones = received.milestones;
  saveData();
});

onMessage("addMilestone", ({ data: received }) => {
  data.milestones.push(received.milestone);
  saveData();
});

onMessage("removeMilestone", ({ data: received }) => {
  data.milestones = data.milestones.filter(
    (milestone) => milestone.id !== received.id
  );
  saveData();
});

onMessage("updateMilestone", ({ data: received }) => {
  data.milestones = data.milestones.map((milestone) =>
    milestone.id === received.id
      ? { ...milestone, value: received.value }
      : milestone
  );
  saveData();
});

// Loads stored data from local storage at start
chrome.storage.local.get(
  [
    "username",
    "milestones",
    "followers",
    "followerThreshold",
    "followerHistory",
  ],
  (result) => {
    console.log(result);
    data = { ...data, ...result };
  }
);

// Saves the data to local storage
function saveData() {
  chrome.storage.local.set(data);
}

// Example API call, replace with your actual API call
async function fetchData() {
  const username = data.username;
  const id = await threadsAPI.getUserIDfromUsername(username);

  if (!id) {
    return;
  }

  const user = await threadsAPI.getUserProfile(username, id);

  if (user.follower_count !== data.followers) {
    const difference = user.follower_count - data.followers;
    data.followers = user.follower_count;

    // Save follower count with timestamp
    data.followerHistory.push({
      count: user.follower_count,
      timestamp: Date.now(),
    });

    saveData();

    const currentTab = await getCurrentTab();
    console.log(currentTab);

    if (!currentTab) {
      return;
    }

    //   // Notify the popup script of the change
    sendMessage(
      "onDataChange",
      { followers: data.followers, followerHistory: data.followerHistory },
      { tabId: currentTab.id, context: "popup" }
    );

    if (difference >= data.followerThreshold) {
      sendMessage(
        "followerThresholdReached",
        { followers: user.follower_count },
        { tabId: currentTab.id, context: "content-script" }
      );
    }

    for (const milestone of data.milestones) {
      if (milestone.value <= data.followers) {
        // Trigger confetti if milestone reached
        sendMessage(
          "milestoneReached",
          // { followerCount: 5 },
          { followers: milestone.value },
          { tabId: currentTab.id, context: "content-script" }
        );
        // Removes the achieved milestone
        data.milestones = data.milestones.filter((m) => m.id !== milestone.id);
        saveData();
      }
    }
  }
}

async function getCurrentTab() {
  const queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  const [tab] = await browser.tabs.query(queryOptions);
  console.log({ currentTab: tab });

  return tab;
}

// Fetches new data every 5 minutes
setInterval(fetchData, 5 * 60 * 1000);
