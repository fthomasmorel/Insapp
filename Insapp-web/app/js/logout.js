app.controller('LogoutAssociation', ['$location', 'Session', function($location, Session) {


  Session.destroyCredentials()
  $location.path('/login')


}]);
