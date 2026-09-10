// ==========================================
// 1. БАСТАПҚЫ САБАҚ КЕСТЕСІ ДЕРЕКТЕРІ
// ==========================================
const defaultSchedules = {
    "8Ә": {
        "monday": [
            { num: 1, time: "08:00 - 08:45", subject: "Қазақ тілі", room: "204" },
            { num: 2, time: "08:50 - 09:35", subject: "Алгебра", room: "310" },
            { num: 3, time: "09:45 - 10:30", subject: "Физика", room: "108" },
            { num: 4, time: "10:40 - 11:25", subject: "Ағылшын тілі", room: "215" },
            { num: 5, time: "11:35 - 12:20", subject: "Дене шынықтыру", room: "Спортзал" }
        ],
        "tuesday": [
            { num: 1, time: "08:00 - 08:45", subject: "Геометрия", room: "310" },
            { num: 2, time: "08:50 - 09:35", subject: "Химия", room: "202" },
            { num: 3, time: "09:45 - 10:30", subject: "Информатика", room: "102" },
            { num: 4, time: "10:40 - 11:25", subject: "Қазақ әдебиеті", room: "204" }
        ],
        "wednesday": [
            { num: 1, time: "08:00 - 08:45", subject: "Алгебра", room: "310" },
            { num: 2, time: "08:50 - 09:35", subject: "Биология", room: "206" },
            { num: 3, time: "09:45 - 10:30", subject: "Орыс тілі", room: "212" }
        ],
        "thursday": [
            { num: 1, time: "08:00 - 08:45", subject: "Физика", room: "108" },
            { num: 2, time: "08:50 - 09:35", subject: "Қазақ тілі", room: "204" },
            { num: 3, time: "09:45 - 10:30", subject: "Ағылшын тілі", room: "215" }
        ],
        "friday": [
            { num: 1, time: "08:00 - 08:45", subject: "Геометрия", room: "310" },
            { num: 2, time: "08:50 - 09:35", subject: "Химия", room: "202" },
            { num: 3, time: "09:45 - 10:30", subject: "Сынып сағаты", room: "204" }
        ],
        "saturday": [
            { num: 1, time: "09:00 - 09:45", subject: "Факультатив", room: "310" }
        ]
    }
};

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
function renderSchedule() {
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

    // Деректерді localstorage-тен немесе стандартты кестеден алу
    const customSchedules = JSON.parse(localStorage.getItem('customSchedules')) || {};
    const daySchedule = customSchedules[selectedClass]?.[selectedDay] || defaultSchedules[selectedClass]?.[selectedDay];

    tableBody.innerHTML = '';

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
            canteenContainer.innerHTML = `<p style="color: var(--text-secondary); padding: 20px;">Асхана мәзірі әлі жүктелмеген (Админ панелінен сурет енгізіңіз).</p>`;
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
// 3. АДМИН ПАНЕЛІНІҢ БАСҚАРУЫ (ADMIN.HTML)
// ==========================================
function initAdminPanel() {
    // 1. Кесте сақтау
    const scheduleForm = document.getElementById('add-schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const className = document.getElementById('sched-class').value;
            const day = document.getElementById('sched-day').value;
            const textData = document.getElementById('sched-items').value.trim();

            const lines = textData.split('\n');
            const parsedSchedule = lines.map((line, index) => {
                const parts = line.split('|').map(s => s.trim());
                return {
                    num: index + 1,
                    time: parts[0] || '—',
                    subject: parts[1] || parts[0],
                    room: parts[2] || '—'
                };
            });

            let customSchedules = JSON.parse(localStorage.getItem('customSchedules')) || {};
            if (!customSchedules[className]) customSchedules[className] = {};
            customSchedules[className][day] = parsedSchedule;

            localStorage.setItem('customSchedules', JSON.stringify(customSchedules));
            alert('✅ Кесте сақталды!');
            scheduleForm.reset();
        });
    }

    // 2. Асхана фотосын сақтау
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

        const savedImage = localStorage.getItem('canteenMenuImage');
        const previewDiv = document.getElementById('canteen-preview');
        if (savedImage && previewDiv) {
            previewDiv.innerHTML = `<p style="color: var(--text-secondary); margin-bottom: 8px;">Ағымдағы сурет:</p>
            <img src="${savedImage}" style="max-width: 100%; max-height: 250px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">`;
        }
    }

    // 3. Хабарландыру қосу
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

function clearAllNews() {
    if (confirm('Барлық хабарландыруды өшіруге сенімдісіз бе?')) {
        localStorage.removeItem('newsList');
        renderAdminNews();
    }
}

// ==========================================
// 4. ТІКЕЛЕЙ ОРЫНДАУ
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