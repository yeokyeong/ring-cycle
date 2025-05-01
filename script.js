import { formatDate, getDateOnly } from "./format.js";
import { testTimes, yesterdayTimestamp } from "./test/testData.js";

// TODO : save multiple alerts
let alertList = [];

// set TimePicker
const TimePicker = tui.TimePicker;

const startTimeContainer = new TimePicker(
  document.getElementById("time-picker-start"),
  {
    initialHour: 9,
    initialMinute: 50,
    inputType: "spinbox",
    showMeridiem: false,
  }
);
const endTimeContainer = new TimePicker(
  document.getElementById("time-picker-end"),
  {
    initialHour: 18,
    initialMinute: 50,
    inputType: "spinbox",
    showMeridiem: false,
  }
);

main();

function main() {
  // add listener
  document.getElementById("saveBtn").addEventListener("click", saveAlert);
  document.getElementById("deleteBtn").addEventListener("click", deleteAlert);
  // for load pevious data if exists
  document.addEventListener("DOMContentLoaded", validateTodayAlertData);
}

async function validateTodayAlertData() {
  const previousTimes = await getData();

  // 오늘 date까지만 가져옴
  const now = new Date();
  const todayDateOnly = getDateOnly(now.getTime());

  let previousDateOnly;
  // 이전 데이터가 있으면 date까지만 가져옴
  if (previousTimes.length > 0) {
    previousDateOnly = getDateOnly(previousTimes[0]);
  }
  // 날짜 비교
  if (todayDateOnly === previousDateOnly) {
    await setData(previousTimes);
  } else {
    deleteAlert();
  }
}

async function getData() {
  const result = await chrome.storage.local.get("times");
  return result?.times || [];
}

async function setData(times) {
  showPreview(times);
  alertList.push(times);
}

async function saveAlert() {
  // get interval
  const intervalMinutes = document.getElementById("inputInterval").value;

  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    startTimeContainer.getHour(),
    startTimeContainer.getMinute()
  );

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    endTimeContainer.getHour(),
    endTimeContainer.getMinute()
  );

  if (!isValidPeriod(startDate, intervalMinutes, endDate)) {
    showWarning("첫 알람 시작이 종료 시간 이후가 될 수 없습니다.");
    return;
  }

  let temp = new Date(startDate.valueOf());
  let alertItems = [new Date(temp.valueOf())];

  while (
    temp.getTime() + intervalMinutes * 60 * 1000 <= endDate.getTime() &&
    intervalMinutes > 0
  ) {
    temp = new Date(temp.getTime() + intervalMinutes * 60 * 1000); // 분 단위로 시간 누적
    alertItems.push(new Date(temp.valueOf()));
  }

  // delete if the time is already past the current time
  const filteredItems = alertItems.filter((time) => time >= now);

  if (filteredItems.length <= 0) {
    showWarning("현재 시간 이후로 설정할 알람이 없습니다.");
    return;
  }

  let isEmptyAlert = alertList.length == 0;
  if (isEmptyAlert) {
    alertList.push(filteredItems);
    hideWarning();

    const timestamps = filteredItems.map((time) => time.getTime());
    showPreview(timestamps);
    await chrome.storage.local.set({
      times: timestamps,
    });
    chrome.runtime.sendMessage({
      type: "SET_ALARMS",
    });
  } else {
    showWarning("알림은 한 개만 저장할 수 있어요. 저장된 알림을 삭제해주세요.");
  }
}

function isValidPeriod(startDate, intervalMinutes, endDate) {
  return new Date(startDate.getTime() + intervalMinutes * 60 * 1000) <= endDate;
}
//FIXME
async function deleteAlert() {
  await chrome.storage.local.clear();
  chrome.runtime.sendMessage({
    type: "REMOVE_ALARMS",
  });
  alertList.shift();
  hidePreview();
  hideWarning();
}

/* rendering */
function showPreview(timestamps) {
  const previewRow = document.getElementById("preview-row");
  previewRow.classList.remove("d-none");
  previewRow.classList.add("d-flex");

  let times = "";
  timestamps.forEach((d, inx) => {
    times += formatDate(new Date(d));
    if (inx < timestamps.length - 1) {
      times += ", ";
    }
  });

  document.getElementById("preview-row__text").innerText = times;
}

function hidePreview() {
  const previewRow = document.getElementById("preview-row");
  previewRow.classList.add("d-none");
  previewRow.classList.remove("d-flex");
}

function showWarning(warningText) {
  const previewRow = document.getElementById("warningText");
  previewRow.innerText = warningText;
  previewRow.classList.remove("invisible");
  previewRow.classList.add("visible");
}

function hideWarning() {
  const previewRow = document.getElementById("warningText");
  previewRow.classList.add("invisible");
  previewRow.classList.remove("visible");
}
