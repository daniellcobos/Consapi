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