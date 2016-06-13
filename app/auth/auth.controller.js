angular.module('codeSide')
  .controller('LogRegController', function($scope, Auth, $state, DatabaseRef) {
    // init empty form
    $scope.formData = {};
    $scope.login = function() {
      if (!$scope.formData.email && !$scope.formData.password) {
        $scope.error = "Add email and password";
      } else {
        Auth.$signInWithEmailAndPassword($scope.formData.email, $scope.formData.password)
          .then(function(firebaseUser) {
            $state.go('home');
          })
          .catch(function(error) {
            $scope.error = error.message;
            $scope.formData = {};
          })
      }
    };
    
    $scope.register = function() {
      if ($scope.formData.email && $scope.formData.password) {
        console.log($scope.formData.email, $scope.formData.password);
        $scope.message = '';
        $scope.error = '';
        Auth.$createUserWithEmailAndPassword($scope.formData.email, $scope.formData.password)
          .then(function(firebaseUser) {
            $state.go('login', { message: 'Created user successfully' });
          })
          .catch(function(error) {
            $scope.error = error.message;
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
          $state.go('home');
        })
        .catch(function(error) {
          $scope.error = error.message;
        })
    }

    // FACEBOOK AUTH
    $scope.facebookAuth = function() {
      var provider = new firebase.auth.FacebookAuthProvider();
      provider.addScope('email');

      Auth.$signInWithPopup(provider)
        .then(function(firebaseUser) {
          $state.go('home');
        })
        .catch(function(error) {
          $scope.error = error.message;
        })
    }
  })
