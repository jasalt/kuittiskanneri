"use strict";
angular.module("myApp.stats", ['dataVisualizationDirectives'])
  .controller('StatsController', function ($scope, receiptService) {
    // TODO HACK list gets reversed twice..
    var receipts = receiptService.getCachedReceipts().reverse();

    $scope.histogramData = data_to_histogram(receipts);
    $scope.areaDiagramData = data_to_areaDiagram(receipts);

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

    function data_to_areaDiagram(user_receipts){
      var entries = [];
      var cumulativeSum = 0;

      user_receipts.forEach(function(entry) {
        if (entry.total_sum !== 0){
          cumulativeSum += entry.total_sum;
          var newEntry = {'time': entry.date,
                          'count': cumulativeSum};
          entries.push(newEntry);
        }
      });

      return {'entries': entries};
    }
  });
