/**
 * state.js
 * Gestión centralizada del estado de la aplicación Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Este módulo elimina las variables globales y proporciona una única fuente de verdad
 * para todos los datos de la aplicación. Maneja el estado del cuestionario, datos de
 * la empresa, productos seleccionados, y resultados de consumo.
 *
 * FUNCIONES PRINCIPALES:
 * - getState() - Obtiene el estado completo de la aplicación
 * - updateCompanyData() - Actualiza datos de la empresa del usuario
 * - setConsumptionData() - Guarda resultados de cálculos de consumo
 * - getCurrentStep() - Obtiene el paso actual del cuestionario
 * - getSelectedProducts() - Obtiene productos seleccionados por el usuario
 *
 * Centralized state management for Consultor Integral
 * Eliminates global variables and provides a single source of truth
 */

// Application state
const state = {
    // Company data collected from user
    companyData: {},

    // Consumption calculation results
    consumptionData: {},

    // Product portfolio data loaded from Excel
    productData: {},

    // Wizard state
    currentStep: 0,

    // User selections
    selectedProducts: [],
    selectedPublicTypes: [],
    selectedBathroomSegment: ''
};

/**
 * Get current state
 * @returns {Object} Current application state
 */
export function getState() {
    return state;
}

/**
 * Update company data
 * @param {Object} data - Company data to merge
 */
export function updateCompanyData(data) {
    state.companyData = { ...state.companyData, ...data };
}

/**
 * Set consumption data
 * @param {Object} data - Consumption calculation results
 */
export function setConsumptionData(data) {
    state.consumptionData = data;
}

/**
 * Set product data
 * @param {Object} data - Product portfolio data
 */
export function setProductData(data) {
    state.productData = data;
}

/**
 * Get current step
 * @returns {number} Current step index
 */
export function getCurrentStep() {
    return state.currentStep;
}

/**
 * Set current step
 * @param {number} step - Step index
 */
export function setCurrentStep(step) {
    state.currentStep = step;
}

/**
 * Increment step
 */
export function nextStep() {
    state.currentStep++;
}

/**
 * Decrement step
 */
export function previousStep() {
    state.currentStep--;
}

/**
 * Get selected products
 * @returns {Array<string>} Selected products
 */
export function getSelectedProducts() {
    return state.selectedProducts;
}

/**
 * Add selected product
 * @param {string} product - Product name
 */
export function addSelectedProduct(product) {
    if (!state.selectedProducts.includes(product)) {
        state.selectedProducts.push(product);
    }
}

/**
 * Remove selected product
 * @param {string} product - Product name
 */
export function removeSelectedProduct(product) {
    state.selectedProducts = state.selectedProducts.filter(p => p !== product);
}

/**
 * Get selected public types
 * @returns {Array<string>} Selected public types
 */
export function getSelectedPublicTypes() {
    return state.selectedPublicTypes;
}

/**
 * Add selected public type
 * @param {string} publicType - Public type
 */
export function addSelectedPublicType(publicType) {
    if (!state.selectedPublicTypes.includes(publicType)) {
        state.selectedPublicTypes.push(publicType);
    }
}

/**
 * Remove selected public type
 * @param {string} publicType - Public type
 */
export function removeSelectedPublicType(publicType) {
    state.selectedPublicTypes = state.selectedPublicTypes.filter(p => p !== publicType);
}

/**
 * Get selected bathroom segment
 * @returns {string} Selected bathroom segment
 */
export function getSelectedBathroomSegment() {
    return state.selectedBathroomSegment;
}

/**
 * Set selected bathroom segment
 * @param {string} segment - Bathroom segment
 */
export function setSelectedBathroomSegment(segment) {
    state.selectedBathroomSegment = segment;
}

/**
 * Reset all state to initial values
 */
export function resetState() {
    state.companyData = {};
    state.consumptionData = {};
    state.currentStep = 0;
    state.selectedProducts = [];
    state.selectedPublicTypes = [];
    state.selectedBathroomSegment = '';
}
