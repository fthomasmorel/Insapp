app.controller('ValidationAssociation', ['$scope', '$resource', '$location', 'Session', 'configuration', function($scope, $resource, $location, Session, configuration) {
  var MyAssociations = $resource(configuration.api + '/association/:id/myassociations?token=:token');
  var Association = $resource(configuration.api + '/association/:id?token=:token');
  var Post = $resource(configuration.api + '/post/:id?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
  };

  $scope.allAssocations = []

  MyAssociations.query({id:Session.getAssociation(), token:Session.getToken()}, function(assosId) {
    for (assoId of assosId){
      Association.get({id:assoId, token:Session.getToken()}, function(association){
        $scope.allAssocations.push(association)
        $scope.allAssocations.sort(function(a, b){
          if(a.name < b.name) return -1;
          if(a.name > b.name) return 1;
          return 0;
        });
        $scope.myAssociations = $scope.allAssocations
      });
    }
  }, function(error) {
      $location.path('/login')
  });

  $scope.onclick = function(association) {
      $location.path('/myAssociation/' + association.ID)
  };

  $scope.search= function(val) {
    var results = $scope.allAssocations
    if(val.length >= 1) {
      results = results.filter(function(assos){
        return assos.name.toLowerCase().includes(val.toLowerCase())
      })
    }
    $scope.$apply(function () {
      $scope.myAssociations = results
    });
  }


}]);
