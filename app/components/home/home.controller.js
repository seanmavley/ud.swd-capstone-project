angular.module('codeSide')

.controller('HomeController', ['$scope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, Auth, DatabaseRef, $firebaseArray) {

    var doRequest = function() {
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
      doRequest();
    };

    Offline.on('down', function() {
      // TODO:
      // clean the retrieved stringified data
      // currently works, but look for better way?
      localforage.getItem('homepage')
        .then(function(data) {
          console.log(data);
          $scope.list = data;
        })
    });


    Offline.on('up', function() {
      doRequest();
    });

  }
])
