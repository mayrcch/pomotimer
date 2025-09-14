export class TodoManager {
    constructor(pomodoroTimer) {
        this.pomodoroTimer = pomodoroTimer;
        this.menuToggle = document.getElementById('menuToggle');
        this.todoSidebar = document.getElementById('todoSidebar');
        this.closeTodoBtn = document.getElementById('closeTodoBtn');
        this.todoInput = document.getElementById('todoInput');
        this.addTodoBtn = document.getElementById('addTodoBtn');
        this.todoList = document.getElementById('todoList');
        this.todoTitle = document.getElementById('todoTitle');
        this.emptyState = document.getElementById('emptyState');

        this.todos = [];
        this.bindEvents();
    }

    bindEvents() {
        this.menuToggle.addEventListener('click', () => {
            this.todoSidebar.classList.add('open');
        });

        this.closeTodoBtn.addEventListener('click', () => {
            this.todoSidebar.classList.remove('open');
        });

        this.addTodoBtn.addEventListener('click', () => this.addTodo());

        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const todo = { id: Date.now(), text, completed: false };
        this.todos.push(todo);
        this.todoInput.value = '';
        this.renderTodos();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.renderTodos();
        }
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.renderTodos();
    }

    renderTodos() {
        this.todoList.innerHTML = '';
        if (this.todos.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        }
        this.emptyState.style.display = 'none';

        this.todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                <div class="todo-actions">
                    <label class="todo-checkbox">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="pomodoroTimer.todoManager.toggleTodo(${todo.id})">
                        <span class="checkbox-custom"></span>
                    </label>
                    <button class="todo-btn delete-btn" onclick="pomodoroTimer.todoManager.deleteTodo(${todo.id})">🗑</button>
                </div>
            `;
            this.todoList.appendChild(li);
        });
    }
}