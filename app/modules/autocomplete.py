'''
Autocomplete utilities and endpoints.

Users added products are added to users the autocomplete-database.

TODO: scrape some general autocomplete-sources

'''

from flask import Blueprint, request
from utils import jsonify
from app import mongo


mod = Blueprint('autocomplete', __name__)


@mod.route('/api/autocomplete', methods=['GET'])
def get_autocomplete_list():
    products = mongo.db.products
    user_products_cursor = products.find(
        {"user": request.authorization['username']})

    user_products = []
    for product in user_products_cursor:
        user_products.append(product)

    return jsonify(user_products)
