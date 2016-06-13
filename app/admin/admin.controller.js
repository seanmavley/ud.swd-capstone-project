angular.module('codeSide')

.controller('AdminController', function($scope, $firebaseObject, currentAuth, Auth) {
  // init empty formData object
  $scope.newPassword = ''
  $scope.formData = {};

  // bring in firebase db url
  var ref = firebase.database().ref();
  var userData = $firebaseObject(ref.child('users').child(currentAuth.uid)); // now at firebase.url/users/uid
  // prepopulate user form if any
  // when userData arrives

  $scope.authInfo = currentAuth.providerData[0];

  userData.$loaded()
    .then(function() {
      $scope.formData = userData;
    })

  $scope.updateUser = function() {
    if (!$scope.formData.fullname) {
      $scope.error = 'Please add full name'
    } else {
      console.log($scope.formData);
      userData.$loaded()
        .then(function() {
          ref
            .child('users')
            .child(currentAuth.uid)
            .set({
              email: currentAuth.email,
              fullname: $scope.formData.fullname,
              country: $scope.formData.country
            })
        })
      $scope.message = 'User profile saved';
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
})
