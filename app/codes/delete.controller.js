angular.module('codeSide')
  .controller('DeleteController', ['$scope', '$stateParams', 'currentAuth', 'DatabaseRef', '$firebaseObject',
    function($scope, $stateParams, currentAuth, DatabaseRef, $firebaseObject) {
      $scope.codeId = $stateParams.codeId;

      $scope.loading = true;
      var allowed = false;

      var ref = DatabaseRef.child('codes').child($stateParams.codeId);
      var deleteObject = $firebaseObject(ref);
      deleteObject.$loaded()
        .then(function(data) {
          $scope.loading = false;
          if (data.uid == currentAuth.uid) {
            toastr.success('User id matches', 'User match');
            console.log('You created this');
            $scope.allowed = true;
            allowed = true;
          } else {
            console.log('Did not create this');
            toastr.error('You did not create this', 'Does not belong to you');
            $scope.allowed = false;
          }
        }, function(error) {
          toast.error('Error: ', error);
          console.log(error.message, error.reason);
        });


      $scope.deleteCode = function() {
        console.log(allowed);
        if (allowed) {
          console.log('delete happened');
          // deleteObject.$remove()
          //   .then(function(ref) {
          //     console.log('deletion happened');
          //     toastr.error('Deletion happened', 'Gone for good');
          //   }, function(error) {
          //     toastr.error('Error: ', error);
          //   });
        } else {
          toastr.error('You aint doing anything');
        }
      }
    }
  ])
