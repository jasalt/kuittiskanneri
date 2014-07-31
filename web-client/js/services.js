'use strict';

/* Services */

var app = angular.module('myApp.services', []);

app.service('currentReceipt', function() {
    this.mockReceipt = {"date":{"Y":2014,"h":23,"m":15,"M":7,"D":16},"total_sum":null,"shop_name":"abc heinola","products":[{"price":2.39,"name":"hedelmäpupmijggurtti"},{"price":0.34,"name":"hakarueji"},{"price":7.29,"name":"hyvä suomi arkijuusto"},{"price":2.45,"name":"maksalaatikko"},{"price":2.49,"name":"broileripyörykät"},{"price":0.21,"name":"muovikassi 40l valio"},{"price":5.35,"name":"vmssezsn"}],"credit_card":true};

    this.receipt = this.mockReceipt;
    this.getReceipt = function() {
        return this.receipt;
    };
    this.setReceipt = function(rcpt) {
        this.receipt = rcpt;
    };
});












