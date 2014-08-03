# -*- coding: utf-8 -*-
import os
import json
#import pprint
#import subprocess
from flask import Flask, request
from flask.ext import restful
from flask.ext.restful import reqparse
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
# reqparse parses/validates input and gives nice error messages
parser = reqparse.RequestParser()
parser.add_argument('id', type=int, help='Resource id')
parser.add_argument('query', type=str, help='Search query')

'''
Define endpoints
TODO: Authentication, functions, basically everything
'''

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


class Receipt(restful.Resource):
    def get(self):
        args = parser.parse_args()
        return {'id': args.id, 'data': 'GET mocked'}

    def post(self, id, data):
        args = parser.parse_args()
        return {'id': args.id, 'data': 'POST mocked'}

    def update(self, id, data):
        args = parser.parse_args()
        return {'id': args.id, 'data': 'UPDATE mocked'}

api.add_resource(Receipt, '/api/receipt')


class Receipts(restful.Resource):
    ''' Querying multiple receipts '''
    def get(self, query):
        args = parser.parse_args()
        return {'query': args.query, 'data': 'GET query ' +
                args.query + ' mocked'}

api.add_resource(Receipts, '/api/receipts')

##TODO ->>
class User(restful.Resource):
    def get(self):
        ''' Return user data '''
        #TODO get authenticated user id from request
        return {'id': '123', 'data': 'GET user mocked'}

    def post(self):
        ''' Create new user '''
        return {'id': '123', 'username': 'Johnny DROP TABLE USERS;'}


    def update(self):
        ''' Update user data'''
        #TODO get authenticated user id from request
        return {'id': '123', 'username': 'Johnny sudo reboot'}


'''
Serve static for development.
TODO: serve static files from real webserver
'''
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


'''Init application'''
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8002, debug=True)
