angular.module('codeSide')

.controller('AdminController', ['$scope', '$firebaseObject', '$firebaseArray', 'currentAuth', 'Auth', 'DatabaseRef',
  function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
    // init empty formData object
    var codeDataRef = DatabaseRef.child('codes');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(100);

    var votesRef = DatabaseRef.child('codes').child('votes');
    var votes = $firebaseArray(votesRef);
    var list = $firebaseArray(query);

    list.$loaded()
      .then(function(data) {
        $scope.list = data;
      })
      .catch(function(error) {
        toastr.error(error.message);
      })

    $scope.loadLanguages = function() {
      DatabaseRef
        .child('languages')
        .update({
          php: 'PHP',
          python: 'Python',
          csharp: 'C#',
          cpp: 'C++',
          javascript: 'Javascript',
          java: 'Java'
        }, function(error) {
          toastr.error(error.message, error.reason);
        })
    }
  }
])
