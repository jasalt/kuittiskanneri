import os
from flask import Blueprint, send_from_directory

'''
Serve static for development.
TODO: serve static files from real webserver
'''


mod = Blueprint('serve_static', __name__)

from app import app


@mod.route('/test2')
def show():
    return "Helloworld"


STATIC_FOLDER = app.static_folder


@mod.route('/')
def web_app():
    print("Serve static app")

    return send_from_directory(STATIC_FOLDER, 'index.html')


@mod.route('js/<path:filename>')
def web_static_js(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'js/'), filename)


@mod.route('css/<path:filename>')
def web_static_css(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'css'), filename)


@mod.route('fonts/<path:filename>')
def web_static_fonts(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'fonts'), filename)


@mod.route('img/<path:filename>')
def web_static_img(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'img'), filename)


@mod.route('partials/<path:filename>')
def web_static_partials(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'partials'),
                               filename)


# @mod.route('static/<path:filename>')
# def web_static(filename):
#     return send_from_directory(os.path.jount(STATIC_FOLDER, filename))
