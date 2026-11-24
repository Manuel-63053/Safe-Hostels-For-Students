// SafeHostel shared script. Each block runs only if its page elements exist.
const $ = (id) => document.getElementById(id);
const fmt = (n) => "UGX " + Math.round(n).toLocaleString("en-UG");

// Mobile menu
const tg = document.querySelector(".menu-toggle"), menu = $("menu");
if (tg && menu) tg.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  tg.setAttribute("aria-expanded", open);
});

// Check Before You Pay: checklist
const cl = $("checklist");
if (cl) {
  const boxes = [...cl.querySelectorAll("input[type=checkbox]")], go = $("check-go"), res = $("check-result");
  const update = () => {
    const n = boxes.filter(b => b.checked).length;
    $("check-count").textContent = n + " of " + boxes.length + " done";
    go.disabled = n < boxes.length; res.hidden = true;
  };
  boxes.forEach(b => b.addEventListener("change", update));
  cl.addEventListener("reset", () => setTimeout(update));
  go.addEventListener("click", () => {
    res.textContent = "Good. Pay only by a traceable method, to the name on your agreement, and get a receipt straight away.";
    res.hidden = false;
  });
}

// Find a Hostel (SAMPLE DATA: replace with verified hostels)
const list = $("results");
if (list) {
  const hostels = [
    {n:"Sample Hostel A", a:"Kisaasi", p:500000, d:0.8, guard:true, water:true},
    {n:"Sample Hostel B", a:"Kyanja", p:420000, d:1.5, guard:false, water:true},
    {n:"Sample Hostel C", a:"Ntinda", p:650000, d:2.4, guard:true, water:false},
    {n:"Sample Hostel D", a:"Kisaasi", p:380000, d:1.1, guard:false, water:false},
    {n:"Sample Hostel E", a:"Kulambiro", p:720000, d:3.0, guard:true, water:true}
  ];
  const f = $("filters");
  const render = () => {
    const q = $("q").value.trim().toLowerCase(), max = Number($("maxp").value) || Infinity, s = $("sort").value;
    const out = hostels.filter(h => (h.n + " " + h.a).toLowerCase().includes(q) && h.p <= max
      && (!$("guard").checked || h.guard) && (!$("water").checked || h.water))
      .sort((a, b) => s === "price" ? a.p - b.p : s === "dist" ? a.d - b.d : a.n.localeCompare(b.n));
    list.innerHTML = out.map(h => `<article class="card"><h2>${h.n}</h2><p>${h.a} · ${h.d} km from VU</p>
      <p><strong>${fmt(h.p)}</strong> per semester</p>
      ${h.guard ? '<span class="tag">Guard</span>' : ""}${h.water ? '<span class="tag">Water included</span>' : ""}
      <p><a href="check-before-you-pay.html">Visit safely first</a></p></article>`).join("");
    $("empty").hidden = out.length > 0;
    $("count").textContent = out.length + " hostel" + (out.length === 1 ? "" : "s") + " shown";
  };
  f.addEventListener("input", render);
  f.addEventListener("reset", () => setTimeout(render));
  render();
}

// Safety page: open/close all
if ($("expand")) {
  $("expand").addEventListener("click", () => document.querySelectorAll("details").forEach(d => d.open = true));
  $("collapse").addEventListener("click", () => document.querySelectorAll("details").forEach(d => d.open = false));
}

// Costs & Budget
const bf = $("budget");
if (bf) {
  const out = $("budget-out");
  bf.addEventListener("submit", e => {
    e.preventDefault();
    const v = Object.fromEntries([...new FormData(bf)].map(([k, x]) => [k, Math.max(0, Number(x) || 0)]));
    const months = v.months || 1;
    const monthly = v.utils + v.transport + v.food;
    const total = v.rent + v.deposit + monthly * months;
    out.innerHTML = `<strong>Total for the semester: ${fmt(total)}</strong><br>Upfront (rent + deposit): ${fmt(v.rent + v.deposit)}<br>Monthly living costs: ${fmt(monthly)}<br>Average per month: ${fmt(total / months)}`;
    out.hidden = false;
  });
  bf.addEventListener("reset", () => { out.hidden = true; });
}

// Help & Contact form (front-end only: no server to send to)
const cf = $("contact-form");
if (cf) {
  cf.addEventListener("submit", e => {
    e.preventDefault();
    const err = $("form-error"), d = Object.fromEntries(new FormData(cf));
    const msgs = [];
    if (!d.name.trim()) msgs.push("Enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(d.email)) msgs.push("Enter a valid email.");
    if (d.msg.trim().length < 10) msgs.push("Write a message of at least 10 characters.");
    if (msgs.length) { err.textContent = msgs.join(" "); err.hidden = false; return; }
    err.hidden = true;
    try { localStorage.setItem("safehostel-msg", JSON.stringify(d)); } catch (x) {}
    $("form-ok").textContent = "Thank you, " + d.name.trim() + ". Your message has been recorded.";
    $("form-ok").hidden = false; cf.reset();
  });
}
