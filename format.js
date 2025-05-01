//formatting
function convertTo24Hour(hour, midday) {
  if (midday === "AM") {
    return hour === 12 ? 0 : Number(hour); // 12AM → 0시
  } else {
    return hour === 12 ? 12 : Number(hour) + 12; // 12PM → 12시
  }
}

export function formatDate(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return [
    hour < 10 ? "0" + hour : hour,
    minute < 10 ? "0" + minute : minute,
  ].join(":");
}

// 현재 시:분을 "HH:MM" 형태로 리턴하는 함수
function getNowTimeString() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function getDateOnly(timestamp) {
  const date = new Date(timestamp);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}
