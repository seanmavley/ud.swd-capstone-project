angular.module('codeSide', ['ui.router', 'firebase', 'ui.codemirror'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

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
        currentAuth:['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
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
        currentAuth:['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
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
        currentAuth: ['Auth', function(Auth) {
          return Auth.$requireSignIn()
        }]
      }
    })

  $urlRouterProvider.otherwise('/');
}])

.run(['$rootScope', '$state', 'Auth', function($rootScope, $state, Auth) {
  $rootScope.$on("$stateChangeError", function(even, toState, toParams, fromState, fromParams, error) {
    if (error === "AUTH_REQUIRED") {
      $state.go('login');
    }
  })
}])

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
      $scope.authInfo = userData;
      $scope.formData = userData;

      $scope.hideUsername = true; 

      if(!$scope.formData.username) {
        $scope.hideUsername = false;
        toastr.error('Please set your username. Once set, cannot be changed.', 'Username required!', { timeOut: 0});
      }

      if(!currentAuth.password) {
        toastr.info('Set password in order to log in');
      }
    })

  // retrieve codes created by 
  var query = DatabaseRef.child('codes').orderByChild('createdBy').equalTo(currentAuth.uid);
  var list = $firebaseArray(query);

  list.$loaded()
    .then(function(data) {
      console.log(data);
      $scope.list = data
    })
    .catch(function(error) {
      toastr.error(error.message);
    })

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
            })
        })
      $scope.hideUsername = true;
      toastr.clear();
      toastr.info('User updated');
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
}])

