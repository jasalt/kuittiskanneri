"use strict";
angular.module("myApp.stats", [])
    .controller('StatsController', function ($scope, receiptService) {
      var receipts = receiptService.getCachedReceipts();
      debugger;
      $scope.histogramData = data_to_histogram(receipts);

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
        return {'entries': entries};
      }
    });
