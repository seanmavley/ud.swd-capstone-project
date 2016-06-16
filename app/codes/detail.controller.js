angular.module('codeSide')

.controller('DetailController', function($scope, $state, $stateParams, DatabaseRef, $firebaseObject, $firebaseArray) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
  };

  var ref = DatabaseRef;
  var codeRef = ref.child('codes')
    .child($stateParams.codeId);

  var codeObject = $firebaseObject(codeRef);
  var snippetsArray = $firebaseArray(codeRef.child('snippets'));

  var langRef = ref.child('languages');
  var langObject = $firebaseObject(langRef);

  $scope.loading = true;
  $scope.editAllowed = true;
  $scope.id = $stateParams.codeId;

  $scope.codeOneChanged = function(language) {
    console.log('Code One changed with: ' + language);
  }

  $scope.saveLanguage = function(data) {
    saveLanguage(data);
  }

  function saveLanguage(data) {
    console.log(data);
    var update = {
      code: data.code
    }
    console.log(update);
    var toSave = ref.child('codes')
      .child($stateParams.codeId)
      .child('snippets')
      .child(data.name)
      .update(update);
    console.log('Thanks for saving this: ', toSave);
    return toSave;
  }

  $scope.enableEditing = function() {
    $scope.editorOptions.readOnly = false;
    $scope.editAllowed = false;
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
        $scope.refreshOne = true;
        console.log('Code One changed with: ' + language.toLowerCase());
        $scope.codeOne = loadLanguage(language);
        console.log($scope.codeOne);
        $scope.refreshOne = false;
      })
  }

  $scope.codeTwoChanged = function(language) {
    codeObject.$loaded()
      .then(function() {
        $scope.refreshTwo = true;
        console.log('Code One changed with: ' + language.toLowerCase());
        $scope.codeTwo = loadLanguage(language);
        console.log($scope.codeTwo);
        $scope.refreshOne = false;
      })
  }


  function loadLanguage(language) {
    var snippetRef = codeRef
      .child('snippets')
      .child(language)

    return $firebaseObject(snippetRef);
  }

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

})
