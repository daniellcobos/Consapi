/**
 * main.js
 * Punto de entrada principal de la aplicación Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Este es el archivo principal que inicializa toda la aplicación. Coordina la carga
 * de datos desde Excel, configura el sistema de delegación de eventos, y arranca el
 * cuestionario interactivo para el usuario.
 *
 * RESPONSABILIDADES:
 * - Inicializar el sistema de delegación de eventos (sin exponer funciones al window)
 * - Cargar datos de Portfolio.xlsx al inicio
 * - Iniciar el cuestionario/wizard
 * - Manejar el evento DOMContentLoaded
 *
 * Main entry point for Consultor Integral application
 * ES6 Module - Ties all modules together and initializes the app
 */

// Import all necessary modules
import { loadProductData } from './Portfolio.js';
import { startQuiz } from './Steps.js';
import { initializeEventDelegation } from './event-delegation.js';

/**
 * Initialize the application when DOM is ready
 */
async function initializeApp() {
    try {
        // Initialize event delegation system
        initializeEventDelegation();

        // Load product data from Portfolio.xlsx before starting the quiz
        await loadProductData();

        // Start the quiz/wizard
        startQuiz();

        console.log('Consultor Integral initialized successfully');
    } catch (error) {
        console.error('Error initializing application:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM is already ready
    initializeApp();
}
