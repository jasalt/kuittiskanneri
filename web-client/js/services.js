'use strict';

/* Services */

var app = angular.module('myApp.services', []);

app.service('currentReceipt', function() {
    this.receipt = null;
    this.getReceipt = function() {
        return this.receipt;
    };
    this.setReceipt = function(rcpt) {
        this.receipt = rcpt;
    };
});












