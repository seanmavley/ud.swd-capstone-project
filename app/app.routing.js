angular.module('codeSide')
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function($stateProvider, $urlRouterProvider, $locationProvider) {
      $stateProvider
      /* 
        STATIC PAGES ROUTES
      */
        .state('home', {
          url: '/',
          templateUrl: 'components/home/home.html',
          controller: 'HomeController',
          meta: {
            title: 'Homepage',
            description: 'Your Favorite Programming Languages, Side By Side'
          },
        })
        .state('about', {
          url: '/about',
          templateUrl: 'pages/about.html',
          meta: {
            title: 'About',
            description: 'CodeBySide, a simple and fast way to compare code, side by side.' +
              ' Find out what CodeBySide is all about'
          }
        })
        .state('tos', {
          url: '/tos-privacy',
          templateUrl: 'pages/privacy-terms.html',
          meta: {
            title: 'ToS and Privacy Policy'
          }
        })
        /*
          AUTHENTICATION ROUTES
        */
        .state('signup', {
          url: '/register',
          templateUrl: 'components/auth/templates/register.html',
          controller: 'LogRegController',
          meta: {
            title: 'Sign up'
          }
        })
        .state('login', {
          url: '/login',
          templateUrl: 'components/auth/templates/login.html',
          controller: 'LogRegController',
          params: {
            message: null,
            toWhere: null
          },
          meta: {
            title: 'Login'
          }
        })
        .state('emailVerify', {
          url: '/verify-email?mode&oobCode',
          templateUrl: 'components/auth/templates/verify-email.html',
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
        /* 
          CRUD ROUTES
        */
        .state('all', {
          url: '/all',
          templateUrl: 'components/codes/templates/all.html',
          controller: 'AllController',
          meta: {
            title: 'View all snippets'
          }
        })
        .state('new', {
          url: '/new',
          templateUrl: 'components/codes/templates/new.html',
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
          templateUrl: 'components/codes/templates/detail.html',
          controller: 'DetailController',
          meta: {
            title: 'Code Detail',
            description: 'Code Description'
          }
        })
        .state('delete', {
          url: '/delete/:codeId',
          templateUrl: 'components/codes/templates/delete.html',
          controller: 'DeleteController',
          resolve: {
            currentAuth: ['Auth', function(Auth) {
              return Auth.$requireSignIn()
            }]
          },
          meta: {
            title: 'Code Detail',
            description: 'Code Description'
          }
        })
        /* 
          ADMINISTRATION
        */
        .state('admin', {
          url: '/admin',
          templateUrl: 'components/admin/admin.html',
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
      $locationProvider.html5Mode(true);
    }
  ])
