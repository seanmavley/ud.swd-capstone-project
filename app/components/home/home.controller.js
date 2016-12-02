angular.module('codeSide')

.controller('HomeController', ['$scope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, Auth, DatabaseRef, $firebaseArray) {
    var codeDataRef = DatabaseRef.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(25);

    var list = $firebaseArray(query);

    function doRequest() {
      list.$loaded()
        .then(function(data) {
          $scope.list = data;
        })
        .catch(function(error) {
          toastr.error(error.message);
        })
    }

    Offline.on('down', function() {
      console.log('network down');
      $scope.offline = true;
      $scope.$apply();
    })

    Offline.on('up', function() {
      console.log('network up on event');
      doRequest();
      $scope.offline = false;
      $scope.$apply();
    })

    if (Offline.state == 'up') {
      console.log('network up on load');
      doRequest();
    } else {
      $scope.offline = true;
      console.log('offline, show offline message');
    }

  }
])
