angular.module('codeSide')
  
  .controller('AdminController', function($scope, currentAuth) {
    $scope.user = currentAuth;
  })