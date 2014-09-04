from functools import wraps
from flask import request, Response

ALLOWED_EXTENSIONS = set(['png','jpg','jpeg','gif'])


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


# @auth.verify_password
# def verify_password(username, entered_pw):
#     bp()
#     # Check that user exists in db
#     user = mongo.db.users.find_one({'_id': username})
#     if not user:
#         print "Failed authentication: user %s does not exist in db" % username
#         return False

#     # Compare entered hash to users pw_hash
#     user_pw_hash = user['pw_hash']
#     if not pwd_context.verify(entered_pw, user_pw_hash):
#         print '''Problem with authentication. Entered password hash does
#     not match the one on db'''
#         return False

#     g.user = user
#     return True
