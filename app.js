document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const statusElement = document.getElementById('status');

    let tasks = []; // Array to hold our tasks

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered! Scope:', registration.scope);
                })
                .catch(err => {
                    console.log('Service Worker registration failed:', err);
                });
        });
    }

    // --- Online/Offline Status Update ---
    function updateOnlineStatus() {
        if (navigator.onLine) {
            statusElement.textContent = 'Online';
            statusElement.style.backgroundColor = '#2ecc71'; // Green
        } else {
            statusElement.textContent = 'Offline';
            statusElement.style.backgroundColor = '#e74c3c'; // Red
        }
    }

    // Initial status check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // --- Task Management Functions ---

    // Load tasks from localStorage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
        renderTasks();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Render tasks to the DOM
    function renderTasks() {
        taskList.innerHTML = ''; // Clear current list

        if (tasks.length === 0) {
            const noTasksMessage = document.createElement('li');
            noTasksMessage.textContent = 'No tasks yet! Add one above.';
            noTasksMessage.style.textAlign = 'center';
            noTasksMessage.style.color = '#777';
            noTasksMessage.style.padding = '20px';
            taskList.appendChild(noTasksMessage);
            return;
        }

        tasks.forEach((task, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('task-item');
            if (task.completed) {
                listItem.classList.add('completed');
            }

            const taskContent = document.createElement('span');
            taskContent.classList.add('task-content');
            taskContent.textContent = task.content;

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-btn');
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.index = index; // Store index for deletion

            listItem.appendChild(taskContent);
            listItem.appendChild(deleteButton);
            taskList.appendChild(listItem);

            // Event listener to toggle completion
            taskContent.addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
                renderTasks(); // Re-render to update UI
            });

            // Event listener for delete button
            deleteButton.addEventListener('click', (event) => {
                // Stop propagation to prevent taskContent's click listener from firing
                event.stopPropagation();
                tasks.splice(index, 1); // Remove task from array
                saveTasks();
                renderTasks(); // Re-render to update UI
            });
        });
    }

    // Add a new task
    function addTask() {
        const taskContent = newTaskInput.value.trim();
        if (taskContent) {
            tasks.push({ content: taskContent, completed: false });
            newTaskInput.value = ''; // Clear input
            saveTasks();
            renderTasks();
        }
    }

    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Initial load of tasks when the app starts
    loadTasks();
});