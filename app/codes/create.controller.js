angular.module('codeSide')

.controller('CreateController', function($scope, $firebaseObject, DatabaseRef, Auth) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
    mode: 'xml',
  };

  var currentAuth = Auth.$getAuth();

  var ref = DatabaseRef;
  var codeData = $firebaseObject(ref.child('codes').child(currentAuth.uid))

  $scope.addNew = function() {
    if ($scope.addForm.$invalid) {
      $scope.error = 'Please fill the form, all of it!';
    } else {
      codeData.$loaded()
        .then(function() {
          codeData.title = $scope.formData.title;
          codeData.$save()
            .then(function(ref) {
              console.log('Saved it :' + ref.key )
            })
        })
      console.log($scope.formData);
      console.log(new Date().getTime());
    }
  }
})
