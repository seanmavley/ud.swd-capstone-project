angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror', 'ngProgress', 'ui.router.title', 'ngMeta'])

.config(['$stateProvider', '$urlRouterProvider', 'ngMetaProvider', function($stateProvider, $urlRouterProvider, ngMetaProvider) {
  ngMetaProvider.useTitleSuffix(true);
  ngMetaProvider.setDefaultTitleSuffix(' :: CodeBySide');
  ngMetaProvider.setDefaultTag('author', 'Rexford Nkansah <hello@khophi.co>');

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'home/home.html',
      controller: 'HomeController',
      meta: {
        title: 'Homepage'
      },
    })
    .state('emailVerify', {
      url: '/verify-email?mode&oobCode',
      templateUrl: 'auth/verify-email.html',
      controller: 'emailVerifyController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
      },
      meta: {
        title: 'Verify Email',
        description: 'Email Verification'
      }
    })
    .state('about', {
      url: '/about',
      templateUrl: 'templates/about.html',
      meta: {
        title: 'About',
        description: 'CodeBySide, a simple and fast way to compare code, side by side.' +
        ' Find out what CodeBySide is all about'
      }
    })    
    .state('tos', {
      url: '/tos-privacy',
      templateUrl: 'templates/privacy-terms.html',
      meta: {
        title: 'ToS and Privacy Policy'
      }
    })
    .state('new', {
      url: '/new',
      templateUrl: 'codes/new.html',
      controller: 'CreateController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
      },
      meta: {
        title: 'Create new'
      }
    })
    .state('detail', {
      url: '/codes/:codeId',
      templateUrl: 'codes/detail.html',
      controller: 'DetailController',
      meta: {
        title: 'Code Detail',
        description: 'Code Description'
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
      meta: {
        title: 'Sign up'
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
      meta: {
        title: 'Login'
      }
    })
    .state('admin', {
      url: '/admin',
      templateUrl: 'admin/admin.html',
      controller: 'AdminController',
      resolve: {
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
      },
      meta: {
        title: 'Admin',
        restricted: true
      }
    })

  $urlRouterProvider.otherwise('/');
}])

.run(['$rootScope', '$state', '$location', 'Auth', 'ngProgressFactory', 'ngMeta',
  function($rootScope, $state, $location, Auth, ngProgressFactory, ngMeta) {
    ngMeta.init();
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
      // $rootScope.title = $state.current.data.title;
      // $rootScope.description = $state.current.data.description || '';
      progress.complete();
    });
  }
])
