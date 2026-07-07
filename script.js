const cities = [
  { city: "Seoul", country: "Korea", flag: "🇰🇷", tz: "Asia/Seoul" },
  { city: "New York", country: "USA", flag: "🇺🇸", tz: "America/New_York" },
  { city: "Los Angeles", country: "USA", flag: "🇺🇸", tz: "America/Los_Angeles" },
  { city: "Toronto", country: "Canada", flag: "🇨🇦", tz: "America/Toronto" },
  { city: "Vancouver", country: "Canada", flag: "🇨🇦", tz: "America/Vancouver" },
  { city: "Mexico City", country: "Mexico", flag: "🇲🇽", tz: "America/Mexico_City" },
  { city: "São Paulo", country: "Brazil", flag: "🇧🇷", tz: "America/Sao_Paulo" },
  { city: "Buenos Aires", country: "Argentina", flag: "🇦🇷", tz: "America/Argentina/Buenos_Aires" },
  { city: "Bogotá", country: "Colombia", flag: "🇨🇴", tz: "America/Bogota" }
];

const list = document.getElementById("clock-list");

function getParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    month: "short",
    day: "2-digit"
  }).formatToParts(date);

  const obj = {};
  parts.forEach(p => obj[p.type] = p.value);
  return obj;
}

function getStatus(hour) {
  if (hour >= 9 && hour < 18) {
    return { label: "업무시간", cls: "open" };
  }
  if ((hour >= 8 && hour < 9) || (hour >= 18 && hour < 20)) {
    return { label: "근접", cls: "soon" };
  }
  return { label: "비업무", cls: "closed" };
}

function render() {
  const now = new Date();

  list.innerHTML = cities.map(item => {
    const p = getParts(now, item.tz);
    const hour = Number(p.hour);
    const status = getStatus(hour);
    const time = `${p.hour}:${p.minute}`;
    const date = `${p.weekday}, ${p.month} ${p.day}`;

    return `
      <article class="city-card">
        <div class="city-top">
          <div>
            <div class="city">${item.flag} ${item.city}</div>
            <div class="country">${item.country}</div>
          </div>
          <span class="status ${status.cls}">${status.label}</span>
        </div>
        <div class="time">${time}</div>
        <div class="date">${date}</div>
      </article>
    `;
  }).join("");
}

render();
setInterval(render, 1000);
