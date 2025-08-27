/* V6: Unified dashboard + detailed narrative Teacher Remark */
const DATA = window.__RAW;
const HE2_ENTRY = window.__HE2_ENTRY || "";
const HE3_ENTRY = window.__HE3_ENTRY || "";
const fmt = (n, d=2) => (Number.isInteger(n) ? n.toString() : (+n).toFixed(d));
const byId = id => document.getElementById(id);
const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const categories = (score) => score>=8.0 ? {label:"Giỏi",cls:"success"} : score>=6.5 ? {label:"Khá",cls:"primary"} : score>=5.0 ? {label:"Trung bình",cls:"warning"} : {label:"Yếu",cls:"danger"};

window.addEventListener("DOMContentLoaded", () => {
  navigate();
  byId("btnPrint")?.addEventListener("click", (e)=>{ e.preventDefault(); window.print(); });
});
window.addEventListener("hashchange", navigate);

function navigate(){
  const hash = location.hash || "#/";
  const app = byId("app");
  app.innerHTML = "";
  if (hash.startsWith("#/hs/")) renderStudent(hash.split("/")[2]);
  else if (hash.startsWith("#/he2")) renderHe2();
  else if (hash.startsWith("#/he3")) renderHe3();
  else renderDashboard();
}

/* ===== Overview ===== */
function renderDashboard(){
  const app = byId("app");
  const hs = DATA.hs;

  const controls = document.createElement("div");
  controls.className = "controls-hide-on-print d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3";
  controls.innerHTML = `
    <div class="input-group searchbar">
      <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
      <input id="q" class="form-control" placeholder="Tìm mã, tên học sinh...">
    </div>
    <div class="d-flex gap-2">
      <a class="btn btn-outline-primary btn-sm" href="#/he2"><i class="bi bi-journal-check"></i> Xem Bài kiểm tra (Hệ 2)</a>
      <a class="btn btn-outline-primary btn-sm" href="#/he3"><i class="bi bi-kanban"></i> Xem Bài tập lớn (Hệ 3)</a>
    </div>`;
  app.appendChild(controls);

  const k = DATA.kpi;
  const kpi = document.createElement("section");
  kpi.className = "kpi mb-4";
  kpi.innerHTML = `
  <div class="row g-3">
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">Sĩ số</div><div class="h3 mb-0">${hs.length}</div></div><i class="bi bi-people h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Hệ 1</div><div class="h3 mb-0">${fmt(k.avgH1)}</div></div><i class="bi bi-clipboard-check h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Hệ 2</div><div class="h3 mb-0">${fmt(k.avgH2)}</div></div><i class="bi bi-journal-check h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Hệ 3</div><div class="h3 mb-0">${fmt(k.avgH3)}</div></div><i class="bi bi-kanban h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Điểm</div><div class="h3 mb-0">${fmt(k.avgTB)}</div></div><i class="bi bi-graph-up h2 mb-0"></i></div></div></div>
    <div class="col-6 col-lg-2"><div class="card card-soft h-100"><div class="card-body d-flex justify-content-between align-items-center"><div><div class="text-muted text-uppercase small">TB Điểm danh</div><div class="h3 mb-0">${(k.avgDD||0).toFixed(1)}%</div></div><i class="bi bi-check2-circle h2 mb-0"></i></div></div></div>
  </div>`;
  app.appendChild(kpi);

  const charts = document.createElement("section");
  charts.className = "mb-4";
  charts.innerHTML = `
    <div class="row g-3">
      <div class="col-lg-8">
        <div class="card card-soft h-100"><div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">Hệ 1 / Hệ 2 / Hệ 3 theo học sinh</h3><span class="text-muted small">Bar chart</span></div>
          <canvas id="barH123" height="130"></canvas>
        </div></div>
      </div>
      <div class="col-lg-4">
        <div class="card card-soft h-100"><div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">Phân bố xếp loại</h3><span class="text-muted small">Doughnut</span></div>
          <canvas id="donutXL" height="130"></canvas>
        </div></div>
      </div>
    </div>`;
  app.appendChild(charts);

  if (typeof Chart !== "undefined"){
    const labels = hs.map(s=>s.ten.split(' ').slice(-2).join(' ')+" ("+s.stt+")");
    new Chart(byId("barH123"), { type:"bar",
      data:{ labels, datasets:[
        { label:"Hệ 1", data: hs.map(s=>s.he1), borderWidth: 1 },
        { label:"Hệ 2 (Bài kiểm tra)", data: hs.map(s=>s.he2), borderWidth: 1 },
        { label:"Hệ 3 (Bài tập lớn)", data: hs.map(s=>s.he3), borderWidth: 1 }
      ]},
      options:{ responsive:true, plugins:{legend:{position:"bottom"}}, scales:{ y:{ suggestedMin:0, suggestedMax:10 } } }
    });
    const buckets = {Gioi:0,Kha:0,TB:0,Yeu:0};
    hs.forEach(s=>{
      if (s.xepLoai.toLowerCase().includes("giỏi")) buckets.Gioi++;
      else if (s.xepLoai.toLowerCase().includes("khá")) buckets.Kha++;
      else if (s.xepLoai.toLowerCase().includes("trung")) buckets.TB++;
      else buckets.Yeu++;
    });
    new Chart(byId("donutXL"), { type:"doughnut",
      data:{ labels:["Giỏi","Khá","Trung bình","Yếu"], datasets:[{ data:[buckets.Gioi,buckets.Kha,buckets.TB,buckets.Yeu] }] },
      options:{ plugins:{legend:{position:"bottom"}} }
    });
  }

  const wrap = document.createElement("section");
  wrap.className = "card card-soft border-0";
  const rows = hs.map((s,i)=>{
    const cat = categories(s.trungBinh);
    return `<tr>
      <td class="text-muted">${s.stt}</td>
      <td><a class="link-primary fw-semibold" href="#/hs/${s.ma}">${s.ten}</a><div class="small text-muted">${s.ma}</div></td>
      <td class="text-end">${fmt(s.he1)}</td>
      <td class="text-end">${fmt(s.he2)}</td>
      <td class="text-end">${fmt(s.he3)}</td>
      <td class="text-end">${fmt(s.nangLuc)}</td>
      <td class="text-end fw-semibold">${fmt(s.trungBinh)}</td>
      <td><span class="badge text-bg-${cat.cls}">${cat.label}</span></td>
      <td class="text-end">${(s.dd_rate||0).toFixed(1)}%</td>
    </tr>`;
  }).join("");
  wrap.innerHTML = `
    <div class="card-body">
      <div class="table-responsive table-sticky">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>#</th><th style="min-width:200px;">Học sinh</th>
              <th class="text-end">Hệ 1</th><th class="text-end">Hệ 2 (Bài kiểm tra)</th><th class="text-end">Hệ 3 (Bài tập lớn)</th>
              <th class="text-end">Năng lực</th><th class="text-end">Điểm TB</th><th>Xếp loại</th><th class="text-end">Điểm danh</th>
            </tr>
          </thead>
          <tbody id="tbody">${rows}</tbody>
        </table>
      </div>
    </div>`;
  app.appendChild(wrap);

  const input = document.getElementById("q");
  function filter(){
    const q = (input.value||"").toLowerCase();
    qsa("#tbody tr").forEach(tr=>{
      const txt = tr.innerText.toLowerCase();
      tr.style.display = txt.includes(q) ? "" : "none";
    });
  }
  input?.addEventListener("input", filter);
}

