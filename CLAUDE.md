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
- **Authentication**: `webapp/auth.py` - Simplified ID-only authentication with Flask-Login
- **Login Manager**: `webapp/login.py` - Flask-Login configuration
- **Logging**: `webapp/logger_config.py` - Logging system for user activity tracking
- **Database**: `webapp/sqla.py` - SQLAlchemy instance
- **Models**:
  - `webapp/models/user.py` - User model with UUID-based identification
  - `webapp/models/portafolio.py` - Portfolio model for saving consumption reports
- **Vendor Module**: `webapp/vendor.py` - Additional blueprint (currently minimal)

### Key Components

#### Authentication System
- **Simplified ID-Only Authentication**: Users register and login with just an identification number (5-30 digits)
- Uses Flask-Login for session management
- No password required - ID number is used for both username and password hash (maintains database compatibility)
- User model with UUID-based identification for session management
- PostgreSQL database storage
- **Activity Logging**: Login and registration events are logged with timestamps and IP addresses in `logs/login_activity.log`

#### API Endpoints

**Legacy Endpoints:**
- `/api_ce` - Legacy consumption calculation API (POST) - requires API key
- `/api_refs` - Product references retrieval (GET)

**Consultor Integral Endpoints:**
- `/` - Main Consultor Integral wizard (requires login)
- `/api_consultor_integral` - POST - Calculate consumption for selected products with multiple public types and proportions
- `/api_get_referencias` - POST - Get available product references for a specific product
- `/api_recalcular_consumo` - POST - Recalculate consumption when user changes product reference
- `/api_portfolio_data` - GET - Serve Portfolio.xlsx data for product recommendations (JSON)
- `/save_portfolio` - POST - Save portfolio report to database with activity logging
- `/read_portfolios` - GET - View all saved portfolios (admin only, requires login)

**Other Pages:**
- `/guia` - Guide page
- `/segmentacion` - Segmentation page
- `/auth/register` - User registration (ID only)
- `/auth/login` - User login (ID only)
- `/auth/logout` - User logout

#### Business Logic
- **Excel-based parameter management**:
  - `ParametrosSimulador.xlsx` - Legacy parameter file with prices and yields
  - `Portfolio.xlsx` - Product recommendations by segment and traffic level
- **Consumption calculations** based on:
  - Workplace demographics (number of men/women, work days, work hours)
  - Multiple public types (administrative, operational, floating visitors)
  - Public type proportions (when both administrative and operational selected)
  - Daily visitor counts (for floating public)
- **Product categorization**: Toilet paper, hand towels, soap/gel
- **Sector-specific consumption patterns**: Different calculations for Healthcare, Education, HoReCa, Industry, etc.
- **Gender-specific consumption patterns**: Different usage rates for men and women
- **Traffic level determination**: Automatic calculation based on total person-hours (Bajo/Medio/Alto/Pico)
- **Bathroom segment selection**: Essential, Restroom Plus, Wow Factor, Higiene Crítica
- **SKU mapping and fallbacks**: Handles missing SKUs with equivalent references (see main.py:356-359)

### Database Configuration
- PostgreSQL database connection configured in `config.py`
- SQLAlchemy ORM for database operations
- **Tables**:
  - `dt_usuarios` - User accounts with UUID, username (ID number), password hash
  - `dt_portafolios` - Saved portfolio reports with sector, demographics, product selections, and consumption data

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
- Application heavily dependent on Excel file structures:
  - `ParametrosSimulador.xlsx` - Contains sheets: Parametros, Parametros Goliat, Tipos, Precios_*, Rendimiento_*
  - `Portfolio.xlsx` (with fallback to `Portfolio_copy.xlsx`) - Contains product recommendations organized by segment/traffic/product
- Located in `webapp/static/`

### Logging System
- **Location**: `logs/` directory (auto-created if missing)
- **Login Activity Log**: `logs/login_activity.log` - Records all login and registration events with IP addresses
- **Portfolio Activity Log**: `logs/portfolio_activity.log` - Records all portfolio creation events with product details
- **Rotation**: 10MB max file size, 10 backup files retained
- **Format**: Timestamp - Level - Message (YYYY-MM-DD HH:MM:SS)

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

