// ==========================================
// 1. БАСТАПҚЫ ДЕРЕКТЕР
// ==========================================
const dayNamesKazakh = {
    "sunday": "Жексенбі",
    "monday": "Дүйсенбі",
    "tuesday": "Сейсенбі",
    "wednesday": "Сәрсенбі",
    "thursday": "Бейсенбі",
    "friday": "Жұма",
    "saturday": "Сенбі"
};

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getTodayKey() {
    return dayKeys[new Date().getDay()];
}

// ==========================================
// 2. БАСТЫ БЕТТІ ЖҮКТЕУ (INDEX.HTML)
// ==========================================
async function renderSchedule() {
    const classSelect = document.getElementById('select-class-view');
    const daySelect = document.getElementById('select-day-view');
    const tableBody = document.getElementById('today-schedule-body');
    const label = document.getElementById('current-day-label');

    if (!classSelect || !tableBody) return;

    const selectedClass = classSelect.value;
    let selectedDay = daySelect.value;

    if (selectedDay === 'today') {
        selectedDay = getTodayKey();
    }

    const dayName = dayNamesKazakh[selectedDay] || selectedDay;
    label.innerText = `Көрсетіліп тұр: ${selectedClass} сыныбы — ${dayName}`;

    tableBody.innerHTML = '';

    let daySchedule = null;

    try {
        // schedule.json файлын кэшсіз жүктеу (v=...)
        const response = await fetch('schedule.json?v=' + new Date().getTime());
        if (response.ok) {
            const fileData = await response.json();

            // Сынып атын регистрге және бос орындарға қарамастан табу
            const matchedKey = Object.keys(fileData).find(
                key => key.trim().toLowerCase() === selectedClass.trim().toLowerCase()
            );

            if (matchedKey && fileData[matchedKey][selectedDay]) {
                daySchedule = fileData[matchedKey][selectedDay];
            }
        }
    } catch (e) {
        console.error("schedule.json жүктелмеді:", e);
    }

    // Егер дерек табылмаса
    if (!daySchedule || daySchedule.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                    <i class="fa-solid fa-mug-hot" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
                    Бұл күні сабақ жоқ немесе кесте енгізілмеген.
                </td>
            </tr>`;
        return;
    }

    // Деректерді кестеге шығару
    daySchedule.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.num}</strong></td>
            <td><i class="fa-regular fa-clock" style="margin-right: 5px; color: var(--accent-gold);"></i>${item.time}</td>
            <td><strong>${item.subject}</strong></td>
            <td><span class="badge">${item.room}-кабинет</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function loadCanteenAndNews() {
    // Асхана суретін шығару
    const canteenContainer = document.getElementById('canteen-container');
    if (canteenContainer) {
        const savedImage = localStorage.getItem('canteenMenuImage');
        if (savedImage) {
            canteenContainer.innerHTML = `<img src="${savedImage}" alt="Асхана мәзірі" style="width: 100%; max-width: 800px; height: auto; border-radius: 10px; border: 1px solid var(--border-color); display: block; margin: 0 auto;">`;
        } else {
            canteenContainer.innerHTML = `<p style="color: var(--text-secondary); padding: 20px;">Асхана мәзірі әлі жүктелмеген.</p>`;
        }
    }

    // Жаңалықтарды шығару
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        let newsList = JSON.parse(localStorage.getItem('newsList')) || [
            { id: 1, title: "«Алтын күз» мерекелік іс-шарасы", content: "Осы жұма күні мектебімізде 5-8 сыныптар арасында «Алтын күз» сайысы өтеді." }
        ];

        newsContainer.innerHTML = '';
        newsList.forEach(item => {
            const div = document.createElement('div');
            div.style.cssText = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; border-left: 4px solid var(--accent-gold);';
            div.innerHTML = `
                <h4 style="margin-bottom: 5px; color: var(--accent-gold);">${item.title}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">${item.content}</p>
            `;
            newsContainer.appendChild(div);
        });
    }
}

// ==========================================
// 3. АДМИН ПАНЕЛІ (ADMIN.HTML)
// ==========================================
function initAdminPanel() {
    const scheduleForm = document.getElementById('add-schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Кесте орталықтандырылған schedule.json файлы арқылы басқарылады. Изменения вносите в файл schedule.json на GitHub!');
        });
    }

    const canteenForm = document.getElementById('add-canteen-form');
    if (canteenForm) {
        canteenForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('canteen-image-file');
            const file = fileInput.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    localStorage.setItem('canteenMenuImage', evt.target.result);
                    alert('✅ Мәзір суреті жаңартылды!');
                    location.reload();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const newsForm = document.getElementById('add-news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('news-title').value;
            const content = document.getElementById('news-content').value;

            let newsList = JSON.parse(localStorage.getItem('newsList')) || [];
            newsList.unshift({ id: Date.now(), title, content });

            localStorage.setItem('newsList', JSON.stringify(newsList));
            alert('📢 Хабарландыру жарияланды!');
            newsForm.reset();
            renderAdminNews();
        });

        renderAdminNews();
    }
}

function renderAdminNews() {
    const container = document.getElementById('admin-news-container');
    if (!container) return;

    let newsList = JSON.parse(localStorage.getItem('newsList')) || [];
    container.innerHTML = '';

    if (newsList.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">Белсенді хабарландырулар жоқ.</p>';
        return;
    }

    newsList.forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = 'background: rgba(255,255,255,0.05); padding: 15px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;';
        div.innerHTML = `
            <div>
                <h4 style="color: var(--accent-gold);">${item.title}</h4>
                <p style="font-size: 0.9rem; color: var(--text-secondary);">${item.content}</p>
            </div>
            <button onclick="deleteNews(${item.id})" style="background: rgba(255,50,50,0.2); color: #ff4d4d; border: 1px solid #ff4d4d; padding: 6px 10px; border-radius: 6px; cursor: pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function deleteNews(id) {
    let newsList = JSON.parse(localStorage.getItem('newsList')) || [];
    newsList = newsList.filter(item => item.id !== id);
    localStorage.setItem('newsList', JSON.stringify(newsList));
    renderAdminNews();
}

// ==========================================
// 4. ІСКЕ ҚОСУ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const classSelect = document.getElementById('select-class-view');
    const daySelect = document.getElementById('select-day-view');

    if (classSelect && daySelect) {
        classSelect.addEventListener('change', renderSchedule);
        daySelect.addEventListener('change', renderSchedule);
        renderSchedule();
        loadCanteenAndNews();
    }

    initAdminPanel();
});
