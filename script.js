// TODO : save multiple alerts
let alertList = [];

function main() {
  // add listener
  document.getElementById("saveBtn").addEventListener("click", saveAlert);
  document.getElementById("deleteBtn").addEventListener("click", deleteAlert);

  // for load pevious data if exists
  document.addEventListener("DOMContentLoaded", async () => {
    await setData();
  });
}

main();

async function setData() {
  let result = await chrome.storage.sync.get("times");

  if (result.times && result.times.length > 0) {
    showPreview(result.times);
  }
}

async function saveAlert() {
  // get start time
  const startHour = document.getElementById("inputStartHour").value;
  const startMinutes = document.getElementById("inputStartMinutes").value;
  const startMidday = document.getElementById("inputStartMidday").value;

  // get end time
  const endHour = document.getElementById("inputEndHour").value;
  const endMinutes = document.getElementById("inputEndMinutes").value;
  const endMidday = document.getElementById("inputEndMidday").value;

  // get interval
  const intervalMinutes = document.getElementById("inputInterval").value;

  const now = new Date();

  const startDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    convertTo24Hour(startHour, startMidday),
    startMinutes
  );

  const endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    convertTo24Hour(endHour, endMidday),
    endMinutes
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

  let hasOneAlert = alertList.length == 0;
  if (hasOneAlert) {
    alertList.push(filteredItems);
    hideWarning();

    const timestamps = filteredItems.map((time) => time.getTime());
    showPreview(timestamps);

    await chrome.storage.sync.set({
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
  await chrome.storage.sync.clear();
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
  previewRow.innerText = "";
  previewRow.classList.add("invisible");
  previewRow.classList.remove("visible");
}
