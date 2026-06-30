// ==========================================
// 1. ORIENTACIÓN A OBJETOS (Clases)
// ==========================================

class Tarea {
    constructor(id, descripcion, estado = false, tiempoLimite = 0) {
        this.id = id;
        this.descripcion = descripcion;
        this.estado = estado; 
        this.fechaCreacion = new Date();
        this.tiempoLimite = tiempoLimite; 
    }

    cambiarEstado() {
        this.estado = !this.estado;
    }
}

class GestorTareas {
    constructor() {
        const datosLocales = JSON.parse(localStorage.getItem('tareas')) || [];
        this.tareas = datosLocales.map(t => new Tarea(t.id, t.descripcion, t.estado, t.tiempoLimite));
    }

    agregarTarea(nuevaTarea) {
        this.tareas = [...this.tareas, nuevaTarea];
        this.guardarEnLocal();
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(tarea => tarea.id !== id);
        this.guardarEnLocal();
    }

    toggleEstado(id) {
        const tarea = this.tareas.find(t => t.id === id);
        if (tarea) {
            tarea.cambiarEstado();
            this.guardarEnLocal();
        }
    }

    guardarEnLocal() {
        localStorage.setItem('tareas', JSON.stringify(this.tareas));
    }
}

// ==========================================
// 2. INICIALIZACIÓN Y VARIABLES GLOBALES
// ==========================================
const gestor = new GestorTareas();
const formulario = document.getElementById('formulario-tarea');
const inputDescripcion = document.getElementById('input-descripcion');
const inputTiempo = document.getElementById('input-tiempo');
const listaTareas = document.getElementById('lista-tareas');
const contadorCaracteres = document.getElementById('contador-caracteres');
const notificacion = document.getElementById('notificacion');

// ==========================================
// 3. ASINCRONÍA Y APIS
// ==========================================

const mostrarNotificacionConRetardo = (mensaje) => {
    setTimeout(() => {
        notificacion.textContent = mensaje;
        notificacion.classList.remove('oculto');
        
        setTimeout(() => {
            notificacion.classList.add('oculto');
        }, 2500);
    }, 2000); // Espera exactamente 2 segundos en aparecer
};

const cargarDesdeAPI = async () => {
    try {
        const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=2');
        if (!respuesta.ok) throw new Error('Error en la API');
        
        const datos = await respuesta.json();
        
        const tareasReales = [
            "Repasar contenido para el certamen de la próxima semana",
            "Subir el informe técnico final corregido a la plataforma Moodle"
        ];
        
        datos.forEach((item, index) => {
            const descripcionReal = tareasReales[index] || item.title;
            const nuevaTarea = new Tarea(Date.now() + item.id, descripcionReal, item.completed, 0);
            gestor.agregarTarea(nuevaTarea);
        });
        
        actualizarDOM();
        mostrarNotificacionConRetardo("¡Tareas de la API cargadas (tras 2s)!");
    } catch (error) {
        console.error(error);
        mostrarNotificacionConRetardo("Error al conectar con la API");
    }
};

// ==========================================
// 4. EVENTOS Y DOM
// ==========================================

const actualizarDOM = () => {
    listaTareas.innerHTML = ''; 
    
    gestor.tareas.forEach(tarea => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="texto-tarea ${tarea.estado ? 'completada' : ''}">${tarea.descripcion}</span>
            <div class="acciones-tarea">
                <span class="tiempo-restante" style="color: #ef4444; font-weight: bold;">
                    ${tarea.tiempoLimite > 0 ? tarea.tiempoLimite + 's' : ''}
                </span>
                <button class="btn-estado" data-id="${tarea.id}">✔</button>
                <button class="btn-eliminar" data-id="${tarea.id}">✖</button>
            </div>
        `;

        li.addEventListener('mouseover', () => li.style.borderLeft = "4px solid #10b981");
        li.addEventListener('mouseout', () => li.style.borderLeft = "none");

        listaTareas.appendChild(li);
    });
};

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const descripcion = inputDescripcion.value;
    const tiempo = parseInt(inputTiempo.value) || 0;
    
    setTimeout(() => {
        const nuevaTarea = new Tarea(Date.now(), descripcion, false, tiempo);
        gestor.agregarTarea(nuevaTarea);
        
        inputDescripcion.value = '';
        inputTiempo.value = '';
        contadorCaracteres.textContent = 'Caracteres: 0';
        
        actualizarDOM();
        mostrarNotificacionConRetardo("¡Nueva tarea guardada exitosamente!");
    }, 300);
});

listaTareas.addEventListener('click', (e) => {
    const id = parseInt(e.target.dataset.id);
    if (e.target.classList.contains('btn-eliminar')) {
        gestor.eliminarTarea(id);
        actualizarDOM();
        mostrarNotificacionConRetardo("Tarea eliminada correctamente");
    }
    if (e.target.classList.contains('btn-estado')) {
        gestor.toggleEstado(id);
        actualizarDOM();
    }
});

inputDescripcion.addEventListener('keyup', () => {
    contadorCaracteres.textContent = `Caracteres: ${inputDescripcion.value.length}`;
});

document.getElementById('btn-cargar-api').addEventListener('click', cargarDesdeAPI);

// ==========================================
// 5. CUENTA REGRESIVA EN TIEMPO REAL
// ==========================================
setInterval(() => {
    let necesitaActualizar = false;
    
    gestor.tareas.forEach(tarea => {
        if (tarea.tiempoLimite > 0 && !tarea.estado) {
            tarea.tiempoLimite -= 1;
            necesitaActualizar = true;
            
            if (tarea.tiempoLimite === 0) {
                alert(`¡Alerta! Se acabó el tiempo límite para: "${tarea.descripcion}"`);
            }
        }
    });

    if (necesitaActualizar) {
        gestor.guardarEnLocal();
        actualizarDOM();
    }
}, 1000);

actualizarDOM();