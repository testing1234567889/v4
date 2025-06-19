function bukaTab(tabId) {
  document.querySelectorAll('.tab-buttons button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  event.target.classList.add('active');
}

const headers = {
  "Content-Type": "text/plain; charset=utf-8",
  "Accept": "application/json"
};
const NAME = "wibu";
const PROFILE = "https://lh3.googleusercontent.com/a/ACg8ocIk6mQVP02KEycB9_MYhhtyiN8eyDaz_N3dp3OwwIDN30ri0XYS=s288-c-no";

function vipDate(epoch) {
  if (!epoch || epoch == 0) return "-";
  return new Date(epoch * 1000).toLocaleString();
}

async function login(email) {
  const payload = { user: NAME, email: email, profil: PROFILE };
  const res = await fetch("https://apps.animekita.org/api/v1.1.6/model/login.php", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!json.data || !json.data[0]) throw new Error("Login gagal atau data tidak ditemukan.");
  return json.data[0].token;
}

async function getData(token) {
  const res = await fetch("https://apps.animekita.org/api/v1.1.6/model/app-config.php", {
    method: "POST",
    headers,
    body: JSON.stringify({ token })
  });
  const json = await res.json();
  return json.data[0];
}

async function prosesVip() {
  if (!isTokenAktif()) {
    alert("⛔ Email belum tervalidasi atau kedaluwarsa.");
    bukaTab('loginToken');
    return;
  }

  const email = document.getElementById('emailAktivasi').value.trim();
  const vipCode = document.getElementById('durasi').value;
  const result = document.getElementById('hasilAktivasi');

  if (!email) {
    result.innerHTML = '<span style="color:red">❌ Email tidak boleh kosong!</span>';
    return;
  }

  result.innerHTML = '🔄 Login...';

  try {
    const token = await login(email);
    const before = await getData(token);
    result.innerHTML = buatTabelStatus(before, 'Sebelum Aktivasi');

    await setPremium(token, vipCode);
    const after = await getData(token);
    result.innerHTML += buatTabelStatus(after, 'Setelah Aktivasi');
  } catch (err) {
    result.innerHTML = '<span style="color:red">❌ ' + err.message + '</span>';
  }
}

async function setPremium(token, vipCode) {
  const res = await fetch("https://apps.animekita.org/api/v1.1.6/model/vip.php", {
    method: "POST",
    headers,
    body: new URLSearchParams({ token, vip: vipCode })
  });
  const json = await res.json();
  if (json.status !== "success" && json.status !== 1) throw new Error("Gagal aktivasi VIP.");
  return json;
}

async function cekStatus() {
  const email = document.getElementById('emailStatus').value.trim();
  const result = document.getElementById('hasilStatus');
  if (!email) {
    result.innerHTML = '<span style="color:red">❌ Email tidak boleh kosong!</span>';
    return;
  }

  result.innerHTML = '🔄 Mengecek status...';
  try {
    const token = await login(email);
    const data = await getData(token);
    result.innerHTML = buatTabelStatus(data, 'Status Pengguna');
  } catch (err) {
    result.innerHTML = '<span style="color:red">❌ ' + err.message + '</span>';
  }
}

function buatTabelStatus(data, judul) {
  return `
    <h4>${judul}</h4>
    <table>
      <tr><th>Level</th><td>${data.level}</td></tr>
      <tr><th>Rank</th><td>${data.rank}</td></tr>
      <tr><th>VIP Level</th><td>${data.vipLevel}</td></tr>
      <tr><th>Kadaluarsa VIP</th><td>${vipDate(data.vipExp)}</td></tr>
    </table>
  `;
}

function salinStatus() {
  const teks = document.getElementById('hasilStatus').innerText;
  navigator.clipboard.writeText(teks).then(() => {
    alert('📋 Status berhasil disalin!');
  }).catch(err => {
    alert('❌ Gagal menyalin: ' + err);
  });
}

function cekTokenEmail() {
  const email = document.getElementById("emailInput").value.trim().replaceAll(".", "_");
  const output = document.getElementById("hasilLogin");

  if (!email) {
    output.innerHTML = '<span style="color:red">❌ Email tidak boleh kosong</span>';
    return;
  }

  output.innerHTML = '🔄 Mengecek database...';

  firebase.database().ref('vipUsers/' + email).once('value').then(snapshot => {
    const data = snapshot.val();
    const now = Math.floor(Date.now() / 1000);
    if (!data) throw new Error("Email tidak ditemukan di database.");
    if (!data.aktif) throw new Error("Akses tidak aktif.");
    if (data.vipExp < now) throw new Error("Masa aktif sudah habis.");

    localStorage.setItem("vipEmail", email);
    localStorage.setItem("vipExp", data.vipExp);
    localStorage.setItem("vipLevel", data.vipLevel);

    output.innerHTML = `<span style="color:green">✅ Login sukses sebagai VIP Level ${data.vipLevel}</span>`;
    bukaTab('aktivasi');
  }).catch(err => {
    output.innerHTML = '<span style="color:red">❌ ' + err.message + '</span>';
  });
}

function isTokenAktif() {
  const email = localStorage.getItem("vipEmail");
  const exp = parseInt(localStorage.getItem("vipExp") || 0);
  const now = Math.floor(Date.now() / 1000);
  return email && now < exp;
}

function logoutVIP() {
  localStorage.clear();
  alert("🚪 Kamu telah logout.");
  bukaTab("loginToken");
}

function aturTampilanAwal() {
  const aktif = isTokenAktif();
  document.getElementById("btnAktivasi").style.display = aktif ? "inline-block" : "none";
  document.getElementById("btnStatus").style.display = aktif ? "inline-block" : "none";
  bukaTab(aktif ? "aktivasi" : "loginToken");
}
