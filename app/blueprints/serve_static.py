import os
from flask import Blueprint, send_from_directory

'''
Serve static for development.
TODO: serve static files from real webserver
'''


serve_static = Blueprint('serve_static', __name__)

from app import app


@serve_static.route('/test2')
def show():
    return "Helloworld"


STATIC_FOLDER = app.static_folder


@serve_static.route('/')
def web_app():
    print("Serve static app")
    
    return send_from_directory(STATIC_FOLDER, 'index.html')


@serve_static.route('js/<path:filename>')
def web_static_js(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'js/'), filename)


@serve_static.route('css/<path:filename>')
def web_static_css(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'css'), filename)


@serve_static.route('fonts/<path:filename>')
def web_static_fonts(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'fonts'), filename)


@serve_static.route('img/<path:filename>')
def web_static_img(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'img'), filename)


@serve_static.route('partials/<path:filename>')
def web_static_partials(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'partials'),
                               filename)


# @serve_static.route('static/<path:filename>')
# def web_static(filename):
#     return send_from_directory(os.path.jount(STATIC_FOLDER, filename))


