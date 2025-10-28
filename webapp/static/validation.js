/**
 * validation.js
 * Validación de formularios y gestión de event listeners para Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Maneja toda la lógica de validación de datos del cuestionario y adjunta event listeners
 * a elementos interactivos (botones de selección, inputs de proporción, etc.). Asegura
 * que los datos ingresados sean correctos antes de permitir avanzar al siguiente paso.
 *
 * FUNCIONES PRINCIPALES:
 * - validateStep(): Valida el paso actual antes de avanzar
 * - attachEventListeners(): Adjunta listeners a elementos del paso renderizado
 * - validateDemographicsStep(): Valida que haya al menos un empleado
 * - updateProporcionInputs(): Muestra/oculta inputs de proporción según selección
 * - updateTotalPorcentaje(): Calcula y valida que porcentajes sumen 100%
 *
 * VALIDACIONES POR PASO:
 * - company-sector: Validar que sector y tamaño estén seleccionados
 * - demographics: Al menos 1 empleado, días y horas válidos
 * - public-type: Al menos un tipo de público, proporciones correctas
 * - product-selection: Al menos un producto y un segmento de baño
 *
 * Handles form validation and event listeners for Consultor Integral
 */

import {
    getState,
    updateCompanyData,
    getSelectedProducts,
    addSelectedProduct,
    removeSelectedProduct,
    getSelectedPublicTypes,
    addSelectedPublicType,
    removeSelectedPublicType,
    getSelectedBathroomSegment,
    setSelectedBathroomSegment,
    getCurrentStep
} from './state.js';
import { steps } from './config.js';

/**
 * Attach event listeners to interactive elements in the current step
 */
export function attachEventListeners() {
    // Event listeners for product selection
    document.querySelectorAll('.product-option').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const selectedProducts = getSelectedProducts();

            if (selectedProducts.includes(product)) {
                removeSelectedProduct(product);
                this.style.background = '#0070C0';
            } else {
                addSelectedProduct(product);
                this.style.background = '#00205b';
            }
        });
    });

    // Event listeners for public type selection
    document.querySelectorAll('.public-option').forEach(button => {
        button.addEventListener('click', function() {
            const publicType = this.dataset.public;
            const selectedPublicTypes = getSelectedPublicTypes();

            if (selectedPublicTypes.includes(publicType)) {
                removeSelectedPublicType(publicType);
                this.style.background = '#0070C0';
            } else {
                addSelectedPublicType(publicType);
                this.style.background = '#00205b';
            }

            // Show/hide proportion inputs
            updateProporcionInputs();
        });
    });

    // Event listeners for proportion inputs
    const propAdm = document.getElementById('prop-administrativo');
    const propOp = document.getElementById('prop-operativo');
    if (propAdm && propOp) {
        [propAdm, propOp].forEach(input => {
            input.addEventListener('input', updateTotalPorcentaje);
        });
    }

    // Event listeners for demographics validation
    const numMujeres = document.getElementById('numMujeres');
    const numHombres = document.getElementById('numHombres');
    if (numMujeres && numHombres) {
        [numMujeres, numHombres].forEach(input => {
            input.addEventListener('input', validateDemographicsStep);
        });
        // Validate when loading the step
        validateDemographicsStep();
    }

    // Event listeners for bathroom segment selection
    document.querySelectorAll('.segment-option').forEach(button => {
        button.addEventListener('click', function() {
            const segment = this.dataset.segment;

            // Reset all segment buttons to default style
            document.querySelectorAll('.segment-option').forEach(btn => {
                btn.style.background = '#0070C0';
            });

            // Set selected segment
            setSelectedBathroomSegment(segment);
            this.style.background = '#00205b';
        });
    });
}

/**
 * Validate demographics step (requires at least one employee)
 */
function validateDemographicsStep() {
    const numMujeres = document.getElementById('numMujeres');
    const numHombres = document.getElementById('numHombres');
    const nextBtn = document.getElementById('next-btn');

    if (numMujeres && numHombres && nextBtn) {
        const mujeres = parseInt(numMujeres.value) || 0;
        const hombres = parseInt(numHombres.value) || 0;

        if (mujeres > 0 || hombres > 0) {
            nextBtn.disabled = false;
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        }
    }
}

/**
 * Update proportion inputs visibility based on selected public types
 */
