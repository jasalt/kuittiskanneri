angular.module('myApp.receipt', ['myApp.userAuthentication'])
    .controller('ReceiptController', function($scope, $location, receiptService) {
        // TODO DEV MOCk get the real receipt
        $scope.origReceipt = receiptService.getReceipt();
        if ("_id" in $scope.origReceipt){
            // The receipt is new so start editing.
            console.log("receipt has id");
            console.log($scope.origReceipt['_id']);
            $scope.editingReceipt = false;
        } else {
            console.log("receipt has not id ");
            $scope.editingReceipt = true;
        }
        $scope.receipt = $scope.origReceipt;

        $scope.changePaymentType = function() {
            $scope.receipt.credit_card = !$scope.receipt.credit_card;
        };

        $scope.saveReceipt = function() {
            receiptService.saveReceipt($scope.receipt).success(function() {
                console.log("Save success.");
                $location.path('/home');
            });
        };

        $scope.editReceipt = function() {
            $scope.editingReceipt = !$scope.editingReceipt;
        };

        $scope.discardReceipt = receiptService.discardReceipt;
    })
    .service('receiptService', function($http, $location) {
        /*
         * Provide receipt data between different controllers.
         */
        var receipt = null;

        var userReceipts = null;

        // this.receipt = this.mockReceipt;
        this.getReceipt = function() {
            // get current receipt or one specified by id
            return receipt;
        };

        this.getMockReceipt = function() {
            var mockReceipt = {"date":{"Y":2011,"h":21,"M":5,"m":1,"D":20},"total_sum":null,"credit_card":false,"products":[{"price":4.4,"name":"sanimiiaaapanna 1kg","$$hashKey":"012"},{"price":1.511,"name":"valio rasvaton nam 1,51","$$hashKey":"013"},{"price":1.59,"name":"elonen misevas 540g 9101","$$hashKey":"014"},{"price":0.75,"name":"pirkka banaani","$$hashKey":"015"},{"price":0.79,"name":"es mrnikalahim 105/1409 velie","$$hashKey":"016"},{"price":1.111,"name":"piri/ka naksanakkara 3009","$$hashKey":"017"},{"price":10,"name":"vhieevsli","$$hashKey":"018"},{"price":4.4,"name":"sanimiiaaapanna 1kg","$$hashKey":"019"},{"price":1.511,"name":"valio rasvaton nam 1,51","$$hashKey":"01A"},{"price":1.59,"name":"elonen misevas 540g 9101","$$hashKey":"01B"},{"price":0.75,"name":"pirkka banaani","$$hashKey":"01C"},{"price":0.79,"name":"es mrnikalahim 105/1409 velie","$$hashKey":"01D"},{"price":1.111,"name":"piri/ka naksanakkara 3009","$$hashKey":"01E"},{"price":10,"name":"vhieevsli","$$hashKey":"01F"}],"shop_name":"1101101100001 1011311101"};

            // get current receipt or one specified by id
            return mockReceipt;
        };

        this.setReceipt = function(rcpt) {
            receipt = rcpt;
            //    $location.path('/receipt');
        };

        this.setUserReceipts = function(receipts) {
            userReceipts = receipts;
            //    $location.path('/receipt');
        };

        this.getUserReceipts = function() {
            var promise = $http({method: 'GET', url: '/api/receipts'}).
                    success(function(data, status, headers, config) {
                        console.log("User receipts loaded");
                    }).
                    error(function(data, status, headers, config) {
                        console.log("Something wrong with getting user receipts..");
                    });
            return promise;
        };


        this.discardReceipt = function(rcpt) {
            receipt = null;
            $location.path('/home');
        };

        this.deleteReceipt = function(receiptid) {
            var promise = $http({method: 'DELETE',
                                 url: '/api/receipts/' + receiptid});
            return promise;
        };

        /*
         * Posts a new receipt or updates an existing
         */
        this.saveReceipt = function(receipt) {
            var methodForRequest = "POST";
            var url = '/api/receipts';

            // TODO if has id, then UPDATE
            if ("_id" in receipt) {
                methodForRequest = "UPDATE";
                url = '/api/receipts/' + receipt['_id'];
            }

            var promise = $http({method: methodForRequest, url: url,
                                 data: receipt})
                    .error(function(data, status, headers, config) {
                        console.log("Something wrong with saving receipt.. duplicate maybe?");
                    });
            return promise;
        };
    });
