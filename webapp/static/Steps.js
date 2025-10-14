/**
 * UserInterface.js
 * Handles UI rendering and navigation for Consultor Integral
 * Combines navigation.js and ui-renderer.js functionality
 */

// ============================================================================
// UI INITIALIZATION & RENDERING
// ============================================================================

/**
 * Initialize the steps list in the sidebar
 * Creates step items dynamically from the steps array
 */
function initializeStepsList() {
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
function updateStepsList() {
    steps.forEach((step, index) => {
        const stepItem = document.getElementById(`step-item-${index}`);

        // Reiniciar clases
        stepItem.className = 'step-item';

        if (index < currentStep) {
            // Paso completado
            stepItem.classList.add('completed');
        } else if (index === currentStep) {
            // Paso activo
            stepItem.classList.add('active');
        } else {
            // Paso futuro - mantener estilo por defecto
        }
    });
}

/**
 * Update progress indicators (sidebar and header)
 */
function updateProgress() {
    updateStepsList();

    // Actualizar encabezado de contenido
    const step = steps[currentStep];
    document.getElementById('current-step-title').textContent = step.title;
    document.getElementById('progress-info').textContent = `Paso ${currentStep + 1} de ${steps.length}`;
}

/**
 * Render the current step content
 * Main rendering function that displays step content and navigation buttons
 */
function renderStep() {
    const step = steps[currentStep];
    const container = document.getElementById('quiz-container');

    container.innerHTML = `
        ${step.content}
        <div class="navigation-buttons">
            <button class="nav-button btn-prev" onclick="previousStep()" ${currentStep === 0 ? 'style="visibility: hidden;"' : ''}>
                Anterior
            </button>
            <button class="nav-button btn-next" onclick="nextStep()" id="next-btn">
                ${currentStep === steps.length - 1 ? 'Generar Recomendaciones' : 'Siguiente'}
            </button>
        </div>
    `;

    updateProgress();
    attachEventListeners();

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
function nextStep() {
    if (!validateStep()) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }

    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
    } else {
        generateRecommendations();
    }
}

/**
 * Navigate to the previous step
 */
function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
}

/**
 * Reset and restart the quiz from the beginning
 */
function startQuiz() {
    currentStep = 0;
    companyData = {};
    selectedProducts = [];
    selectedPublicTypes = [];
    selectedBathroomSegment = '';
    initializeStepsList();
    renderStep();
}
