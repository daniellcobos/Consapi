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