function updateProporcionInputs() {
    const selectedPublicTypes = getSelectedPublicTypes();
    const proporcionContainer = document.getElementById('proporcion-container');
    const visitantesContainer = document.getElementById('visitantes-container');
    const propAdmContainer = document.getElementById('proporcion-administrativo');
    const propOpContainer = document.getElementById('proporcion-operativo');

    // Check which public types are selected
    const hasAdministrativo = selectedPublicTypes.includes('administrativo');
    const hasOperativo = selectedPublicTypes.includes('operativo');
    const hasFlotante = selectedPublicTypes.includes('flotante');

    // Show proportion inputs when both administrativo and operativo are selected
    if (hasAdministrativo && hasOperativo) {
        proporcionContainer.classList.remove('hidden');
        propAdmContainer.style.display = 'block';
        propOpContainer.style.display = 'block';
        updateTotalPorcentaje();
    } else {
        proporcionContainer.classList.add('hidden');
        propAdmContainer.style.display = 'none';
        propOpContainer.style.display = 'none';
    }

    // Show visitors input when flotante is selected
    if (hasFlotante) {
        visitantesContainer.classList.remove('hidden');
    } else {
        visitantesContainer.classList.add('hidden');
    }
}

/**
 * Update the total percentage display for proportion inputs
 */
function updateTotalPorcentaje() {
    const propAdm = parseInt(document.getElementById('prop-administrativo').value) || 0;
    const propOp = parseInt(document.getElementById('prop-operativo').value) || 0;
    const total = propAdm + propOp;

    const totalElement = document.getElementById('total-porcentaje');
    totalElement.textContent = `Total: ${total}%`;

    if (total === 100) {
        totalElement.style.color = '#059669';
    } else if (total > 100) {
        totalElement.style.color = '#dc2626';
    } else {
        totalElement.style.color = '#00853F';
    }
}

/**
 * Validate the current step before proceeding
 * @returns {boolean} True if validation passes
 */
export function validateStep() {
    const currentStep = getCurrentStep();
    const stepId = steps[currentStep].id;
    const selectedPublicTypes = getSelectedPublicTypes();
    const selectedProducts = getSelectedProducts();
    const selectedBathroomSegment = getSelectedBathroomSegment();

    switch(stepId) {
        case 'company-sector':
            const sector = document.getElementById('companySector').value;
            const size = document.getElementById('companySize').value;
            if (!sector || !size) return false;
            updateCompanyData({ sector, size });
            break;

        case 'demographics':
            const mujeres = document.getElementById('numMujeres').value;
            const hombres = document.getElementById('numHombres').value;
            const dias = document.getElementById('diasLaborales').value;
            const horas = document.getElementById('horasLaborales').value;
            if (!mujeres || !hombres || !dias || !horas) return false;
            updateCompanyData({
                numMujeres: parseInt(mujeres),
                numHombres: parseInt(hombres),
                diasLaborales: parseInt(dias),
                horasLaborales: parseInt(horas)
            });
            break;

        case 'public-type':
            if (selectedPublicTypes.length === 0) return false;

            // Check which public types are selected
            const hasAdministrativo = selectedPublicTypes.includes('administrativo');
            const hasOperativo = selectedPublicTypes.includes('operativo');
            const hasFlotante = selectedPublicTypes.includes('flotante');

            // Validate proportions when both administrativo and operativo are selected
            if (hasAdministrativo && hasOperativo) {
                const propAdm = parseInt(document.getElementById('prop-administrativo').value) || 0;
                const propOp = parseInt(document.getElementById('prop-operativo').value) || 0;

                if (propAdm + propOp !== 100) {
                    alert('Las proporciones deben sumar exactamente 100%');
                    return false;
                }

                // Save proportions to companyData
                updateCompanyData({
                    proporciones: {
                        administrativo: propAdm,
                        operativo: propOp
                    }
                });
            }

            // Validate number of visitors when flotante is selected
            if (hasFlotante) {
                const numVisitantes = parseInt(document.getElementById('num-visitantes').value);
                if (!numVisitantes || numVisitantes <= 0) {
                    alert('Debe ingresar un número válido de visitantes diarios');
                    return false;
                }

                // Save number of visitors to companyData
                updateCompanyData({ numVisitantes });
            }

            updateCompanyData({ tipoPublico: selectedPublicTypes });
            break;

        case 'product-selection':
            if (selectedProducts.length === 0) return false;
            if (!selectedBathroomSegment) return false;
            updateCompanyData({
                products: selectedProducts,
                bathroomSegment: selectedBathroomSegment
            });
            break;
    }

    return true;
}
