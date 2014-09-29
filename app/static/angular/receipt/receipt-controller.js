"use strict";
angular.module('myApp.receipt', ['myApp.userAuthentication', 'myApp.receiptService', 'autocomplete'])
  .controller('ReceiptController', function($scope, $location, $filter, receiptService, userService, autocompleteService) {
    autocompleteService.getAutocompleteList().then(
      function(resp) {
        $scope.autocompleteList = resp.data;
      }
    );
    var origReceipt = receiptService.getReceipt();

    $scope.editingReceipt = true;
    if (origReceipt){
      if ("_id" in origReceipt){
        // The receipt is new so start editing.
        console.log("Editing a stored receipt");
        console.log(origReceipt._id);
        $scope.editingReceipt = false;
      }
      //console.log("Editing unsaved receipt");
    } else {
      console.log("Creating a new receipt");
      var origReceipt = { "products": [{}],
                          credit_card: false,
                          total_sum: null,
                          shop_name: null,
                          user: userService.getUsername(),
                          date: Date.now()  // Epoch time
                        };
    }

    $scope.receipt = _.clone(origReceipt);

    $scope.receipt.date = $filter('date')($scope.receipt.date, 'yyyy-MM-dd');  // epoch -> "2014-09-26"

    $scope.addProductField = function() {
      $scope.receipt.products.push({});

    };

    $scope.removeProductField = function(product) {
      $scope.receipt.products = _.without($scope.receipt.products, product);
    };

    $scope.changePaymentType = function() {
      $scope.receipt.credit_card = !$scope.receipt.credit_card;
    };

    $scope.saveReceipt = function() {
      // TODO validate input
      // Delete empty
      // Calculate sum

      // Check for missing receipts
      
     

      
      // Check for empty product name-fields
      $scope.receipt.products.forEach(function(product) {
        if (!product.name) {
          if (!product.price){
            // Remove empty product-fields
            $scope.receipt.products = _.without($scope.receipt.products, product);
          } else {
            alert("Fill blank product names!");
            return;
          }
        }
      });

      if ($scope.receipt.products.length === 0){
        alert("Please add some products before saving.");
        $scope.receipt.products.push({});
        return;
      }

      // Check for shop name
      if (!$scope.receipt.shop_name) {
        $scope.receipt.shop_name = "Default";
      }

      $scope.receipt.date = Date.parse($scope.receipt.date);  // 2014-09-26 -> epoch

      receiptService.saveReceipt($scope.receipt).success(function() {
        console.log("Save success.");
        $location.path('/home');
      });
    };

    $scope.editReceipt = function() {
      $scope.editingReceipt = !$scope.editingReceipt;
    };

    /*
     * Calculates sum from current receipt product prices
     */
    var calculateSum = function(receipt) {
      // loop all prices
      // set total_sum
      var newSum = 0;
      receipt.products.forEach(function(entry) {
        // Skip empty fields
        if (!isNaN(entry.price)){
          newSum += entry.price;
        }
      });
      $scope.receipt.total_sum = Math.round(newSum * 100) / 100;
    };

    $scope.$watch('receipt', function(newValue, oldValue) {
      console.log("changed receipt");
      calculateSum($scope.receipt);
    }, true);

    $scope.discardReceipt = receiptService.discardReceipt;
    calculateSum($scope.receipt);
  });
