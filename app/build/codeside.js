angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror', 'ngProgress', 'ui.router.title'])

.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {
    // ngMetaProvider.useTitleSuffix(true);
    // ngMetaProvider.setDefaultTitleSuffix(' :: CodeBySide');
    // ngMetaProvider.setDefaultTag('author', 'Rexford Nkansah <hello@khophi.co>');

    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
        controller: 'HomeController',
        meta: {
          title: 'Homepage',
          description: 'Your Favorite Programming Languages, Side By Side'
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
    $locationProvider.html5Mode(true);
  }
])

.run(['$rootScope', '$state', '$location', 'Auth', 'ngProgressFactory',
  function($rootScope, $state, $location, Auth, ngProgressFactory) {
    // ngMeta.init();
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
      $rootScope.title = $state.current.meta.title;
      $rootScope.description = $state.current.meta.description;
      progress.complete();
    });
  }
])

angular.module('codeSide')

.controller('AdminController', ['$scope', '$firebaseObject', '$firebaseArray', 'currentAuth', 'Auth', 'DatabaseRef',
  function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
    // init empty formData object
    $scope.newPassword = ''
    $scope.formData = {};

    // bring in firebase db url
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid)); // now at firebase.url/users/uid

    userData.$loaded()
      .then(function() {
        if (!currentAuth.emailVerified) {
          $scope.notVerified = true;
          toastr.clear();
          toastr.error('You have not verified your email', 'Verify Email', { timeOut: 0 });
        };
        $scope.authInfo = userData;
        $scope.formData = userData;

        $scope.hideUsername = true;

        if (!$scope.formData.username) {
          $scope.hideUsername = false;
          toastr.error('Please set your username. Once set, cannot be changed.', 'Username required!', { timeOut: 0 });
        }
      })

    // retrieve codes created by 
    var query = DatabaseRef.child('codes').orderByChild('uid').equalTo(currentAuth.uid);
    var list = $firebaseArray(query);

    list.$loaded()
      .then(function(data) {
        // console.log(data);
        $scope.list = data
      })
      .catch(function(error) {
        toastr.error(error.message);
      })

    $scope.sendVerifyEmail = function() {
      toastr.info('Sending email verification message to your email. Check inbox now!', 'Email Verification');
      currentAuth.sendEmailVerification();
    }

    $scope.updateUser = function() {
      if (!$scope.formData.displayName) {
        toastr.error('Please add full name');
      } else {
        console.log($scope.formData);
        userData.$loaded()
          .then(function() {
            DatabaseRef
              .child('users')
              .child(currentAuth.uid)
              .update({
                username: $scope.formData.username,
                displayName: $scope.formData.displayName,
              }, function(error) {
                if (!error) {
                  $scope.hideUsername = true;
                  toastr.clear();
                  toastr.info('User updated');
                } else {
                  toastr.clear();
                  toastr.error('You cannot edit your username. ' +
                    'Username is set once', 'Not allowed', { timeOut: 0 });
                }
              })
          })
      }
    }

    $scope.updatePassword = function() {
      Auth.$updatePassword($scope.newPassword).then(function() {
        toastr.success('Password updated successfully', 'Successful!');
        $scope.newPassword = '';
      }).catch(function(error) {
        toastr.error(error.message, error.reason);
      });
    }

    $scope.loadLanguages = function() {
      DatabaseRef
        .child('languages')
        .update({
          php: 'PHP',
          python: 'Python',
          csharp: 'C#',
          cpp: 'C++',
          javascript: 'Javascript',
          java: 'Java'
        }, function(error) {
          toastr.error(error.message, error.reason);
        })
    }
  }
])

