/**
 * ui-handlers.js
 * Handles UI interactions, image updates, and PDF generation for Consultor Integral
 */

/**
 * Update reference image when a reference is selected
 * @param {string} productName - Product name
 * @param {string} referenceText - Reference number
 */
function updateReferenceImage(productName, referenceText) {
    // Find all reference image containers for this product
    const productHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes(`${productName}`));
    if (productHeading) {
        // Find the reference image container within the grid
        const gridContainer = productHeading.nextElementSibling;
        if (gridContainer) {
            const referenceContainer = gridContainer.querySelector('.reference-image-container');
            if (referenceContainer) {
                // Update the heading
                const heading = referenceContainer.querySelector('h4');
                if (heading) {
                    heading.textContent = `Referencia Seleccionada: ${referenceText}`;
                }

                // Update the image
                const img = referenceContainer.querySelector('img');
                const fallback = referenceContainer.querySelector('div[style*="display: none"]');
                if (img && fallback) {
                    img.src = `/static/images/${referenceText}.png`;
                    img.alt = `Imagen de referencia ${referenceText}`;
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                    fallback.style.display = 'none';
                    fallback.innerHTML = `Imagen no disponible para la referencia ${referenceText}`;
                }
            }
        }
    }
}

/**
 * Update dispenser image when a dispenser is selected
 * @param {string} productName - Product name
 * @param {string} dispenserText - Dispenser number
 */
function updateDispenserImage(productName, dispenserText) {
    // Find all dispenser image containers for this product
    const productHeading = Array.from(document.querySelectorAll('h3')).find(h => h.textContent.includes(`${productName}`));
    if (productHeading) {
        // Find the dispenser image container within the grid
        const gridContainer = productHeading.nextElementSibling;
        if (gridContainer) {
            const dispenserContainer = gridContainer.querySelector('.dispenser-image-container');
            if (dispenserContainer) {
                // Update the heading
                const heading = dispenserContainer.querySelector('h4');
                if (heading) {
                    heading.textContent = `Dispensador Seleccionado: ${dispenserText}`;
                }

                // Update the image (using placeholder for now)
                const img = dispenserContainer.querySelector('img');
                const fallback = dispenserContainer.querySelector('div[style*="display: none"]');
                if (img && fallback) {
                    img.src = `/static/images/${dispenserText}.jpg`;
                    img.alt = `Imagen de dispensador ${dispenserText}`;
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                    fallback.style.display = 'none';
                    fallback.innerHTML = `Imagen no disponible para el dispensador ${dispenserText}`;
                }
            }
        }
    }
}

/**
 * Handle reference button click
 * @param {string} referenceText - Reference number
 * @param {string} productName - Product name
 */
function handleReferenceClick(referenceText, productName) {
    // Find the corresponding select element
    const selectId = `ref-${productName.replace(/\s/g, '-')}`;
    const selectElement = document.getElementById(selectId);

    if (selectElement) {
        // Get the Selectize instance
        const selectizeInstance = selectElement.selectize;

        if (selectizeInstance) {
            // Use Selectize API to find and set value
            let foundValue = null;

            // First try exact match
            if (selectizeInstance.options[referenceText]) {
                foundValue = referenceText;
            } else {
                // Look for partial match in all options
                for (let optionValue in selectizeInstance.options) {
                    if (optionValue.startsWith(referenceText + ' -') ||
                        optionValue.includes(referenceText)) {
                        foundValue = optionValue;
                        break;
                    }
                }
            }

            if (foundValue) {
                // Set the value using Selectize API
                selectizeInstance.setValue(foundValue, false); // false = don't trigger change event

                // Update the reference image
                updateReferenceImage(productName, referenceText);

                // Manually trigger recalculation since we suppressed the change event
                recalcularConsumo(productName, true);
            }
        } else {
            // Fallback to native select if Selectize not initialized

            let foundOption = false;

            // First try exact match
            for (let option of selectElement.options) {
                if (option.value === referenceText) {
                    selectElement.value = referenceText;
                    foundOption = true;
                    break;
                }
            }

            // If exact match not found, look for partial match
            if (!foundOption) {
                for (let option of selectElement.options) {
                    if (option.value.startsWith(referenceText + ' -') ||
                        option.value.includes(referenceText)) {
                        selectElement.value = option.value;
                        foundOption = true;
                        break;
                    }
                }
            }

            if (foundOption) {
                // Update the reference image
                updateReferenceImage(productName, referenceText);
                recalcularConsumo(productName, true);
            }
        }
    }
}

/**
 * Handle dispenser button click
 * @param {string} dispenserText - Dispenser number
 * @param {string} productName - Product name
 */
function handleDispenserClick(dispenserText, productName) {
    // Update the dispenser image
    updateDispenserImage(productName, dispenserText);
}

/**
 * Generate PDF report from the recommendations
 */
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const element = document.getElementById('report-content');

    // Call saveReporte before generating PDF
    saveReporte();

    // Ocultar botones de navegación antes de la captura
    const navButtons = document.querySelector('.navigation-buttons');
    navButtons.style.display = 'none';

    html2canvas(element, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const filename = `Reporte_${companyData.sector.replace(/\s/g, '_')}.pdf`;
        doc.save(filename);

        // Mostrar botones de navegación de nuevo
        navButtons.style.display = 'flex';
    });
}

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Load product data from Portfolio.xlsx before starting the quiz
    await loadProductData();
    startQuiz();
});
