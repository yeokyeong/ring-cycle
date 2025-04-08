chrome.runtime.onInstalled.addListener(() => {
  console.info("RingCycle successfully installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_ALARMS") {
    message.times.forEach((timestamp, index) => {
      chrome.alarms.create(`ringAlarm_${timestamp}`, { when: timestamp });
    });
  } else if (message.type === "REMOVE_ALARMS") {
    chrome.alarms.clearAll();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "./images/ring-cycle-logo_128.png",
    title: "🔔 RingCycle 알람",
    message: "설정된 시간이 되었어요!",
    priority: 2,
  });
});
