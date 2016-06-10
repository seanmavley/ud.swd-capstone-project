angular.module('codeSide')
  .controller('RegisterController', function($scope, Auth) {
    $scope.register = function() {
      console.log($scope.formData);
      $scope.message = null;
      $scope.error = null;

      Auth.$createUserWithEmailAndPassword($scope.formData.email, $scope.formData.password)
        .then(function(firebaseUser) {
          $scope.message = "User Created with uid " + firebaseUser.uid;
        })
        .catch(function(error) {
          $scope.error = error;
        });
    };
  })

.controller('LoginController', function($scope, Auth) {
  $scope.login = function() {
    console.log($scope.formData);
  }
})
