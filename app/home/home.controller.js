angular.module('codeSide')

  .controller('HomeController', function($scope, currentAuth, $rootScope, Auth) {
    var userObj = Auth.$getAuth();
    console.log(userObj.email);
  })