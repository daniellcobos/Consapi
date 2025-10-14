/**
 * config.js
 * Configuration and step definitions for Consultor Integral
 */

// Step definitions for the wizard
const steps = [
    {
        id: 'company-sector',
        title: 'Información de la Empresa',
        shortTitle: 'Empresa',
        icon: '',
        description: '¿Por qué necesitamos esta información?',
        content: `
            <div class="step-description">
                <div class="description-box">
                    <h4>¿Por qué necesitamos esta información?</h4>
                    <p> El sector de su empresa y su tamaño, determinan las necesidades específicas de higiene. Por ejemplo, el sector Salud requiere estándares de higiene crítica, mientras que el sector HoReCa, puede preferir atributos atados a una experiencia superior</p>
                </div>
            </div>
            <div class="form-group">
                <label for="companySector">Sector de la empresa:</label>
                <select id="companySector" required>
                    <option value="">-- Selecciona un sector --</option>
                    <option value="Oficinas / Corporativo">Oficinas / Corporativo</option>
                    <option value="Industria / Manufactura">Industria / Manufactura</option>
                    <option value="Salud (Hospitales, Clínicas)">Salud (Hospitales, Clínicas)</option>
                    <option value="Educación (Colegios, Universidades)">Educación (Colegios, Universidades)</option>
                    <option value="HoReCa (Hoteles, Restaurantes, Cafeterías)">HoReCa (Hoteles, Restaurantes, Cafeterías)</option>
                    <option value="Retail / Comercio">Retail / Comercio</option>
                    <option value="Otro">Otro</option>
                </select>
            </div>
            <div class="form-group">
                <label for="companySize">Tamaño de la empresa (número de empleados):</label>
                <select id="companySize" required>
                    <option value="">-- Selecciona el tamaño --</option>
                    <option value="11-50">Pequeña 11-50 empleados</option>
                    <option value="51-200">Mediana 51-200 empleados</option>
                    <option value="200+">Grande Más de 500 empleados</option>
                </select>
            </div>
        `
    },
    {
        id: 'demographics',
        title: 'Demografía y Jornada Laboral',
        shortTitle: 'Demografía',
        icon: '',
        description: '¿Por qué preguntamos sobre demografía?',
        content: `
            <div class="step-description">
                <div class="description-box">
                    <h4>¿Por qué preguntamos sobre demografía?</h4>
                    <p>Los patrones de uso varían entre géneros, y la intensidad de trabajo afecta la frecuencia de uso de los productos. Esta información, nos permite calcular un consumo mensual estimado y su base instalada de dispensadores a necesitar.</p>
                </div>
            </div>
            <div class="form-group">
                <label for="numMujeres">Número de mujeres:</label>
                <input type="number" id="numMujeres" min="0" value="0" required>
            </div>
            <div class="form-group">
                <label for="numHombres">Número de hombres:</label>
                <input type="number" id="numHombres" min="0" value="0" required>
            </div>
            <div class="form-group">
                <label for="diasLaborales">Días laborales por mes:</label>
                <input type="number" id="diasLaborales" min="1" max="31" value="30" required>
            </div>
            <div class="form-group">
                <label for="horasLaborales">Horas laborales por día:</label>
                <input type="number" id="horasLaborales" min="1" max="24" value="8" required>
            </div>
        `
    },
    {
        id: 'public-type',
        title: 'Tipo de Público',
        shortTitle: 'Público',
        icon: '',
        description: '¿Por qué es importante el tipo de público?',
        content: `
            <div class="step-description">
                <div class="description-box">
                    <h4>¿Por qué es importante el tipo de público?</h4>
                    <p>Diferentes tipos de usuarios, tienen distintos patrones de consumo y expectativas de experiencias. Esta clasificación, nos ayuda a determinar el segmento de producto más apropiado.</p>
                </div>
            </div>
            <p>¿Qué tipos de público visitan sus instalaciones? (Puede seleccionar múltiples opciones)</p>
            <div class="options-container">
                <button type="button" class="option-button public-option" data-public="administrativo">
                    <strong>Administrativo</strong><br>
                    <span style="font-size: 0.9em; font-weight: normal;">Personal de oficina, gerentes, empleados de escritorio</span>
                </button>
                <button type="button" class="option-button public-option" data-public="operativo">
                    <strong>Operativo</strong><br>
                    <span style="font-size: 0.9em; font-weight: normal;">Personal de producción, técnicos, trabajadores de campo</span>
                </button>
                <button type="button" class="option-button public-option" data-public="flotante">
                    <strong>Flotante</strong><br>
                    <span style="font-size: 0.9em; font-weight: normal;">Visitantes, clientes, personal temporal o externo</span>
                </button>
            </div>

            <div id="proporcion-container" class="hidden" style="margin-top: 30px;">
                <div class="description-box">
                    <h4>Distribución de Público</h4>
                    <p>Por favor, especifique la proporción de cada tipo de público en su empresa (debe sumar 100%):</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                    <div class="form-group" id="proporcion-administrativo" style="display: none;">
                        <label for="prop-administrativo" style="color: #00205b;">Administrativo (%):</label>
                        <input type="number" id="prop-administrativo" min="0" max="100" value="50" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
                    </div>

                    <div class="form-group" id="proporcion-operativo" style="display: none;">
                        <label for="prop-operativo" style="color: #00205b;">Operativo (%):</label>
                        <input type="number" id="prop-operativo" min="0" max="100" value="50" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px;">
                    </div>
                </div>

                <div style="margin-top: 15px; text-align: center;">
                    <p id="total-porcentaje" style="font-weight: 600; color: #00853F;">Total: 100%</p>
                </div>
            </div>

            <div id="visitantes-container" class="hidden" style="margin-top: 30px;">
                <div class="description-box">
                    <h4>Visitantes Flotantes</h4>
                    <p>Por favor, especifique el número estimado de visitantes diarios que utilizan las instalaciones:</p>
                </div>

                <div class="form-group" style="margin-top: 20px;">
                    <label for="num-visitantes" style="color: #00205b;">Número estimado de visitantes por día:</label>
                    <input type="number" id="num-visitantes" min="0" value="50" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; max-width: 300px;">
                </div>
            </div>
        `
    },
    {
        id: 'product-selection',
        title: 'Selección de Productos y Segmentos',
        shortTitle: 'Productos',
        icon: '🧻',
        description: '¿Por qué seleccionar productos y segmentos específicos?',
        content: `
            <div class="step-description">
                <div class="description-box">
                    <h4>¿Por qué seleccionar productos y segmentos específicos?</h4>
                    <p>Cada sistema tiene diferentes especificaciones técnicas, frecuencias de uso y métodos de dispensación; por otro lado, el segmento de baño, determina el nivel de experiencia y bienestar que desea el usuario. Esta información nos permite ofrecer recomendaciones atadas a esas necesidades</p>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #00205b; margin-bottom: 15px; font-size: 1.3em;">Productos de Higiene</h3>
                <p>¿Qué productos de higiene necesita su empresa? (Puede seleccionar múltiples opciones)</p>
                <div class="options-container">
                    <button type="button" class="option-button product-option" data-product="Papel Higiénico">Papel Higiénico</button>
                    <button type="button" class="option-button product-option" data-product="Toallas de Manos">Toallas de Manos</button>
                    <button type="button" class="option-button product-option" data-product="Jabones y Gel">Jabones y Gel</button>
                </div>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: #00205b; margin-bottom: 15px; font-size: 1.3em;">Segmento de Baños</h3>
                <p>Seleccione el segmento que mejor describe las expectativas y necesidades de sus baños:</p>
                <div class="options-container">
                    <button type="button" class="option-button segment-option" data-segment="Essential">
                        <strong>Esencial</strong><br>
                        <span style="font-size: 0.9em; font-weight: normal;">Funcionalidad básica y costo-eficiente</span>
                    </button>
                    <button type="button" class="option-button segment-option" data-segment="Restroom Plus">
                        <strong>Baños Plus</strong><br>
                        <span style="font-size: 0.9em; font-weight: normal;">Balance entre experiencia, calidad y costos</span>
                    </button>
                    <button type="button" class="option-button segment-option" data-segment="Wow Factor">
                        <strong>Baños con Factor "WOW"</strong><br>
                        <span style="font-size: 0.9em; font-weight: normal;">Imagen y experiencia premium</span>
                    </button>
                    <button type="button" class="option-button segment-option" data-segment="Higiene Crítica">
                        <strong>Higiene Crítica</strong><br>
                        <span style="font-size: 0.9em; font-weight: normal;">Máximos estándares de higiene</span>
                    </button>
                </div>
            </div>
        `
    }
];
