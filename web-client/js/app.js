var login = angular.module('myLoginCheck', []).
        factory('$logincheck', function($cookies){
            return function(){
                //Perform logical user loging check by looking at cookies
                var user = $cookies.currentUser;
                console.log("logged user:" + user);
                if(user) return true; //TODO
                return false;
            };
        });


// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'ngRoute',
    'ngCookies',
    'myApp.filters',
    'myApp.services',
    'myApp.directives',
    'myApp.controllers',
    'myLoginCheck'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/', {templateUrl: 'partials/index.html', controller: 'IndexCtrl'});
        $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterCtrl'});
        $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
        $routeProvider.when('/upload', {templateUrl: 'partials/upload.html', controller: 'UploadCtrl'});
        $routeProvider.when('/receipt', {templateUrl: 'partials/receipt.html', controller: 'ReceiptCtrl'});
        $routeProvider.when('/about', {templateUrl: 'partials/about.html', controller: 'AboutCtrl'});
        $routeProvider.otherwise({redirectTo: '/'});
    }])
    .run(function($logincheck, $location) {

        if( $logincheck())
        {
            console.log("User logged in, redirecting to home");
            $location.path('/home');
        }
        else
        {
            console.log("User not logged in, redirecting to index");
            $location.path('/');
        }
    });
