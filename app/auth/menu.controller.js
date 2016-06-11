angular.module('codeSide')
  .controller('MenuController', function($scope, Auth, $state){
    $scope.logout = function() {
      Auth.$signOut();
      $state.go('login');
    }
  })