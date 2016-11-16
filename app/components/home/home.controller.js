angular.module('codeSide')

.controller('HomeController', ['$scope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, Auth, DatabaseRef, $firebaseArray) {
    var ref = DatabaseRef;
    var codeDataRef = ref.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(25);

    var list = $firebaseArray(query);

    list.$loaded()
      .then(function(data) {
        $scope.list = data;
      })
      .catch(function(error) {
        toastr.error(error.message);
      })
  }
])