/* ===== Embedded subpages ===== */
function renderHe2(){
  const app = byId("app");
  const entry = HE2_ENTRY ? `he2/${HE2_ENTRY}` : "";
  app.innerHTML = `<div class="card card-soft"><div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h2 class="h6 mb-0"><i class="bi bi-journal-check"></i> Bài kiểm tra (Hệ 2)</h2>
      <a class="btn btn-sm btn-outline-primary" href="#/">Quay lại tổng quan</a>
    </div>
    ${entry ? `<iframe class="embed" src="${entry}"></iframe>` : `<div class="alert alert-warning mb-0">Không tìm thấy trang HTML bên trong gói “Bài kiểm tra”.</div>`}
  </div></div>`;
}
function renderHe3(){
  const app = byId("app");
  const entry = HE3_ENTRY ? `he3/${HE3_ENTRY}` : "";
  app.innerHTML = `<div class="card card-soft"><div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h2 class="h6 mb-0"><i class="bi bi-kanban"></i> Bài tập lớn (Hệ 3)</h2>
      <a class="btn btn-sm btn-outline-primary" href="#/">Quay lại tổng quan</a>
    </div>
    ${entry ? `<iframe class="embed" src="${entry}"></iframe>` : `<div class="alert alert-warning mb-0">Không tìm thấy trang HTML bên trong gói “Bài tập lớn”.</div>`}
  </div></div>`;
}

