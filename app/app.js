angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'HomeController',
      // resolve: {
      //   currentAuth: function(Auth) {
      //     return Auth.$waitForSignIn();
      //   }
      // }
    })
    .state('about', {
      url: '/about',
      templateUrl: 'templates/about.html'
    })
    .state('new', {
      url: '/new',
      templateUrl: 'codes/new.html',
      controller: 'CreateController',
      resolve: {
        currentAuth: function(Auth) {
          return Auth.$requireSignIn()
        }
      }
    })
    .state('detail', {
      url: '/:title/:from/to/:to',
      templateUrl: 'code/detail.html',
      controller: 'DetailController'
    })
    .state('signup', {
      url: '/register',
      templateUrl: 'auth/register.html',
      controller: 'LogRegController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'auth/login.html',
      controller: 'LogRegController',
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
