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

    var langObject = $firebaseObject(ref.child('languages'));

    langObject.$loaded()
      .then(function(data) {
        toastr.info('All is set. Code away!', 'Document ready!');
        $scope.languages = data;
        console.log(data);
      });

    $scope.sending = false;

    $scope.addNew = function() {
      toastr.info('data.sending($scope.data, callback(detailPage, { param: $scope.data.id }));', 'Invoked function...');
      $scope.sending = true;
      if ($scope.addForm.$invalid) {
        toastr.error('Please fill the form, all of it!',
                     'Throw in the best of your coding spices.',
                     'It means a lot!', 'Incomplete form');
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
                    name: $scope.formData.from,
                    code: $scope.formData.fromCode,
                    timestamp: now
                  });

                // add second snippet
                codeDataRef
                  .child(added.key)
                  .child('snippets')
                  .child($scope.formData.to)
                  .set({
                    name: $scope.formData.to,
                    code: $scope.formData.toCode,
                    timestamp: now
                  })
                console.log('Hands are clean now');
                $state.go('detail', { codeId: added.key});
              })
              .catch(function(error) {
                console.log(error);
                toastr.error(error.message, 'Error');
              })
          })
      }
    }
  })
