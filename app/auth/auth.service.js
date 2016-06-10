angular.module("codeSide")

.factory("Auth", function($firebaseAuth) {
  return $firebaseAuth();
});
