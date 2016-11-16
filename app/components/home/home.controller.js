angular.module('codeSide')

.controller('HomeController', ['$scope', 'Auth', 'DatabaseRef', '$firebaseArray',
  function($scope, Auth, DatabaseRef, $firebaseArray) {

    var doRequest = function() {
      var ref = DatabaseRef;
      var codeDataRef = ref.child('codes');
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
