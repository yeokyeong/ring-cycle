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
  console.log("save()");
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

  console.log("start time", startHour, startMinutes, startMidday);
  console.log("end time", endHour, endMinutes, endMidday);
  console.log("intervalMunutes", intervalMinutes);

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

  console.log(filteredItems, 111, "filteredItems");

  let isVaild = alertList.length == 0;

  if (isVaild) {
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
    showWarning();
  }
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

function showWarning() {
  const previewRow = document.getElementById("warningText");
  previewRow.classList.remove("d-none");
  previewRow.classList.add("d-flex");
}

function hideWarning() {
  const previewRow = document.getElementById("warningText");
  previewRow.classList.add("d-none");
  previewRow.classList.remove("d-flex");
}
