angular.module('myApp.receipt', ['myApp.userAuthentication', 'myApp.receiptService'])
    .controller('ReceiptController', function($scope, $location, receiptService, userService) {
        $scope.origReceipt = receiptService.getReceipt();

        $scope.editingReceipt = true;

        if ($scope.origReceipt){
            if ("_id" in $scope.origReceipt){
                // The receipt is new so start editing.
                console.log("Editing a stored receipt");
                console.log($scope.origReceipt['_id']);
                $scope.editingReceipt = false;
            }
            console.log("Editing unsaved receipt");
        } else {
            console.log("Creating a new receipt");
            $scope.origReceipt = { "products": [],
                                   credit_card: false,
                                   total_sum: null,
                                   shop_name: null,
                                   user: userService.getUsername(),
                                   date: "today" // TODO set this date
                                   // TODO datepicker
                                 };
        }

        $scope.receipt = $scope.origReceipt;

        $scope.addProductField = function() {
            $scope.receipt["products"].push({});

        };

        $scope.removeProductField = function(product) {
            $scope.receipt["products"] = _.without($scope.receipt.products, product);
        };

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
    });
