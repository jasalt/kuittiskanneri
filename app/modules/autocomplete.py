'''
Autocomplete utilities and endpoints.

Users added products are added to users the autocomplete-database.

TODO: scrape some general autocomplete-sources

'''
import json
import os
from flask import Blueprint, request
from utils import jsonify
from app import mongo


mod = Blueprint('autocomplete', __name__)

GLOBAL_AC_LIST = []


def load_autocomplete_files():
    ''' Load scraped product lists to memory '''
    f = open('data/xtra.txt')
    lines = f.readlines()
    f.close()
    GLOBAL_AC_LIST.extend(lines)

    f = open('data/rainbow.txt')
    lines = f.readlines()
    f.close()
    GLOBAL_AC_LIST.extend(lines)


load_autocomplete_files()


@mod.route('/api/autocomplete', methods=['GET'])
def ac_get():
    users = mongo.db.users
    user = users.find_one(
        {"_id": request.authorization['username']})
    # TODO use dict, array dumps not probably secure
    return json.dumps(user['products'] + GLOBAL_AC_LIST)


def ac_add_user_products(receipt):
    '''Add new products in receipt to user ac-list'''

    users = mongo.db.users

    user = users.find_one(
        {"_id": request.authorization['username']})

    try:
        user_products = user['products']
    except:
        user_products = []

    new_user_products = []

    for product in receipt['products']:
        if product['name'] not in user_products:
            new_user_products.append(product['name'])

    # Append new products to database

    query = users.update({"_id": request.authorization['username']},
                         {'$set': {'products': user_products +
                                   new_user_products}})

    return query