angular.module('codeSide')
  .controller('LogRegController', ['$scope', '$stateParams', 'Auth', '$state', '$rootScope', 'DatabaseRef', '$firebaseObject',
    function($scope, $stateParams, Auth, $state, $rootScope, DatabaseRef, $firebaseObject) {
      // init empty form
      $scope.formData = {};
      $scope.login = function() {
        if (!$scope.formData.email && !$scope.formData.password) {
          toastr.error("Add email and password");
        } else {
          Auth.$signInWithEmailAndPassword($scope.formData.email, $scope.formData.password)
            .then(function(firebaseUser) {
              // if rootscope is set
              if ($stateParams.toWhere !== null) {
                console.log($stateParams.toWhere);
                // console.log('I should go to ', $stateParams.toWhere.name);
                $state.go($stateParams.toWhere.name);
                $stateParams.toWhere = null;
                console.log($stateParams.toWhere);
              } else {
                $state.go('admin');
              };

              if (!firebaseUser.emailVerified) {
                // firebaseUser.sendEmailVerification();
                toastr.info('Your email is NOT verified.', 'Verify email!');
                $state.go('admin');
              }
              // $state.go('home');
            })
            .catch(function(error) {
              toastr.error(error.message, error.reason, { timeOut: 10000 });
              $scope.formData = {};
            })
        }
      };

      $scope.register = function() {
        if ($scope.formData.email && $scope.formData.password && $scope.formData.username) {
          console.log($scope.formData.email, $scope.formData.password);
          Auth.$createUserWithEmailAndPassword($scope.formData.email, $scope.formData.password)
            .then(function(firebaseUser) {
              // create user at /users/ endpoint
              var admin = false;
              if ($scope.formData.email == 'seanmavley@gmail.com') {
                admin = true;
              }
              DatabaseRef
                .child('users')
                .child(firebaseUser.uid)
                .set({
                  username: $scope.formData.username,
                  displayName: firebaseUser.displayName || '',
                  email: firebaseUser.email,
                  admin: admin
                })

              toastr.info('Sending email verification link. Check email!', "You've got mail!")
              firebaseUser.sendEmailVerification();

              toastr.success('Awesome! Welcome aboard. Login to begin coding!', 'Register Successful', { timeOut: 7000 });
              $state.go('admin');
            })
            .catch(function(error) {
              toastr.error(error.message, error.reason);
              // reset the form
              $scope.formData = {};
            });
        } else {
          toastr.error('Kindly complete the form', 'Some parts missing!');
        }
      };

      // Social Auths
      // GOOGLE AUTH
      $scope.googleAuth = function() {
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/plus.login');

        Auth.$signInWithPopup(provider)
          .then(function(firebaseUser) {
            var admin = false;
            if (firebaseUser.user.email == 'seanmavley@gmail.com') {
              admin = true;
            };

            console.log(firebaseUser.user);
            var userObject = $firebaseObject(DatabaseRef.child('users').child(firebaseUser.user.uid));
            userObject.$loaded()
              .then(function(data) {
                // don't override
                // data if exist
                userObject.$save({
                  displayName: data.displayName || firebaseUser.user.displayName,
                  email: data.email || firebaseUser.user.email,
                  admin: data.admin || admin,
                  createdAt: new Date().getTime()
                })
              })

            toastr.success('Logged in with Google successfully', 'Success');
            // updateUserIfEmpty(firebaseUser);
            $state.go('admin');
          })
          .catch(function(error) {
            toastr.error(error.message, error.reason);
          })
      }

      // FACEBOOK AUTH
      $scope.facebookAuth = function() {
        var provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');

        Auth.$signInWithPopup(provider)
          .then(function(firebaseUser) {
            toastr.success('Logged in with Google successfully', 'Success');
            $state.go('home');
          })
          .catch(function(error) {
            toastr.error(error.message, error.reason);
          })
      }
    }
  ])

angular.module("codeSide")

.factory("Auth", ['$firebaseAuth', function($firebaseAuth) {
  return $firebaseAuth();
}]);
angular.module('codeSide')

.controller('emailVerifyController', ['$scope', '$stateParams', 'currentAuth', 'DatabaseRef',
  function($scope, $stateParams, currentAuth, DatabaseRef) {
    console.log(currentAuth);
    $scope.doVerify = function() {
      firebase.auth()
        .applyActionCode($stateParams.oobCode)
        .then(function(data) {
          // change emailVerified for logged in User
          toastr.success('Verification happened', 'Success!');
        })
        .catch(function(error) {
          $scope.error = error.message;
          toastr.error(error.message, error.reason, { timeOut: 0 });
        })
    };
  }
])

angular.module('codeSide')
  .controller('MenuController', ['$scope', 'Auth', '$state', function($scope, Auth, $state) {

    Auth.$onAuthStateChanged(function(firebaseUser) {
      if (firebaseUser != null) {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }
    })

    $scope.logout = function() {
      Auth.$signOut();
      Auth.$onAuthStateChanged(function(firebaseUser) {
        console.log('loggedout');
      });
      $state.go('login');
    }
  }])

angular.module('codeSide')

