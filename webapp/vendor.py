from flask import Blueprint, render_template
from flask_login import login_required
bp = Blueprint("goliat", __name__, url_prefix="/goliat")


@bp.route('/vendedor', methods=["GET", "POST"])
@login_required
def vendedor():
    return render_template("simulador_afh.html")