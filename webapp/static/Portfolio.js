/**
 * Portfolio.js
 * Handles configuration, state, business logic, and recommendations for Consultor Integral
 * Consolidates: config.js, state.js, business-logic.js, and recommendations.js
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

// Datos de la empresa del usuario
let companyData = {};
let consumptionData = {};

// Datos de segmentación de productos (cargados dinámicamente desde Portfolio.xlsx)
let productData = {};

// Estado del cuestionario
let currentStep = 0;
let selectedProducts = [];
let selectedPublicTypes = [];
let selectedBathroomSegment = '';

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load product data from Portfolio.xlsx via API
 */
async function loadProductData() {
    try {
        const response = await fetch('/api_portfolio_data');
        if (response.ok) {
            productData = await response.json();
        } else {
            console.error('Error loading portfolio data:', response.status);
            // Volver a datos vacíos o mostrar error
            productData = {};
        }
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        productData = {};
    }
}

/**
 * Load product references for a specific product and populate dropdown
 * @param {string} producto - Product name
 */
async function loadReferencesForProduct(producto) {
    try {
        const response = await fetch('/api_get_referencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ producto })
        });

        if (response.ok) {
            const data = await response.json();
            const selectId = `ref-${producto.replace(/\s/g, '-')}`;
            const select = document.getElementById(selectId);

            if (select && data.referencias) {
                // Get recommended references for this product
                const segment = companyData.bathroomSegment;
                const totalEmployees = companyData.numMujeres + companyData.numHombres;
                const trafficLevel = determineTrafficLevel(totalEmployees, companyData.diasLaborales, companyData.horasLaborales);

                let recommendedRefs = [];
                // Safely access recommendation with null checks
                const recommendation = productData[producto] && productData[producto][segment] && productData[producto][segment][trafficLevel]
                    ? productData[producto][segment][trafficLevel]
                    : null;

                if (recommendation) {
                    if (Array.isArray(recommendation)) {
                        // If multiple recommendations, collect all references
                        recommendation.forEach(rec => {
                            recommendedRefs = recommendedRefs.concat(rec.referencias);
                        });
                    } else if (recommendation.referencias) {
                        recommendedRefs = recommendation.referencias;
                    }
                }

                // Remove duplicates
                recommendedRefs = [...new Set(recommendedRefs)];

                // Limpiar opciones existentes excepto la primera (actual)
                const currentValue = select.value;
                select.innerHTML = '';

                // Get the specific selected reference for this product
                const selectedReference = companyData.selectedReferences && companyData.selectedReferences[producto]
                    ? companyData.selectedReferences[producto]
                    : (consumptionData[producto] && consumptionData[producto].referencia_usada
                        ? consumptionData[producto].referencia_usada
                        : null);

                // Sort references: selected reference first, then other recommended, then others
                const sortedRefs = data.referencias.sort((a, b) => {
                    const aIsSelected = selectedReference && (a === selectedReference || a.startsWith(selectedReference + ' -'));
                    const bIsSelected = selectedReference && (b === selectedReference || b.startsWith(selectedReference + ' -'));
                    const aIsRecommended = recommendedRefs.includes(a);
                    const bIsRecommended = recommendedRefs.includes(b);

                    // Selected reference goes first
                    if (aIsSelected && !bIsSelected) return -1;
                    if (!aIsSelected && bIsSelected) return 1;

                    // If both or neither are selected, sort by recommendation status
                    if (aIsRecommended && !bIsRecommended) return -1;
                    if (!aIsRecommended && bIsRecommended) return 1;
                    return 0;
                });

                // Añadir todas las referencias con highlighting
                sortedRefs.forEach(ref => {
                    const option = document.createElement('option');
                    option.value = ref;

                    // Highlight recommended references
                    if (recommendedRefs.length > 0 && recommendedRefs.includes(ref)) {
                        option.textContent = `⭐ ${ref} (Recomendado)`;
                    } else {
                        option.textContent = ref;
                    }

                    // Set selected to match currentValue or selectedReference
                    option.selected = ref === currentValue || ref === selectedReference || (selectedReference && ref.startsWith(selectedReference + ' -'));
                    select.appendChild(option);
                });

                // Initialize Selectize after populating options
                $(select).selectize({
                    searchField: ['text', 'value'],
                    maxItems: 1,
                    create: false,
                    sortField: 'text',
                    onChange: function(value) {
                        // Update reference image when dropdown selection changes
                        if (value) {
                            const producto = this.$input.data('producto');
                            if (producto) {
                                // Extract just the reference number from the full value (in case it has description)
                                const referenceMatch = value.match(/^(\d+)/);
                                const referenceNumber = referenceMatch ? referenceMatch[1] : value;
                                updateReferenceImage(producto, referenceNumber);
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando referencias:', error);
    }
}

// ============================================================================
// BUSINESS LOGIC & CALCULATIONS
// ============================================================================

/**
 * Determine traffic level based on employees and working hours
 * @param {number} numEmployees - Total number of employees
 * @param {number} diasLaborales - Working days per month
 * @param {number} horasLaborales - Working hours per day
 * @returns {string} Traffic level classification
 */
function determineTrafficLevel(numEmployees, diasLaborales, horasLaborales) {
    // Calcular intensidad de uso basada en empleados, días y horas laborales

    // Factor de intensidad horaria (horas/día)
    let intensityFactor = 1;
    if (horasLaborales >= 16) {
        intensityFactor = 1.5; // Turnos de 24 horas o múltiples turnos
    } else if (horasLaborales >= 12) {
        intensityFactor = 1.3; // Jornadas extendidas
    } else if (horasLaborales >= 8) {
        intensityFactor = 1.0; // Jornada normal
    } else {
        intensityFactor = 0.8; // Jornadas reducidas
    }

    // Factor de frecuencia mensual (días/mes)
    let frequencyFactor = 1;
    if (diasLaborales >= 28) {
        frequencyFactor = 1.4; // Operación casi continua
    } else if (diasLaborales >= 22) {
        frequencyFactor = 1.2; // Operación intensa (más de 5 días/semana)
    } else if (diasLaborales >= 20) {
        frequencyFactor = 1.0; // Operación estándar (5 días/semana)
    } else if (diasLaborales >= 15) {
        frequencyFactor = 0.8; // Operación reducida
    } else {
        frequencyFactor = 0.6; // Operación muy reducida
    }

    // Índice de tráfico ajustado
    const adjustedTrafficIndex = numEmployees * intensityFactor * frequencyFactor;

    // Clasificación basada en el índice ajustado
    if (adjustedTrafficIndex < 40) return "Tráfico Bajo";
    if (adjustedTrafficIndex < 180) return "Tráfico Medio";
    if (adjustedTrafficIndex < 450) return "Tráfico Alto";
    return "Tráfico Pico";
}

/**
 * Determine bathroom segment based on sector, size, and public types
 * Currently unused - user selects segment directly
 * @param {string} sector - Company sector
 * @param {string} size - Company size
 * @param {Array|string} tiposPublico - Public types
 * @returns {string} Recommended segment
 */
function determineSegment(sector, size, tiposPublico) {
    // Lógica para determinar el segmento basado en sector, tamaño y tipos de público
    if (sector === 'Salud (Hospitales, Clínicas)') return 'Higiene Crítica';
    if (sector === 'HoReCa (Hoteles, Restaurantes, Cafeterías)') return 'Higiene Crítica';

    // Considerar si hay tipo de público flotante para segmentación premium
    const hasFlotante = Array.isArray(tiposPublico) ? tiposPublico.includes('flotante') : tiposPublico === 'flotante';
    const hasMultipleTypes = Array.isArray(tiposPublico) && tiposPublico.length > 1;

    // Segmentación premium para público flotante o múltiples tipos
    if ((hasFlotante || hasMultipleTypes) && size === '200+') return 'Wow Factor';
    if ((hasFlotante || hasMultipleTypes) && (size === '51-200' || size === '11-50')) return 'Restroom Plus';

    if (size === '200+') return 'Wow Factor';
    if (size === '51-200') return 'Restroom Plus';
    return 'Essential';
}

// ============================================================================
// RECOMMENDATIONS GENERATION & DISPLAY
// ============================================================================

/**
 * Generate recommendations based on company data
 * Initiates the recommendation process
 */
function generateRecommendations() {
    const totalEmployees = companyData.numMujeres + companyData.numHombres;
    const trafficLevel = determineTrafficLevel(totalEmployees, companyData.diasLaborales, companyData.horasLaborales);
    const segment = companyData.bathroomSegment; // Use user-selected segment

    // Scroll to top on mobile to prevent viewport jumping
    if (window.innerWidth <= 768) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    let recommendationsHTML = `
        <div class="recommendation" id="report-content">
            <h2>Recomendaciones Personalizadas</h2>

            <div class="company-summary">
                <h3>Resumen de su Empresa</h3>
                <p><strong>Sector:</strong> ${companyData.sector}</p>
                <p><strong>Tamaño:</strong> ${companyData.size}</p>
                <p><strong>Total empleados:</strong> ${totalEmployees} (${companyData.numMujeres} mujeres, ${companyData.numHombres} hombres)</p>
                <p><strong>Jornada laboral:</strong> ${companyData.diasLaborales} días/mes, ${companyData.horasLaborales} horas/día</p>
                <p><strong>Tipo de público:</strong> ${companyData.tipoPublico}</p>
                <p><strong>Segmento seleccionado:</strong> ${segment}</p>
                <p><strong>Nivel de tráfico:</strong> ${trafficLevel}</p>
            </div>

            <div class="loading">
                <p>Calculando consumo mensual...</p>
            </div>
        </div>
    `;

    document.getElementById('quiz-container').innerHTML = recommendationsHTML;

    // Mark all steps as completed
    steps.forEach((step, index) => {
        const stepItem = document.getElementById(`step-item-${index}`);
        if (stepItem) {
            stepItem.className = 'step-item completed';
        }
    });

    // Calcular consumo mensual
    calculateConsumption(segment, trafficLevel, totalEmployees);
}

/**
 * Display recommendations with consumption data
 * Main function for rendering the final recommendations page
 */
function displayRecommendationsWithConsumption(segment, trafficLevel, consumptionData) {
    const totalEmployees = companyData.numMujeres + companyData.numHombres;

    // Mapear tipos de público para mostrar
    const tipoPublicoDisplay = {
        'administrativo': 'Administrativo',
        'operativo': 'Operativo',
        'flotante': 'Flotante'
    };

    // Formatear tipos de público para mostrar
    let tiposPublicoText = '';
    if (Array.isArray(companyData.tipoPublico)) {
        tiposPublicoText = companyData.tipoPublico
            .map(tipo => tipoPublicoDisplay[tipo] || tipo)
            .join(', ');
    } else {
        tiposPublicoText = tipoPublicoDisplay[companyData.tipoPublico] || companyData.tipoPublico;
    }

    let recommendationsHTML = `
        <div class="recommendation" id="report-content">
            <h2>Recomendaciones Personalizadas</h2>
            <div class="company-summary">
                <h3>Resumen de su Empresa</h3>
                <p><strong>Sector:</strong> ${companyData.sector}</p>
                <p><strong>Tamaño:</strong> ${companyData.size}</p>
                <p><strong>Total empleados:</strong> ${totalEmployees} (${companyData.numMujeres} mujeres, ${companyData.numHombres} hombres)</p>
                <p><strong>Jornada laboral:</strong> ${companyData.diasLaborales} días/mes, ${companyData.horasLaborales} horas/día</p>
                <p><strong>Tipos de público:</strong> ${tiposPublicoText}</p>
                <p><strong>Segmento de Baños:</strong> ${segment}</p>
                <p><strong>Nivel de tráfico:</strong> ${trafficLevel}</p>
            </div>

            <div class="recommendation-title" style="display: flex; justify-content: center; align-items: center;">

            </div>
    `;

    // El consumo mensual ahora está integrado directamente con cada recomendación de producto

    // Mostrar recomendaciones de productos con consumo integrado
    companyData.products.forEach(product => {
        const recommendation = productData[product] && productData[product][segment] && productData[product][segment][trafficLevel] ? productData[product][segment][trafficLevel] : null;
        const productConsumption = consumptionData[product];

        recommendationsHTML += `<h3 style="color: #00205b; font-size: 1.8em; margin: 30px 0 20px 0; border-bottom: 3px solid #00205b; padding-bottom: 10px;">${product}</h3>`;

        // Add selected reference and dispenser images
        const selectedReference = companyData.selectedReferences ? companyData.selectedReferences[product] : (productConsumption ? productConsumption.referencia_usada : '');

        // Get the first dispenser for this product
        const productRecommendation = productData[product] && productData[product][segment] && productData[product][segment][trafficLevel] ? productData[product][segment][trafficLevel] : null;
        let selectedDispenser = '';
        if (productRecommendation) {
            if (Array.isArray(productRecommendation) && productRecommendation.length > 0) {
                selectedDispenser = productRecommendation[0].dispensador[0];
            } else if (productRecommendation && productRecommendation.dispensador) {
                selectedDispenser = productRecommendation.dispensador[0];
            }
        }

        if (selectedReference || selectedDispenser) {
            recommendationsHTML += `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
            `;

            if (selectedReference) {
                recommendationsHTML += `
                    <div class="reference-image-container" style="text-align: center; padding: 20px; background: white; border: 2px solid #00205b;">
                        <h4 style="color: #00205b; margin-bottom: 15px; font-weight: 600;">Referencia Seleccionada: ${selectedReference}</h4>
                        <img src="/static/images/${selectedReference}.png" alt="Imagen de referencia ${selectedReference}"
                             style="max-width: 300px; max-height: 200px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: white; padding: 10px; display: block; margin: 0 auto;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display: none; color: #64748b; font-style: italic; padding: 20px;">
                            Imagen no disponible para la referencia ${selectedReference}
                        </div>
                    </div>
                `;
            }

            if (selectedDispenser) {
                recommendationsHTML += `
                    <div class="dispenser-image-container" style="text-align: center; padding: 20px; background: white; border: 2px solid #00205b;">
                        <h4 style="color: #00205b; margin-bottom: 15px; font-weight: 600;">Dispensador Seleccionado: ${selectedDispenser}</h4>
                        <img src="/static/images/${selectedDispenser}.jpg" alt="Imagen de dispensador ${selectedDispenser}"
                             style="max-width: 300px; max-height: 200px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: white; padding: 10px; display: block; margin: 0 auto;"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        <div style="display: none; color: #64748b; font-style: italic; padding: 20px;">
                            Imagen no disponible para el dispensador ${selectedDispenser}
                        </div>
                    </div>
                `;
            }

            recommendationsHTML += `
                </div>
            `;
        }

        // Check if there are recommendations
        const hasReferences = recommendation && (
            (Array.isArray(recommendation) && recommendation.length > 0 && recommendation[0].referencias && recommendation[0].referencias.length > 0) ||
            (!Array.isArray(recommendation) && recommendation.referencias && recommendation.referencias.length > 0)
        );

        if (!hasReferences) {
            // No recommendations available - show message and consumption selector
            recommendationsHTML += `
                <div class="recommendation-group" style="margin-bottom: 25px;">
                    <div class="recommendation-grid">
                        <div>
                            <h3 class="recommendation-option-title">No hay sugerencias disponibles</h3>
                            <p style="color: #64748b; margin-top: 10px;">No se encontraron recomendaciones específicas para este producto en el segmento y nivel de tráfico seleccionados.</p>
                        </div>
                        <div class="consumption-item">
                            <h4 class="consumption-title">
                                Consumo Mensual
                            </h4>
                            <div class="reference-selector">
                                <label for="ref-${product.replace(/\s/g, '-')}">Referencia actual:</label>
                                <select id="ref-${product.replace(/\s/g, '-')}" data-producto="${product}" class="reference-select">
                                    <option value="${companyData.selectedReferences ? companyData.selectedReferences[product] : (productConsumption ? productConsumption.referencia_usada : '')}">${companyData.selectedReferences ? companyData.selectedReferences[product] : (productConsumption ? productConsumption.referencia_usada : '')}</option>
                                </select>
                                <button class="recalculate-btn" onclick="recalcularConsumo('${product}', false, this)">Recalcular</button>
                            </div>
                            <p class="consumption-value" id="consumo-${product.replace(/\s/g, '-')}">
                                ${productConsumption ? productConsumption.consumo_mensual + ' cajas/mes' : 'No aplica'}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        } else if (Array.isArray(recommendation)) {

            recommendation.forEach((rec, index) => {
                recommendationsHTML += `
                    <div class="recommendation-group" style="margin-bottom: 25px;">
                        <div class="recommendation-grid">
                            <div>
                                <h3 class="recommendation-option-title">Opción ${index + 1}: ${rec.posicionamiento}</h3>
                                <div class="recommendation-section">
                                    <h4 class="recommendation-section-title">Referencias:</h4>
                                    <div class="button-container">
                                        ${rec.referencias.map(ref => `
                                            <button type="button" onclick="handleReferenceClick('${ref}', '${product}')" class="reference-button">${ref}</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="recommendation-section">
                                    <h4 class="recommendation-section-title">Dispensador:</h4>
                                    <div class="button-container">
                                        ${rec.dispensador.map(disp => `
                                            <button type="button" onclick="handleDispenserClick('${disp}', '${product}')" class="dispenser-button">${disp}</button>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            ${productConsumption && index === 0 ? `
                                <div class="consumption-item">
                                    <h4 class="consumption-title">
                                        Consumo Mensual
                                    </h4>
                                    <div class="reference-selector">
                                        <label for="ref-${product.replace(/\s/g, '-')}">Referencia actual:</label>
                                        <select id="ref-${product.replace(/\s/g, '-')}" data-producto="${product}" class="reference-select">
                                            <option value="${companyData.selectedReferences ? companyData.selectedReferences[product] : productConsumption.referencia_usada}">${companyData.selectedReferences ? companyData.selectedReferences[product] : productConsumption.referencia_usada}</option>
                                        </select>
                                        <button class="recalculate-btn" onclick="recalcularConsumo('${product}', false, this)">Recalcular</button>
                                    </div>
                                    <p class="consumption-value" id="consumo-${product.replace(/\s/g, '-')}">
                                        ${productConsumption.consumo_mensual} cajas/mes
                                    </p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } else {

            recommendationsHTML += `
                <div class="recommendation-group" style="margin-bottom: 25px;">
                    <div class="recommendation-grid">
                        <div>
                            <h3 class="recommendation-option-title">${recommendation.posicionamiento}</h3>
                            <div class="recommendation-section">
                                <h4 class="recommendation-section-title">Referencias:</h4>
                                <div class="button-container">
                                    ${recommendation.referencias.map(ref => `
                                        <button type="button" onclick="handleReferenceClick('${ref}', '${product}')" class="reference-button">${ref}</button>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="recommendation-section">
                                <h4 class="recommendation-section-title">Dispensador:</h4>
                                <div class="button-container">
                                    ${recommendation.dispensador.map(disp => `
                                        <button type="button" onclick="handleDispenserClick('${disp}', '${product}')" class="dispenser-button">${disp}</button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        ${productConsumption ? `
                            <div class="consumption-item">
                                <h4 class="consumption-title">
                                    Consumo Mensual
                                </h4>
                                <div class="reference-selector">
                                    <label for="ref-${product.replace(/\s/g, '-')}">Referencia actual:</label>
                                    <select id="ref-${product.replace(/\s/g, '-')}" data-produto="${product}" class="reference-select">
                                        <option value="${companyData.selectedReferences ? companyData.selectedReferences[product] : productConsumption.referencia_usada}">${companyData.selectedReferences ? companyData.selectedReferences[product] : productConsumption.referencia_usada}</option>
                                    </select>
                                    <button class="recalculate-btn" onclick="recalcularConsumo('${product}', false, this)"
                                            style="background: #00853F; color: white; border: none;
                                                   padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;
                                                   box-shadow: 0 4px 15px rgba(0, 133, 63, 0.3);">Recalcular</button>
                                </div>
                                <p class="consumption-value" id="consumo-${product.replace(/\s/g, '-')}"
                                   style="font-size: 1.3em; font-weight: 700; color: #00853F; margin: 10px 0 0 0;">
                                    ${productConsumption.consumo_mensual} cajas/mes
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }
    });

    recommendationsHTML += `
        </div>
        <div class="navigation-buttons">
            <button class="nav-button btn-prev" onclick="startQuiz()">Comenzar de Nuevo</button>
            <button class="nav-button btn-next" onclick="generatePDF()">Generar Reporte</button>
        </div>
    `;

    document.getElementById('quiz-container').innerHTML = recommendationsHTML;

    // Cargar referencias para cada producto después de renderizar
    companyData.products.forEach(producto => {
        loadReferencesForProduct(producto);
    });
}
