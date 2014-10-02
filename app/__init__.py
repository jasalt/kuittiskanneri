# -*- coding: utf-8 -*-
from flask import Flask
from flask.ext.pymongo import PyMongo
from secrets import MONGO_URI

app = Flask(__name__)

# Store pics temporarily on api server
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_FILES'] = ['png', 'jpg', 'jpeg', 'gif']

# Setup MongoDB connection
app.config['MONGO_URI'] = MONGO_URI

mongo = PyMongo(app)

# Load app modules

from modules import serve_static
app.register_blueprint(serve_static.mod, url_prefix='/')

from modules import authentication
app.register_blueprint(authentication.mod)

from modules import uploads
app.register_blueprint(uploads.mod)

from modules import receipts
app.register_blueprint(receipts.mod)

from modules import autocomplete
app.register_blueprint(autocomplete.mod)

# autocorrect.init('wordlist.txt') TODO used somewhere?
