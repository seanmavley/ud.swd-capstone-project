angular.module('codeSide')

.controller('HomeController', ['$scope', 'Auth', 'DatabaseRef', '$firebaseArray', '$window',
  function($scope, Auth, DatabaseRef, $firebaseArray, $window) {

    var doRequest = function() {
      $scope.offline = false;
      console.log($scope.offline);

      var codeDataRef = DatabaseRef.child('codes');
      var query = codeDataRef.orderByChild("createdAt").limitToLast(25);

      var list = $firebaseArray(query);

      list.$loaded()
        .then(function(data) {
          $scope.list = data;
          localforage.setItem('homepage', JSON.stringify(data)).then(function(res) {
              toastr.success('Homepage Database Offline', 'Content taken offline');
            })
            .catch(function(error) {
              console.log(error);
            })
        })
        .catch(function(error) {
          toastr.error(error.message);
        })
    }

    if (Offline.state === 'up') {
      $scope.offline = false;
      doRequest();
    } else {
      $scope.offline = true;
      doOffline();
    };

    var doOffline = function() {
      $scope.offline = true;
      $scope.$apply();
      console.log($scope.offline);
      // TODO:
      // clean the retrieved stringified data
      // currently works, but look for better way?
      localforage.getItem('homepage')
        .then(function(data) {
          console.log(data);
          $scope.list = data;
        })
    }

    Offline.on('down', function() {
      doOffline();
    });


    Offline.on('up', function() {
      doRequest();
    });

  }
])
