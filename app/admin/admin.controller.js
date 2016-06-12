angular.module('codeSide')

.controller('AdminController', function($scope, $firebaseObject, currentAuth, Auth) {
  var ref = firebase.database().ref();
  var userData = $firebaseObject(ref.child('users').child(currentAuth.uid));
  // prepopulate user form if any
  userData.$loaded()
    .then(function() {
      console.log(userData);
      $scope.formData = userData;
      $scope.formData.dob = new Date(userData.dob);
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
              fullname: $scope.formData.fullname,
              dob: new Date($scope.formData.dob).getTime(),
              country: $scope.formData.country
            })
        })
      $scope.message = 'User profile saved';
    }
  }

  $scope.user = currentAuth;

  $scope.updatePassword = function() {
    Auth.$updatePassword($scope.newPassword).then(function() {
      $scope.message = 'Successful';
    }).catch(function(error) {
      console.error("Error: ", error);
    });
  }
})
