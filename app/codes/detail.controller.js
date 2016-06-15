angular.module('codeSide')

.controller('DetailController', function($scope, $state, $stateParams, DatabaseRef, $firebaseObject) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
    mode: 'xml',
  };
  $scope.loading = true;

  $scope.saveLanguage = function() {
    console.log('Language was fired');
  }

  $scope.id = $stateParams.codeId;

  var ref = DatabaseRef;
  var codeRef = ref.child('codes')
    .child($stateParams.codeId);

  var codeObject = $firebaseObject(codeRef);

  codeObject.$loaded()
    .then(function() {
      $scope.loading = false;
      $scope.formData = {
        createdBy: codeObject.createdBy,
        title: codeObject.title,
        createdAt: codeObject.createdAt
      }

      $scope.codeOne = loadLanguage('javascript');
      $scope.codeTwo = loadLanguage('python');

    })


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
