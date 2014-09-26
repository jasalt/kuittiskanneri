from flask import Blueprint, request, abort
from flask.ext.pymongo import ObjectId

from app import mongo
from authentication import requires_auth
from autocomplete import ac_add_user_products
from utils import jsonify

'''
Operations on receipts.
'''

mod = Blueprint('receipts', __name__)


# Actions for element
@mod.route('/api/receipts/<id>',
           methods=['GET', 'PUT', 'DELETE'])
@requires_auth
def receipt(id):
    receipts = mongo.db.receipts
    if request.method == 'GET':
        '''Get receipt specified by ID'''  # TODO
        return {'id': id, 'data': 'GET mocked'}

    if request.method == 'PUT':
        '''Update receipt data'''
        receipt = request.get_json()
        receipt['_id'] = ObjectId(receipt['_id'])
        query = receipts.save(receipt)
        # TODO A save receipt product names to autocomplete database
        ac_add_user_products(receipt)
        # add if not exists

        return jsonify(receipt)

    if request.method == 'DELETE':
        '''Delete receipt'''
        # TODO: other users receipts can now be removed by ID
        try:
            query = receipts.remove(ObjectId(id))
            if query[u'n'] is 0:
                abort(404, "Problem with Mongo remove function")
        except:
            abort(404)
        return jsonify({"query": str(query)}), 200


# Actions for collection
@mod.route('/api/receipts', methods=['GET', 'POST', 'DELETE'])
@requires_auth
def get_receipts():
    receipts = mongo.db.receipts
    if request.method == 'POST':
        '''Create new receipt'''
        receipt = request.json
        receipt['user'] = request.authorization['username']
        # TODO Validate input, add date if missing etc
        db_operation = receipts.insert(receipt)
        ac_add_user_products(receipt)
        return jsonify({'savedReceipt': receipt, 'dbOperation': db_operation})
# 201 Created
# 403 Forbidden
    if request.method == 'GET':
        ''' List all receipts for request user.
        Pagination is set by limit and offset variables.
        '''
        limit = request.args.get('limit') or 1000
        offset = request.args.get('offset') or 0
        receipts = mongo.db.receipts
        user_receipts_cursor = receipts.find(
            {"user": request.authorization['username']})
        user_receipts = []
        for receipt in user_receipts_cursor:
            user_receipts.append(receipt)
        return jsonify({'receipts':
                        user_receipts[offset:offset+limit],
                        'pagination': {
                            'total': len(user_receipts),
                            'from': offset,
                            'to': offset + limit}})