/* ===== Student Detail ===== */
function renderStudent(ma){
  const app = byId("app");
  const s = DATA.hs.find(x => x.ma === ma);
  if (!s){ app.innerHTML = `<div class="alert alert-warning">Không tìm thấy học sinh ${ma}. <a href="#/">Quay lại</a></div>`; return; }

  app.innerHTML += `<nav aria-label="breadcrumb" class="mb-2"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="#/">Tổng quan</a></li><li class="breadcrumb-item active">${s.ten}</li></ol></nav>`;

  const cat = categories(s.trungBinh);
  const summary = document.createElement("div");
  summary.className = "row g-3 mb-3";
  summary.innerHTML = `
    <div class="col-lg-7"><div class="card card-soft h-100"><div class="card-body">
      <h2 class="h5 mb-1">${s.ten}</h2>
      <div class="small text-muted mb-3">${s.ma} • Sinh ngày: ${s.dob}</div>
      <div class="mb-2">Điểm thành phần</div>
      ${progress("Hệ 1", s.he1, 10)}
      ${progress("Hệ 2 (Bài kiểm tra)", s.he2, 10)}
      ${progress("Hệ 3 (Bài tập lớn)", s.he3, 10)}
      ${progress("Năng lực", s.nangLuc, 10)}
      ${progress("Điểm TB", s.trungBinh, 10)}
      <div class="mt-3"><span class="badge text-bg-${cat.cls}">Xếp loại: ${cat.label}</span></div>
    </div></div></div>
    <div class="col-lg-5"><div class="card card-soft h-100"><div class="card-body">
      <div class="d-flex align-items-center justify-content-between mb-2"><h3 class="h6 mb-0">So sánh với TB lớp</h3><span class="text-muted small">Radar</span></div>
      <canvas id="radarHS" height="160"></canvas>
    </div></div></div>`;
  app.appendChild(summary);

  if (typeof Chart !== "undefined"){
    const avgH1 = DATA.kpi.avgH1, avgH2 = DATA.kpi.avgH2, avgH3 = DATA.kpi.avgH3;
    new Chart(byId("radarHS"), { type:"radar",
      data: { labels: ["Hệ 1 (0..10)","Hệ 2 – Bài kiểm tra (0..10)","Hệ 3 – Bài tập lớn (0..10)"],
        datasets: [
          { label: s.ten, data: [s.he1, s.he2, s.he3], borderWidth: 1, pointRadius: 3 },
          { label: "TB lớp", data: [avgH1, avgH2, avgH3], borderWidth: 1, pointRadius: 3 }
        ] },
      options: { plugins:{legend:{position:"bottom"}}, scales:{ r:{ suggestedMin:0, suggestedMax:10 } } }
    });
  }

  const learned = document.createElement("div");
  learned.className = "card card-soft mb-3";
  learned.innerHTML = `<div class="card-body">
    <div class="mb-2 section-title">KIẾN THỨC ĐÃ HỌC</div>
    ${learnedHTML()}
  </div>`;
  app.appendChild(learned);

  const remark = document.createElement("div");
  remark.className = "card card-soft";
  remark.innerHTML = `<div class="card-body">
    <div class="mb-2 section-title">NHẬN XÉT ĐỊNH KỲ CỦA GIÁO VIÊN</div>
    ${teacherRemarkHTML(s)}
  </div>`;
  app.appendChild(remark);
}

function progress(label, val, max){
  const pct = Math.max(0, Math.min(100, (val/max)*100));
  return `<div class="mb-2">
    <div class="d-flex justify-content-between"><div class="small text-muted">${label}</div><div class="small"><strong>${fmt(val,2)}</strong> / ${fmt(max,0)}</div></div>
    <div class="progress thin"><div class="progress-bar" role="progressbar" style="width:${pct}%">${fmt(val,1)}</div></div>
  </div>`;
}

