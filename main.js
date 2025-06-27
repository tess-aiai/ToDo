const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const calendar = document.getElementById('calendar');
const calendarTitle = document.getElementById('calendar-title');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const selectedDateLabel = document.getElementById('selected-date-label');

let currentYear, currentMonth;
let selectedDate = getToday();

// todosは {"YYYY-MM-DD": [ {text, completed}, ... ] } 形式
let todosByDate = {};

function saveTodos() {
    localStorage.setItem('todosByDate', JSON.stringify(todosByDate));
}

function loadTodos() {
    const data = localStorage.getItem('todosByDate');
    if (data) {
        todosByDate = JSON.parse(data);
    } else {
        todosByDate = {};
    }
}

function getToday() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function renderTodos() {
    todoList.innerHTML = '';
    const list = todosByDate[selectedDate] || [];
    list.forEach((todo, idx) => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => {
            todosByDate[selectedDate][idx].completed = checkbox.checked;
            saveTodos();
            renderTodos();
        });

        const label = document.createElement('span');
        label.className = 'todo-label' + (todo.completed ? ' completed' : '');
        label.textContent = todo.text;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', () => {
            todosByDate[selectedDate].splice(idx, 1);
            if (todosByDate[selectedDate].length === 0) {
                delete todosByDate[selectedDate];
            }
            saveTodos();
            renderTodos();
            renderCalendar();
        });

        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (text) {
        if (!todosByDate[selectedDate]) todosByDate[selectedDate] = [];
        todosByDate[selectedDate].push({ text, completed: false });
        saveTodos();
        renderTodos();
        renderCalendar();
        todoInput.value = '';
    }
});

function renderCalendar() {
    calendar.innerHTML = '';
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    calendarTitle.textContent = `${currentYear}年${currentMonth + 1}月`;

    // 曜日ヘッダー
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    let tr = document.createElement('tr');
    daysOfWeek.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        tr.appendChild(th);
    });
    calendar.appendChild(tr);

    let date = 1;
    for (let i = 0; i < 6; i++) {
        tr = document.createElement('tr');
        for (let j = 0; j < 7; j++) {
            const td = document.createElement('td');
            if (i === 0 && j < startDay) {
                td.textContent = '';
            } else if (date > daysInMonth) {
                td.textContent = '';
            } else {
                const ymd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                td.textContent = date;
                td.className = 'calendar-date';
                if (ymd === selectedDate) {
                    td.classList.add('selected');
                }
                if (todosByDate[ymd] && todosByDate[ymd].length > 0) {
                    td.classList.add('has-todo');
                    // 過去日付で未完了タスクがある場合は赤く
                    const now = new Date();
                    const cellDate = new Date(ymd);
                    if (cellDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                        const hasUncompleted = todosByDate[ymd].some(t => !t.completed);
                        if (hasUncompleted) {
                            td.classList.add('overdue');
                        }
                    }
                }
                td.addEventListener('click', () => {
                    selectedDate = ymd;
                    renderTodos();
                    renderCalendar();
                    renderSelectedDateLabel();
                });
                date++;
            }
            tr.appendChild(td);
        }
        calendar.appendChild(tr);
        if (date > daysInMonth) break;
    }
}

function renderSelectedDateLabel() {
    selectedDateLabel.textContent = `${selectedDate} のタスク`;
}

prevMonthBtn.addEventListener('click', () => {
    if (currentMonth === 0) {
        currentYear--;
        currentMonth = 11;
    } else {
        currentMonth--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    if (currentMonth === 11) {
        currentYear++;
        currentMonth = 0;
    } else {
        currentMonth++;
    }
    renderCalendar();
});

// 初期化
loadTodos();
const today = new Date();
currentYear = today.getFullYear();
currentMonth = today.getMonth();
selectedDate = getToday();
renderCalendar();
renderSelectedDateLabel();
renderTodos();
