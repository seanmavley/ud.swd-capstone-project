angular.module('codeSide')

.controller('DetailController', function($scope, $state, $stateParams, DatabaseRef, $firebaseObject) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
  };

  $scope.loading = true;
  $scope.editAllowed = true;
  $scope.id = $stateParams.codeId;

  $scope.codeOneChanged = function(language) {
    console.log('Code One changed with: ' + language);
  }

  $scope.saveLanguage = function() {
    console.log('Language saving was fired');
  }

  $scope.enableEditing = function() {
    $scope.editorOptions.readOnly = false;
    $scope.editAllowed = false;
  }

  var ref = DatabaseRef;
  var codeRef = ref.child('codes')
    .child($stateParams.codeId);

  var codeObject = $firebaseObject(codeRef);

  var langRef = ref.child('languages');
  var langObject = $firebaseObject(langRef);

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
        createdAt: new Date(codeObject.createdAt)
      }

      $scope.codeOne = loadLanguage('javascript');
      $scope.codeTwo = loadLanguage('python');
    })

  $scope.codeOneChanged = function(language) {
    codeObject.$loaded()
      .then(function() {
        console.log('Code One changed with: ' + language.toLowerCase());
        $scope.codeOne = loadLanguage(language);
        console.log($scope.codeOne);
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
