angular.module('codeSide')

.controller('CreateController', function($scope, $firebaseObject, $firebaseArray, DatabaseRef, Auth) {
  $scope.editorOptions = {
    lineWrapping: true,
    lineNumbers: true,
    readOnly: 'nocursor',
    mode: 'xml',
  };

  var currentAuth = Auth.$getAuth();

  var ref = DatabaseRef;
  var codeData = $firebaseArray(ref.child('codes'));

  $scope.addNew = function() {
    if ($scope.addForm.$invalid) {
      $scope.error = 'Please fill the form, all of it!';
    } else {
      codeData.$loaded()
        .then(function() {
          console.log($scope.formData);
          codeData.$add({
              title: $scope.formData.title,
              createdBy: currentAuth.uid,
              createdAt: new Date().getTime(),
              from: $scope.formData.from,
              from_code: $scope.formData.fromCode,
              to: $scope.formData.to,
              to_code: $scope.formData.toCode,
            })
            .then(function(added) {
              console.log(added);
            })
            .catch(function(error) {
              console.log(error);
            })
        })
    }
  }
})
