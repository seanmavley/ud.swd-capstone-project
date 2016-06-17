angular.module('codeSide')

.controller('CreateController',
  function($scope, $state, $firebaseObject, $firebaseArray, DatabaseRef, Auth) {
    // codemirror settings
    $scope.editor1Options = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    $scope.editor2Options = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    var currentAuth = Auth.$getAuth();
    var ref = DatabaseRef;
    var codeDataRef = ref.child('codes');
    var codeData = $firebaseArray(codeDataRef);

    // load languages
    $scope.notReady = true; // disable dropdown if languages not ready
    var langObject = $firebaseObject(ref.child('languages'));
    langObject.$loaded()
      .then(function(data) {
        toastr.info('All is set. Code away!', 'Document ready!');
        $scope.languages = data;
        console.log(data);
        $scope.notReady = false;
      }, function(error) {
        toastr.error(error.message, 'Oh no, error!');
      });

    $scope.code1Change = function(language) {
      $scope.codeDuplicate = false;
      if ($scope.formData.to == $scope.formData.from) {
        toastr.warning('You cannot select same progamming language on both sides', 'Fix it!', {
          tapToDismiss: false,
          timeOut: 0
        });
        $scope.codeDuplicate = true;
      } else {
        toastr.clear();
        $scope.codeDuplicate = true;
        console.log('code changed to: ' + language);
        if (['csharp', 'cpp'].includes(language)) {
          console.log('I am one of clike: ' + language);
          $scope.editor1Options.mode = language;
          console.log($scope.editor1Options.mode);
        } else {
          $scope.editor1Options.mode = $scope.formData.from;
          console.log($scope.editor1Options.mode);
        }
      }
    }

    $scope.code2Change = function(language) {
      $scope.codeDuplicate = false;
      if ($scope.formData.to == $scope.formData.from) {
        toastr.warning('You cannot select same progamming language on both sides', 'Fix it!', {
          tapToDismiss: false,
          timeOut: 0
        });
        $scope.codeDuplicate = true;
      } else {
        toastr.clear();
        $scope.codeDuplicate = true;
        console.log('code changed to: ' + language);
        if (['csharp', 'cpp'].includes(language)) {
          console.log('I am one of clike: ' + language);
          $scope.editor2Options.mode = language;
          console.log($scope.editor2Options.mode);
        } else {
          $scope.editor2Options.mode = $scope.formData.to;
          console.log($scope.editor2Options.mode);
        }
      }
    }

    $scope.sending = false;


    $scope.addNew = function() {
      if ($scope.addForm.$invalid) {
        toastr.error('Please fill the form, all of it!',
          'Throw in the best of your coding spices.',
          'It means a lot!', 'Incomplete form');
      } else if ($scope.formData.from == $scope.formData.to) {
        toastr.warning('You cannot select same progamming languages on both sides', 'Fix it!');
      } else {
        toastr.info('data.sending($scope.data, callback(detailPage, { param: $scope.data.id }));', 'Invoked function...');
        $scope.sending = true;

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
                    createdAt: now,
                    createdBy: currentAuth.uid
                  });

                // add second snippet
                codeDataRef
                  .child(added.key)
                  .child('snippets')
                  .child($scope.formData.to)
                  .set({
                    name: $scope.formData.to,
                    code: $scope.formData.toCode,
                    createdAt: now,
                    createdBy: currentAuth.uid
                  })
                console.log('Hands are clean now');
                $state.go('detail', { codeId: added.key });
              })
              .catch(function(error) {
                console.log(error);
                toastr.error(error.message, 'Error');
              })
          })
      }
    }
  })
