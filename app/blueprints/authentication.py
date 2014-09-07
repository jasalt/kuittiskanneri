from flask import Blueprint, g, Response, request, url_for, abort
from passlib.apps import custom_app_context as pwd_context
from functools import wraps
from tools import jsonify  # jsonify with Mongo BSON support
import arrow

from app import mongo

'''
Authentication utilities and endpoints.
'''
authentication = Blueprint('authentication', __name__)


# Authentication functions
def check_auth(username, password):
    """This function is called to check if a username /
    password combination is valid.
    TODO check for both hash and pw.
    """
    user = mongo.db.users.find_one({'_id': username})
    if not user:
        print "Failed authentication: user %s does not exist in db" % username
        return False
    user_pw_hash = user['pw_hash']

    # Check if comparing just hash
    if "rounds" in password and password == user_pw_hash:
        print "Hash match"
        g.user = user
        return True
    # Compare entered password to users pw_hash
    if not pwd_context.verify(password, user_pw_hash):
        print '''Problem with authentication. Entered password hash does
    not match the one on db'''
        return False
    print "PW match"
    g.user = user
    return True


def authenticate():
    """Sends a 401 response that enables basic auth"""
    return Response(
        'Could not verify your access level for that URL.\n'
        'You have to login with proper credentials', 401,
        {'WWW-Authenticate': 'Basic realm="Login Required"'})


def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            return authenticate()
        return f(*args, **kwargs)
    return decorated


@authentication.route('/api/user/', methods=['GET'])
@requires_auth
def get_user():
    ''' Normal user login by password. '''
    # TODO get user scan history
    receipts = mongo.db.receipts
    user_receipts = []
    db_receipts = receipts.find({"user":
                                 request.authorization['username']})
    for receipt in db_receipts:
        user_receipts.append(receipt)

    g.user['receipts'] = user_receipts
    return jsonify(g.user)


@authentication.route('/api/user/', methods=['POST'])
def create_user():
    ''' Create new user '''
    # Get password from request payload
    username = request.json.get('username')
    password = request.json.get('password')

    if username is None or password is None:
        abort(400)
    # Check that username does not exist in db

    db_query = mongo.db.users.find_one({'_id': username})

    if db_query is not None:
        print "User exists TODO return error object"
        abort(400)  # TODO better error handling

    # Encrypt password with sha256
    pw_hash = pwd_context.encrypt(password)
    # Verify that encrypted pw matches original one
    if not pwd_context.verify(password, pw_hash):
        print "Problem with authentication. Hash not matching pw"
        abort(400)

    register_date_utc = arrow.utcnow().format('DD-MM-YYYY HH:mm:ss ZZ')

    new_user = {'_id': username, 'pw_hash': pw_hash,
                'register_date': register_date_utc}

    # Save user to db
    mongo.db.users.insert(new_user)
    print "Registered new user " + username
    # Redirect to get_user
    return jsonify({'username': username,
                    'pw_hash': pw_hash}), 201, {
                        'Location': url_for('get_user',
                                            id=username,
                                            _external=True)}


@authentication.route('/api/user/<id>', methods=['POST'])
def update_user(id):
    ''' Update user data'''
    # TODO get authenticated user id from request
    return {'id': id, 'username': 'Johnny sudo reboot'}
