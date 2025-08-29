document.addEventListener('DOMContentLoaded', function() {
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDescriptionInput = document.getElementById('task-description');
    const taskList = document.getElementById('task-list');

    // Function to fetch and display tasks
    async function fetchTasks() {
        const response = await fetch('/items');
        const tasks = await response.json();
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.dataset.id = task.id;
            li.innerHTML = `
                <span>
                    <strong>${task.name}</strong> - ${task.description}
                </span>
                <div class="task-actions">
                    <button class="edit">Edit</button>
                    <button class="delete">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }

    // Add a new task
    taskForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const name = taskNameInput.value;
        const description = taskDescriptionInput.value;

        const response = await fetch('/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            taskNameInput.value = '';
            taskDescriptionInput.value = '';
            fetchTasks();
        } else {
            console.error('Failed to add task');
        }
    });

    // Delete and Edit tasks (Event Delegation)
    taskList.addEventListener('click', async function(event) {
        if (event.target.classList.contains('delete')) {
            const li = event.target.closest('li');
            const id = li.dataset.id;
            const response = await fetch(`/items/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchTasks();
            } else {
                console.error('Failed to delete task');
            }
        } else if (event.target.classList.contains('edit')) {
            const li = event.target.closest('li');
            const id = li.dataset.id;
            const currentName = li.querySelector('strong').textContent;
            const currentDescription = li.querySelector('span').childNodes[2].textContent.trim().substring(1).trim(); // Get description

            // Populate form for editing
            taskNameInput.value = currentName;
            taskDescriptionInput.value = currentDescription;

            // Change form submit to update
            taskForm.removeEventListener('submit', addTaskSubmitHandler);
            taskForm.addEventListener('submit', async function updateTaskSubmitHandler(e) {
                e.preventDefault();
                const newName = taskNameInput.value;
                const newDescription = taskDescriptionInput.value;

                const response = await fetch(`/items/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newName, description: newDescription })
                });

                if (response.ok) {
                    taskNameInput.value = '';
                    taskDescriptionInput.value = '';
                    fetchTasks();
                    // Revert form to add task mode
                    taskForm.removeEventListener('submit', updateTaskSubmitHandler);
                    taskForm.addEventListener('submit', addTaskSubmitHandler);
                } else {
                    console.error('Failed to update task');
                }
            }, { once: true }); // Use once: true to ensure handler runs only once
        }
    });

    // Initial fetch of tasks
    fetchTasks();

    // Store the initial addTask submit handler for re-use
    const addTaskSubmitHandler = async function(event) {
        event.preventDefault();
        const name = taskNameInput.value;
        const description = taskDescriptionInput.value;

        const response = await fetch('/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, description })
        });

        if (response.ok) {
            taskNameInput.value = '';
            taskDescriptionInput.value = '';
            fetchTasks();
        } else {
            console.error('Failed to add task');
        }
    };
    taskForm.addEventListener('submit', addTaskSubmitHandler);
});