function learnedHTML(){
  return `<ul class="bulleted">
    <li><strong>1. Tổng quan về OOP</strong>
      <ul>
        <li>Khái niệm lập trình hướng đối tượng (Object-Oriented Programming - OOP) và vai trò.</li>
        <li>Các đặc điểm chính: <em>Đóng gói</em>, <em>Kế thừa</em>, <em>Đa hình</em>, <em>Trừu tượng</em>.</li>
        <li>So sánh OOP với lập trình thủ tục; ưu/nhược điểm khi thiết kế phần mềm.</li>
      </ul>
    </li>
    <li><strong>2. Xây dựng lớp và đối tượng</strong>
      <ul>
        <li>Khai báo lớp, thuộc tính, phương thức; các phương thức đặc biệt như <code>__init__</code>, <code>__str__</code>, <code>__repr__</code>.</li>
        <li>Thiết kế lớp theo trách nhiệm đơn (SRP), đặt tên thuộc tính/phương thức rõ nghĩa.</li>
        <li>Chuyển từ sơ đồ lớp (phác UML) sang cài đặt và thử nghiệm nhỏ.</li>
      </ul>
    </li>
    <li><strong>3. Kế thừa (Inheritance)</strong>
      <ul>
        <li>Kế thừa đơn, đa cấp; ghi đè phương thức; sử dụng <code>super()</code>.</li>
        <li>Khi nào nên kế thừa, khi nào nên ủy quyền (composition).</li>
      </ul>
    </li>
    <li><strong>4. Trừu tượng & Đa hình</strong>
      <ul>
        <li>Lớp/Phương thức trừu tượng; giao diện hành vi; mẫu thiết kế đơn giản.</li>
        <li>Đa hình qua overriding/overloading; lợi ích với khả năng mở rộng và kiểm thử.</li>
      </ul>
    </li>
  </ul>`;
}

