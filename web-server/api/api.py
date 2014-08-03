# -*- coding: utf-8 -*-
import os
import json
#import pprint
#import subprocess
from flask import Flask, request
from flask.ext import restful
from flask import send_from_directory
from werkzeug.utils import secure_filename

from utils import allowed_file
from ocr import optical_character_recognition

#import autocorrect
#import receiptparser

# Store pics temporarily on api server
OCR_SCRIPT = './ocr.sh'
UPLOAD_FOLDER = 'uploads/'
STATIC_FOLDER = '../../web-client/'
ALLOWED_EXTENSIONS = set(['png','jpg','jpeg','gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
#autocorrect.init('wordlist.txt')

api = restful.Api(app)

class Upload(restful.Resource):
    def get(self):
        return {'hello':'world'}
    # return send_from_directory(app.config['UPLOAD_FOLDER'],
    #                             filename)
    
    def post(self):
        image_file = request.files['file']
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            print("Save filename " + filename)
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.mkdir(app.config['UPLOAD_FOLDER'])
            imagepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(imagepath)
            # TODO:
            # Process image with ImageMagick
            # convert input.jpg -resize 600x800 -blur 2 -lat 8x8-2% out.jpg

            return json.dumps(optical_character_recognition(imagepath)[2])
            #return redirect(url_for('uploaded_file',
            #                        filename=filename))
    
api.add_resource(Upload, '/api/upload')

# TODO: for development. serve static files from real webserver

@app.route('/js/<path:filename>')
def web_static_js(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'js'), filename)

@app.route('/css/<path:filename>')
def web_static_css(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'css'), filename)

@app.route('/fonts/<path:filename>')
def web_static_fonts(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'fonts'), filename)

@app.route('/img/<path:filename>')
def web_static_img(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'img'), filename)

@app.route('/partials/<path:filename>')
def web_static_partials(filename):
    return send_from_directory(os.path.join(STATIC_FOLDER, 'partials'),
        filename)

@app.route('/static/<path:filename>')
def web_static(filename):
    return send_from_directory(STATIC_FOLDER, filename)


@app.route('/')
def web_app():
    print("Return static app")
    return send_from_directory(STATIC_FOLDER, 'index.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8002, debug=True)
