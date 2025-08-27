document.addEventListener("DOMContentLoaded", () => {
  fetch("data.json")
    .then(res => res.json())
    .then(data => {
      const total = data.reduce((sum, s) => sum + parseFloat(s.diem), 0);
      const avg = (total / data.length).toFixed(2);
      document.getElementById("avg-score").textContent = avg;
    });

  const form = document.getElementById("lookup-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim().toLowerCase();
    const dob = document.getElementById("dob").value.trim();

    const res = await fetch("data.json");
    const data = await res.json();
    const student = data.find(s => 
      s.ten_hoc_sinh.toLowerCase() === name && s.ngay_sinh === dob
    );

    if (student) {
      window.location.href = `student.html?id=${student.ma_hoc_sinh}`;
    } else {
      document.getElementById("error-msg").textContent = "Không có kết quả phù hợp, vui lòng nhập lại.";
    }
  });
});
