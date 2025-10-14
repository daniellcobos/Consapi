/**
 * validation.js
 * Handles form validation and event listeners for Consultor Integral
 */

/**
 * Attach event listeners to interactive elements in the current step
 */
function attachEventListeners() {
    // Event listeners para selección de productos
    document.querySelectorAll('.product-option').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            if (selectedProducts.includes(product)) {
                selectedProducts = selectedProducts.filter(p => p !== product);
                this.style.background = '#0070C0';
            } else {
                selectedProducts.push(product);
                this.style.background = '#00205b';
            }
        });
    });

    // Event listeners para selección de tipos de público
    document.querySelectorAll('.public-option').forEach(button => {
        button.addEventListener('click', function() {
            const publicType = this.dataset.public;
            if (selectedPublicTypes.includes(publicType)) {
                selectedPublicTypes = selectedPublicTypes.filter(p => p !== publicType);
                this.style.background = '#0070C0';
            } else {
                selectedPublicTypes.push(publicType);
                this.style.background = '#00205b';
            }

            // Mostrar/ocultar inputs de proporción
            updateProporcionInputs();
        });
    });

    // Event listeners para los inputs de proporción
    const propAdm = document.getElementById('prop-administrativo');
    const propOp = document.getElementById('prop-operativo');
    if (propAdm && propOp) {
        [propAdm, propOp].forEach(input => {
            input.addEventListener('input', updateTotalPorcentaje);
        });
    }

    // Event listeners para validación de demografía
    const numMujeres = document.getElementById('numMujeres');
    const numHombres = document.getElementById('numHombres');
    if (numMujeres && numHombres) {
        [numMujeres, numHombres].forEach(input => {
            input.addEventListener('input', validateDemographicsStep);
        });
        // Validar al cargar el paso
        validateDemographicsStep();
    }

    // Event listeners para selección de segmento de baños
    document.querySelectorAll('.segment-option').forEach(button => {
        button.addEventListener('click', function() {
            const segment = this.dataset.segment;

            // Reiniciar todos los botones de segmento al estilo por defecto
            document.querySelectorAll('.segment-option').forEach(btn => {
                btn.style.background = '#0070C0';
            });

            // Establecer el segmento seleccionado
            selectedBathroomSegment = segment;
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
    const proporcionContainer = document.getElementById('proporcion-container');
    const visitantesContainer = document.getElementById('visitantes-container');
    const propAdmContainer = document.getElementById('proporcion-administrativo');
    const propOpContainer = document.getElementById('proporcion-operativo');

    // Verificar qué tipos de público están seleccionados
    const hasAdministrativo = selectedPublicTypes.includes('administrativo');
    const hasOperativo = selectedPublicTypes.includes('operativo');
    const hasFlotante = selectedPublicTypes.includes('flotante');

    // Mostrar inputs de proporción cuando administrativo y operativo estén seleccionados
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

    // Mostrar input de visitantes cuando flotante esté seleccionado
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
function validateStep() {
    const stepId = steps[currentStep].id;

    switch(stepId) {
        case 'company-sector':
            const sector = document.getElementById('companySector').value;
            const size = document.getElementById('companySize').value;
            if (!sector || !size) return false;
            companyData.sector = sector;
            companyData.size = size;
            break;

        case 'demographics':
            const mujeres = document.getElementById('numMujeres').value;
            const hombres = document.getElementById('numHombres').value;
            const dias = document.getElementById('diasLaborales').value;
            const horas = document.getElementById('horasLaborales').value;
            if (!mujeres || !hombres || !dias || !horas) return false;
            companyData.numMujeres = parseInt(mujeres);
            companyData.numHombres = parseInt(hombres);
            companyData.diasLaborales = parseInt(dias);
            companyData.horasLaborales = parseInt(horas);
            break;

        case 'public-type':
            if (selectedPublicTypes.length === 0) return false;

            // Verificar qué tipos de público están seleccionados
            const hasAdministrativo = selectedPublicTypes.includes('administrativo');
            const hasOperativo = selectedPublicTypes.includes('operativo');
            const hasFlotante = selectedPublicTypes.includes('flotante');

            // Validar proporciones cuando administrativo y operativo estén seleccionados
            if (hasAdministrativo && hasOperativo) {
                const propAdm = parseInt(document.getElementById('prop-administrativo').value) || 0;
                const propOp = parseInt(document.getElementById('prop-operativo').value) || 0;

                if (propAdm + propOp !== 100) {
                    alert('Las proporciones deben sumar exactamente 100%');
                    return false;
                }

                // Guardar proporciones en companyData
                companyData.proporciones = {
                    administrativo: propAdm,
                    operativo: propOp
                };
            }

            // Validar cantidad de visitantes cuando flotante esté seleccionado
            if (hasFlotante) {
                const numVisitantes = parseInt(document.getElementById('num-visitantes').value);
                if (!numVisitantes || numVisitantes <= 0) {
                    alert('Debe ingresar un número válido de visitantes diarios');
                    return false;
                }

                // Guardar cantidad de visitantes en companyData
                companyData.numVisitantes = numVisitantes;
            }

            companyData.tipoPublico = selectedPublicTypes;
            break;

        case 'product-selection':
            if (selectedProducts.length === 0) return false;
            if (!selectedBathroomSegment) return false;
            companyData.products = selectedProducts;
            companyData.bathroomSegment = selectedBathroomSegment;
            break;
    }

    return true;
}
