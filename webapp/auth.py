
from flask import abort
from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import session
from flask import url_for
from flask import current_app
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash
from is_safe_url import is_safe_url
from urllib.parse import urlparse


from webapp.models.user import User
from webapp.sqla import sqla
from flask_login import login_user, current_user
#from webapp.oauth import oauth
from flask import current_app
from flask_login import login_required

bp = Blueprint("auth", __name__, url_prefix="/auth")


@bp.route("/register", methods=("GET", "POST"))
@login_required
def register():
    if request.method == "GET":
        return render_template("auth/register.html")
    """Register a new user.

    Validates that the username is not already taken. Hashes the
    password for security.
    """
    if request.method == "POST":
        try:
            user = User(username=request.form["username"], password=request.form["password"])
        except ValueError as e:
            flash(str(e))
            return render_template("auth/register.html")
        '''#msg = Message("Por favor confirme Usuario: " + request.form["username"],sender="easynet@synapsis-rs.com",
        '#             recipients=["daniel.cobos@synapsis-rs.com"])
        tser = ts.gettser()
        #key = str(tser.dumps(request.form["username"], salt="confirm-email"))
        msg.html = render_template("email/verify.html", token=key)
        #mail.send(msg)'''
        sqla.session.add(user)
        sqla.session.commit()

        return redirect(url_for("index"))
@bp.route("/login", methods=("GET", "POST"))
def login():
    """Log in a registered user by adding the user id to the session."""
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        error = None
        user = User.query.filter_by(username=username).first()
        if user is None:
            return render_template("auth/login.html", message="Credenciales Incorrectas")
        elif not user.correct_password(password):
            return render_template("auth/login.html", message="Credenciales Incorrectas")
        if error is None:
            login_user(user)
            session['Username'] = username
            next = request.args.get('next')
            if next:
                if not is_safe_url(next, { urlparse(request.base_url).netloc }):
                    return abort(400)
                return redirect(next or url_for("index"))

        flash(error)

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
    return redirect(url_for("index"))








