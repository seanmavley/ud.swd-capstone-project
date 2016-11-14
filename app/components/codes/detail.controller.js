angular.module('codeSide')

.controller('DetailController', ['$scope', '$rootScope', '$state',
  '$stateParams', 'DatabaseRef', '$firebaseObject',
  '$firebaseArray', 'Auth',
  function($scope, $rootScope, $state, $stateParams,
    DatabaseRef, $firebaseObject, $firebaseArray, Auth) {
    // codemirror options
    $scope.editorOneOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };

    $scope.editorTwoOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };

    var now = new Date().getTime();

    $scope.loading = true;
    $scope.editAllowed = true;

    $scope.enableEditing = function() {
      $scope.editorOneOptions.readOnly = false;
      $scope.editorTwoOptions.readOnly = false;
      $scope.editAllowed = !$scope.editAllowed;
    };

    // global ref to root of app db
    var ref = DatabaseRef;
    var codeRef = ref.child('codes').child($stateParams.codeId);
    var snippetRef = ref.child('snippets').child($stateParams.codeId);
    var langRef = ref.child('languages');
    var usersRef = ref.child('users');

    var codeObject = $firebaseObject(codeRef);
    var snippetsArray = $firebaseArray(snippetRef);
    var langObject = $firebaseObject(langRef);

    Auth.$waitForSignIn()
      .then(function(loggedIn) {
        var currentAuth = loggedIn;
        // load username
        if (currentAuth) {
          var userData = $firebaseObject(usersRef.child(currentAuth.uid));
          userData.$loaded()
            .then(function(data) {
              $scope.profile = data;
              // console.log($scope.profile);
            })
        } else {
          console.log('You are not logged in!');
        }

        // load revisions
        var query = DatabaseRef
          .child('revision')
          .child($stateParams.codeId)
          //   .orderByChild('uid')
          //   .equalTo(currentAuth.uid);

        var list = $firebaseArray(query);

        list.$loaded()
          .then(function(data) {
            // console.log(data);
            $scope.revisionTwo = data;
          })
      });

    // Save changes to language
    $scope.saveLanguage = function(data) {
      if ($scope.profile) {
        saveLanguage(data)
      } else {
        toastr.error('You are not logged in', 'Log in first!');
      }
    };

    function saveLanguage(data) {
      if (data.createdBy == null) {
        // console.log(data);
        var update = {
          // $id: data.name,
          name: data.name,
          code: data.code,
          createdAt: new Date().getTime(),
          createdBy: $scope.profile.username
        };

        console.log(update);
        var toSave = ref.child('snippets')
          .child($stateParams.codeId)
          // TODO use $getRecord here instead
          .child(data.name)
          .update(update);
        console.log('Saving Done!');
        toastr.success('Changes saved!');
        return toSave;
      } else if ($scope.profile.username == data.createdBy) {
        // console.log(data);
        var update = {
          // $id: data.name,
          name: data.name,
          code: data.code,
        };

        console.log(update);
        var toSave = ref.child('snippets')
          .child($stateParams.codeId)
          // TODO use $getRecord here instead
          .child(data.name)
          .update(update);
        console.log('Saving Done!');
        toastr.success('Changes saved!');
        return toSave;
        // does editing user match created user?
      } else {
        toastr.error('Because you did not create this snippet, you cannot edit', 'Not allowed')
      }
    };

    langObject.$loaded()
      .then(function(data) {
        $scope.languages = data;
        // console.log(data);
      });

    codeObject.$loaded()
      .then(function(data) {
        $scope.loading = false;
        console.log(data.title);
        $rootScope.title = data.title;
        // change page title dynamically
        // ngMeta.setTitle(data.title);
        // ngMeta.setTag('description', data.description);
        // ngMeta.setTag('og:url', 'https://code.khophi.co/#/codes/'+data.uid);


        $scope.formData = {
          createdBy: data.createdBy,
          title: data.title,
          createdAt: data.createdAt,
          description: data.description,
          codeId: data.$id,
          uid: data.uid,
        }

        snippetsArray.$loaded()
          // default languages to load on load
          // based on first two items in snippets array
          .then(function(snippets) {
            $scope.formData.snippets = snippets;
            $scope.codeOne = loadLanguage(snippets.$keyAt(0));
            $scope.codeTwo = loadLanguage(snippets.$keyAt(1));
          })
      });

    $scope.codeOneChanged = function(language) {
      codeObject.$loaded()
        .then(function() {
          // toastr.success('Running to fetch the code');
          $scope.refreshOne = true;
          var returnedCode = loadLanguage(language);
          returnedCode
            .$loaded()
            .then(function() {
              if (returnedCode.code) {
                console.log('something came out');
                $scope.codeOne = returnedCode;
                toastr.clear();
              } else {
                toastr.clear();
                console.log('nothing came out');
                toastr.info('This code snippet has not been created. Start typing, then click "Save"', 'Create snippet!', { timeOut: 8000 });
                $scope.codeOne = {
                  name: language,
                  code: ''
                }
              }
            })

          // console.log($scope.codeOne);
          $scope.refreshOne = false;
        })
    };

    $scope.codeTwoChanged = function(language) {
      codeObject.$loaded()
        .then(function() {
          // toastr.success('Running to fetch the code');
          $scope.refreshTwo = true;
          var returnedCode = loadLanguage(language);
          returnedCode
            .$loaded()
            .then(function() {
              if (returnedCode.code) {
                console.log('something came out');
                $scope.codeTwo = returnedCode;
                toastr.clear();
              } else {
                toastr.clear();
                console.log('nothing came out');
                toastr.info('This code snippet has not been created. Start typing, then click "Save"', 'Create snippet!', { timeOut: 8000 });
                $scope.codeTwo = {
                  name: language,
                  code: ''
                }
              }
            })

          // console.log($scope.codeTwo);
          $scope.refreshOne = false;
        })
    };

    function loadLanguage(language) {
      return $firebaseObject(snippetRef.child(language));
    };

    $scope.updateCode = function() {
      var updateData = {
        title: $scope.formData.title,
        description: $scope.formData.description,
        updatedAt: now
      }

      ref.child('codes')
        .child($stateParams.codeId)
        .update(updateData, function(error) {
          if (error) {
            toastr.error(error.message, error.reason)
          } else {
            toastr.success('Updated succefully');
          }
        })
    }
  }
]);
