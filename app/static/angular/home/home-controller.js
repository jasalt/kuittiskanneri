angular.module('myApp.home', ['myApp.userAuthentication', 'myApp.receiptService', 'myApp.receipt'])

//TODO 'HomeCtrl' -> 'HomeController'
    .controller('HomeController', function($scope, receiptService, userService, $location) {
        $scope.loading = true;
        console.log("Getting receipts for " + userService.getUsername());
        receiptService.getUserReceipts().then(function(result) {
            $scope.loading = false;
            var receipts = result.data.receipts;
            if (receipts.length == 0){
                return;
            }
            else {
                $scope.receipts = receipts;
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
    });
