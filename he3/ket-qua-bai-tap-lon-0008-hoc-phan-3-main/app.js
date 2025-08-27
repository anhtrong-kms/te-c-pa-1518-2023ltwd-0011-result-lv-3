/* Dashboard App with real data */
const DATA = window.__RAW;
const fmt = (n) => (Number.isInteger(n) ? n.toString() : (+n).toFixed(1));
const avg = (arr) => arr.length? arr.reduce((a,b)=>a+b,0)/arr.length : 0;
const byId = id => document.getElementById(id);
function categorize(score){
  if (score >= 85) return {label: "Xuất sắc", cls: "success"};
  if (score >= 75) return {label: "Tốt", cls: "primary"};
  if (score >= 65) return {label: "Khá", cls: "info"};
  if (score >= 50) return {label: "Trung bình", cls: "warning"};
  return {label: "Yếu", cls: "danger"};
}

window.addEventListener("DOMContentLoaded", () => {
  navigate();
  byId("btnPrint")?.addEventListener("click", (e)=>{ e.preventDefault(); window.print(); });
});
window.addEventListener("hashchange", navigate);

function navigate(){
  const hash = location.hash || "#/";
  const app = byId("app");
  app.innerHTML = "";
  if (hash.startsWith("#/group/")) renderGroupDetail(hash.split("/")[2]);
  else renderDashboard();
}

/* ===== Dashboard ===== */
function renderDashboard(){
  const app = byId("app");
  const groups = DATA.nhom;

  // KPIs
  const kpi = document.createElement("section");
  kpi.className = "kpi mb-4";
  const topGroup = groups.reduce((a,b)=> a.diemCuoi>b.diemCuoi?a:b, groups[0]||{});
  kpi.innerHTML = `
  <div class="row g-3">
    <div class="col-6 col-lg-3"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">Tổng nhóm</div><div class="h3 mb-0">${groups.length}</div></div><i class="bi bi-people h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-3"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">Điểm TB cuối</div><div class="h3 mb-0">${fmt(DATA.avgFinal)}</div></div><i class="bi bi-graph-up h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-3"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Bảng I / II</div><div class="h3 mb-0">${fmt(DATA.avgBangI)} / ${fmt(DATA.avgBangII)}</div></div><i class="bi bi-bar-chart h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-3"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">Nhóm dẫn đầu</div><div class="h3 mb-0">${DATA.leadGroup||topGroup?.ma||"-"}</div><div class="small text-muted">Điểm: ${fmt(topGroup?.diemCuoi||0)}</div></div><i class="bi bi-stars h2 mb-0"></i></div></div></div>
  </div>`;
  app.appendChild(kpi);

  // Overall comments
  const sw = document.createElement("section");
  sw.className = "mb-4";
  sw.innerHTML = `
    <div class="card card-soft">
      <div class="card-body">
        <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0"><i class="bi bi-chat-left-dots me-1"></i> Nhận xét tổng quan</h3></div>
        ${ (DATA.overallComments && DATA.overallComments.length) ? DATA.overallComments.map(p=>`<blockquote class="excerpt mb-2">${p}</blockquote>`).join("") : '<div class="text-muted">Chưa có nhận xét tổng quan.</div>'}
      </div>
    </div>`;
  app.appendChild(sw);

  // Charts
  const charts = document.createElement("section");
  charts.className = "mb-4";
  charts.innerHTML = `
    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card card-soft h-100"><div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">Bảng I / Bảng II theo nhóm</h3><span class="text-muted small">Bar chart</span></div>
          <canvas id="barBI" height="120"></canvas>
        </div></div>
      </div>
      <div class="col-lg-4">
        <div class="card card-soft h-100"><div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">Phân bố hạng điểm cuối</h3><span class="text-muted small">Doughnut</span></div>
          <canvas id="donutCat" height="120"></canvas>
        </div></div>
      </div>
    </div>`;
  app.appendChild(charts);

  if (typeof Chart !== "undefined"){
    const labels = groups.map(g=>g.ma);
    new Chart(byId("barBI"), { type:"bar",
      data:{ labels, datasets:[
        { label:"Bảng I", data: groups.map(g=>g.bangI), borderWidth: 1 },
        { label:"Bảng II", data: groups.map(g=>g.bangII), borderWidth: 1 }
      ]},
      options:{ responsive:true, plugins:{legend:{position:"bottom"}}, scales:{ y:{ suggestedMin:0, suggestedMax:100 } } }
    });
    const buckets = {XS:0,T:0,K:0,TB:0,Y:0};
    groups.forEach(g=>{
      if (g.diemCuoi>=85) buckets.XS++; else if (g.diemCuoi>=75) buckets.T++; else if (g.diemCuoi>=65) buckets.K++; else if (g.diemCuoi>=50) buckets.TB++; else buckets.Y++;
    });
    new Chart(byId("donutCat"), { type:"doughnut",
      data:{ labels:["Xuất sắc","Tốt","Khá","Trung bình","Yếu"], datasets:[{ data:[buckets.XS,buckets.T,buckets.K,buckets.TB,buckets.Y] }] },
      options:{ plugins:{legend:{position:"bottom"}} }
    });
  }

  // Groups table
  const wrap = document.createElement("section");
  wrap.className = "card card-soft border-0";
  const rows = groups.map((g,i)=>{
    const cat = categorize(g.diemCuoi);
    const members = (g.thanhVien||[]).map(m=> (typeof m==='string'? m : (m.ten||'')) ).filter(Boolean).join(", ");
    return `<tr>
      <td class="text-muted">${i+1}</td>
      <td><a class="link-primary fw-semibold" href="#/group/${g.ma}">${g.ma}</a><div class="small text-muted">${members||'-'}</div></td>
      <td class="text-end">${fmt(g.bangI)}</td>
      <td class="text-end">${fmt(g.bangII)}</td>
      <td class="text-end">${fmt(g.camQuan)}</td>
      <td class="text-end fw-semibold">${fmt(g.diemCuoi)}</td>
      <td><span class="badge text-bg-${cat.cls}">${cat.label}</span></td>
    </tr>`;
  }).join("");
  wrap.innerHTML = `
    <div class="card-body">
      <div class="table-responsive table-sticky">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th><th style="min-width:180px;">Nhóm / Thành viên</th>
              <th class="text-end">Bảng I (45%)</th><th class="text-end">Bảng II (45%)</th>
              <th class="text-end">Cảm quan (0..10)</th><th class="text-end">Điểm cuối (100)</th><th>Hạng</th>
            </tr>
          </thead>
          <tbody id="tbody">${rows}</tbody>
        </table>
      </div>
    </div>`;
  app.appendChild(wrap);
}

