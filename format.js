//formatting
function convertTo24Hour(hour, midday) {
  if (midday === "AM") {
    return hour === 12 ? 0 : Number(hour); // 12AM → 0시
  } else {
    return hour === 12 ? 12 : Number(hour) + 12; // 12PM → 12시
  }
}

function formatDate(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  return [
    hour < 10 ? "0" + hour : hour,
    minute < 10 ? "0" + minute : minute,
  ].join(":");
}
