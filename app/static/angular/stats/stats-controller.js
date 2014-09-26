"use strict";
angular.module("myApp.stats", [])
    .controller('StatsController', function ($scope, receiptService) {
        // TODO Force dates on data
        // TODO Force prices on products/totalsum
        // TODO convert data to epoch
        $scope.mockData = {
            //_type: "date_histogram",
            // Entries are in epoch time.
            entries : [{
                time : 1411672514000,
                count : 9
            }, {
                time : 1411672514000,
                count : 32
            }, {
                time : 1411672514000,
                count : 78
            }]
        };
    })

    ;