/* ===== Group Detail ===== */
function renderGroupDetail(id){
  const app = byId("app");
  const g = DATA.nhom.find(x => x.ma === id);
  if (!g){ app.innerHTML = `<div class="alert alert-warning">Không tìm thấy nhóm ${id}. <a href="#/">Quay lại</a></div>`; return; }

  app.innerHTML += `<nav aria-label="breadcrumb" class="mb-2"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#/">Tổng quan</a></li><li class="breadcrumb-item active">Nhóm ${g.ma}</li></ol></nav>`;

  const cat = categorize(g.diemCuoi);
  app.innerHTML += `<div class="d-flex align-items-center justify-content-between mb-3">
    <div><h2 class="h4 mb-1">Nhóm <span class="text-primary">${g.ma}</span></h2><span class="badge text-bg-${cat.cls}">Hạng: ${cat.label}</span></div>
    <div class="d-flex gap-2"><a href="#/" class="btn btn-outline-secondary"><i class="bi bi-arrow-left"></i> Quay lại</a><button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> In / Xuất</button></div>
  </div>`;

  const members = (g.thanhVien||[]).map(m=> (typeof m==='string'? m : (m.ten||'')) ).filter(Boolean);
  const head = document.createElement("div");
  head.className = "row g-3 mb-3";
  head.innerHTML = `
    <div class="col-lg-8"><div class="card card-soft h-100"><div class="card-body">
      <div class="d-flex flex-wrap gap-2 mb-2">
        <span class="tag">Bảng I: <strong>${fmt(g.bangI)}</strong></span>
        <span class="tag">Bảng II: <strong>${fmt(g.bangII)}</strong></span>
        <span class="tag">Cảm quan (0..10): <strong>${fmt(g.camQuan)}</strong></span>
        <span class="tag">Điểm cuối (100): <strong>${fmt(g.diemCuoi)}</strong></span>
      </div>
      <div class="small text-muted">Thành viên: ${members.join(", ") || "Chưa cập nhật"}</div>
    </div></div></div>
    <div class="col-lg-4"><div class="card card-soft h-100"><div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">So sánh với TB</h3><span class="text-muted small">Radar</span></div>
      <canvas id="radarGroup" height="150"></canvas>
    </div></div></div>`;
  app.appendChild(head);

  if (typeof Chart !== "undefined"){
    const avgBangI = DATA.avgBangI || 0;
    const avgBangII = DATA.avgBangII || 0;
    const avgCamQuan100 = (DATA.nhom.map(x=>x.camQuan*10).reduce((a,b)=>a+b,0) / DATA.nhom.length) || 0;
    new Chart(byId("radarGroup"), { type: "radar",
      data: { labels: ["Bảng I (x/100)","Bảng II (x/100)","Cảm quan (x/100)"],
        datasets: [
          { label: "Nhóm "+g.ma, data: [g.bangI, g.bangII, g.camQuan*10], borderWidth: 1, pointRadius: 3 },
          { label: "TB lớp", data: [avgBangI, avgBangII, avgCamQuan100], borderWidth: 1, pointRadius: 3 }
        ] },
      options: { plugins:{legend:{position:"bottom"}}, scales:{ r:{ suggestedMin:0, suggestedMax:100 } } }
    });
  }

  // Comments
  const cmt = document.createElement("div");
  cmt.className = "card card-soft mb-3";
  cmt.innerHTML = `<div class="card-body"><h3 class="h6 mb-2"><i class="bi bi-chat-left-quote me-1"></i> Nhận xét (trích)</h3>
    ${ (g.nhanXetTongQuan && g.nhanXetTongQuan.length) ? g.nhanXetTongQuan.map(p=>`<blockquote class="excerpt mb-2">${escapeHtml(p)}</blockquote>`).join("") : '<div class="text-muted">Chưa có nhận xét.</div>' }
  </div>`;
  app.appendChild(cmt);

  // Detail tables
  function rowsHtml(arr){
    const sumMax = arr.reduce((s,x)=>s+(+x.max||0),0);
    const sumGot = arr.reduce((s,x)=>s+(+x.nhan||0),0);
    return `
      <div class="table-responsive">
        <table class="table table-bordered word-like-table align-top mb-0">
          <thead><tr><th style="width:28%;">Mục đánh giá</th><th>Nhận xét chi tiết</th><th class="text-end">Điểm tối đa</th><th class="text-end">Điểm thực nhận</th></tr></thead>
          <tbody>${arr.map(r=>`<tr><th>${escapeHtml(r.label)}</th><td>${escapeHtml(r.nx||"")}</td><td class="text-end">${r.max}</td><td class="text-end">${r.nhan}</td></tr>`).join("")}</tbody>
          <tfoot><tr><th class="text-end">Tổng</th><th></th><th class="text-end">${sumMax}</th><th class="text-end">${sumGot}</th></tr></tfoot>
        </table>
      </div>`;
  }
  const card = document.createElement("div");
  card.className = "card card-soft";
  card.innerHTML = `<div class="card-body">
    <h3 class="h6 mb-2">BẢNG I – Đánh giá đề tài nghiên cứu</h3>
    ${rowsHtml(g.chiTiet.bangI)}
    <hr class="my-3"/>
    <h3 class="h6 mb-2">BẢNG II – Đánh giá kiến thức/OOP</h3>
    ${rowsHtml(g.chiTiet.bangII)}
  </div>`;
  app.appendChild(card);
}

function escapeHtml(str){ return String(str||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
