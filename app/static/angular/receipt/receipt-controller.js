angular.module('myApp.receipt', ['myApp.services'])

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