.controller('CreateController', ['$scope', '$state', '$firebaseObject', '$firebaseArray', 'DatabaseRef', 'Auth', 'currentAuth',
  function($scope, $state, $firebaseObject, $firebaseArray, DatabaseRef, Auth, currentAuth) {
    // codemirror settings
    $scope.editorOneOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    $scope.editorTwoOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    // used to display form only after email 
    // verified
    $scope.emailVerified = currentAuth.emailVerified;

    // init some values
    $scope.sending = false; // form is being submitted
    $scope.notReady = true; // disable dropdown if languages not ready

    // load codes
    var codeData = $firebaseArray(DatabaseRef.child('codes'));

    // load userData
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));

    userData.$loaded()
      .then(function(data) {
        $scope.profile = data;
        // console.log($scope.profile);
      })

    // load languages
    var langObject = $firebaseObject(DatabaseRef.child('languages'));
    langObject.$loaded()
      .then(function(data) {
        $scope.languages = data;
        // console.log(data);
        $scope.notReady = false;
        if (currentAuth.emailVerified) {
          toastr.success('All is set. Code away!', 'Document ready!');
        }
      }, function(error) {
        toastr.error(error.message, 'Couldnt not load languages');
      });

    // when left side of code is changed
    $scope.code1Change = function(language) {
      // is code2 same as this?
      $scope.codeDuplicate = false;
      if ($scope.formData.to == $scope.formData.from) {
        toastr.warning('You cannot select same progamming language on both sides', 'Fix it!', {
          tapToDismiss: false,
          timeOut: 0
        });
        $scope.codeDuplicate = true;
      } else {
        toastr.clear();
        $scope.codeDuplicate = false;
        console.log('code changed to: ' + language);
        // change codemirror settings to match language
        if (['csharp', 'cpp'].includes(language)) {
          console.log('I am one of clike: ' + language);
          $scope.editorOneOptions.mode = language;
          // console.log($scope.editorOneOptions.mode);
        } else {
          $scope.editorOneOptions.mode = $scope.formData.from;
          // console.log($scope.editorOneOptions.mode);
        }
      }
    }

    // TODO: Refactor this to be one function for
    // top code one change and code two change
    $scope.code2Change = function(language) {
      $scope.codeDuplicate = false;
      if ($scope.formData.to == $scope.formData.from) {
        toastr.warning('You cannot select same progamming language on both sides', 'Fix it!', {
          tapToDismiss: false,
          timeOut: 0
        });
        $scope.codeDuplicate = true;
      } else {
        toastr.clear();
        $scope.codeDuplicate = false;
        console.log('code changed to: ' + language);
        if (['csharp', 'cpp'].includes(language)) {
          console.log('I am one of clike: ' + language);
          $scope.editorTwoOptions.mode = language;
          // console.log($scope.editorTwoOptions.mode);
        } else {
          $scope.editorTwoOptions.mode = $scope.formData.to;
          // console.log($scope.editorTwoOptions.mode);
        }
      }
    }

    $scope.addNew = function() {
      if ($scope.addForm.$invalid) {
        toastr.error('Please fill the form, all of it!',
          'Throw in the best of your coding spices.',
          'It means a lot!', 'Incomplete form');
        // if same code selected
      } else if ($scope.formData.from == $scope.formData.to) {
        toastr.warning('You cannot select same progamming languages on both sides', 'Fix it!');
        // if no username
      } else if (!$scope.profile.username) {
        toastr.warning('Kindly visit the' +
                    ' <a ui-sref="admin" style="text-decoration:underline;">Admin Page</a>' + 
                    'to add username first. Thank you!',
                    'Your Username is Missing!');
      } else {
        toastr.info('data.sending($scope.data, callback(detailPage, { param: $scope.data.id }));', 'Saved Successfully');
        $scope.sending = true;

        codeData.$loaded()
          .then(function() {
            console.log($scope.formData);

            var now = new Date().getTime();

            codeData.$add({
                title: $scope.formData.title,
                uid: currentAuth.uid,
                createdBy: $scope.profile.username,
                createdAt: now,
                description: $scope.formData.description
              })
              .then(function(added) {
                // add first snippet
                DatabaseRef.child('snippets')
                  .child(added.key)
                  .child($scope.formData.from)
                  .set({
                    name: $scope.formData.from,
                    code: $scope.formData.fromCode,
                    createdAt: now,
                    uid: currentAuth.uid,
                    createdBy: $scope.profile.username
                  });

                // add second snippet
                DatabaseRef.child('snippets')
                  .child(added.key)
                  .child($scope.formData.to)
                  .set({
                    name: $scope.formData.to,
                    code: $scope.formData.toCode,
                    uid: currentAuth.uid,
                    createdAt: now,
                    createdBy: $scope.profile.username,
                  })
                console.log('Hands are clean now');
                $state.go('detail', { codeId: added.key });
              })
              .catch(function(error) {
                console.log(error);
                toastr.error(error.message, 'Error');
              })
          })
      }
    }
  }
])

