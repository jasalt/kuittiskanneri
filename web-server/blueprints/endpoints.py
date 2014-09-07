from flask import Blueprint

endpoints = Blueprint('endpoints', __name__)


@endpoints.route('/test1', defaults={'page': 'index'})
@endpoints.route('/<page>')
def show(page):
    return "Helloworld"
