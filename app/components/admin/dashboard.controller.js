angular.module('codeSide')

.controller('DashboardController', ['$scope', '$firebaseObject', '$firebaseArray', 'currentAuth', 'Auth', 'DatabaseRef',
  function($scope, $firebaseObject, $firebaseArray, currentAuth, Auth, DatabaseRef) {
    // init empty formData object
    $scope.newPassword = ''
    $scope.formData = {};

    // bring in firebase db url
    var userData = $firebaseObject(DatabaseRef.child('users').child(currentAuth.uid)); // now at firebase.url/users/uid

    userData.$loaded()
      .then(function() {
        if (!currentAuth.emailVerified) {
          $scope.notVerified = true;
          toastr.clear();
          toastr.error('You have not verified your email', 'Verify Email', { timeOut: 0 });
        };
        $scope.authInfo = userData;
        $scope.formData = userData;

        $scope.hideUsername = true;

        if (!$scope.formData.username) {
          $scope.hideUsername = false;
          toastr.error('Please set your username. Once set, cannot be changed.', 'Username required!', { timeOut: 0 });
        }
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
              }, function(error) {
                if (!error) {
                  $scope.hideUsername = true;
                  toastr.clear();
                  toastr.info('User updated');
                } else {
                  toastr.clear();
                  toastr.error('You cannot edit your username. ' +
                    'Username is set once', 'Not allowed', { timeOut: 0 });
                }
              })
          })
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
  }
])
