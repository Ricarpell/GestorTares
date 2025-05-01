// URL base de tu API (ajusta según sea necesario)
const API_URL = 'http://localhost:5000/api/tasks';

// Elementos del DOM
const addTaskForm = document.getElementById('addTaskForm');
const tasksContainer = document.getElementById('tasksContainer');

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', loadTasks);

// Manejar el envío del formulario
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    
    const newTask = {
        title,
        description,
        isCompleted: false
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });
        
        if (!response.ok) throw new Error('Error al crear tarea');
        
        // Limpiar formulario y recargar tareas
        addTaskForm.reset();
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al crear la tarea');
    }
});

// Cargar todas las tareas
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar tareas');
        
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar las tareas');
    }
}

// Mostrar tareas en el DOM
function displayTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p>No hay tareas disponibles.</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p><strong>Estado:</strong> ${task.isCompleted ? 'Completada' : 'Pendiente'}</p>
            <p><strong>Creada:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
            <div class="task-actions">
                <button onclick="toggleTaskCompletion('${task.id}', ${!task.isCompleted})">
                    ${task.isCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                </button>
                <button class="edit-btn" onclick="editTask('${task.id}')">Editar</button>
                <button class="delete-btn" onclick="deleteTask('${task.id}')">Eliminar</button>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
}

// Cambiar estado de completado
async function toggleTaskCompletion(taskId, isCompleted) {
    try {
        // Primero obtenemos la tarea actual
        const response = await fetch(`${API_URL}/${taskId}`);
        if (!response.ok) throw new Error('Error al obtener tarea');
        
        const task = await response.json();
        
        // Actualizamos solo el estado
        const updatedTask = {
            ...task,
            isCompleted
        };
        
        const updateResponse = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        });
        
        if (!updateResponse.ok) throw new Error('Error al actualizar tarea');
        
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la tarea');
    }
}

// Eliminar tarea
async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Error al eliminar tarea');
        
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar la tarea');
    }
}

// Editar tarea (modal básico)
function editTask(taskId) {
    // Implementación básica - puedes mejorarla con un modal real
    const newTitle = prompt('Nuevo título:');
    if (!newTitle) return;
    
    const newDescription = prompt('Nueva descripción:');
    if (!newDescription) return;
    
    updateTask(taskId, newTitle, newDescription);
}

// Actualizar tarea
async function updateTask(taskId, title, description) {
    try {
        // Primero obtenemos la tarea actual
        const response = await fetch(`${API_URL}/${taskId}`);
        if (!response.ok) throw new Error('Error al obtener tarea');
        
        const task = await response.json();
        
        // Actualizamos los campos
        const updatedTask = {
            ...task,
            title,
            description
        };
        
        const updateResponse = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask)
        });
        
        if (!updateResponse.ok) throw new Error('Error al actualizar tarea');
        
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar la tarea');
    }
}