
from flask import abort
from flask import Blueprint
from flask import flash
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from is_safe_url import is_safe_url
from urllib.parse import urlparse
import re
import logging

from webapp.models.user import User
from webapp.sqla import sqla
from flask_login import login_user

bp = Blueprint("auth", __name__, url_prefix="/auth")
login_logger = logging.getLogger('login_activity')


def validate_numero_identificacion(numero_id):
    """ID number validation - must be between 5 and 30 digits."""
    # Strip whitespace and convert to string
    numero_id = str(numero_id).strip()
    # Remove spaces and hyphens for digit counting
    digits_only = numero_id.replace(' ', '').replace('-', '')
    # Check if it contains only digits and is between 5 and 30 characters
    if not digits_only.isdigit():
        return False
    return 5 <= len(digits_only) <= 30


@bp.route("/register", methods=("GET", "POST"))
def register():
    """Register a new user with ID number only.

    Simple registration requiring only a numero de identificacion.
    Auto-creates account and logs user in.
    """
    if request.method == "GET":
        return render_template("auth/register.html")

    if request.method == "POST":
        numero_id = request.form.get("numero_identificacion", "").strip()

        # Validate ID number format
        if not numero_id:
            flash("El número de identificación es requerido")
            return render_template("auth/register.html", message="El número de identificación es requerido")

        if not validate_numero_identificacion(numero_id):
            flash("Formato de número de identificación inválido. Debe contener entre 5 y 30 dígitos")
            return render_template("auth/register.html", message="Formato de número de identificación inválido. Debe contener entre 5 y 30 dígitos")

        # Check if user already exists
        existing_user = User.query.filter_by(username=numero_id).first()
        if existing_user:
            flash("El número de identificación ya está registrado. Por favor inicia sesión.")
            return render_template("auth/register.html", message="El número de identificación ya está registrado")

        # Create new user (ID number only, no password)
        try:
            # Note: User model still requires password field, using numero_id as dummy password
            # This maintains database compatibility without schema changes
            user = User(username=numero_id, password=numero_id)
            sqla.session.add(user)
            sqla.session.commit()

            # Auto-login after registration
            login_user(user)
            session.permanent = True
            session['Username'] = numero_id

            # Log registration and login
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            login_logger.info(f"REGISTRO Y LOGIN - Usuario: {numero_id} | IP: {ip_address}")

            return redirect(url_for("consultor_integral"))
        except Exception as e:
            #sqla.session.rollback()
            print(e)
            #flash(f"Registro fallido: {str(e)}")
            return render_template("auth/register.html", message="Registro fallido")


@bp.route("/login", methods=("GET", "POST"))
def login():
    """Log in with ID number only (pseudo-login).

    If ID number exists, log them in.
    If ID number doesn't exist, redirect to registration.
    This is an open application with minimal authentication.
    """
    if request.method == "POST":
        numero_id = request.form.get("numero_identificacion", "").strip()

        # Validate ID number format
        if not numero_id:
            return render_template("auth/login.html", message="El número de identificación es requerido")

        if not validate_numero_identificacion(numero_id):
            return render_template("auth/login.html", message="Formato de número de identificación inválido. Debe contener entre 5 y 30 dígitos")

        # Check if user exists
        user = User.query.filter_by(username=numero_id).first()

        if user is None:
                return render_template("auth/login.html", message="Número de identificación no registrado. Por favor regístrate primero.")

        # Log user in
        login_user(user)
        session.permanent = True
        session['Username'] = numero_id

        # Log login activity
        ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        login_logger.info(f"LOGIN - Usuario: {numero_id} | IP: {ip_address}")

        # Handle next parameter for redirect
        next_url = request.args.get('next')
        if next_url:
            if not is_safe_url(next_url, {urlparse(request.base_url).netloc}):
                return abort(400)
            return redirect(next_url)

        return redirect(url_for("consultor_integral"))

    return render_template("auth/login.html")

'''
@bp.route("/glogin", methods=("GET", "POST"))
def glogin():
    # Google Oauth Config
    # Get client_id and client_secret from environment variables
    # For developement purpose you can directly put it
    # here inside double quotes
    cd = current_app.config["GCK"]
    sc = current_app.config["GCS"]
    CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
    oauth.register(
        name='google',
        client_id=cd,
        client_secret=sc,
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )

    # Redirect to google_auth function
    redirect_uri = url_for('auth.google_auth', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)


@bp.route('/google/auth/')
def google_auth():
    token = oauth.google.authorize_access_token()
    mail = token["userinfo"]["email"]
    user = User.query.filter_by(username=mail).first()
    if user is None:
        return render_template("login.html", message="Credenciales Incorrectas")
    else:
        session['Username'] = mail
        session['Nivel'] = 1
        session["Cliente"] = user.getClient()
        login_user(user)
    return redirect('/')
'''

@bp.route("/logout")
def logout():
    """Clear the current session, including the stored user id."""
    session.clear()
    return redirect(url_for("consultor_integral"))








