document.addEventListener("DOMContentLoaded", () => {
  const splashScreen = document.getElementById("splashScreen");
  const mainApp = document.getElementById("mainApp");
  const bottomNav = document.getElementById("bottomNav");

  setTimeout(() => {
    splashScreen.classList.add("splash-hidden");
    mainApp.classList.add("app-visible");
    bottomNav.classList.add("app-visible");
    setTimeout(() => splashScreen.style.display = "none", 600);
  }, 3500);

  // Sekme Geçişleri
  const navItems = document.querySelectorAll(".nav-item");
  const tabContents = document.querySelectorAll(".tab-content");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = item.getAttribute("data-target");

      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      tabContents.forEach(tab => tab.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");
    });
  });

  const mainPlusBtn = document.getElementById("mainPlusBtn");
  const quickLogBtn = document.getElementById("quickLogBtn");
  const cycleDayNumber = document.getElementById("cycleDayNumber");
  const daysLeftText = document.getElementById("daysLeftText");
  const daysGrid = document.getElementById("daysGrid");
  const monthYearDisplay = document.getElementById("monthYearDisplay");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const recordsList = document.getElementById("recordsList");
  const selectAllBtn = document.getElementById("selectAllBtn");
  const deleteSelectedBtn = document.getElementById("deleteSelectedBtn");
  const moodCardWrapper = document.getElementById("moodCardWrapper");
  const moodOptionsContainer = document.getElementById("moodOptionsContainer");
  const moodReactionBox = document.getElementById("moodReactionBox");
  const moodCardTitle = document.getElementById("moodCardTitle");
  const moodButtons = document.querySelectorAll(".mood-btn");

  let currentDate = new Date();
  let isAllSelected = false;

  const todayKey = new Date().toLocaleDateString('tr-TR');
  let dailyMoods = JSON.parse(localStorage.getItem("dailyMoods")) || {};
  let moodSubmittedToday = localStorage.getItem("moodSubmitted_" + todayKey) === "true";

  // Duygu seçimi ve animasyonlu reaksiyon / kapanış
  moodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const mood = btn.getAttribute("data-mood");
      dailyMoods[todayKey] = mood;
      localStorage.setItem("dailyMoods", JSON.stringify(dailyMoods));
      localStorage.setItem("moodSubmitted_" + todayKey, "true");

      let reactionText = "";
      if (mood === "Mutlu") {
        reactionText = "Yessssssss beeeeeee 🎉";
      } else if (mood === "Üzgün") {
        reactionText = "Kıyamamm neden? 😢";
      } else if (mood === "Sinirli" || mood === "Gergin") {
        reactionText = "Gazamız mübarek olsunnnn ⚔️";
      } else {
        reactionText = "Anladım güzelim ❤️";
      }

      moodOptionsContainer.style.display = "none";
      moodCardTitle.style.display = "none";
      moodReactionBox.style.display = "block";
      moodReactionBox.textContent = reactionText;

      setTimeout(() => {
        moodCardWrapper.classList.add("hidden");
      }, 2200);
    });
  });

  // 3 Ay (90 gün) otomatik temizlik ve veri yönetimi
  function getCleanPeriods() {
    let rawPeriods = JSON.parse(localStorage.getItem("periods")) || [];
    const now = new Date().getTime();
    const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000;

    let cleaned = rawPeriods.filter(dateStr => {
      let parts = dateStr.split('.');
      let recordDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
      return (now - recordDate) <= threeMonthsInMs;
    });

    if (cleaned.length !== rawPeriods.length) {
      localStorage.setItem("periods", JSON.stringify(cleaned));
    }
    return cleaned;
  }

  let periods = getCleanPeriods();

  function getPeriodDaysForDate(dateStr) {
    let parts = dateStr.split('.');
    let startDate = new Date(parts[2], parts[1] - 1, parts[0]);
    let activeDays = [];

    for (let i = 0; i < 7; i++) {
      let d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      activeDays.push(d.toDateString());
    }
    return activeDays;
  }

  function getAllActivePeriodDays() {
    let allDaysSet = new Set();
    periods.forEach(pDate => {
      let weekDays = getPeriodDaysForDate(pDate);
      weekDays.forEach(wd => allDaysSet.add(wd));
    });
    return allDaysSet;
  }

  // Takvim grid çizimi
  function renderCalendar() {
    daysGrid.innerHTML = "";
    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    let firstDayIndex = new Date(year, month, 1).getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    let totalDays = new Date(year, month + 1, 0).getDate();
    let activePeriodDays = getAllActivePeriodDays();

    for (let i = 0; i < firstDayIndex; i++) {
      let div = document.createElement("div");
      div.classList.add("day-cell", "other-month");
      daysGrid.appendChild(div);
    }

    for (let day = 1; day <= totalDays; day++) {
      let div = document.createElement("div");
      div.classList.add("day-cell");
      div.textContent = day;

      let currentCellDate = new Date(year, month, day);
      let dateStringFormatted = currentCellDate.toLocaleDateString('tr-TR');

      if (periods.includes(dateStringFormatted)) {
        div.classList.add("period-start");
      } else if (activePeriodDays.has(currentCellDate.toDateString())) {
        div.classList.add("period-active");
      }

      daysGrid.appendChild(div);
    }
  }

  // Takvim Ay Geçiş Animasyonları Fonksiyonu
  function changeMonthWithAnimation(direction) {
    if (direction === 'prev') {
      daysGrid.classList.add("animating-right");
      setTimeout(() => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
        daysGrid.classList.remove("animating-right");
      }, 200);
    } else {
      daysGrid.classList.add("animating-left");
      setTimeout(() => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
        daysGrid.classList.remove("animating-left");
      }, 200);
    }
  }

  // Kayıtlı Tarihler Listesini Render Etme
  function renderRecordsList() {
    recordsList.innerHTML = "";
    if (periods.length === 0) {
      recordsList.innerHTML = `<div style="text-align:center; color:#aaa; font-style:italic; padding:10px; font-size:12px;">Kayıt bulunmuyor</div>`;
      return;
    }

    periods.forEach(dateStr => {
      let itemDiv = document.createElement("div");
      itemDiv.classList.add("record-item");

      let checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = dateStr;
      checkbox.classList.add("record-checkbox");

      let span = document.createElement("span");
      span.textContent = `${dateStr} başlangıç tarihi`;

      itemDiv.appendChild(checkbox);
      itemDiv.appendChild(span);
      recordsList.appendChild(itemDiv);
    });
  }

  function updateUI() {
    periods = getCleanPeriods();

    const activeDays = getAllActivePeriodDays();
    const todayStringDate = new Date().toDateString();
    const isCurrentlyOnPeriod = activeDays.has(todayStringDate);

    moodSubmittedToday = localStorage.getItem("moodSubmitted_" + todayKey) === "true";
    if (isCurrentlyOnPeriod && !moodSubmittedToday) {
      moodCardWrapper.classList.remove("hidden");
    } else {
      moodCardWrapper.classList.add("hidden");
    }

    if (periods.length === 0) {
      cycleDayNumber.textContent = "1";
      daysLeftText.textContent = "Kayıt bekleniyor";
      renderCalendar();
      renderRecordsList();
      return;
    }

    const lastDateStr = periods[0];
    const parts = lastDateStr.split('.');
    const lastDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const today = new Date();
    
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    cycleDayNumber.textContent = diffDays;

    const remaining = 28 - diffDays;
    if (remaining > 0) {
      daysLeftText.textContent = `${remaining} Gün kaldı`;
    } else {
      daysLeftText.textContent = `Döngü günü geldi/geçti`;
    }

    renderCalendar();
    renderRecordsList();
  }

  function logToday() {
    const todayStr = new Date().toLocaleDateString('tr-TR');
    if (!periods.includes(todayStr)) {
      periods.unshift(todayStr);
      localStorage.setItem("periods", JSON.stringify(periods));
      localStorage.removeItem("moodSubmitted_" + todayKey);
      updateUI();
      alert("Bugünün tarihi ve takip eden 7 günlük döngü başarıyla işlendi güzelim! ❤️");
    } else {
      alert("Bu tarih zaten kayıtlı.");
    }
  }

  mainPlusBtn.addEventListener("click", logToday);
  quickLogBtn.addEventListener("click", logToday);

  prevMonthBtn.addEventListener("click", () => changeMonthWithAnimation('prev'));
  nextMonthBtn.addEventListener("click", () => changeMonthWithAnimation('next'));

  selectAllBtn.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".record-checkbox");
    isAllSelected = !isAllSelected;
    checkboxes.forEach(cb => cb.checked = isAllSelected);
    selectAllBtn.textContent = isAllSelected ? "Seçimi Kaldır" : "Hepsini Seç";
  });

  deleteSelectedBtn.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".record-checkbox:checked");
    if (checkboxes.length === 0) {
      alert("Lütfen silinecek kayıtları seç güzelim.");
      return;
    }

    const valuesToDelete = Array.from(checkboxes).map(cb => cb.value);
    periods = periods.filter(p => !valuesToDelete.includes(p));
    localStorage.setItem("periods", JSON.stringify(periods));

    isAllSelected = false;
    selectAllBtn.textContent = "Hepsini Seç";
    updateUI();
    alert("Seçilen kayıtlar başarıyla temizlendi.");
  });

  updateUI();
});