angular.module('codeSide')
  .controller('RegisterController', function($scope, Auth, $state, DatabaseRef) {

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
  })

.controller('LoginController', function($scope, Auth, $state, $rootScope, DatabaseRef) {
  $scope.error = null;
  $scope.message = null;

  $scope.googleAuth = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');

    Auth.$signInWithPopup(provider)
      .then(function(firebaseUser) {
        $state.go('home');
      })
      .catch(function(error) {
        $scope.error = error;
      })

  }

  $scope.login = function() {
    if (!$scope.email && !$scope.password) {
      $scope.error = "Add email and password";
    } else {
      Auth.$signInWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
          $state.go('home');
        })
        .catch(function(error) {
          $scope.error = error.message;
        })
    }
  }
})
