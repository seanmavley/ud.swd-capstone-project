angular.module('codeSide')

.controller('DetailController', function($scope, $state, $stateParams, DatabaseRef, $firebaseObject, $firebaseArray) {
  // codemirror options
  // TODO dynamically change mode
  // to match language
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
  };

  // global ref to root of app db
  var ref = DatabaseRef;
  var codeRef = ref.child('codes')
    .child($stateParams.codeId);

  var codeObject = $firebaseObject(codeRef);
  var snippetsArray = $firebaseArray(codeRef.child('snippets'));

  var langRef = ref.child('languages');
  var langObject = $firebaseObject(langRef);

  $scope.loading = true;
  $scope.editAllowed = true;

  $scope.saveLanguage = function(data) {
    saveLanguage(data);
  }

  function saveLanguage(data) {
    console.log(data);
    var update = {
      $id: data.name,
      name: data.name,
      code: data.code
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

  $scope.enableEditing = function() {
    $scope.editorOptions.readOnly = false;
    $scope.editAllowed = !$scope.editAllowed;
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
        createdAt: new Date(codeObject.createdAt),
        snippets: codeObject.snippets
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
