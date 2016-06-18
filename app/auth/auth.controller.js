angular.module('codeSide')
  .controller('LogRegController', function($scope, Auth, $state, DatabaseRef, $firebaseObject) {
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

            // if (!firebaseUser.emailVerified) {
            //   firebaseUser.sendEmailVerification();
            //   toastr.info('Email verification sent', 'Verify email!');
            // }
            $state.go('home');
          })
          .catch(function(error) {
            toastr.error(error.message, error.reason, { timeOut: 10000 });
            $scope.formData = {};
          })
      }
    };

    $scope.register = function() {
      if ($scope.formData.email && $scope.formData.password) {
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
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                admin: admin
              })

            toastr.success('Awesome! Welcome aboard. Login to begin coding!', 'Register Successful', { timeOut: 7000 });
            $state.go('login');
          })
          .catch(function(error) {
            toastr.error(error.message, error.reason);
            // empty the form
            $scope.formData = {};
          });
      } else {
        $scope.error = 'Do add email and password.';
      }
    };

    // Social Auths
    // GOOGLE AUTH
    $scope.googleAuth = function() {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/plus.login');

      Auth.$signInWithPopup(provider)
        .then(function(firebaseUser) {
          toastr.success('Logged in with Google successfully', 'Success');
          // updateUserIfEmpty(firebaseUser);
          $state.go('home');
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
  })

.controller('emailVerifyController', function($scope, $stateParams, Auth) {
  $scope.mode = $stateParams.mode;
  $scope.oobCode = $stateParams.oobCode;
})
