angular.module('codeSide')
  .controller('RegisterController', function($scope, Auth, $state) {
    $scope.register = function() {
      console.log($scope.email, $scope.password);
      $scope.message = null;
      $scope.error = null;

      Auth.$createUserWithEmailAndPassword($scope.email, $scope.password)
        .then(function(firebaseUser) {
          $scope.message = "User Created with uid " + firebaseUser.uid;
          // pass in this message to home route
          $state.go('home');
        })
        .catch(function(error) {
          $scope.error = error;
        });
    };
  })

.controller('LoginController', function($scope, Auth, $state) {
  $scope.error = null;
  $scope.message = null;

  $scope.login = function() {
    if (!$scope.email && !$scope.password) {
      $scope.message = "Dude, please enter password and email";
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