angular.module('codeSide')
  .controller('LogRegController', ['$scope', 'Auth', '$state', 'DatabaseRef', '$firebaseObject',
    function($scope, Auth, $state, DatabaseRef, $firebaseObject) {
      // init empty form
      $scope.formData = {};
      $scope.login = function() {
        if (!$scope.formData.email && !$scope.formData.password) {
          toastr.error("Add email and password");
        } else {
          Auth.$signInWithEmailAndPassword($scope.formData.email, $scope.formData.password)
            .then(function(firebaseUser) {
              // TODO send email verification after login after
              // first time
              if (!firebaseUser.emailVerified) {
                firebaseUser.sendEmailVerification();
                toastr.info('Email verification sent', 'Verify email!');
              }
              $state.go('home');
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
                  emailVerified: firebaseUser.emailVerified,
                  admin: admin
                })

              toastr.success('Awesome! Welcome aboard. Login to begin coding!', 'Register Successful', { timeOut: 7000 });
              // Auth.$signOut();
              $state.go('admin');
            })
            .catch(function(error) {
              toastr.error(error.message, error.reason);
              // empty the form
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
                  emailVerified: data.emailVerified || firebaseUser.user.emailVerified,
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

      // function updateUserIfEmpty(authData) {
      //   // data from sign in
      //   console.log(authData.user.uid);
      //   // data from /users/uid/
      //   var firebaseUser = $firebaseObject(DatabaseRef.child('users').child(authData.user.uid));

      //   firebaseUser.$loaded()
      //     .then(function(user) {
      //       if (!user.displayName) {
      //         firebaseUser.displayName = authData.user.displayName;
      //         firebaseUser.$save()
      //           .then(function() {
      //             console.log('saved displayname');
      //           })
      //       } else if (!user.photoURL) {
      //         firebaseUser.photoURL = authData.user.photoURL;
      //         firebaseUser.$save()
      //           .then(function() {
      //             console.log('saved photoURL');
      //           })
      //       }
      //     })
      // }

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

.controller('emailVerifyController', ['$scope', '$stateParams', 'Auth',
  function($scope, $stateParams, Auth) {
    $scope.mode = $stateParams.mode;
    $scope.oobCode = $stateParams.oobCode;
  }
])

angular.module("codeSide")

.factory("Auth", ['$firebaseAuth', function($firebaseAuth) {
  return $firebaseAuth();
}]);

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

.controller('CreateController', ['$scope', '$state', '$firebaseObject', '$firebaseArray', 'DatabaseRef', 'Auth',
  function($scope, $state, $firebaseObject, $firebaseArray, DatabaseRef, Auth) {
    // codemirror settings
    $scope.editor1Options = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    $scope.editor2Options = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    var currentAuth = Auth.$getAuth();
    var codeData = $firebaseArray(DatabaseRef.child('codes'));

    // load userData
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));

    userData.$loaded()
      .then(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
      })

    // load languages
    $scope.notReady = true; // disable dropdown if languages not ready
    var langObject = $firebaseObject(DatabaseRef.child('languages'));
    langObject.$loaded()
      .then(function(data) {
        toastr.success('All is set. Code away!', 'Document ready!');
        $scope.languages = data;
        console.log(data);
        $scope.notReady = false;
      }, function(error) {
        toastr.error(error.message, 'Oh no, error!');
      });

    $scope.code1Change = function(language) {
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
          $scope.editor1Options.mode = language;
          console.log($scope.editor1Options.mode);
        } else {
          $scope.editor1Options.mode = $scope.formData.from;
          console.log($scope.editor1Options.mode);
        }
      }
    }

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
          $scope.editor2Options.mode = language;
          console.log($scope.editor2Options.mode);
        } else {
          $scope.editor2Options.mode = $scope.formData.to;
          console.log($scope.editor2Options.mode);
        }
      }
    }

    $scope.sending = false;


    $scope.addNew = function() {
      if ($scope.addForm.$invalid) {
        toastr.error('Please fill the form, all of it!',
          'Throw in the best of your coding spices.',
          'It means a lot!', 'Incomplete form');
      } else if ($scope.formData.from == $scope.formData.to) {
        toastr.warning('You cannot select same progamming languages on both sides', 'Fix it!');
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
                DatabaseRef.child('codes')
                  .child(added.key)
                  .child('snippets')
                  .child($scope.formData.from)
                  .set({
                    name: $scope.formData.from,
                    code: $scope.formData.fromCode,
                    createdAt: now,
                    uid: currentAuth.uid,
                    createdBy: $scope.profile.username
                  });

                // add second snippet
                DatabaseRef.child('codes')
                  .child(added.key)
                  .child('snippets')
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

.controller('DetailController', ['$scope', '$state',
      '$stateParams', 'DatabaseRef', '$firebaseObject',
      '$firebaseArray', 'Auth',
      function($scope, $state, $stateParams, DatabaseRef, $firebaseObject, $firebaseArray, Auth) {
        // codemirror options
        $scope.editorOptions = {
          lineWrapping: true,
          lineNumbers: true,
          readOnly: 'nocursor',
        };

        $scope.loading = true;
        $scope.editAllowed = true;

        $scope.enableEditing = function() {
          $scope.editorOptions.readOnly = false;
          $scope.editAllowed = !$scope.editAllowed;
        }

        // global ref to root of app db
        var ref = DatabaseRef;
        var codeRef = ref.child('codes')
          .child($stateParams.codeId);

        var codeObject = $firebaseObject(codeRef);
        var snippetsArray = $firebaseArray(codeRef.child('snippets'));

        var langRef = ref.child('languages');
        var langObject = $firebaseObject(langRef);

        var currentAuth = Auth.$getAuth();

        if (currentAuth) {
          var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));
          userData.$loaded()
            .then(function(data) {
              $scope.profile = data;
              console.log($scope.profile);
            })
        }

        $scope.saveLanguage = function(data) {
          if ($scope.profile) {
            saveLanguage(data);
          } else {
            toastr.error('You are not logged in', 'Log in first!');
          }
        }

        function saveLanguage(data) {
          console.log(data);
          var update = {
            // $id: data.name,
            name: data.name,
            code: data.code,
            createdAt: new Date().getTime(),
            createdBy: $scope.profile.username
          }
          console.log(update);
          var toSave = ref.child('codes')
            .child($stateParams.codeId)
            .child('snippets')
            .child(data.name)
            .update(update);

          console.log('Thanks for saving this: ', toSave);
          toastr.success('Changes saved!');
          return toSave;
        }


        langObject.$loaded()
          .then(function(data) {
            $scope.languages = data;
            console.log(data);
          });

        codeObject.$loaded()
          .then(function() {
            $scope.loading = false;
            $scope.formData = {
              createdBy: codeObject.createdBy,
              title: codeObject.title,
              createdAt: codeObject.createdAt,
              snippets: codeObject.snippets,
              description: codeObject.description
            }

            snippetsArray.$loaded()
              // default languages to load on load
              // based on first two items in snippets array
              .then(function(snippets) {
                $scope.codeOne = loadLanguage(snippets.$keyAt(0));
                $scope.codeTwo = loadLanguage(snippets.$keyAt(1));
              })
          })

        $scope.codeOneChanged = function(language) {
          codeObject.$loaded()
            .then(function() {
              toastr.success('Running to fetch the code');
              $scope.refreshOne = true;
              var returnedCode = loadLanguage(language);
              returnedCode
                .$loaded()
                .then(function() {
                  if (returnedCode.code) {
                    console.log('something came out');
                    $scope.codeOne = returnedCode;
                  } else {
                    console.log('nothing came out');
                    $scope.codeOne = {
                      name: language,
                      code: ''
                    }
                  }
                })

              console.log($scope.codeOne);
              $scope.refreshOne = false;
            })
        };

        $scope.codeTwoChanged = function(language) {
          codeObject.$loaded()
            .then(function() {
              toastr.success('Running to fetch the code');
              $scope.refreshTwo = true;
              var returnedCode = loadLanguage(language);
              returnedCode
                .$loaded()
                .then(function() {
                  if (returnedCode.code) {
                    console.log('something came out');
                    $scope.codeTwo = returnedCode;
                  } else {
                    console.log('nothing came out');
                    $scope.codeTwo = {
                      name: language,
                      code: ''
                    }
                  }
                })

              console.log($scope.codeTwo);
              $scope.refreshOne = false;
            })
        };


        function loadLanguage(language) {
          var snippetRef = codeRef
            .child('snippets')
            .child(language)

          return $firebaseObject(snippetRef);
        };

        // codeObject.$bindTo($scope, "formData")
        //   .then(function() {
        //     console.log('bound');
        //     $scope.loading = false;
        //   });

        // codeRef
        //   .child($stateParams.codeId)
        //   .once('value', function(snap) {
        //     console.log(snap.val());
        //     $scope.data = snap.val();
        //   })

      }]);

angular.module('codeSide')

.controller('HomeController', ['$scope', '$rootScope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, $rootScope, Auth, DatabaseRef, $firebaseArray) {
    var ref = DatabaseRef;
    var codeDataRef = ref.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(10);

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
