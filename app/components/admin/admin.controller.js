angular.module('codeSide')

.controller('AdminController', ['$scope', '$firebaseObject', '$firebaseArray', 'currentAuth', 'Auth', 'DatabaseRef',
  function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
    // init empty formData object
    var codeDataRef = DatabaseRef.child('codes');
    var votingRef = DatabaseRef.child('voting');
    var query = codeDataRef.orderByChild("createdAt").limitToLast(100);

    var list = $firebaseArray(query);
    var voting = $firebaseObject(votingRef);

    list.$loaded()
      .then(function(data) {
        $scope.list = data;
      })
      .catch(function(error) {
        toastr.error(error.message);
      })

    $scope.upVote = function(item, vote) {
      console.log(item);
      votingRef.child(item.$id).child('voted')
        .push(currentAuth.uid)
        .then(function(data) {
          console.log('Push array happened');
          votingRef.child(item.$id)
            .update({
              votes: (item.votes || 0) + 1
            })
            .then(function(data) {
              console.log('Update happened, beginning array');
            })
        })
    }

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
