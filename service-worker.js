chrome.runtime.onInstalled.addListener(() => {
  console.info("RingCycle successfully installed");
});

// onMessage
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "SET_ALARMS") {
    let result = await chrome.storage.sync.get("times");
    const times = result.times;
    try {
      times.forEach((timestamp, index) => {
        chrome.alarms.create(`ringAlarm_${timestamp}`, { when: timestamp });
      });
    } catch (error) {
      console.error(error);
    }
  } else if (message.type === "REMOVE_ALARMS") {
    chrome.alarms.clearAll();
  }
});

//TODO : show next alarm time
// onAlarm
chrome.alarms.onAlarm.addListener((alarm) => {
  playSound();

  chrome.notifications.create({
    type: "basic",
    iconUrl: "./src/ring-cycle-logo_128.png",
    title: "🔔 RingCycle 알람",
    message: "설정된 시간이 되었어요!",
    priority: 2,
    silent: true,
  });
});

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function playSound(source = "./src/ring-cycle-sound.mp3", volume = 1) {
  await createOffscreen();
  await chrome.runtime.sendMessage({ play: { source, volume } });
}

// Create the offscreen document if it doesn't already exist
async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "testing", // details for using the API
  });
}
