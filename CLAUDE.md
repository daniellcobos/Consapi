# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is a Flask web application for consumption simulation and management, primarily focused on hygiene products (toilet paper, hand towels, soap, napkins, cleaning supplies). The application provides:

- User authentication system with login/registration
- Consumption calculation API based on workplace parameters
- Product reference management
- Excel-based parameter configuration

## Architecture

### Core Structure
- **Entry Point**: `wsgi.py` - WSGI application entry point
- **Main Application**: `webapp/main.py` - Flask app with routes and business logic
- **Configuration**: `config.py` - Database connections, API keys, and environment settings
- **Authentication**: `webapp/auth.py` - User registration, login, logout with Flask-Login
- **Database**: `webapp/sqla.py` - SQLAlchemy instance
- **Models**: `webapp/models/user.py` - User model with password hashing
- **Vendor Module**: `webapp/vendor.py` - Additional blueprint (currently minimal)

### Key Components

#### Authentication System
- Uses Flask-Login for session management
- Password hashing with Werkzeug
- User model with UUID-based identification
- PostgreSQL database storage

#### API Endpoints
- `/api_ce` - Main consumption calculation API (POST)
- `/api_refs` - Product references retrieval (GET) 
- `/` - Main dashboard (requires login)
- `/guia` - Guide page

#### Business Logic
- Excel-based parameter management (`ParametrosSimulador.xlsx`)
- Consumption calculations based on workplace demographics
- Product categorization (toilet paper, towels, soap, napkins, cleaning supplies)
- Sector-specific and gender-specific consumption patterns

### Database Configuration
- PostgreSQL database connection configured in `config.py`
- SQLAlchemy ORM for database operations
- User table: `dt_usuarios` with UUID, username, password fields

## Development Commands

### Running the Application
```bash
python wsgi.py
```
The application runs on host 0.0.0.0 (all interfaces) with Flask's default port.

### Environment Setup
- Python 3.12+ required
- No requirements.txt found - dependencies managed manually
- Key dependencies: Flask, Flask-Login, Flask-SQLAlchemy, Flask-CORS, pandas, Werkzeug

### Database
- PostgreSQL connection configured for production database
- Connection string in `config.py` (contains credentials - handle with care)

## Configuration Notes

### Security Considerations
- API key hardcoded in main.py: `'asdklfLCJKVLvnclklskhdW09232dkja92235adj'`
- Database credentials and API keys are hardcoded in config.py
- CORS configured for specific external domains

### Excel Dependencies
- Application heavily dependent on `ParametrosSimulador.xlsx` structure
- Contains multiple sheets: Parametros, Tipos, Precios_*, Rendimiento_*
- Located in `webapp/static/`

## Key Features
- Multi-factor consumption calculation (gender, work hours, facility type)
- Product reference management with SKU parsing
- Sector-specific consumption patterns
- Error handling for calculation failures

## Consultor Integral Styling

The `consultor_integral.html` template and `consultor_integral.css` stylesheet have been refactored with consistent Tork branding:

### Color Palette
- **Tork Blue**: `#00205b` - Primary brand color for text, borders, and primary elements
- **Secondary Blue**: `#0070C0` - Navigation buttons (Anterior/Siguiente) and option buttons
- **Tork Green**: `#00853F` - Selected states, success indicators, and accent elements
- **Background Blue**: `#CDEBFE` - Light background for recommendation sections
- **White**: `white` - Clean backgrounds for cards, forms, and content areas

### Typography
- **Font Family**: Helvetica Neue with fallbacks (`'Helvetica Neue', Helvetica, Arial, sans-serif`)
- Applied consistently across all elements including Selectize dropdowns

### Key Styling Changes
1. **CSS Extraction**: Moved 800+ lines of CSS from inline styles to external stylesheet
2. **Color Consistency**: Updated all elements to use consistent Tork brand colors
3. **Component Refactoring**: Created reusable CSS classes for step 4 recommendations:
   - `.recommendation-grid` - Layout for recommendation sections
   - `.recommendation-option-title` - Tork blue titles
   - `.reference-button` / `.dispenser-button` - Styled interaction buttons
   - `.consumption-item` - White background consumption cards
   - `.reference-select` - Consistent dropdown styling
4. **Responsive Design**: Maintained mobile-friendly grid layouts
5. **Selectize Integration**: Custom styling for dropdown components with Helvetica Neue

### Layout Structure
- **Left Sidebar**: White background with Tork blue text and borders
- **Step Items**: White backgrounds with Tork blue borders (green when completed)
- **Main Content**: Clean white cards with appropriate color accents
- **Navigation**: Secondary blue buttons for consistent user flow

