angular.module('codeSide')

.controller('CreateController',
  function($scope, $state, $firebaseObject, $firebaseArray, DatabaseRef, Auth) {
  // codemirror settings
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

  $scope.sending = false;

  $scope.addNew = function() {
    $scope.sending = true;
    if ($scope.addForm.$invalid) {
      $scope.error = 'Please fill the form, all of it! Throw in the best of your coding spices. It means a lot!';
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
                        code: $scope.formData.fromCode,
                      });

              // add second snippet
              codeDataRef
                .child(added.key)
                  .child('snippets')
                    .child($scope.formData.to)
                      .set({
                        code: $scope.formData.toCode
                      })
              console.log('Hands are clean now');
              // TODO: go to detail page of added item instead here
              // Pass param to route
              $state.go('admin');
            })
            .catch(function(error) {
              console.log(error);
              $scope.error = error.message;
            })
        })
    }
  }
})
