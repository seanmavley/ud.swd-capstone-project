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
    var codeData = $firebaseArray(DatabaseRef.child('codes'));

    // load userData
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));

    userData.$loaded()
      .then(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
      })

    // load languages
    $scope.notReady = true; // disable dropdown if languages not ready
    var langObject = $firebaseObject(DatabaseRef.child('languages'));
    langObject.$loaded()
      .then(function(data) {
        toastr.success('All is set. Code away!', 'Document ready!');
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
        $scope.codeDuplicate = false;
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
        $scope.codeDuplicate = false;
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
        toastr.info('data.sending($scope.data, callback(detailPage, { param: $scope.data.id }));', 'Saved Successfully');
        $scope.sending = true;

        codeData.$loaded()
          .then(function() {
            console.log($scope.formData);

            var now = new Date().getTime();

            codeData.$add({
                title: $scope.formData.title,
                uid: currentAuth.uid,
                createdBy: $scope.profile.username,
                createdAt: now,
                description: $scope.formData.description
              })
              .then(function(added) {
                // add first snippet
                DatabaseRef.child('codes')
                  .child(added.key)
                  .child('snippets')
                  .child($scope.formData.from)
                  .set({
                    name: $scope.formData.from,
                    code: $scope.formData.fromCode,
                    createdAt: now,
                    uid: currentAuth.uid,
                    createdBy: $scope.profile.username
                  });

                // add second snippet
                DatabaseRef.child('codes')
                  .child(added.key)
                  .child('snippets')
                  .child($scope.formData.to)
                  .set({
                    name: $scope.formData.to,
                    code: $scope.formData.toCode,
                    uid: currentAuth.uid,
                    createdAt: now,
                    createdBy: $scope.profile.username,
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
