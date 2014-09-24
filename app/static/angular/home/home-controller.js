angular.module('myApp.home', ['myApp.userAuthentication', 'myApp.receiptService', 'myApp.receipt'])

//TODO 'HomeCtrl' -> 'HomeController'
    .controller('HomeController', function($scope, receiptService, userService, $location) {
        $scope.loading = true;

        $scope.currentPage = 0;
        $scope.pageSize = 10;

        console.log("Getting receipts for " + userService.getUsername());
        receiptService.getUserReceipts().then(function(result) {
            $scope.loading = false;
            var receipts = result.data.receipts;
            if (receipts.length == 0){
                return;
            }
            else {
                $scope.receipts = receipts;

                $scope.numberOfPages = function(){
                    return Math.ceil($scope.receipts.length/$scope.pageSize);
                };
            }
        });


        /*
         * When selecting a receipt from history, set it as current and redirect to receipt view
         */
        $scope.selectReceipt = function(receipt) {
            receiptService.setReceipt(receipt);
            $location.path('/receipt');
        };

        $scope.deleteReceipt = function(receiptid) {
            receiptService.deleteReceipt(receiptid).success(function(result) {
                // After successful delete, remove from scope also
                $scope.receipts = _.without($scope.receipts, _.findWhere(
                    $scope.receipts, {'_id': receiptid}));
            });
        };
    })

    .filter('startFrom', function() {
        return function(input, start) {
            start = +start; //parse to int
            return input.slice(start);
        };
    });
