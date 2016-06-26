angular.module('codeSide')

.controller('DetailController', ['$scope', '$state',
  '$stateParams', 'DatabaseRef', '$firebaseObject',
  '$firebaseArray', 'Auth',
  function($scope, $state, $stateParams, DatabaseRef, $firebaseObject, $firebaseArray, Auth) {
    // codemirror options
    $scope.editorOptions = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };
    // for revisions
    $scope.revisionsShow = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: 'nocursor',
    };

    $scope.revisionsAdd = {
      lineWrapping: true,
      lineNumbers: true,
      readOnly: false,
    };

    var now = new Date().getTime();

    $scope.loading = true;
    $scope.editAllowed = true;
    $scope.showRevOne = false;
    $scope.showRevTwo = false;

    $scope.revisionTwo = {};
    $scope.revisionOne = {};

    $scope.enableAlternative = function(number) {
      if (number == 'one') {
        $scope.showRevOne = !$scope.showRevOne;
      }

      if (number == 'two') {
        $scope.showRevTwo = !$scope.showRevTwo;
      }
    };

    // TODO: get it fixed.
    $scope.addAlternative = function(revision, code) {
      if (revision.code) {
        DatabaseRef.child('revision')
          .child($stateParams.codeId)
          .push({
            codeId: $stateParams.codeId,
            code: revision.code,
            createdBy: $scope.profile.username,
            uid: currentAuth.uid,
            createdAt: now,
            language: code.name
          })
        toastr.success('Added your code!', 'Successful');
      } else {
        toastr.error('Kindly add code', 'Code missing!');
      }
    }

    $scope.enableEditing = function() {
      $scope.editorOptions.readOnly = false;
      $scope.editAllowed = !$scope.editAllowed;
    }

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
            console.log(data);
            $scope.revisionTwo = data;
          })
      })

    // Save changes to language
    $scope.saveLanguage = function(data) {
      if ($scope.profile) {
        saveLanguage(data)
      } else {
        toastr.error('You are not logged in', 'Log in first!');
      }
    }

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
    }

    langObject.$loaded()
      .then(function(data) {
        $scope.languages = data;
        // console.log(data);
      });

    codeObject.$loaded()
      .then(function() {
        $scope.loading = false;
        $scope.formData = {
          createdBy: codeObject.createdBy,
          title: codeObject.title,
          createdAt: codeObject.createdAt,
          description: codeObject.description
        }

        snippetsArray.$loaded()
          // default languages to load on load
          // based on first two items in snippets array
          .then(function(snippets) {
            $scope.codeOne = loadLanguage(snippets.$keyAt(0));
            $scope.codeTwo = loadLanguage(snippets.$keyAt(1));
          })
      })

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
              } else {
                console.log('nothing came out');
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
              } else {
                console.log('nothing came out');
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
  }
]);
