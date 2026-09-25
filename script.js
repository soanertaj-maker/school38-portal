// ==========================================
// 1. БАСТАПҚЫ ДЕРЕКТЕР ЖӘНЕ КӨМЕКШІ ФУНКЦИЯЛАР
// ==========================================

// ImgBB API кілті
const IMGBB_API_KEY = "8aa6b18e631f2a70f12623513f63c0c6"; 

// ⚠️ JSONBin кілттерін осы жерге қойыңыз:
const JSONBIN_BIN_ID = "6ab64ec9ac6210605af3ea32"; 
const JSONBIN_API_KEY = "$2a$10$MkodS7RsiDGodZmgznEsD.vz2dMcga9sKGifdQv4BCqaRiwlO0DEe"; 

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

// Әріптерді нормализациялау (кириллица/латиница Ә/Ə айырмашылығын жою)
function cleanClassString(str) {
    if (!str) return '';
    return str.replace(/Ə/g, 'Ә').replace(/ə/g, 'ә').trim().toLowerCase();
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

    localStorage.removeItem('customSchedules');

    const selectedClass = classSelect.value;
    let selectedDay = daySelect.value;

    if (selectedDay === 'today') {
        selectedDay = getTodayKey();
    }

    const dayName = dayNamesKazakh[selectedDay] || selectedDay;
    if (label) {
        label.innerText = `Көрсетіліп тұр: ${selectedClass} сыныбы — ${dayName}`;
    }

    tableBody.innerHTML = '';

    let daySchedule = null;

    try {
        const response = await fetch('schedule.json?v=' + Date.now());
        if (response.ok) {
            const fileData = await response.json();

            const matchedKey = Object.keys(fileData).find(
                key => cleanClassString(key) === cleanClassString(selectedClass)
            );

            if (matchedKey && fileData[matchedKey] && fileData[matchedKey][selectedDay]) {
                daySchedule = fileData[matchedKey][selectedDay];
            }
        } else {
            console.error("schedule.json файлы табылмады!");
        }
    } catch (e) {
        console.error("schedule.json жүктелмеді немесе JSON форматында қате бар:", e);
    }

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

async function loadCanteenAndNews() {
    // Асхана суретін онлайн JSONBin ортақ базасынан алу
    const canteenContainer = document.getElementById('canteen-container');
    if (canteenContainer) {
        try {
            const res = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
                headers: { 'X-Master-Key': JSONBIN_API_KEY }
            });
            const data = await res.json();
            const imageUrl = (data.record && data.record.canteenImage) ? data.record.canteenImage : null;

            if (imageUrl) {
                canteenContainer.innerHTML = `<img src="${imageUrl}" alt="Асхана мәзірі" style="width: 100%; max-width: 800px; height: auto; border-radius: 10px; border: 1px solid var(--border-color); display: block; margin: 0 auto;">`;
            } else {
                canteenContainer.innerHTML = `<p style="color: var(--text-secondary); padding: 20px;">Асхана мәзірі әлі жүктелмеген.</p>`;
            }
        } catch (e) {
            console.error("Мәзірді жүктеу қатесі:", e);
            canteenContainer.innerHTML = `<p style="color: var(--text-secondary); padding: 20px;">Асхана мәзірін жүктеуде қате пайда болды.</p>`;
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

    // Асхана мәзірін ImgBB + JSONBin ортақ сақтау базасына жүктеу
    const canteenForm = document.getElementById('add-canteen-form');
    if (canteenForm) {
        canteenForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('canteen-image-file');
            const file = fileInput.files[0];

            if (!file) {
                alert('Өтініш, сурет файлын таңдаңыз!');
                return;
            }

            const submitBtn = canteenForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Серверге жүктелуде... Күте тұрыңыз";
            submitBtn.disabled = true;

            try {
                // 1. Суретті ImgBB-ге жүктеу
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    const imageUrl = result.data.url;

                    // 2. Сілтемені JSONBin ортақ базасына сақтау
                    await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Master-Key': JSONBIN_API_KEY
                        },
                        body: JSON.stringify({ canteenImage: imageUrl })
                    });

                    alert('✅ Мәзір суреті сәтті жаңартылды! Енді барлық пайдаланушылар мен құрылғыларда бірдей көрінеді.');
                    location.reload();
                } else {
                    alert('❌ Суретті жүктеу қатесі: ' + (result.error ? result.error.message : 'Белгісіз қате'));
                }
            } catch (err) {
                console.error(err);
                alert('❌ Желіде қате пайда болды. Интернет байланысын тексеріңіз.');
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
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
