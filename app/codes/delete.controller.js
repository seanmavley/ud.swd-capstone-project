angular.module('codeSide')
  .controller('DeleteController', ['$scope', '$state', '$stateParams', 'currentAuth', 'DatabaseRef', '$firebaseObject',
    function($scope, $state, $stateParams, currentAuth, DatabaseRef, $firebaseObject) {
      $scope.codeId = $stateParams.codeId;

      $scope.loading = true;
      var allowed = false;

      var ref = DatabaseRef.child('codes').child($stateParams.codeId);
      var refSnippet = DatabaseRef.child('snippets').child($stateParams.codeId);

      var deleteObject = $firebaseObject(ref);
      var deleteSnippet = $firebaseObject(refSnippet);

      deleteObject.$loaded()
        .then(function(data) {
          $scope.loading = false;
          if (data.uid == currentAuth.uid) {
            toastr.error('Are you sure?', 'About to Delete');
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
          deleteObject.$remove()
            .then(function(ref) {
              // delete the related snippet
              deleteSnippet.$remove()
                .then(function(ref) {
                  console.log('deletion happened');
                  toastr.info('Deletion ongoing');
                  $state.go('home');
                }, function(error) {
                  toastr.error('Error: ', error.message);
                })
              toastr.success('Floor scrubbing done!', 'Finished Deletion')
            });

          //TODO: Delete accompanying Snippet object

        } else {
          toastr.error('You aint doing anything');
        }
      }
    }
  ])
