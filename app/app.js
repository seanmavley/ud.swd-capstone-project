angular.module('codeSide', ['ui.router'])
  
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('homepage', {
        url: '/',
        templateUrl: 'home/home.html'
      })

    $urlRouterProvider.otherwise('/');
  })
