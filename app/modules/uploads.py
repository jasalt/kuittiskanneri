import os
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from utils import jsonify

'''
Handle uploads and do OCR on image files.
'''

mod = Blueprint('uploads', __name__)

from app import app
from authentication import requires_auth
from ocr_utils.ocr import optical_character_recognition


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_FILES']


@mod.route('/api/simple/upload', methods=['POST'])
def simple_upload_receipt():
    ''' Receipt upload handler without DB connection and authentication.'''
    image_file = request.files['file']
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.mkdir(app.config['UPLOAD_FOLDER'])

        imagepath = os.path.join(app.root_path + '/' +
                                 app.config['UPLOAD_FOLDER'], filename)
        image_file.save(imagepath)
        app.logger.debug("Upload OK, saved file " + imagepath)

        uploads_readings = optical_character_recognition(imagepath)[2]
        # TODO create a new receipt object to db and return it
        return jsonify(uploads_readings)


@mod.route('/api/upload', methods=['POST'])
@requires_auth
def upload_receipt():
    ''' Receipt upload handler
    Save image file to folder, process with OCR,
    create receipt to DB and return data to client. '''
    image_file = request.files['file']
    if image_file and allowed_file(image_file.filename):
        filename = secure_filename(image_file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.mkdir(app.config['UPLOAD_FOLDER'])

        imagepath = os.path.join(app.root_path + '/' +
                                 app.config['UPLOAD_FOLDER'], filename)
        image_file.save(imagepath)
        app.logger.debug("Upload OK, saved file " + imagepath)

        ocr_readings = optical_character_recognition(imagepath)[2]
        # TODO create a new receipt object to db and return it
        return jsonify(ocr_readings)