## Consultor Integral JavaScript Architecture

The JavaScript for Consultor Integral has been **completely refactored** from a monolithic inline script (~1500 lines) into a clean, modular ES6 architecture with proper separation of concerns and elimination of global scope pollution.

### Modular File Structure

The application now uses ES6 modules with proper imports/exports. All files are located in `/webapp/static/`:

```
/webapp/static/
├── main.js                 # Application entry point and initialization
├── state.js                # Centralized state management (no global variables)
├── config.js               # Step definitions and configuration constants
├── api.js                  # All API communication with backend
├── validation.js           # Form validation and event listener attachment
├── ui-handlers.js          # UI interactions, image updates, PDF generation
├── event-delegation.js     # Central event handling system (replaces window.* exposures)
├── Steps.js                # Step rendering and navigation
└── Portfolio.js            # Data loading, business logic, recommendations
```

### Module Descriptions

#### 1. **main.js** - Application Entry Point
- Initializes the event delegation system
- Loads product data from Portfolio.xlsx on startup
- Starts the wizard/quiz
- Handles DOMContentLoaded event
- **No window.* exposures** - clean global scope

#### 2. **state.js** - Centralized State Management
**Eliminates all global variables** with a clean state management pattern:
- `companyData` - User input data (sector, demographics, public types, proportions)
- `consumptionData` - API calculation results
- `productData` - Portfolio.xlsx recommendations
- `currentStep` - Wizard progress tracker
- `selectedProducts` - Product selections
- `selectedPublicTypes` - Public type selections
- `selectedBathroomSegment` - Bathroom segment selection

**Exported Functions:**
- `getState()` - Get current application state
- `updateCompanyData()` - Update company data
- `setConsumptionData()` - Set consumption results
- `getCurrentStep()`, `setCurrentStep()`, `nextStep()`, `previousStep()` - Step navigation
- `getSelectedProducts()`, `addSelectedProduct()`, `removeSelectedProduct()` - Product management
- `resetState()` - Reset all state to initial values

#### 3. **config.js** - Configuration & Step Definitions
Exports the `steps` array with 4 wizard steps:
1. **company-sector**: Company information (sector, size)
2. **demographics**: Employee demographics and work schedule
3. **public-type**: Public type selection with proportions and visitor counts
4. **product-selection**: Product and bathroom segment selection

Each step includes: `id`, `title`, `shortTitle`, `icon`, `description`, `content` (HTML)

#### 4. **api.js** - API Communication
**All backend communication centralized:**
- `calculateConsumption()` - POST to `/api_consultor_integral` with company data and selected products
- `recalcularConsumo()` - POST to `/api_recalcular_consumo` when user changes product reference
- `saveReporte()` - POST to `/save_portfolio` to save report to database

**Features:**
- Handles proportions for multiple public types
- Supports visitor count for floating public
- Updates state with consumption results
- Manages reference selections

#### 5. **validation.js** - Form Validation & Event Listeners
**Validation by step:**
- **company-sector**: Sector and size required
- **demographics**: At least 1 employee, valid days/hours
- **public-type**: At least 1 public type, proportions must sum to 100%, visitor count required for floating
- **product-selection**: At least 1 product and 1 bathroom segment

**Event Management:**
- `attachEventListeners()` - Attaches listeners to product/public/segment buttons
- `validateStep()` - Validates current step before proceeding
- `validateDemographicsStep()` - Real-time validation for employee count
- `updateProporcionInputs()` - Shows/hides proportion inputs based on selections
- `updateTotalPorcentaje()` - Real-time percentage total calculation and validation

#### 6. **ui-handlers.js** - UI Interactions & PDF Generation
**Image Management:**
- `updateReferenceImage()` - Updates product reference image from `/static/images/{SKU}.png`
- `updateDispenserImage()` - Updates dispenser image from `/static/images/{SKU}.jpg`
- Handles image loading errors with fallback messages

**User Interactions:**
- `handleReferenceClick()` - Syncs reference button with Selectize dropdown
- `handleDispenserClick()` - Updates dispenser selection and image
- Works with Selectize plugin for searchable dropdowns

