from flask import Blueprint, render_template, current_app, request, jsonify,session,redirect,url_for
from flask_login import login_required
import requests


bp = Blueprint("goliat", __name__, url_prefix="/goliat")


@bp.route('/vendedor', methods=["GET", "POST"])
@login_required
def vendedor():
    return render_template("simulador_afh.html")


@bp.route('/chatbot', methods=["POST"])
@login_required
def chatbot_proxy():
    try:
        # Get the request data from frontend
        chat_data = request.get_json()
        
        # Get API key from server config (not exposed to frontend)
        api_key = current_app.config['ASSISTANT_KEY']
        api_url = "https://ynfdil7dzfxg5dmvwrt6mu5t.agents.do-ai.run/api/v1/chat/completions"
        
        # Make the API call with the key from backend
        response = requests.post(
            api_url,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            },
            json=chat_data,
            timeout=30
        )
        
        # Return the response to frontend
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": "Failed to get response from chatbot"}), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Network error occurred"}), 500
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@bp.route('/consultor-integral')
@login_required

def consultor_integral():
    if session['Username'] == 'edexa':
        return redirect(url_for('index'))
    return render_template("consultor_integral.html")