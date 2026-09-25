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
        // 1. Сначала пробуем загрузить из файла schedule.json
        const response = await fetch('schedule.json');
        if (response.ok) {
            const fileData = await response.json();
            daySchedule = fileData[selectedClass]?.[selectedDay];
        }
    } catch (e) {
        console.log("Файл schedule.json жүктелмеді, резервтік деректер қолданылады");
    }

    // 2. Если в файле нет данных, проверяем localStorage или defaultSchedules
    if (!daySchedule) {
        const customSchedules = JSON.parse(localStorage.getItem('customSchedules')) || {};
        daySchedule = customSchedules[selectedClass]?.[selectedDay] || defaultSchedules[selectedClass]?.[selectedDay];
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