/* === New detailed remark generator (narrative, "thầy" xưng, polite, bold/italic focus) === */
function evalMilestone(s){
  const arr = Array.isArray(s.diemdanh)? s.diemdanh : [];
  let last = 0;
  for (let i=0;i<arr.length;i++){ if (arr[i] !== -1) last = i+1; }
  const milestones = [4,9,12];
  let m = 4;
  for (const ms of milestones){ if (last >= ms) m = ms; }
  return m;
}
function teacherRemarkHTML(s){
  const milestone = evalMilestone(s);
  const ddRate = (s.dd_rate!=null && !isNaN(s.dd_rate)) ? Number(s.dd_rate).toFixed(1) : "—";
  const he1show = (s.he1!=null) ? fmt(s.he1,2) : "—";
  const he2show = (s.he2!=null && s.he2>=0) ? fmt(s.he2,2) : "—";
  const he3show = (s.he3!=null && s.he3>=0) ? fmt(s.he3,2) : "—";

  const ddComment = (s.dd_rate>=90) ? "tham gia khá đều" : (s.dd_rate>=75) ? "tham gia tương đối ổn định" : "cần cải thiện tính đều đặn";
  const he1Comment = (s.he1>=8) ? "vận dụng kiến thức ở mức tốt" : (s.he1>=6.5) ? "đã nắm ý chính nhưng cần luyện thêm" : "cần hệ thống hóa lại kiến thức nền";
  const he2Comment = (s.he2>=8) ? "khả năng tổng hợp kiến thức ở mức tốt" : (s.he2>=6.5) ? "đã nắm phần trọng tâm" : "cần ôn tập lại các khái niệm và kỹ thuật làm bài";
  const he3Comment = (s.he3>=8) ? "triển khai bài tập lớn tương đối vững" : (s.he3>=6.5) ? "đã đáp ứng yêu cầu cốt lõi" : "cần hướng dẫn thêm về tổ chức mã và kiểm thử";

  const needFocus = [];
  if (s.dd_rate<85) needFocus.push("chuyên cần và kế hoạch học đều");
  if (s.he1<6.5) needFocus.push("luyện tập bài hệ 1 để củng cố nền tảng");
  if (s.he2<6.5) needFocus.push("ôn tập cấu trúc đề kiểm tra và luyện đề có hướng dẫn");
  if (s.he3<6.5) needFocus.push("chia nhỏ yêu cầu bài tập lớn, bổ sung thử nghiệm và kiểm thử");
  const focusText = needFocus.length ? `Em nên tập trung vào ${needFocus.map(x=>`<em>${x}</em>`).join(", ")} trong các buổi tới.` : "Em tiếp tục duy trì nhị học hiện tại và mở rộng thêm các bài thực hành tự chọn.";

  const lines = [];
  lines.push(`<p><strong>Kính gửi quý phụ huynh và em ${s.ten}</strong>, thầy là <strong>Nguyễn Anh Trọng</strong> – giáo viên chính của lớp <strong>Siêu Nhân Lập Trình Web</strong>. Hôm nay là đợt nhận xét định kỳ tại <strong>buổi ${milestone}</strong> của học phần <strong>Pathway – Học phần 3: Lập trình hướng đối tượng (OOP)</strong>.</p>`);

  lines.push(`<p>Trong các buổi trước mốc đánh giá, lớp đã ôn luyện những nội dung trọng tâm về hướng đối tượng: khái niệm và vai trò của OOP; <em>lớp</em>, <em>đối tượng</em>, <em>thuộc tính</em>, <em>phương thức</em>; các đặc trưng <em>đóng gói</em>, <em>kế thừa</em>, <em>đa hình</em>, <em>trừu tượng</em>; cùng với cách áp dụng vào bối cảnh  (mô hình hoá <em>Model</em>, tổ chức <em>View</em>, ràng buộc logic trong <em>Class-Based View</em>). Những kiến thức này giúp em viết mã có cấu trúc, dễ mở rộng và thuận lợi khi phát triển tính năng mới trong dự án.</p>`);

  lines.push(`<p><strong>Về kiến thức</strong>, em ${he1Comment}. Điểm hệ 1 hiện ghi nhận <strong>${he1show}/10</strong>, phản ánh mức độ tiếp thu qua các bài tại lớp. Ở <strong>bài kiểm tra (Hệ 2)</strong>, kết quả <strong>${he2show}/10</strong> cho thấy em ${he2Comment}. Với <strong>bài tập lớn (Hệ 3)</strong>, điểm số <strong>${he3show}/10</strong> cùng nhận xét rằng em ${he3Comment}. Khi làm bài, em cần chú ý làm rõ phần thiết kế lớp, quan hệ giữa các lớp, và cách đặt tên phương thức để mã dễ đọc hơn.</p>`);

  lines.push(`<p><strong>Về kỹ năng</strong>, em thể hiện sự tiến bộ ở khả năng phân tích yêu cầu và chia nhỏ bài toán; thao tác với Git/GitHub và tổ chức mã nguồn đang dần ổn định. Thầy khuyến khích em <em>viết tài liệu ngắn</em> trước khi code (mô tả lớp, thuộc tính, hành vi), sau đó mới triển khai để hạn chế sửa đi sửa lại. Khi làm , nên luyện thêm <em>Class-Based View</em>, <em>Form/ModelForm</em> và thói quen tách logic sang <em>service/helper</em> để dự án rõ ràng.</p>`);

  const ddTone = (s.dd_rate>=90) ? "rất tốt" : (s.dd_rate>=75) ? "tương đối tốt" : "chưa ổn định";
  lines.push(`<p><strong>Về thái độ học tập</strong>, em có tinh thần hợp tác, ${ddComment}, và chủ động trao đổi khi gặp vướng mắc. Tỷ lệ điểm danh hiện tại là <strong>${ddRate}%</strong> (<em>${ddTone}</em>). Ở các tiết thảo luận, thầy ghi nhận nỗ lực lắng nghe và phản hồi của em; nếu duy trì nhịp độ này, em sẽ tự tin hơn khi trình bày phần kiến trúc OOP và demo chức năng.</p>`);

  lines.push(`<p><strong>Cần cải thiện</strong>: ${focusText} Bên cạnh đó, thầy gợi ý mỗi tuần dành tối thiểu <strong>2–3 phiên luyện tập</strong> (30–45 phút/phiên) để ôn <em>định nghĩa – ví dụ – phản ví dụ</em> cho từng đặc trưng OOP, đồng thời luyện <em>bài nhỏ</em> chuyển từ mô hình hoá lớp sang cài đặt  (Model + View + Template).</p>`);

  lines.push(`<p><strong>Định hướng cho các buổi tiếp theo</strong>: thầy sẽ tăng dần độ khó qua các bài <em>refactor</em> (đổi cấu trúc nhưng giữ hành vi), bổ sung yêu cầu <em>unit test</em> cơ bản để em hình thành thói quen kiểm thử; song song là các mini–project ngắn nhằm rèn cách tách lớp, đặt tên rõ nghĩa và quản lý phụ thuộc. Nếu có thời gian, em có thể tham gia thêm hoạt động <em>pair programming</em> để học hỏi phong cách thiết kế từ bạn bè.</p>`);

  lines.push(`<p><strong>Tổng kết đợt đánh giá buổi ${milestone}</strong>: kết quả hiện tại phản ánh nỗ lực nghiêm túc của em. Thầy tin rằng khi duy trì nhịp học đều và bổ sung thêm thực hành có mục tiêu, em sẽ đạt tiến bộ vững chắc trong phần còn lại của học phần. <em>Rất mong sự đồng hành của quý phụ huynh để nhắc con giữ lịch học đều và phản hồi sớm nếu cần hỗ trợ thêm</em>.</p>`);

  lines.push(`<p>Trân trọng,<br/><strong>Thầy Nguyễn Anh Trọng</strong><br/><em>Giáo viên – Lớp Siêu Nhân Lập Trình Web</em></p>`);

  return lines.join("");
}
