/**
 * event-delegation.js
 * Sistema central de delegación de eventos para Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Implementa el patrón de delegación de eventos para manejar todas las interacciones
 * del usuario de forma centralizada. Reemplaza las exposiciones window.* con un único
 * listener que enruta eventos basándose en atributos data-action.
 *
 * ACCIONES SOPORTADAS:
 * - next-step: Navegar al siguiente paso del cuestionario
 * - prev-step: Regresar al paso anterior
 * - start-quiz: Reiniciar el cuestionario desde el inicio
 * - recalculate: Recalcular consumo de un producto específico
 * - select-reference: Seleccionar una referencia de producto
 * - select-dispenser: Seleccionar un dispensador
 * - generate-pdf: Generar reporte en PDF
 *
 * BENEFICIOS:
 * - Elimina la contaminación del scope global (no más window.funciones)
 * - Mejora la seguridad (funciones no accesibles globalmente)
 * - Mejor rendimiento (un solo listener en lugar de múltiples)
 * - Funciona perfectamente con contenido generado dinámicamente
 *
 * Central event delegation system for Consultor Integral
 * Replaces window.* function exposures with clean event handling
 */

import { nextStep, previousStep, startQuiz } from './Steps.js';
import { recalcularConsumo } from './api.js';
import { handleReferenceClick, handleDispenserClick, generatePDF } from './ui-handlers.js';

/**
 * Initialize event delegation
 * Sets up a single event listener on document that handles all interactive elements
 */
export function initializeEventDelegation() {
    // Single click listener for the entire document
    document.addEventListener('click', handleClick);

    console.log('Event delegation initialized');
}

/**
 * Central click handler
 * Routes clicks to appropriate functions based on data-action attributes
 * @param {MouseEvent} event - Click event
 */
function handleClick(event) {
    const target = event.target;

    // Get the action from data-action attribute
    const action = target.dataset.action;
    if (!action) return; // Not an action element, ignore

    // Route to appropriate handler based on action type
    switch(action) {
        case 'next-step':
            handleNextStep(event);
            break;

        case 'prev-step':
            handlePrevStep(event);
            break;

        case 'start-quiz':
            handleStartQuiz(event);
            break;

        case 'recalculate':
            handleRecalculate(event);
            break;

        case 'select-reference':
            handleSelectReference(event);
            break;

        case 'select-dispenser':
            handleSelectDispenser(event);
            break;

        case 'generate-pdf':
            handleGeneratePDF(event);
            break;

        default:
            console.warn(`Unknown action: ${action}`);
    }
}

/**
 * Handle next step button click
 * @param {MouseEvent} event - Click event
 */
function handleNextStep(event) {
    event.preventDefault();
    nextStep();
}

/**
 * Handle previous step button click
 * @param {MouseEvent} event - Click event
 */
function handlePrevStep(event) {
    event.preventDefault();
    previousStep();
}

/**
 * Handle start quiz button click
 * @param {MouseEvent} event - Click event
 */
function handleStartQuiz(event) {
    event.preventDefault();
    startQuiz();
}

/**
 * Handle recalculate button click
 * Extracts product name from data-product attribute
 * @param {MouseEvent} event - Click event
 */
function handleRecalculate(event) {
    event.preventDefault();
    const button = event.target;
    const product = button.dataset.product;

    if (!product) {
        console.error('Recalculate button missing data-product attribute');
        return;
    }

    recalcularConsumo(product, false, button);
}

/**
 * Handle reference button click
 * Extracts reference and product from data attributes
 * @param {MouseEvent} event - Click event
 */
function handleSelectReference(event) {
    event.preventDefault();
    const button = event.target;
    const reference = button.dataset.reference;
    const product = button.dataset.product;

    if (!reference || !product) {
        console.error('Reference button missing data-reference or data-product attribute');
        return;
    }

    handleReferenceClick(reference, product);
}

/**
 * Handle dispenser button click
 * Extracts dispenser and product from data attributes
 * @param {MouseEvent} event - Click event
 */
function handleSelectDispenser(event) {
    event.preventDefault();
    const button = event.target;
    const dispenser = button.dataset.dispenser;
    const product = button.dataset.product;

    if (!dispenser || !product) {
        console.error('Dispenser button missing data-dispenser or data-product attribute');
        return;
    }

    handleDispenserClick(dispenser, product);
}

/**
 * Handle generate PDF button click
 * @param {MouseEvent} event - Click event
 */
function handleGeneratePDF(event) {
    event.preventDefault();
    generatePDF();
}

/**
 * Cleanup function to remove event listeners
 * Call this if you need to destroy the delegation system
 */
export function destroyEventDelegation() {
    document.removeEventListener('click', handleClick);
    console.log('Event delegation destroyed');
}
