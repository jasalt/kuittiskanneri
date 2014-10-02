"use strict";
angular.module("myApp.stats", ['dataVisualizationDirectives'])
  .controller('StatsController', function ($scope, receiptService) {
    /*
     * Convert application receipt data quickly for use in 3rd party
     * visualization plugin api's.
     * Used plugins taken from https://github.com/fullscale/dangle
     */

    // TODO HACK list gets reversed twice..
    var receipts = _.clone(receiptService.getCachedReceipts()).reverse();

    $scope.histogramData = data_to_histogram(receipts);
    $scope.areaDiagramData = data_to_areaDiagram(receipts);
    $scope.donutDiagramData = data_to_donutDiagram(receipts);

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

    function data_to_donutDiagram(user_receipts){
      var shops = [];

      user_receipts.forEach(function(entry) {
        var shop_name = entry.shop_name;

        // Check if it exists
        var found = false;
        for(var i = 0; i < shops.length; i++) {
          if (shops[i].term == shop_name) {
            // increment if does
            shops[i].count++;
            found = true;
          }
        }
        // otherwise add as first
        if (!found){
          shops.push({term: shop_name, count:1});
          found = false;
        }
      });

      var requiredDataModel = {
        _type : "terms",
        terms : shops
      };
      return requiredDataModel;
    }
  });
