angular.module('codeSide', ['ui.router', 'firebase'])
  
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html'
      })
      .state('signup', {
        url: '/register',
        templateUrl: 'auth/register.html',
        controller: 'RegisterController'
      })      
      .state('login', {
        url: '/login',
        templateUrl: 'auth/login.html',
        controller: 'LoginController'
      })

    $urlRouterProvider.otherwise('/');
  })

  .constant('FirebaseUrl', 'https://khophi-auth.firebaseio.com/')