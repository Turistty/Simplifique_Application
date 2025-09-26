from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from Modules.Auth import auth_bp
load_dotenv()


app = Flask(__name__)
CORS(app, resources = {r"/api/*": {"origins":"*"}})

app.config.update(
    JWT_SECRET=os.environ.get("JWT_SECRET","dev-change-me"),
    JWT_ISSUER=os.environ.get("JWT_ISSUER","simplifique-task"),
    JWT_AUDIENCE=os.environ.get("JWT_AUDIENCE","simplifique-next"),
    JWT_EXPIRES_IN_MIN=int(os.environ.get(" JWT_EXPIRES_IN_MIN","60")),
    
)

app.register_blueprint(auth_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
