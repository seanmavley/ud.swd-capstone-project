angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'HomeController',
      // resolve: {
      //   currentAuth: function(Auth) {
      //     return Auth.$getAuth();
      //   }
      // }
    })
    .state('emailVerify', {
      url: '/verify-email?mode&oobCode',
      templateUrl: 'templates/verify-email.html',
      controller: 'emailVerifyController',
      resolve: {
        currentAuth: function(Auth) {
          return Auth.$requireSignIn()
        }
      }
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
      url: '/codes/:codeId',
      templateUrl: 'codes/detail.html',
      controller: 'DetailController'
    })
    .state('detailFromTo', {
      url: '/:title/:from/to/:to',
      templateUrl: 'codes/detailfromto.html',
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