### Brand Compliance
- Removed all gradients for clean, professional appearance
- Eliminated emoji usage throughout interface
- Consistent border treatments and shadow effects
- Professional color hierarchy with proper contrast ratios

## Consultor Integral JavaScript Refactor (Future)

The JavaScript in `consultor_integral.html` is currently monolithic (~1500 lines in a single `<script>` tag). Below is the suggested modular structure for a future refactor:

### Current Code Division by Function

**1. Data Management & State**
- `companyData` - Company/user input data storage
- `consumptionData` - API consumption results storage
- `productData` - Portfolio data from Excel
- `currentStep` - Current quiz step tracker
- `selectedProducts` - Selected product categories
- `selectedPublicTypes` - Selected public types
- `selectedBathroomSegment` - Selected bathroom segment

**2. Data Loading & API Calls**
- `loadProductData()` - Fetch portfolio data from `/api_portfolio_data`
- `loadReferencesForProduct(producto)` - Fetch product references from `/api_get_referencias`
- `calculateConsumption(segment, trafficLevel, totalEmployees)` - POST to `/api_consultor_integral`
- `recalcularConsumo(producto, fromReferenceClick, btnEl)` - POST to `/api_recalcular_consumo`
- `saveReporte()` - POST to `/save_portfolio`

**3. UI Initialization & Rendering**
- `initializeStepsList()` - Create sidebar step items
- `renderStep()` - Render current step content
- `updateProgress()` - Update progress indicators
- `updateStepsList()` - Update sidebar step states (active/completed)

**4. Step Navigation & Validation**
- `nextStep()` - Move to next step with validation
- `previousStep()` - Move to previous step
- `validateStep()` - Validate current step input
- `startQuiz()` - Reset and restart quiz

**5. Event Handlers**
- `attachEventListeners()` - Attach all event listeners for current step
- `handleReferenceClick(referenceText, productName)` - Reference button click handler
- `handleDispenserClick(dispenserText, productName)` - Dispenser button click handler

**6. Form Input Management**
- `updateProporcionInputs()` - Show/hide proportion inputs based on public type selection
- `updateTotalPorcentaje()` - Calculate and validate percentage totals
- `validateDemographicsStep()` - Enable/disable next button based on demographics input

**7. Business Logic & Calculations**
- `determineTrafficLevel(numEmployees, diasLaborales, horasLaborales)` - Calculate traffic level
- `determineSegment(sector, size, tiposPublico)` - Determine recommended segment (currently unused)

**8. Results Generation & Display**
- `generateRecommendations()` - Trigger recommendation generation
- `displayRecommendationsWithConsumption(segment, trafficLevel, consumptionData)` - Render final recommendations
- `displaySelected(producto)` - Move recommended reference to first position (legacy)

**9. UI Updates & Image Management**
- `updateReferenceImage(productName, referenceText)` - Update reference product image
- `updateDispenserImage(productName, dispenserText)` - Update dispenser image

**10. PDF Generation**
- `generatePDF()` - Generate PDF report using html2canvas and jsPDF

**11. Configuration & Constants**
- `steps[]` - Array of step definitions with content, titles, descriptions

**12. Initialization**
- `DOMContentLoaded` event listener - Load product data and start quiz

### Proposed Refactored Structure

```
/static/js/consultor-integral/
├── config.js              # steps[] definition, constants, API endpoints
├── state.js               # Data management (companyData, productData, etc.)
├── api.js                 # All API calls (fetch wrappers)
├── validation.js          # All validation functions
├── navigation.js          # Step navigation & progress tracking
├── ui-renderer.js         # UI rendering functions (renderStep, updateStepsList)
├── event-handlers.js      # Event listener attachment & handlers
├── business-logic.js      # Traffic level, segment determination
├── recommendations.js     # Recommendation generation & display
├── pdf-generator.js       # PDF generation functionality
├── image-manager.js       # Image update functions
└── main.js                # Initialization & orchestration
```

### Benefits of Refactoring
- **Maintainability**: Each file has a single responsibility
- **Testability**: Functions are isolated and easier to unit test
- **Organization**: Related functions grouped together logically
- **Reusability**: Functions can be imported where needed
- **Debugging**: Easier to locate and fix bugs in specific modules
- **Collaboration**: Multiple developers can work on different modules simultaneously

### Implementation Notes
- Use ES6 modules (`import`/`export`)
- Consider using a build tool (Webpack, Vite) for bundling
- Maintain backward compatibility during migration
- Add JSDoc comments for better IDE support
- Consider TypeScript for type safety (optional)