angular.module('codeSide')

.controller('DetailController', ['$scope', '$rootScope', '$state',
  '$stateParams', 'DatabaseRef', '$firebaseObject',
  '$firebaseArray', 'Auth',
  function($scope, $rootScope, $state, $stateParams,
    DatabaseRef, $firebaseObject, $firebaseArray, Auth) {
    // codemirror options
    $scope.editorOneOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };
    
    $scope.editorTwoOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };
    // for revisions
    $scope.revisionsShow = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };

    $scope.revisionsAdd = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    var now = new Date().getTime();

    $scope.loading = true;
    $scope.editAllowed = true;
    $scope.showRevOne = false;
    $scope.showRevTwo = false;

    $scope.revisionTwo = {};
    $scope.revisionOne = {};

    $scope.enableAlternative = function(number) {
      if (number == 'one') {
        $scope.showRevOne = !$scope.showRevOne;
      }

      if (number == 'two') {
        $scope.showRevTwo = !$scope.showRevTwo;
      }
    };

    // TODO: get it fixed.
    $scope.addAlternative = function(revision, code) {
      if (revision.code) {
        DatabaseRef.child('revision')
          .child($stateParams.codeId)
          .push({
            codeId: $stateParams.codeId,
            code: revision.code,
            createdBy: $scope.profile.username,
            uid: currentAuth.uid,
            createdAt: now,
            language: code.name
          })
        toastr.success('Added your code!', 'Successful');
      } else {
        toastr.error('Kindly add code', 'Code missing!');
      }
    }

    $scope.enableEditing = function() {
      $scope.editorOneOptions.readOnly = false;
      $scope.editorTwoOptions.readOnly = false;
      $scope.editAllowed = !$scope.editAllowed;
    }

    // global ref to root of app db
    var ref = DatabaseRef;
    var codeRef = ref.child('codes').child($stateParams.codeId);
    var snippetRef = ref.child('snippets').child($stateParams.codeId);
    var langRef = ref.child('languages');
    var usersRef = ref.child('users');

    var codeObject = $firebaseObject(codeRef);
    var snippetsArray = $firebaseArray(snippetRef);
    var langObject = $firebaseObject(langRef);

    Auth.$waitForSignIn()
      .then(function(loggedIn) {
        var currentAuth = loggedIn;
        // load username
        if (currentAuth) {
          var userData = $firebaseObject(usersRef.child(currentAuth.uid));
          userData.$loaded()
            .then(function(data) {
              $scope.profile = data;
              // console.log($scope.profile);
            })
        } else {
          console.log('You are not logged in!');
        }

        // load revisions
        var query = DatabaseRef
          .child('revision')
          .child($stateParams.codeId)
          //   .orderByChild('uid')
          //   .equalTo(currentAuth.uid);

        var list = $firebaseArray(query);

        list.$loaded()
          .then(function(data) {
            // console.log(data);
            $scope.revisionTwo = data;
          })
      })

    // Save changes to language
    $scope.saveLanguage = function(data) {
      if ($scope.profile) {
        saveLanguage(data)
      } else {
        toastr.error('You are not logged in', 'Log in first!');
      }
    }

    function saveLanguage(data) {
      if (data.createdBy == null) {
        // console.log(data);
        var update = {
          // $id: data.name,
          name: data.name,
          code: data.code,
          createdAt: new Date().getTime(),
          createdBy: $scope.profile.username
        };

        console.log(update);
        var toSave = ref.child('snippets')
          .child($stateParams.codeId)
          // TODO use $getRecord here instead
          .child(data.name)
          .update(update);
        console.log('Saving Done!');
        toastr.success('Changes saved!');
        return toSave;
      } else if ($scope.profile.username == data.createdBy) {
        // console.log(data);
        var update = {
          // $id: data.name,
          name: data.name,
          code: data.code,
        };

        console.log(update);
        var toSave = ref.child('snippets')
          .child($stateParams.codeId)
          // TODO use $getRecord here instead
          .child(data.name)
          .update(update);
        console.log('Saving Done!');
        toastr.success('Changes saved!');
        return toSave;
        // does editing user match created user?
      } else {
        toastr.error('Because you did not create this snippet, you cannot edit', 'Not allowed')
      }
    }

    langObject.$loaded()
      .then(function(data) {
        $scope.languages = data;
        // console.log(data);
      });

    codeObject.$loaded()
      .then(function(data) {
        $scope.loading = false;
        console.log(data.title);
        $rootScope.title = data.title;
        // change page title dynamically
        // ngMeta.setTitle(data.title);
        // ngMeta.setTag('description', data.description);
        // ngMeta.setTag('og:url', 'https://code.khophi.co/#/codes/'+data.uid);


        $scope.formData = {
          createdBy: data.createdBy,
          title: data.title,
          createdAt: data.createdAt,
          description: data.description,
          codeId: data.$id,
          uid: data.uid,
        }

        snippetsArray.$loaded()
          // default languages to load on load
          // based on first two items in snippets array
          .then(function(snippets) {
            $scope.formData.snippets = snippets;
            $scope.codeOne = loadLanguage(snippets.$keyAt(0));
            $scope.codeTwo = loadLanguage(snippets.$keyAt(1));
          })
      })

    $scope.codeOneChanged = function(language) {
      codeObject.$loaded()
        .then(function() {
          // toastr.success('Running to fetch the code');
          $scope.refreshOne = true;
          var returnedCode = loadLanguage(language);
          returnedCode
            .$loaded()
            .then(function() {
              if (returnedCode.code) {
                console.log('something came out');
                $scope.codeOne = returnedCode;
                toastr.clear();
              } else {
                toastr.clear();
                console.log('nothing came out');
                toastr.info('This code snippet has not been created. <br/><a href="#/new" class="button secondary">Add now</a>', 'Create me', { timeOut: 0 });
                $scope.codeOne = {
                  name: language,
                  code: ''
                }
              }
            })

          // console.log($scope.codeOne);
          $scope.refreshOne = false;
        })
    };

    $scope.codeTwoChanged = function(language) {
      codeObject.$loaded()
        .then(function() {
          // toastr.success('Running to fetch the code');
          $scope.refreshTwo = true;
          var returnedCode = loadLanguage(language);
          returnedCode
            .$loaded()
            .then(function() {
              if (returnedCode.code) {
                console.log('something came out');
                $scope.codeTwo = returnedCode;
                toastr.clear();
              } else {
                toastr.clear();
                console.log('nothing came out');
                toastr.info('This code snippet has not been created. <br/><a href="#/new" class="button secondary">Add now</a>', 'Create me', { timeOut: 0 });
                $scope.codeTwo = {
                  name: language,
                  code: ''
                }
              }
            })

          // console.log($scope.codeTwo);
          $scope.refreshOne = false;
        })
    };

    function loadLanguage(language) {
      return $firebaseObject(snippetRef.child(language));
    };

    $scope.updateCode = function() {
      var updateData = {
        title: $scope.formData.title,
        description: $scope.formData.description,
        updatedAt: now
      }

      ref.child('codes')
        .child($stateParams.codeId)
        .update(updateData, function(error) {
          if (error) {
            toastr.error(error.message, error.reason)
          } else {
            toastr.success('Updated succefully');
          }
        })
    };
  }
]);

angular.module('codeSide')

.controller('HomeController', ['$scope', '$rootScope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, $rootScope, Auth, DatabaseRef, $firebaseArray) {
    var ref = DatabaseRef;
    var codeDataRef = ref.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(50);

    var list = $firebaseArray(query);

    // TODO email verification
    // Auth.$onAuthStateChanged(function(firebaseUser) {
    //   if (firebaseUser) {
    //     console.log(firebaseUser);
    //     if (firebaseUser.emailVerified) {
    //       console.log(firebaseUser);
    //       toastr.success('Email verified');
    //     } else {
    //       toastr.info('Do verify email');
    //     }
    //   }
    // })

    list.$loaded()
      .then(function(data) {
        $scope.list = data;
      })
      .catch(function(error) {
        toastr.error(error.message);
      })
  }
])

angular.module("codeSide")
.factory("DatabaseRef", function() {
  return firebase.database().ref();
});

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-59418377-1', 'auto');
ga('send', 'pageview');

$(document).foundation();

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-right",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "5000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