**PDF Generation:**
- `generatePDF()` - Uses html2canvas + jsPDF to generate multi-page PDF reports
- Calls `saveReporte()` before generating PDF
- Hides navigation buttons during capture
- Filenames include company sector

#### 7. **event-delegation.js** - Central Event System
**Replaces window.* function exposures** with a clean delegation pattern using `data-action` attributes:

**Supported Actions:**
- `data-action="next-step"` - Navigate to next step
- `data-action="prev-step"` - Navigate to previous step
- `data-action="start-quiz"` - Restart wizard
- `data-action="recalculate"` - Recalculate consumption (requires `data-product`)
- `data-action="select-reference"` - Select reference (requires `data-reference` and `data-product`)
- `data-action="select-dispenser"` - Select dispenser (requires `data-dispenser` and `data-product`)
- `data-action="generate-pdf"` - Generate PDF report

**Benefits:**
- Single event listener on document
- No global function pollution
- Better security (functions not accessible globally)
- Works perfectly with dynamically generated content
- Improved performance

#### 8. **Steps.js** - Step Rendering & Navigation
**UI Rendering:**
- `initializeStepsList()` - Creates sidebar step items
- `renderStep()` - Renders current step content with navigation buttons
- `updateProgress()` - Updates progress indicators
- `updateStepsList()` - Updates step visual states (active/completed/pending)

**Navigation:**
- `nextStep()` - Validates and moves to next step, or generates recommendations on final step
- `previousStep()` - Returns to previous step
- `startQuiz()` - Resets state and restarts wizard

**Features:**
- Automatically scrolls to step title on mobile devices
- Dynamically imports validation module to attach event listeners
- Navigation buttons use `data-action` attributes for event delegation

#### 9. **Portfolio.js** - Data Loading & Business Logic
**Data Loading:**
- `loadProductData()` - Fetches Portfolio.xlsx via `/api_portfolio_data`
- `loadReferencesForProduct()` - Fetches references via `/api_get_referencias`
- Handles encoding fixes for Spanish characters (é, í, á)
- Manages Portfolio.xlsx and Portfolio_copy.xlsx fallback

**Business Logic:**
- `determineTrafficLevel()` - Calculates traffic level (Bajo/Medio/Alto/Pico) based on person-hours
- `generateRecommendations()` - Orchestrates recommendation generation
- `displayRecommendationsWithConsumption()` - Renders final results with consumption data

**Reference Management:**
- Sorts references: selected first, then recommended (⭐), then others
- Initializes Selectize dropdowns with search functionality
- Highlights recommended references
- Updates images when references change

### Architectural Benefits Achieved

**Achieved Improvements:**
- **Zero Global Pollution**: No functions exposed on `window` object
- **Single Responsibility**: Each module has one clear purpose
- **Maintainability**: Easy to locate and modify specific functionality
- **Testability**: Functions are isolated and can be unit tested
- **Reusability**: Modules can be imported where needed
- **Security**: Functions not accessible from browser console or external scripts
- **Performance**: Single event listener instead of multiple inline handlers
- **Modern Standards**: ES6 modules, arrow functions, async/await, destructuring
- **Documentation**: JSDoc comments throughout for IDE support

### Event Delegation Pattern

The new architecture uses a **centralized event delegation system** that eliminates the need for:
- `onclick="functionName()"` inline attributes
- `window.functionName = function() {}` global exposures
- Multiple event listeners on dynamic content

**Instead, all interactive elements use data attributes:**
```html
<!-- Old way (eliminated): -->
<button onclick="nextStep()">Next</button>

<!-- New way: -->
<button data-action="next-step">Next</button>
<button data-action="recalculate" data-product="Papel Higiénico">Recalculate</button>
```

The central handler in `event-delegation.js` routes all clicks based on `data-action` values.

### State Management Pattern

**Old way (eliminated):**
```javascript
var companyData = {};  // Global variable
var currentStep = 0;   // Global variable
```

**New way:**
```javascript
// state.js - encapsulated
import { getState, updateCompanyData } from './state.js';

const state = getState();
updateCompanyData({ sector: 'Healthcare' });
```

All state is encapsulated in `state.js` and accessed only through exported functions.