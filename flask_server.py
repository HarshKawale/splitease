"""
flask_server.py - Serve the SplitEase frontend
Run:  python flask_server.py
"""

from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='v1', static_url_path='')

@app.route('/')
def index():
    return send_from_directory('v1', 'home.html')

@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('v1', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
