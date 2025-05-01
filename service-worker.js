chrome.runtime.onInstalled.addListener(() => {
  console.info("RingCycle successfully installed");
});

chrome.runtime.onMessage.addListener(handleOnMessages);

async function handleOnMessages(message) {
  switch (message.type) {
    case "SET_ALARMS":
      let result = await chrome.storage.local.get("times");
      const times = result.times;
      try {
        times.forEach((timestamp, index) => {
          chrome.alarms.create(`ringAlarm_${timestamp}`, { when: timestamp });
        });
      } catch (error) {
        console.error(error);
      }
      break;
    case "REMOVE_ALARMS":
      chrome.alarms.clearAll();
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
}

//TODO : show next alarm time
// onAlarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (isSameTimeByMinute(alarm.scheduledTime, Date.now())) {
    requestToOffScreen();

    chrome.notifications.create({
      type: "basic",
      iconUrl: "./src/ring-cycle-logo_128.png",
      title: "🔔 RingCycle 알람",
      message: "설정된 시간이 되었어요!",
      priority: 2,
      silent: true,
    });
  }
});

/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */
async function requestToOffScreen(
  source = "./src/ring-cycle-sound.mp3",
  volume = 0.7
) {
  await createOffscreen();

  await chrome.runtime.sendMessage({
    type: "SET_SOUND",
    target: "offscreen-doc",
    play: { source, volume },
  });
}

async function createOffscreen() {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "play sound for alert",
  });
}

function isSameTimeByMinute(timestamp1, timestamp2) {
  const minute1 = Math.floor(timestamp1 / 60000); // 60,000 밀리초 = 1분
  const minute2 = Math.floor(timestamp2 / 60000);

  return minute1 === minute2;
}
