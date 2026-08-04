document.addEventListener('DOMContentLoaded', () => {
    // --- YEREL TARİH YARDIMCISI ---
    function getLocalDateString(d = new Date()) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const todayStr = getLocalDateString();
    const periodDuration = 7; 

    // --- 1. AÇILIŞ EKRANI (SPLASH SCREEN) ---
    const splash = document.getElementById('splashScreen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            splash.style.transition = 'opacity 0.5s ease';
            setTimeout(() => splash.classList.add('splash-hidden'), 500);
        }, 1800);
    }

    // --- 2. SEKME (TAB) GEÇİŞLERİ (Animasyonlu) ---
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            item.classList.add('active');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.add('active');
            }
        });
    });

    // --- 3. VERİ YÖNETİMİ ---
    let periodDates = JSON.parse(localStorage.getItem('periodDates')) || [];
    
    // --- 4. DUYGU DURUMU VE ZAMANLAYICILAR (AKILLI KONTROL) ---
    const moodCardWrapper = document.getElementById('moodCardWrapper');
    const moodReactionBox = document.getElementById('moodReactionBox');
    const moodOptionsContainer = document.getElementById('moodOptionsContainer');
    const moodCardTitle = document.getElementById('moodCardTitle');
    const moodBtns = document.querySelectorAll('.mood-btn');

    let currentMood = localStorage.getItem('savedMood');
    let moodSetDate = localStorage.getItem('moodSetDate');
    
    let moodFadeOutTimer;
    let wrapperHideTimer;

    const moodResponses = {
        "Mutlu": "Hep böyle gülmeye devam et bebeğim, seni seviyorum! ❤️",
        "Üzgün": "Kıyamam sana... Yanında değilsem bile kalbim seninle güzelim. 🥺",
        "Sinirli": "Tamam tamam sakin ol, hepsi hormonlardan. Derin bir nefes al... 💆‍♀️",
        "Gergin": "Sıcak bir şeyler içip biraz uzanmaya ne dersin güzelim? Geçecek... 🌸",
        "Bilmiyorum/Diğer": "Ne hissedersen hisset, her halinde yanındayım. 🫂"
    };

    function isTodayPeriodDay() {
        if(periodDates.length === 0) return false;
        const todayLocal = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        
        for (let dateStr of periodDates) {
            const [y, m, d] = dateStr.split('-');
            const sDate = new Date(y, m - 1, d);
            const diffDays = Math.floor((todayLocal - sDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays < periodDuration) return true;
        }
        return false;
    }

    function updateMoodVisibility() {
        if (!moodCardWrapper) return;
        
        // Önceki animasyon ve gizleme komutlarını iptal et ki kart takılı kalmasın
        clearTimeout(wrapperHideTimer);
        clearTimeout(moodFadeOutTimer);
        
        if (isTodayPeriodDay()) {
            moodCardWrapper.style.display = 'block';
            moodCardWrapper.classList.remove('hidden');
            moodCardWrapper.style.opacity = '1';
            
            // Üstünde daha önceden kalma silinme efekti varsa temizle
            moodReactionBox.classList.remove('fade-out-msg');

            // Eğer bugün zaten bir duygu seçildiyse mesajı göster, yoksa soruları sor
            if (currentMood && moodSetDate === todayStr) {
                showMoodReaction(currentMood, false); 
            } else {
                moodOptionsContainer.style.display = 'flex';
                moodCardTitle.style.display = 'block';
                moodReactionBox.style.display = 'none';
            }
        } else {
            moodCardWrapper.style.display = 'none';
        }
    }

    function showMoodReaction(mood, triggerTimeout = true) {
        if (!moodOptionsContainer || !moodCardTitle || !moodReactionBox) return;
        
        moodOptionsContainer.style.display = 'none';
        moodCardTitle.style.display = 'none';
        
        moodReactionBox.innerHTML = moodResponses[mood] || "Seni çok seviyorum!";
        moodReactionBox.classList.remove('fade-out-msg');
        moodReactionBox.style.display = 'block';
        moodReactionBox.style.opacity = '1';

        clearTimeout(moodFadeOutTimer);
        clearTimeout(wrapperHideTimer);

        if(triggerTimeout) {
            moodFadeOutTimer = setTimeout(() => {
                moodReactionBox.classList.add('fade-out-msg');
                wrapperHideTimer = setTimeout(() => {
                    if(moodCardWrapper) moodCardWrapper.style.display = 'none';
                }, 1000); 
            }, 6500); 
        }
    }

    moodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedMood = btn.getAttribute('data-mood');
            localStorage.setItem('savedMood', selectedMood);
            localStorage.setItem('moodSetDate', todayStr);
            currentMood = selectedMood;
            moodSetDate = todayStr;
            showMoodReaction(selectedMood, true);
        });
    });

    // --- GEÇMİŞ VERİLERE GÖRE AKILLI DÖNGÜ HESAPLAMA ---
    function getAverageCycleLength() {
        if (periodDates.length < 2) return 28;
        const sorted = [...periodDates].sort((a, b) => new Date(a) - new Date(b));
        let totalDays = 0;
        let validCycles = 0;

        for (let i = 1; i < sorted.length; i++) {
            const date1 = new Date(sorted[i-1]);
            const date2 = new Date(sorted[i]);
            const diffDays = Math.ceil(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
            if (diffDays >= 15 && diffDays <= 45) {
                totalDays += diffDays;
                validCycles++;
            }
        }
        if (validCycles === 0) return 28;
        return Math.round(totalDays / validCycles);
    }

    // --- 5. TAKVİM VE EKRAN RENDER İŞLEMLERİ ---
    const daysGrid = document.getElementById('daysGrid');
    const monthYearDisplay = document.getElementById('monthYearDisplay');
    const cycleDayNumber = document.getElementById('cycleDayNumber');
    const daysLeftText = document.getElementById('daysLeftText');
    const mainPlusBtn = document.getElementById('mainPlusBtn');
    const quickLogBtn = document.getElementById('quickLogBtn');

    let currentDate = new Date();

    function renderCalendar() {
        if (!daysGrid || !monthYearDisplay) return;

        daysGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        
        monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

        let emptyDays = firstDay === 0 ? 6 : firstDay - 1;
        for (let i = 0; i < emptyDays; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'day-cell other-month';
            daysGrid.appendChild(emptyDiv);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'day-cell';
            dayDiv.textContent = i;
            dayDiv.style.cursor = 'pointer';

            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const cellDateObj = new Date(year, month, i);

            let isStartDay = false;
            let isInsidePeriod = false;

            for (let startDateStr of periodDates) {
                const [sy, sm, sd] = startDateStr.split('-');
                const sDateObj = new Date(sy, sm - 1, sd);
                const diffDays = Math.floor((cellDateObj - sDateObj) / (1000 * 60 * 60 * 24));

                if (diffDays === 0) {
                    isStartDay = true; break;
                } else if (diffDays > 0 && diffDays < periodDuration) {
                    isInsidePeriod = true;
                }
            }

            if (isStartDay) dayDiv.classList.add('period-start');
            else if (isInsidePeriod) dayDiv.classList.add('period-active');

            dayDiv.addEventListener('click', () => togglePeriodDate(cellDateStr));
            daysGrid.appendChild(dayDiv);
        }

        updateDashboardInfo();
        renderRecords();
        updateMoodVisibility();
    }

    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    if (prevBtn) prevBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });

    function togglePeriodDate(dateStr) {
        if (periodDates.includes(dateStr)) {
            periodDates = periodDates.filter(d => d !== dateStr);
        } else {
            periodDates.push(dateStr);
        }
        periodDates.sort().reverse();
        localStorage.setItem('periodDates', JSON.stringify(periodDates));
        
        // EĞER BUGÜNÜ REGL OLARAK İŞARETLEDİYSE VEYA KALDIRDIYSA HAFIZAYI TAMAMEN SIFIRLA!
        if (dateStr === todayStr) {
            localStorage.removeItem('savedMood');
            localStorage.removeItem('moodSetDate');
            currentMood = null;
            moodSetDate = null;
        }
        
        renderCalendar();
    }

    function toggleTodayPeriod() { togglePeriodDate(todayStr); }

    if (mainPlusBtn) mainPlusBtn.addEventListener('click', toggleTodayPeriod);
    if (quickLogBtn) quickLogBtn.addEventListener('click', toggleTodayPeriod);

    function updateDashboardInfo() {
        if (!cycleDayNumber || !daysLeftText) return;

        if (periodDates.length === 0) {
            cycleDayNumber.textContent = "?";
            daysLeftText.textContent = "Kayıt bekleniyor";
            return;
        }

        const sortedDates = [...periodDates].sort().reverse();
        const lastPeriodParts = sortedDates[0].split('-');
        const lastPeriod = new Date(lastPeriodParts[0], lastPeriodParts[1] - 1, lastPeriodParts[2]);
        const todayLocal = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

        const diffDays = Math.floor((todayLocal - lastPeriod) / (1000 * 60 * 60 * 24)) + 1;

        cycleDayNumber.textContent = diffDays >= 1 ? diffDays : "1";

        const dynamicCycleLength = getAverageCycleLength(); 
        const nextPeriod = new Date(lastPeriod);
        nextPeriod.setDate(nextPeriod.getDate() + dynamicCycleLength);

        const daysLeft = Math.ceil((nextPeriod - todayLocal) / (1000 * 60 * 60 * 24));

        if (daysLeft > 0) daysLeftText.textContent = `Tahmini ${daysLeft} gün kaldı`;
        else if (daysLeft === 0) daysLeftText.textContent = "Bugün bekleniyor";
        else daysLeftText.textContent = `${Math.abs(daysLeft)} gün gecikti`;
    }

    const recordsList = document.getElementById('recordsList');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectAllBtn = document.getElementById('selectAllBtn');

    function renderRecords() {
        if (!recordsList) return;
        recordsList.innerHTML = '';
        if (periodDates.length === 0) {
            recordsList.innerHTML = '<div style="text-align:center; padding:10px; color:#888;">Henüz bir tarih kaydetmedin güzelim.</div>';
            return;
        }

        periodDates.forEach(dateStr => {
            const [y, m, d] = dateStr.split('-');
            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';
            recordItem.innerHTML = `
                <input type="checkbox" value="${dateStr}" class="record-check">
                <span>${d}.${m}.${y} - Regl Başlangıcı</span>
            `;
            recordsList.appendChild(recordItem);
        });
    }

    let isAllSelected = false;
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.record-check');
            isAllSelected = !isAllSelected;
            checkboxes.forEach(cb => cb.checked = isAllSelected);
            selectAllBtn.textContent = isAllSelected ? "Seçimi Kaldır" : "Hepsini Seç";
        });
    }

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.record-check:checked');
            if (checkboxes.length === 0) {
                alert("Silmek için önce kutucuklardan bir tarih seçmelisin.");
                return;
            }
            if (confirm("Seçtiğin tarihleri siliyorum, emin misin?")) {
                checkboxes.forEach(cb => { periodDates = periodDates.filter(d => d !== cb.value); });
                localStorage.setItem('periodDates', JSON.stringify(periodDates));
                isAllSelected = false;
                if (selectAllBtn) selectAllBtn.textContent = "Hepsini Seç";
                renderCalendar();
            }
        });
    }

    // Uygulama ilk açıldığında çalıştır
    renderCalendar();
    updateMoodVisibility();
});