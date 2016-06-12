angular.module('codeSide')
  .controller('RegisterController', function($scope, Auth, $state) {
    $scope.register = function() {
      if ($scope.email && $scope.password) {
        console.log($scope.email, $scope.password);
        $scope.message = '';
        $scope.error = '';
        Auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
          .then(function(firebaseUser) {
            $state.go('login');
          })
          .catch(function(error) {
            $scope.error = error;
          });
      } else {
        $scope.error = 'Do add email and password.';
      }

    };
  })

.controller('LoginController', function($scope, Auth, $state, $rootScope) {
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
          $scope.error = error;
        })
    }
  }
})
