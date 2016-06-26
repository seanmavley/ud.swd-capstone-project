angular.module('codeSide')

.controller('AdminController', ['$scope', '$firebaseObject', '$firebaseArray', 'currentAuth', 'Auth', 'DatabaseRef', 
  function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
  // init empty formData object
  $scope.newPassword = ''
  $scope.formData = {};

  // bring in firebase db url
  var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid)); // now at firebase.url/users/uid

  userData.$loaded()
    .then(function() {
      if(!userData.emailVerified) {
        toastr.clear();
        toastr.error('You have not verified your email', 'Verify Email', { timeOut: 0 });
      };

      $scope.authInfo = userData;
      $scope.formData = userData;

      $scope.hideUsername = true; 

      if(!$scope.formData.username) {
        $scope.hideUsername = false;
        toastr.error('Please set your username. Once set, cannot be changed.', 'Username required!', { timeOut: 0});
      }

      // Check if password is set
      // if(!currentAuth.password) {
      //   toastr.info('Set password in order to log in');
      // }
    })

  // retrieve codes created by 
  var query = DatabaseRef.child('codes').orderByChild('uid').equalTo(currentAuth.uid);
  var list = $firebaseArray(query);

  list.$loaded()
    .then(function(data) {
      // console.log(data);
      $scope.list = data
    })
    .catch(function(error) {
      toastr.error(error.message);
    })

  $scope.sendVerifyEmail = function() {
    toastr.info('Sending email verification message to your email. Check inbox now!', 'Email Verification');
    currentAuth.sendEmailVerification();
  }

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
              username: $scope.formData.username,
              displayName: $scope.formData.displayName,
            })
        })
      $scope.hideUsername = true;
      toastr.clear();
      toastr.info('User updated');
    }
  }

  $scope.updatePassword = function() {
    Auth.$updatePassword($scope.newPassword).then(function() {
      toastr.success('Password updated successfully', 'Successful!');
      $scope.newPassword = '';
    }).catch(function(error) {
      toastr.error(error.message, error.reason);
    });
  }

  $scope.loadLanguages = function() {
    DatabaseRef
      .child('languages')
      .update({
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
}])
