// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
        $routeProvider.when('/receipt', {templateUrl: 'partials/receipt.html', controller: 'ReceiptCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
    }]);
