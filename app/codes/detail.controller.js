angular.module('codeSide')

.controller('DetailController', function($scope, $state, $stateParams, DatabaseRef, $firebaseObject, $firebaseArray, Auth) {
  // codemirror options
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
  };

  $scope.loading = true;
  $scope.editAllowed = true;

  $scope.enableEditing = function() {
    $scope.editorOptions.readOnly = false;
    $scope.editAllowed = !$scope.editAllowed;
  }

  // global ref to root of app db
  var ref = DatabaseRef;
  var codeRef = ref.child('codes')
    .child($stateParams.codeId);

  var codeObject = $firebaseObject(codeRef);
  var snippetsArray = $firebaseArray(codeRef.child('snippets'));

  var langRef = ref.child('languages');
  var langObject = $firebaseObject(langRef);

  var currentAuth = Auth.$getAuth();

  if (currentAuth) {
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid));
    userData.$loaded()
      .then(function(data) {
        $scope.profile = data;
        console.log($scope.profile);
      })
  }

  $scope.saveLanguage = function(data) {
    if ($scope.profile) {
      saveLanguage(data);
    } else {
      toastr.error('You are not logged in', 'Log in first!');
    }
  }

  function saveLanguage(data) {
    console.log(data);
    var update = {
      // $id: data.name,
      name: data.name,
      code: data.code,
      createdAt: new Date().getTime(),
      createdBy: $scope.profile.username
    }
    console.log(update);
    var toSave = ref.child('codes')
      .child($stateParams.codeId)
      .child('snippets')
      .child(data.name)
      .update(update);

    console.log('Thanks for saving this: ', toSave);
    toastr.success('Changes saved!');
    return toSave;
  }


  langObject.$loaded()
    .then(function(data) {
      $scope.languages = data;
      console.log(data);
    });

  codeObject.$loaded()
    .then(function() {
      $scope.loading = false;
      $scope.formData = {
        createdBy: codeObject.createdBy,
        title: codeObject.title,
        createdAt: codeObject.createdAt,
        snippets: codeObject.snippets,
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
        toastr.success('Running to fetch the code');
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

        console.log($scope.codeOne);
        $scope.refreshOne = false;
      })
  };

  $scope.codeTwoChanged = function(language) {
    codeObject.$loaded()
      .then(function() {
        toastr.success('Running to fetch the code');
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

        console.log($scope.codeTwo);
        $scope.refreshOne = false;
      })
  };


  function loadLanguage(language) {
    var snippetRef = codeRef
      .child('snippets')
      .child(language)

    return $firebaseObject(snippetRef);
  };

  // codeObject.$bindTo($scope, "formData")
  //   .then(function() {
  //     console.log('bound');
  //     $scope.loading = false;
  //   });

  // codeRef
  //   .child($stateParams.codeId)
  //   .once('value', function(snap) {
  //     console.log(snap.val());
  //     $scope.data = snap.val();
  //   })

});
