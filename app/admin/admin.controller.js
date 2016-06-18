angular.module('codeSide')

.controller('AdminController', function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
  // init empty formData object
  $scope.newPassword = ''
  $scope.formData = {};

  // bring in firebase db url
  var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid)); // now at firebase.url/users/uid

  userData.$loaded()
    .then(function() {
      $scope.authInfo = userData;
      $scope.formData = userData;
    })

  // retrieve codes created by 
  var query = DatabaseRef.child('codes').orderByChild('createdBy').equalTo(currentAuth.uid);
  var list = $firebaseArray(query);

  list.$loaded()
    .then(function(data) {
      console.log(data);
      $scope.list = data
    })
    .catch(function(error) {
      toastr.error(error.message);
    })

  $scope.updateUser = function() {
    if (!$scope.formData.displayName) {
      toastr.error('Please add full name');
    } else {
      console.log($scope.formData);
      userData.$loaded()
        .then(function() {
          DatabaseRef
            .child('users')
            .child(currentAuth.uid)
            .update({
              displayName: $scope.formData.displayName,
            })
        })
      toastr.info('User updated');
    }
  }

  $scope.updatePassword = function() {
    Auth.$updatePassword($scope.newPassword).then(function() {
      $scope.message = 'Password updated successfully';
      $scope.newPassword = '';
    }).catch(function(error) {
      $scope.error = error.message
    });
  }

  $scope.loadLanguages = function() {
    DatabaseRef
      .child('languages')
      .set({
        php: 'PHP',
        python: 'Python',
        csharp: 'C#',
        cpp: 'C++',
        javascript: 'Javascript',
        java: 'Java'
      }, function(error) {
        toastr.error(error.message, error.reason);
      })
  }
})
