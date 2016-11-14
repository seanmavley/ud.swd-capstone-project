angular.module('codeSide')

.controller('HomeController', ['$scope', '$rootScope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, $rootScope, Auth, DatabaseRef, $firebaseArray) {
    var ref = DatabaseRef;
    var codeDataRef = ref.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(50);

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
