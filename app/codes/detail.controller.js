angular.module('codeSide')

  .controller('DetailController', function($scope, $state, $stateParams) {
    $scope.title = $stateParams.title;
    $scope.from = $stateParams.from;
    $scope.to = $stateParams.to;
  })