import os
from flask import Blueprint, send_from_directory

'''
Serve static for development.
TODO: serve static files from real webserver
'''


mod = Blueprint('serve_static', __name__)

from app import app


@mod.route('/')
def root():
    return app.send_static_file('index.html')


@app.route('/<path:path>')
def static_proxy(path):
    # send_static_file will guess the correct MIME type
    return app.send_static_file(path)
