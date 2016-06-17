angular.module('codeSide')

.controller('HomeController', function($scope, $rootScope, Auth, DatabaseRef, $firebaseArray) {
  // toastr.info('function(loadRecent, callback);', 'Running fetch function', { timeOut: 5000 })
  var ref = DatabaseRef;
  var codeDataRef = ref.child('codes');
  var query = codeDataRef.orderByChild("createdAt").limitToLast(10);

  var list = $firebaseArray(query);

  list.$loaded()
    .then(function(data) {
      $scope.list = data;
    })
    .catch(function(error) {
      toastr.error(error.message);
    })
})
