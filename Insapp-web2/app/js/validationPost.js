app.controller('ValidationPost', ['$scope', '$resource', '$location', 'Session', 'configuration',function($scope, $resource, $location, Session, configuration) {
  var MyAssociations = $resource(configuration.api + '/association/:id/myassociations?token=:token');
  var Association = $resource(configuration.api + '/association/:id?token=:token');
  var Post = $resource(configuration.api + '/post/:id?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
  };

  $scope.allPosts = []
  $scope.myPosts = []

  MyAssociations.query({id:Session.getAssociation(), token:Session.getToken()}, function(assosId) {
    for (assoId of assosId){
      Association.get({id:assoId, token:Session.getToken()}, function(association){
        var posts = (association.posts != null ? association.posts : [])
        for (postId of posts){
          Post.get({id:postId, token:Session.getToken()}, function(post){
            post.nbLikes = (post.likes != null ? post.likes.length : 0)
            post.nbComments = (post.comments != null ? post.comments.length : 0)
            post.associationName = association.name
            $scope.allPosts.push(post)
            $scope.allPosts.sort(function(a, b){return new Date(b.date).getTime()-new Date(a.date).getTime()});
            $scope.myPosts = $scope.allPosts
          });
        }
      });
    }
  }, function(error) {
      $location.path('/login')
  });

  $scope.onclick = function(post) {
      $location.path('/myPosts/' + post.ID)
  };

  $scope.search= function(val) {
    var results = $scope.allPosts
    if(val.length >= 1) {
      results = results.filter(function(post){
        return post.title.toLowerCase().includes(val.toLowerCase()) || post.associationName.toLowerCase().includes(val.toLowerCase())
      })
    }
    $scope.$apply(function () {
      $scope.myPosts = results
    });
  }

}]);
