/**
 * api.js
 * Gestión de comunicación con el backend para Consultor Integral.
 *
 * DESCRIPCIÓN:
 * Maneja todas las llamadas HTTP al backend de Flask, incluyendo cálculos de consumo,
 * recálculos de productos específicos, y guardado de portafolios. Procesa las respuestas
 * del servidor y actualiza el estado de la aplicación.
 *
 * ENDPOINTS UTILIZADOS:
 * - /api_consultor_integral: Cálculo de consumo para todos los productos seleccionados
 * - /api_recalcular_consumo: Recálculo cuando el usuario cambia la referencia
 * - /save_portfolio: Guarda el reporte generado en la base de datos
 * - /api_get_referencias: Obtiene referencias disponibles para un producto
 *
 * FUNCIONES PRINCIPALES:
 * - calculateConsumption(): Calcula consumo mensual de todos los productos
 * - recalcularConsumo(): Recalcula consumo al cambiar referencia de producto
 * - saveReporte(): Guarda los resultados en la base de datos
 *
 * DATOS ENVIADOS:
 * - Información de la empresa (sector, tamaño, empleados, jornada)
 * - Productos y referencias seleccionadas
 * - Proporciones de tipos de público (si aplica)
 *
 * Handles all API communication for Consultor Integral
 */

import { getState, setConsumptionData, updateCompanyData } from './state.js';
import { determineTrafficLevel } from './Portfolio.js';

/**
 * Calculate consumption for all selected products
 * @param {string} segment - Bathroom segment
 * @param {string} trafficLevel - Traffic level
 * @param {number} totalEmployees - Total employees
 */
export async function calculateConsumption(segment, trafficLevel, totalEmployees) {
    const state = getState();
    const { companyData, productData } = state;

    try {
        // Prepare selected references for each product
        const referencias = {};
        const selectedReferences = {}; // Store the specific reference chosen for each product

        companyData.products.forEach(product => {
            // Safely access recommendation with null checks
            const recommendation = productData[product]?.[segment]?.[trafficLevel];
            let productReferences = [];

            if (recommendation) {
                if (Array.isArray(recommendation) && recommendation.length > 0) {
                    productReferences = recommendation[0].referencias || [];
                } else if (recommendation.referencias) {
                    productReferences = recommendation.referencias;
                }
            }

            referencias[product] = productReferences;

            // Select the first RECOMMENDED reference as default (not from API response)
            if (productReferences.length > 0) {
                selectedReferences[product] = productReferences[0];
            } else {
                // If no recommendations, set to null so backend uses default
                selectedReferences[product] = null;
            }
        });

        // Store selected references for UI updates
        updateCompanyData({ selectedReferences });

        const requestData = {
            numMujeres: companyData.numMujeres,
            numHombres: companyData.numHombres,
            diasLaborales: companyData.diasLaborales,
            horasLaborales: companyData.horasLaborales,
            tipoPublico: companyData.tipoPublico,
            sector: companyData.sector,
            productos: companyData.products,
            referencias: selectedReferences, // Use specific selected references instead of arrays
            proporciones: companyData.proporciones || {}, // Include proportions if they exist
            numVisitantes: companyData.numVisitantes || 0 // Include number of visitors if it exists
        };

        const response = await fetch('/api_consultor_integral', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Error en el cálculo de consumo');
        }

        const consumptionData = await response.json();
        setConsumptionData(consumptionData);

        // Import dynamically to avoid circular dependency
        const { displayRecommendationsWithConsumption } = await import('./Portfolio.js');
        displayRecommendationsWithConsumption(segment, trafficLevel, consumptionData);

    } catch (error) {
        console.error('Error calculando consumo:', error);

        // Import dynamically to avoid circular dependency
        const { displayRecommendationsWithConsumption } = await import('./Portfolio.js');
        displayRecommendationsWithConsumption(segment, trafficLevel, {});
    }
}

/**
 * Recalculate consumption for a specific product with a new reference
 * @param {string} producto - Product name
 * @param {boolean} fromReferenceClick - Whether triggered by reference button click
 * @param {HTMLElement} btnEl - Button element to show loading state
 */
