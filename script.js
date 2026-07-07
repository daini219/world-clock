const cities = [
  { city: "Seoul", country: "Korea HQ", flag: "🇰🇷", tz: "Asia/Seoul", home: true },
  { city: "New York", country: "USA East", flag: "🇺🇸", tz: "America/New_York" },
  { city: "Los Angeles", country: "USA West", flag: "🇺🇸", tz: "America/Los_Angeles" },
  { city: "Toronto", country: "Canada East", flag: "🇨🇦", tz: "America/Toronto" },
  { city: "Vancouver", country: "Canada West", flag: "🇨🇦", tz: "America/Vancouver" },
  { city: "Mexico City", country: "Mexico", flag: "🇲🇽", tz: "America/Mexico_City" },
  { city: "São Paulo", country: "Brazil", flag: "🇧🇷", tz: "America/Sao_Paulo" },
  { city: "Buenos Aires", country: "Argentina", flag: "🇦🇷", tz: "America/Argentina/Buenos_Aires" },
  { city: "Bogotá", country: "Colombia", flag: "🇨🇴", tz: "America/Bogota" }
];

const list = document.getElementById("clock-list");
const summary = document.getElementById("summary");
const updated = document.getElementById("updated");

function getParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    month: "short",
    day: "2-digit",
    timeZoneName: "short"
  }).formatToParts(date);

  const obj = {};
  parts.forEach(p => obj[p.type] = p.value);
  if (obj.hour === "24") obj.hour = "00";
  return obj;
}

function getHour(date, timeZone) {
  return Number(getParts(date, timeZone).hour);
}

function offsetMinutes(date, timeZone) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
  const parts = {};
  dtf.formatToParts(date).forEach(({type, value}) => { parts[type] = value; });
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUTC - date.getTime()) / 60000);
}

function diffFromSeoul(date, timeZone) {
  const diff = offsetMinutes(date, timeZone) - offsetMinutes(date, "Asia/Seoul");
  const sign = diff >= 0 ? "+" : "";
  const hours = diff / 60;
  return `${sign}${hours}h vs Seoul`;
}

function getStatus(hour) {
  if (hour >= 9 && hour < 18) return { label: "🟢 업무시간", cls: "open" };
  if ((hour >= 8 && hour < 9) || (hour >= 18 && hour < 20)) return { label: "🟡 근접", cls: "soon" };
  return { label: "🔴 비업무", cls: "closed" };
}

function progress(hour) {
  if (hour >= 9 && hour < 18) return ((hour - 9) / 9) * 100;
  if (hour >= 8 && hour < 9) return 10;
  if (hour >= 18 && hour < 20) return 92;
  return 0;
}

function render() {
  const now = new Date();
  const rows = cities.map(c => {
    const p = getParts(now, c.tz);
    const hour = Number(p.hour);
    const status = getStatus(hour);
    return { ...c, parts: p, hour, status };
  });

  const openCount = rows.filter(r => r.status.cls === "open" && !r.home).length;
  const soonCount = rows.filter(r => r.status.cls === "soon" && !r.home).length;
  const closedCount = rows.filter(r => r.status.cls === "closed" && !r.home).length;

  summary.innerHTML = `
    <div class="summary-card"><div class="summary-label">Now Open</div><div class="summary-value">🟢 ${openCount} cities</div></div>
    <div class="summary-card"><div class="summary-label">Near Business Hours</div><div class="summary-value">🟡 ${soonCount} cities</div></div>
    <div class="summary-card"><div class="summary-label">Closed</div><div class="summary-value">🔴 ${closedCount} cities</div></div>
  `;

  list.innerHTML = rows.map(r => {
    const time = `${r.parts.hour}:${r.parts.minute}`;
    const date = `${r.parts.weekday}, ${r.parts.month} ${r.parts.day}`;
    const diff = r.home ? "Base timezone" : diffFromSeoul(now, r.tz);
    const bar = Math.max(0, Math.min(100, progress(r.hour)));

    return `
      <article class="card ${r.home ? "home" : ""}">
        <div class="top">
          <div>
            <div class="city">${r.flag} ${r.city}</div>
            <div class="country">${r.country}</div>
          </div>
          <span class="badge ${r.status.cls}">${r.home ? "KST" : r.status.label}</span>
        </div>
        <div class="time">${time}</div>
        <div class="meta">
          ${date} · ${r.parts.timeZoneName}<br>
          <span class="diff">${diff}</span>
        </div>
        <div class="footer"><div class="progress ${r.status.cls}" style="width:${bar}%"></div></div>
      </article>
    `;
  }).join("");

  const seoul = getParts(now, "Asia/Seoul");
  updated.textContent = `Updated ${seoul.hour}:${seoul.minute} KST`;
}

render();
setInterval(render, 60000);
