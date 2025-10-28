/**
 * Steps.js
 * Renderizado de interfaz y navegación del cuestionario para Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Maneja la lógica de navegación del wizard multi-paso, renderiza el contenido de cada
 * paso, actualiza la barra de progreso, y coordina la transición entre pasos validando
 * los datos ingresados por el usuario.
 *
 * FUNCIONES PRINCIPALES:
 * - renderStep(): Renderiza el contenido del paso actual con botones de navegación
 * - nextStep(): Avanza al siguiente paso (con validación)
 * - previousStep(): Retrocede al paso anterior
 * - startQuiz(): Reinicia el cuestionario desde el inicio
 * - updateProgress(): Actualiza indicadores visuales de progreso
 *
 * RESPONSABILIDADES:
 * - Renderizar HTML de cada paso usando templates de config.js
 * - Validar datos antes de permitir avanzar
 * - Actualizar clases CSS para indicar paso activo/completado
 * - Generar botones con atributos data-action para event delegation
 * - Manejar scroll en dispositivos móviles
 *
 * Handles UI rendering and navigation for Consultor Integral
 */

import { getState, getCurrentStep, setCurrentStep, resetState } from './state.js';
import { steps } from './config.js';
import { validateStep } from './validation.js';
import { generateRecommendations } from './Portfolio.js';

// ============================================================================
// UI INITIALIZATION & RENDERING
// ============================================================================

/**
 * Initialize the steps list in the sidebar
 * Creates step items dynamically from the steps array
 */
export function initializeStepsList() {
    const container = document.getElementById('steps-list');
    container.innerHTML = '';

    steps.forEach((step, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.id = `step-item-${index}`;

        stepItem.innerHTML = `
            <div class="step-content-title">
                <span class="step-number">${index + 1}</span>
                ${step.shortTitle}
            </div>
        `;

        container.appendChild(stepItem);
    });

    updateStepsList();
}

/**
 * Update the visual state of steps in the sidebar
 * Marks steps as active, completed, or pending
 */
export function updateStepsList() {
    const currentStep = getCurrentStep();

    steps.forEach((step, index) => {
        const stepItem = document.getElementById(`step-item-${index}`);

        // Reset classes
        stepItem.className = 'step-item';

        if (index < currentStep) {
            // Completed step
            stepItem.classList.add('completed');
        } else if (index === currentStep) {
            // Active step
            stepItem.classList.add('active');
        }
        // Future steps keep default style
    });
}

/**
 * Update progress indicators (sidebar and header)
 */
export function updateProgress() {
    updateStepsList();

    // Update content header
    const currentStep = getCurrentStep();
    const step = steps[currentStep];
    document.getElementById('current-step-title').textContent = step.title;
    document.getElementById('progress-info').textContent = `Paso ${currentStep + 1} de ${steps.length}`;
}

/**
 * Render the current step content
 * Main rendering function that displays step content and navigation buttons
 */
export function renderStep() {
    const currentStep = getCurrentStep();
    const step = steps[currentStep];
    const container = document.getElementById('quiz-container');

    container.innerHTML = `
        ${step.content}
        <div class="navigation-buttons">
            <button class="nav-button btn-prev" data-action="prev-step" ${currentStep === 0 ? 'style="visibility: hidden;"' : ''}>
                Anterior
            </button>
            <button class="nav-button btn-next" data-action="next-step" id="next-btn">
                ${currentStep === steps.length - 1 ? 'Generar Recomendaciones' : 'Siguiente'}
            </button>
        </div>
    `;

    updateProgress();

    // Import and attach event listeners dynamically
    import('./validation.js').then(module => {
        module.attachEventListeners();
    });

    // Scroll to current step title on mobile
    if (window.innerWidth <= 768) {
        const stepTitle = document.getElementById('current-step-title');
        if (stepTitle) {
            stepTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Navigate to the next step
 * Validates current step before proceeding
 */
export function nextStep() {
    if (!validateStep()) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }

    const currentStep = getCurrentStep();
    if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
        renderStep();
    } else {
        generateRecommendations();
    }
}

/**
 * Navigate to the previous step
 */
export function previousStep() {
    const currentStep = getCurrentStep();
    if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
        renderStep();
    }
}

/**
 * Reset and restart the quiz from the beginning
 */
export function startQuiz() {
    resetState();
    initializeStepsList();
    renderStep();
}
