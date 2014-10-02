"use strict";
angular.module('myApp.receipt', ['myApp.userAuthentication',
                                 'myApp.receiptService',
                                 'autocomplete'])
  .controller('ReceiptController', function($scope, $location, $filter, receiptService, userService, autocompleteService) {

    autocompleteService.getAutocompleteList().then(
      function(resp) {
        $scope.autocompleteList = resp.data;
      }
    );

    var origReceipt = receiptService.getReceipt();

    if (origReceipt){
      if ("_id" in origReceipt){
        console.log("Viewing a stored receipt");
        console.log(origReceipt._id);
        $scope.editingReceipt = false;
      }
    } else {
      console.log("Creating a new receipt");
      origReceipt = { "products": [{}],
                      credit_card: false,
                      total_sum: null,
                      shop_name: null,
                      user: userService.getUser(),
                      date: Date.now()  // Epoch time
                    };
      $scope.editingReceipt = true;
    }

    // Clone receipt object for view
    $scope.receipt = _.clone(origReceipt);

    // Dates are stored as UNIX Epoch and shown in human readable format
    $scope.receipt.date = $filter('date')($scope.receipt.date, 'yyyy-MM-dd');  // epoch -> "2014-09-26"




    $scope.addProductField = function() {
      $scope.receipt.products.push({});

    };

    $scope.removeProductField = function(product) {
      $scope.receipt.products = _.without($scope.receipt.products, product);
    };

    $scope.saveReceipt = function() {
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

      // Check for empty receipt
      if ($scope.receipt.products.length === 0){
        alert("Please add some products before saving.");
        $scope.receipt.products.push({});
        return;
      }

      // Check for shop name, enter "Default" if it's missing.
      if (!$scope.receipt.shop_name) {
        $scope.receipt.shop_name = "Default";
      }

      $scope.receipt.date = Date.parse($scope.receipt.date);  // 2014-09-26 -> epoch

      // Push to API, route to /home after
      receiptService.saveReceipt($scope.receipt).success(function() {
        console.log("Save success.");
        $location.path('/home');
      });
    };

    // Switch between edit and view modes.
    $scope.editReceipt = function() {
      $scope.editingReceipt = !$scope.editingReceipt;
    };

    $scope.discardReceipt = receiptService.discardReceipt;

    /*
     * Calculates sum from current receipt product prices
     */
    var calculateSum = function(receipt) {
      var newSum = 0;
      receipt.products.forEach(function(entry) {
        // Skip empty fields
        if (!isNaN(entry.price)){
          newSum += entry.price;
        }
      });
      // Round to two decimal values
      $scope.receipt.total_sum = Math.round(newSum * 100) / 100;
    };

    // Update sum on product list change
    $scope.$watch('receipt.products', function() {
      calculateSum($scope.receipt);
    }, true);

    // Calculate sum initally
    calculateSum($scope.receipt);
  });
