angular.module('codeSide')

.controller('CreateController', ['$scope', '$state', '$firebaseObject', '$firebaseArray', 'DatabaseRef', 'Auth', 'currentAuth',
  function($scope, $state, $firebaseObject, $firebaseArray, DatabaseRef, Auth, currentAuth) {
    // codemirror settings
    $scope.editorOneOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    $scope.editorTwoOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    // used to display form only after email 
    // verified
    $scope.emailVerified = currentAuth.emailVerified;

    // init some values
    $scope.sending = false; // form is being submitted
    $scope.notReady = true; // disable dropdown if languages not ready

    // load codes
    var codeData = $firebaseArray(DatabaseRef.child('codes'));

    // load userData
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));

    userData.$loaded()
      .then(function(data) {
        $scope.profile = data;
        // console.log($scope.profile);
      })

    // load languages
    var langObject = $firebaseObject(DatabaseRef.child('languages'));
    langObject.$loaded()
      .then(function(data) {
        $scope.languages = data;
        // console.log(data);
        $scope.notReady = false;
        if (currentAuth.emailVerified) {
          toastr.success('All is set. Code away!', 'Document ready!');
        }
      }, function(error) {
        toastr.error(error.message, 'Couldnt not load languages');
      });

    // when left side of code is changed
    $scope.code1Change = function(language) {
      // is code2 same as this?
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
        // change codemirror settings to match language
        if (['csharp', 'cpp'].includes(language)) {
          console.log('I am one of clike: ' + language);
          $scope.editorOneOptions.mode = language;
          // console.log($scope.editorOneOptions.mode);
        } else {
          $scope.editorOneOptions.mode = $scope.formData.from;
          // console.log($scope.editorOneOptions.mode);
        }
      }
    }

    // TODO: Refactor this to be one function for
    // top code one change and code two change
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
          $scope.editorTwoOptions.mode = language;
          // console.log($scope.editorTwoOptions.mode);
        } else {
          $scope.editorTwoOptions.mode = $scope.formData.to;
          // console.log($scope.editorTwoOptions.mode);
        }
      }
    }

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
                DatabaseRef.child('snippets')
                  .child(added.key)
                  .child($scope.formData.from)
                  .set({
                    name: $scope.formData.from,
                    code: $scope.formData.fromCode,
                    createdAt: now,
                    uid: currentAuth.uid,
                    createdBy: $scope.profile.username
                  });

                // add second snippet
                DatabaseRef.child('snippets')
                  .child(added.key)
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
  }
])
