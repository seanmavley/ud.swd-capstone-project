angular.module('codeSide')
  .controller('MenuController', function($scope, Auth, $state) {

    Auth.$onAuthStateChanged(function(firebaseUser) {
      if(firebaseUser != null) {
        $scope.loggedIn = true;
      } else {
        $scope.loggedIn = false;
      }
    })

    $scope.logout = function() {
      Auth.$signOut();
      $state.go('login');
    }
  })
