angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror', 'ngProgress', 'ui.router.title'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'HomeController',
      resolve: {
        $title: function() {
          return 'Homepage';
        }
      }
    })
    .state('emailVerify', {
      url: '/verify-email?mode&oobCode',
      templateUrl: 'auth/verify-email.html',
      controller: 'emailVerifyController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }],
        $title: function() {
          return 'Verify Email';
        }
      }
    })
    .state('about', {
      url: '/about',
      templateUrl: 'templates/about.html',
      resolve: {
        $title: function() {
          return 'About';
        }
      }
    })    
    .state('tos', {
      url: '/tos-privacy',
      templateUrl: 'templates/privacy-terms.html',
      resolve: {
        $title: function() {
          return 'ToS and Privacy Policy';
        }
      }
    })
    .state('new', {
      url: '/new',
      templateUrl: 'codes/new.html',
      controller: 'CreateController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }],
        $title: function() {
          return 'Create New';
        }
      }
    })
    .state('detail', {
      url: '/codes/:codeId',
      templateUrl: 'codes/detail.html',
      controller: 'DetailController',
      resolve: {
        $title: function() {
          return 'Code Detail'
        }
      }
    })
    .state('detailFromTo', {
      url: '/:title/:from/to/:to',
      templateUrl: 'codes/detailfromto.html',
    })
    .state('signup', {
      url: '/register',
      templateUrl: 'auth/register.html',
      controller: 'LogRegController',
      resolve: {
        $title: function() {
          return 'Sign up';
        }
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: 'auth/login.html',
      controller: 'LogRegController',
      params: {
        message: null,
        toWhere: null
      },
      resolve: {
        $title: function() {
          return 'Login';
        }
      }
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'admin/admin.html',
      controller: 'AdminController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }],
        $title: function() {
          return 'Admin';
        }
      },
      restricted: true
    })

  $urlRouterProvider.otherwise('/');
}])

.run(['$rootScope', '$state', '$location', 'Auth', 'ngProgressFactory',
  function($rootScope, $state, $location, Auth, ngProgressFactory) {
    var progress = ngProgressFactory.createInstance();
    var afterLogin;

    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      if (error === "AUTH_REQUIRED") {
        $state.go('login', { toWhere: toState });
        progress.complete();
      }
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      progress.start();
    });

    $rootScope.$on('$stateChangeSuccess', function() {
      progress.complete();
    });
  }
])
