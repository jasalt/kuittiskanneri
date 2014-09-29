"use strict";

angular.module('myApp.home', ['myApp.userAuthentication', 'myApp.receiptService', 'myApp.receipt', 'datehistogram'])
  .controller('HomeController', function($scope, receiptService, userService, $location) {
    $scope.currentPage = 0;
    $scope.pageSize = 10;

    console.log("Getting receipts for " + userService.getUsername());
    receiptService.getUserReceipts().then(function(result) {
      var receipts = result.data.receipts;
      if (receipts.length === 0){
        return;
      }
      else {
        $scope.receipts = receipts;

        $scope.numberOfPages = function(){
          return Math.ceil($scope.receipts.length/$scope.pageSize);
        };
        data_to_histogram($scope.receipts);
      }
    });

    /*
     * Convert receipt data for histogram
     */
    function data_to_histogram(user_receipts) {
      var entries = [];
      user_receipts.forEach(function(entry) {
        var newEntry = {'time': entry.date,
                        'count': entry.total_sum};
        entries.push(newEntry);
      });
      $scope.histogramData = {'entries': entries};
    }

    /*
     * When selecting a receipt from history, set it as current and redirect to receipt view
     */
    $scope.selectReceipt = function(receipt) {
      receiptService.setReceipt(receipt);
      $location.path('/receipt');
    };

    $scope.deleteReceipt = function(receiptid) {
      receiptService.deleteReceipt(receiptid).success(function() {
        // After successful delete, remove from scope also
        $scope.receipts = _.without($scope.receipts, _.findWhere(
          $scope.receipts, {'_id': receiptid}));
        data_to_histogram($scope.receipts);
      });
    };
  })
  .filter('startFrom', function() {
    /*
     * For home page pagination. Used with builtin LimitTo filter.
     */
    return function(input, start) {
      // HACKFIX missing input
      var input0 = input || "";
      start = +start; //parse to int
      return input0.slice(start);
    };
  });
