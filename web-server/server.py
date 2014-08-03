# -*- coding: utf-8 -*-
import os
import json
import pprint
import subprocess
from flask import Flask, request, redirect, url_for
from flask import send_from_directory
from werkzeug.utils import secure_filename

import autocorrect
import receiptparser

# Store pics temporarily on api server
OCR_SCRIPT = './ocr.sh'
UPLOAD_FOLDER = 'uploads/'
STATIC_FOLDER = '../web-client/'
ALLOWED_EXTENSIONS = set(['png','jpg','jpeg','gif'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
autocorrect.init('wordlist.txt')


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


def optical_character_recognition(imagepath):
    """ Does OCR on an image and returns tuple:
        (raw text, autocorrected text, parsed receipt data) """
    
    # Process image with ImageMagick
    tempimagepath = os.path.join(app.config['UPLOAD_FOLDER'], 'temp.png')
    im_proc = subprocess.Popen(['convert',imagepath,'-resize','600x800',
                                '-blur','2','-lat','8x8-2%',tempimagepath],
                                stdout=subprocess.PIPE)
    im_proc.communicate()

    image_text = ""
    proc = subprocess.Popen([OCR_SCRIPT, tempimagepath],
                            stdout=subprocess.PIPE)
    for line in iter(proc.stdout.readline, ''):
        image_text += line.rstrip() + '\n'

    image_text = image_text.decode('utf-8')

    corrected_text = autocorrect.correct_text_block(image_text)

    if corrected_text is unicode:
        corrected_text = corrected_text.encode('utf-8')

    return (image_text,
            corrected_text,
            receiptparser.parse_receipt(corrected_text))


@app.route('/upload', methods=['GET','POST'])
def upload_file():
    if request.method == 'POST':
        image_file = request.files['file']
        if image_file and allowed_file(image_file.filename):
            filename = secure_filename(image_file.filename)
            print("Save filename " + filename)
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.mkdir(app.config['UPLOAD_FOLDER'])
            imagepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_file.save(imagepath)
            # convert input.jpg -resize 600x800 -blur 2 -lat 8x8-2% out.jpg

            return json.dumps(optical_character_recognition(imagepath)[2])
            #return redirect(url_for('uploaded_file',
            #                        filename=filename))
    # GET
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form action="" method=post enctype=multipart/form-data>
    <p><input type=file name=file>
    <input type=submit value=Upload>
    </form>
    '''

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'],
                                filename)

@app.route('/ocr/<filename>')
def ocr_testing(filename):
    if allowed_file(filename):
        imagepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(imagepath):
            (_, corrected_text, parse_result) =\
                optical_character_recognition(imagepath)

            return '''
            <!doctype html>
            <pre>%s</pre>
            <hr>
            <pre>%s</pre>
            <hr>
            <pre>%s</pre>
            ''' % (corrected_text,
                   pprint.pformat(parse_result),
                   json.dumps(parse_result))

    return '''
    <!doctype html>
    <p>Error occurred or image not found.</p>
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
    print("static app")
    return send_from_directory(STATIC_FOLDER, 'index.html')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8002, debug=True)

