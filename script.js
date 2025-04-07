function main() {
  // 알림 권한 요청
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // add listener
  document.getElementById("saveBtn").addEventListener("click", save);
  document.getElementById("deleteBtn").addEventListener("click", deleteAlert);

  // TODO : save multiple alerts
  let alertList = [];

  function save() {
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

    const now = new Date(); // 현재 날짜와 시간

    // 새로운 Date 객체 생성: 날짜는 오늘로, 시간과 분만 설정
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

    // delete time if the time already passed current time
    const filteredItems = alertItems.filter((time) => time >= now);

    let isVaild = alertList.length == 0;

    if (isVaild) {
      alertList.push(filteredItems);
      hideWarning();
      showPreview(filteredItems);

      //first alert
      let nextAlarmTime = filteredItems.shift();
      let alarmHour = nextAlarmTime.getHours();
      let alarmMinute = nextAlarmTime.getMinutes();

      // set timer
      alarmInterval = setInterval(() => {
        const now = new Date();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        if (nowHour === alarmHour && nowMinute === alarmMinute) {
          nextAlarmTime = filteredItems.shift();
          alarmHour = nextAlarmTime.getHours();
          alarmMinute = nextAlarmTime.getMinutes();

          showNotification(
            `다음 알람 예정: ${nextAlarmTime.toLocaleTimeString()}`
          );
          //   document.getElementById("statusMsg").innerText = `다음 알람 예정: ${nextAlarmTime.toLocaleTimeString()}`;
        }

        if (filteredItems.length === 0) {
          clearInterval(alarmInterval);
        }
      }, 60000); // 1초마다 체크
    } else {
      showWarning();
    }
  }

  //FIXME
  function deleteAlert() {
    alertList.shift();
    hidePreview();
    hideWarning();
    clearInterval(alarmInterval);
  }
}

main();

function showNotification(notiMsg) {
  new Notification("🔔 RingCycle 알람", {
    body: `설정된 시간이 되었어요!` + notiMsg,
  });
  //     if (Notification.permission === "granted") {
  //   }
}

/* rendering */
function showPreview(filteredItems) {
  const previewRow = document.getElementById("preview-row");
  previewRow.classList.remove("d-none");
  previewRow.classList.add("d-flex");

  let times = "";
  filteredItems.forEach((d, inx) => {
    times += formatDate(d);
    if (inx < filteredItems.length - 1) {
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