export async function recalcularConsumo(producto, fromReferenceClick = false, btnEl = null) {
    const state = getState();
    const { companyData } = state;

    const selectId = `ref-${producto.replace(/\s/g, '-')}`;
    const consumoId = `consumo-${producto.replace(/\s/g, '-')}`;
    const select = document.getElementById(selectId);
    const consumoElement = document.getElementById(consumoId);
    if (!select || !consumoElement) return;

    const nuevaReferencia = select.value;

    // Loading state ONLY if it came from button (not from reference click)
    if (!fromReferenceClick && btnEl) {
        btnEl.disabled = true;
        btnEl.innerHTML = '⏳ Calculando...';
    }

    consumoElement.textContent = 'Calculando...';

    try {
        const requestData = {
            numMujeres: companyData.numMujeres,
            numHombres: companyData.numHombres,
            diasLaborales: companyData.diasLaborales,
            horasLaborales: companyData.horasLaborales,
            tipoPublico: companyData.tipoPublico,
            sector: companyData.sector,
            producto: producto,
            referencia: nuevaReferencia,
            proporciones: companyData.proporciones || {}, // Include proportions if they exist
            numVisitantes: companyData.numVisitantes || 0 // Include number of visitors if it exists
        };

        const response = await fetch('/api_recalcular_consumo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.error) {
                consumoElement.innerHTML = 'Error en el cálculo';
                alert('Error: ' + data.error);
            } else {
                consumoElement.innerHTML = `${data.consumo_mensual} cajas/mes`;

                // Extract reference number from select value
                const referenceMatch = nuevaReferencia.match(/^(\d+)/);
                const referenceNumber = referenceMatch ? referenceMatch[1] : nuevaReferencia;

                // Check if we need to create/update the reference image
                // Find the product heading
                const productHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.trim() === producto);

                if (productHeading) {
                    // Check if image container already exists
                    let imageGrid = productHeading.nextElementSibling;

                    if (!imageGrid || !imageGrid.style.display || imageGrid.style.display.indexOf('grid') === -1) {
                        // Image container doesn't exist, create it
                        const newImageGrid = document.createElement('div');
                        newImageGrid.style.display = 'grid';
                        newImageGrid.style.gridTemplateColumns = '1fr 1fr';
                        newImageGrid.style.gap = '20px';
                        newImageGrid.style.margin = '20px 0';

                        const referenceContainer = document.createElement('div');
                        referenceContainer.className = 'reference-image-container';
                        referenceContainer.style.textAlign = 'center';
                        referenceContainer.style.padding = '20px';
                        referenceContainer.style.background = 'white';
                        referenceContainer.style.border = '2px solid #00205b';

                        referenceContainer.innerHTML = `
                            <h4 style="color: #00205b; margin-bottom: 15px; font-weight: 600;">Referencia Seleccionada: ${referenceNumber}</h4>
                            <img src="/static/images/${referenceNumber}.png" alt="Imagen de referencia ${referenceNumber}"
                                 style="max-width: 300px; max-height: 200px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: white; padding: 10px; display: block; margin: 0 auto;"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <div style="display: none; color: #64748b; font-style: italic; padding: 20px;">
                                Imagen no disponible para la referencia ${referenceNumber}
                            </div>
                        `;

                        newImageGrid.appendChild(referenceContainer);
                        productHeading.parentNode.insertBefore(newImageGrid, productHeading.nextSibling);
                    } else {
                        // Update existing image
                        const { updateReferenceImage } = await import('./ui-handlers.js');
                        updateReferenceImage(producto, referenceNumber);
                    }
                }
            }
        } else {
            consumoElement.innerHTML = 'Error en el cálculo';
            alert('Error al recalcular el consumo');
        }
    } catch (error) {
        console.error('Error recalculando consumo:', error);
        consumoElement.textContent = 'Error en el cálculo';
        alert('Error de conexión al recalcular');
    } finally {
        if (!fromReferenceClick && btnEl) {
            btnEl.disabled = false;
            btnEl.textContent = 'Recalcular';
        }
    }
}

/**
 * Save the portfolio report to the database
 */
export async function saveReporte() {
    const state = getState();
    const { companyData, consumptionData } = state;

    try {
        // Prepare portfolio data
        const portfolioData = {
            sector: companyData.sector,
            mujeres: companyData.numMujeres,
            hombres: companyData.numHombres,
            dias: companyData.diasLaborales,
            horas: companyData.horasLaborales,
            tipo: companyData.tipoPublico,
            refpapel: null,
            conspapel: null,
            refjabones: null,
            consjabones: null,
            reftoallas: null,
            constoallas: null
        };

        // Extract product data if available
        if (consumptionData && Object.keys(consumptionData).length > 0) {
            Object.keys(consumptionData).forEach(producto => {
                const productData = consumptionData[producto];
                const selectElement = document.getElementById(`ref-${producto.replace(/\s/g, '-')}`);
                const referencia = selectElement ? selectElement.value : null;

                // Map products to database fields
                if (producto.toLowerCase().includes('papel')) {
                    portfolioData.refpapel = referencia;
                    portfolioData.conspapel = productData.consumo_mensual;
                } else if (producto.toLowerCase().includes('jabón') || producto.toLowerCase().includes('jabon')) {
                    portfolioData.refjabones = referencia;
                    portfolioData.consjabones = productData.consumo_mensual;
                } else if (producto.toLowerCase().includes('toalla')) {
                    portfolioData.reftoallas = referencia;
                    portfolioData.constoallas = productData.consumo_mensual;
                }
            });
        }

        // Send data to backend
        const response = await fetch('/save_portfolio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(portfolioData)
        });

        if (response.ok) {
            const result = await response.text();
            console.log('Portfolio saved successfully');
        } else {
            console.error('Error guardando portfolio:', response.status);
        }

    } catch (error) {
        console.error('Error enviando portfolio:', error);
    }
}
