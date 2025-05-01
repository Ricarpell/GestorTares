// URL base de la API (para entorno local)
const API_URL = 'http://localhost:5000/api/Tasks';

// Elementos del DOM
const addTaskForm = document.getElementById('addTaskForm');
const tasksContainer = document.getElementById('tasksContainer');
const editModal = document.getElementById('editModal');
const editTaskForm = document.getElementById('editTaskForm');
const closeModal = document.getElementsByClassName('close')[0];

// Función para escapar caracteres HTML y prevenir XSS
function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;' // Corrección del error de tipeo
    })[match]);
}

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', loadTasks);

// Manejar el envío del formulario para agregar tareas
addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    
    if (!title || !description) {
        alert('El título y la descripción son obligatorios.');
        return;
    }
    
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
            body: JSON.stringify(newTask),
            credentials: 'include'
        });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
            } catch {
                throw new Error(`Error ${response.status}: Respuesta no JSON`);
            }
        }
        
        addTaskForm.reset();
        loadTasks();
    } catch (error) {
        console.error('Error al crear tarea:', error);
        alert(`Error al crear la tarea: ${error.message}`);
    }
});

// Cargar todas las tareas
async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            credentials: 'include'
        });
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
            } catch {
                const text = await response.text();
                console.log('Respuesta del servidor:', text);
                throw new Error(`Error ${response.status}: Respuesta no JSON`);
            }
        }
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        alert(`Error al cargar las tareas: ${error.message}`);
    }
}

// Mostrar tareas en el DOM
function displayTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    if (!tasks || tasks.length === 0) {
        tasksContainer.innerHTML = '<p>No hay tareas disponibles.</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        // Escapar datos para mostrar en HTML y evitar XSS
        const safeTitle = escapeHTML(task.title || '');
        const safeDescription = escapeHTML(task.description || '');
        taskElement.innerHTML = `
            <h3>${safeTitle}</h3>
            <p>${safeDescription}</p>
            <p><strong>Estado:</strong> ${task.isCompleted ? 'Completada' : 'Pendiente'}</p>
            <p><strong>Creada:</strong> ${new Date(task.createdAt).toLocaleString()}</p>
            <div class="task-actions">
                <button class="toggle-btn" data-id="${task.id}" data-completed="${task.isCompleted}">
                    ${task.isCompleted ? 'Marcar como Pendiente' : 'Marcar como Completada'}
                </button>
                <button class="edit-btn" data-id="${task.id}" data-title="${safeTitle}" data-description="${safeDescription}">Editar</button>
                <button class="delete-btn" data-id="${task.id}">Eliminar</button>
            </div>
        `;
        tasksContainer.appendChild(taskElement);
    });
    
    // Añadir eventos a los botones después de renderizar
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const isCompleted = btn.dataset.completed === 'true';
            toggleTaskCompletion(id, !isCompleted);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const title = btn.dataset.title;
            const description = btn.dataset.description;
            editTask(id, title, description);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteTask(btn.dataset.id);
        });
    });
}

// Cambiar estado de completado
async function toggleTaskCompletion(taskId, isCompleted) {
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
            } catch {
                throw new Error(`Error ${response.status}: Respuesta no JSON`);
            }
        }
        
        const task = await response.json();
        
        const updatedTask = {
            id: task.id,
            title: task.title,
            description: task.description,
            isCompleted,
            createdAt: task.createdAt
        };
        
        const updateResponse = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask),
            credentials: 'include'
        });
        
        if (!updateResponse.ok) {
            let errorData;
            try {
                errorData = await updateResponse.json();
                throw new Error(errorData.detail || `Error ${updateResponse.status}`);
            } catch {
                throw new Error(`Error ${updateResponse.status}: Respuesta no JSON`);
            }
        }
        
        loadTasks();
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        alert(`Error al actualizar la tarea: ${error.message}`);
    }
}

// Eliminar tarea
async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
            } catch {
                throw new Error(`Error ${response.status}: Respuesta no JSON`);
            }
        }
        
        loadTasks();
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        alert(`Error al eliminar la tarea: ${error.message}`);
    }
}

// Abrir modal para editar tarea
function editTask(taskId, title, description) {
    if (!taskId || title === undefined || description === undefined) {
        alert('Error: Datos de la tarea no válidos.');
        return;
    }
    
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTitle').value = title;
    document.getElementById('editDescription').value = description;
    editModal.style.display = 'block';
}

// Manejar el envío del formulario de edición
editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    
    if (!title || !description) {
        alert('El título y la descripción son obligatorios.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            credentials: 'include'
        });
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                throw new Error(errorData.detail || `Error ${response.status}`);
            } catch {
                throw new Error(`Error ${response.status}: Respuesta no JSON`);
            }
        }
        
        const task = await response.json();
        
        const updatedTask = {
            id: task.id,
            title,
            description,
            isCompleted: task.isCompleted,
            createdAt: task.createdAt
        };
        
        const updateResponse = await fetch(`${API_URL}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTask),
            credentials: 'include'
        });
        
        if (!updateResponse.ok) {
            let errorData;
            try {
                errorData = await updateResponse.json();
                throw new Error(errorData.detail || `Error ${updateResponse.status}`);
            } catch {
                throw new Error(`Error ${updateResponse.status}: Respuesta no JSON`);
            }
        }
        
        editModal.style.display = 'none';
        loadTasks();
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        alert(`Error al actualizar la tarea: ${error.message}`);
    }
});

// Cerrar modal
closeModal.onclick = () => {
    editModal.style.display = 'none';
};

// Cerrar modal al hacer clic fuera
window.onclick = (event) => {
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
};