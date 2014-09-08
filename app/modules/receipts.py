import json
from flask import Blueprint, request
from flask.ext.pymongo import ObjectId

from app import mongo
from authentication import requires_auth
from utils import jsonify

'''
Operations on receipts.
'''

mod = Blueprint('receipts', __name__)

receipts = mongo.db.receipts


@mod.route('/api/receipts/', methods=['GET', 'POST', 'UPDATE', 'DELETE'])
@requires_auth
def receipt():
    if request.method == 'GET':
        '''Get receipt specified by ID'''  # TODO
        return {'id': id, 'data': 'GET mocked'}

    if request.method == 'POST':
        '''Create new receipt'''
        receipt = request.json
        receipt['user'] = request.authorization['username']
        # Saving receipt adds MongoDB ObjectId to it
        receipts.insert(receipt)
        return jsonify({'savedReceipt': receipt})

    if request.method == 'UPDATE':
        '''Update receipt data'''
        # TODO HACK why not json? There's something weird going on.
        receipt = json.loads(request.data)
        receipts.save(receipt)
        return jsonify(receipt)

    if request.method == 'DELETE':
        '''Delete receipt'''
        receiptid = request.data
        query = receipts.remove({'_id': ObjectId(receiptid)})
        return jsonify({"query": query})


@mod.route('/api/receipts', methods=['GET'])
def get_receipts():
    ''' Querying multiple receipts '''
    query = request.args.get('q')
    found_receipts = receipts.find(query)
    # TODO better response
    return {'query': query, 'data': found_receipts}
