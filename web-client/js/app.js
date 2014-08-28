var login = angular.module('myLoginCheck',[]).
factory('$logincheck', function(){
  return function(userid){
  //Perform logical user loging check either by looking at cookies or make a call to server
  if(userid > 0) return true; //TODO
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
        console.log("User logged in: ", $logincheck(5));
    });
