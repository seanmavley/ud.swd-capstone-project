angular.module('codeSide', ['ui.router', 'firebase'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'HomeController',
      resolve: {
        currentAuth: function(Auth) {
          return Auth.$waitForSignIn();
        }
      }
    })
    .state('signup', {
      url: '/register',
      templateUrl: 'auth/register.html',
      controller: 'RegisterController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'auth/login.html',
      controller: 'LoginController',
      params: {
        message: null
      }
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'admin/admin.html',
      controller: 'AdminController',
      resolve: {
        currentAuth: function(Auth) {
          return Auth.$requireSignIn()
        }
      }
    })

  $urlRouterProvider.otherwise('/');
})

.run(function($rootScope, $state, Auth) {
  $rootScope.$on("$stateChangeError", function(even, toState, toParams, fromState, fromParams, error) {
    if (error === "AUTH_REQUIRED") {
      $state.go('login');
    }
  })
})
