from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/solve', methods=['POST'])
def solve():
    data = request.get_json()
    green = data.get('green', [])  # list of strings
    yellow = data.get('yellow', [])  # list of strings
    gray = data.get('gray', [])  # list of strings

    # Build command
    cmd = ['./app']
    for g in green:
        cmd += ['--green', g]
    for y in yellow:
        cmd += ['--yellow', y]
    for gr in gray:
        cmd += ['--gray', gr]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        words = result.stdout.strip().split('\n') if result.stdout.strip() else []
        return jsonify({'solutions': words})
    except subprocess.CalledProcessError as e:
        return jsonify({'error': e.stderr or str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 