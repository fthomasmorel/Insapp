app.controller('LoginAssociation', ['$scope', '$resource', '$location', 'Session', 'ngDialog', 'configuration', function($scope, $resource, $location, Session, ngDialog, configuration) {
  var Login = $resource(configuration.api + '/login/association');

  $scope.currentLogin = {
    username : "",
    password : "",
    error : ""
  }

  if(Session.getToken() != null && Session.getAssociation() != null){
    $location.path('/myEvents')
  }else{
    $scope.login = false
  }

  $scope.login = function() {
      Login.save({}, $scope.currentLogin, function(auth){
        $scope.currentLogin.error = auth.error
        if (!auth.error) {
          Session.setToken(auth.token)
          Session.setAssociation(auth.associationID)
          Session.setMaster(auth.master)
          $location.path('/myEvents')
        }
      });
   };

}]);
