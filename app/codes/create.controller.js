angular.module('codeSide')

.controller('CreateController', function($scope, $firebaseObject, $firebaseArray, DatabaseRef, Auth) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
    mode: 'xml',
  };

  var currentAuth = Auth.$getAuth();

  var ref = DatabaseRef;
  var codeDataRef = ref.child('codes');
  var codeData = $firebaseArray(codeDataRef);

  $scope.addNew = function() {
    if ($scope.addForm.$invalid) {
      $scope.error = 'Please fill the form, all of it!';
    } else {
      codeData.$loaded()
        .then(function() {
          console.log($scope.formData);

          var now = new Date().getTime();

          codeData.$add({
              title: $scope.formData.title,
              createdBy: currentAuth.uid,
              createdAt: now
            })
            .then(function(added) {
              // add first snippet
              codeDataRef
                .child(added.key)
                  .child('snippets')
                    .child($scope.formData.from)
                      .set({
                        whatIwant: 'What i want'
                      });

              // add second snippet
              codeDataRef
                .child(added.key)
                  .child('snippets')
                    .child($scope.formData.to)
                      .set({
                        whatIwant: 'What i want'
                      })
              console.log('Hands are clean now');
            })
            .catch(function(error) {
              console.log(error);
            })
        })
    }
  }
})
