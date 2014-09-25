import os
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from utils import jsonify

'''
Handle uploads and do OCR on image files.
'''

mod = Blueprint('mock_uploads', __name__)

from app import app
from authentication import requires_auth


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in app.config['ALLOWED_FILES']


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

        ocr_readings = dict({'credit_card': True, 'total_sum': 4.68,
                             'shop_name': "Mock Market", 'products':
                             [{'price': 1.59, 'name': 'Elonen ruisevas 540g'},
                              {'price': 0.75, 'name': 'Pirkka hanaani'},
                              {'price': 1.59, 'name': 'Elonen ruisevas 540g'},
                              {'price': 0.75, 'name': 'Pirkka hanaani'}],
                             'date': 2014-10-12})

        # TODO create a new receipt object to db and return it
        return jsonify(ocr_readings)
