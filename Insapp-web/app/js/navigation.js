app.controller('NavigationController', ['$scope', 'Session', '$location', 'configuration', function($scope, Session, $location, configuration) {
    $scope.master = null;
    $scope.baseUrl = configuration.baseUrl
    $scope.isLoggedIn = isLoggedIn()
    Session.setLoggedInCallback(isLoggedIn)

    function isLoggedIn(){
      $scope.master = (Session.getMaster() == 'true')
      $scope.loggedIn = Session.getToken() != null && Session.getAssociation() != null
    }

    $scope.isActive = function (viewLocation) {
      return $location.path().indexOf(viewLocation) > -1
    };
}]);
