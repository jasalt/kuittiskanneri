# -*- coding: utf-8 -*-

'''
Autocomplete utilities and endpoints.
User's added products and shops are used for autocompleting text input.
Some scraped product names are also included.
'''
import json
import os
import codecs
from flask import Blueprint, request
from utils import jsonify
from app import mongo


mod = Blueprint('autocomplete', __name__)

GLOBAL_AC_LIST = []


def load_autocomplete_files():
    ''' Load scraped product lists to memory '''
    with codecs.open('data/xtra.txt', 'r', encoding='utf8') as f:
        lines = f.readlines()
        f.close()
        GLOBAL_AC_LIST.extend(lines)

    with codecs.open('data/rainbow.txt', 'r', encoding='utf8') as f:
        lines = f.readlines()
        f.close()
        GLOBAL_AC_LIST.extend(lines)

load_autocomplete_files()


@mod.route('/api/autocomplete', methods=['GET'])
def ac_get():
    '''Return autocomplete word list for logged in user.'''
    users = mongo.db.users
    user = users.find_one(
        {"_id": request.authorization['username']})
    # TODO use dict, array dumps not probably secure
    ac_list = {}
    try:
        user_products_ac = user['products'] + GLOBAL_AC_LIST
    except:
        print "User does not have any products for ac"
        user_products_ac = GLOBAL_AC_LIST

    try:
        user_shops_ac = user['shops']
    except:
        print "User does not have any shops for ac"
        user_shops_ac = []

    return json.dumps({'products': user_products_ac, 'shops': user_shops_ac})


def ac_add_new_words(receipt):
    '''Add new receipt's products and shop name user's ac-list'''
    users = mongo.db.users
    user = users.find_one(
        {"_id": request.authorization['username']})

    # Check for new products
    try:
        user_products = user['products']
    except:
        print "User does not yet have any products"
        user_products = []

    for product in receipt['products']:
        name = product['name']
        if name not in user_products and name not in GLOBAL_AC_LIST:
            user_products.append(product['name'])

    # Append new products to database
    query = users.update({"_id": request.authorization['username']},
                         {'$set': {'products':
                                   user_products}})

    #  Check if the shop name is new
    try:
        user_shops = user['shops']
        if user_shops is None:
            user_shops = []
    except:
        print "User does not yet have any shops"
        user_shops = []

    receipt_shop = receipt['shop_name']
    if receipt_shop not in user_shops:
        print "Add new shop " + receipt_shop
        user_shops.append(receipt_shop)
        query = users.update({"_id": request.authorization['username']},
                             {'$set': {'shops':
                                       user_shops}})
    return query
