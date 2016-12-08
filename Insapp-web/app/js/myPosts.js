app.controller('MyPosts', ['$scope', '$resource', '$location', 'Session', 'configuration', function($scope, $resource, $location, Session, configuration) {
  var Association = $resource(configuration.api + '/association/:id?token=:token');
  var Post = $resource(configuration.api + '/post/:id?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
  };

  $scope.isAllSetUp = false
  $scope.baseUrl = configuration.baseUrl

  Association.get({id:Session.getAssociation(), token:Session.getToken()}, function(assos) {
    $scope.allPosts = []
    $scope.isAllSetUp = (assos.profile && assos.profile != "")
    assos.posts = (assos.posts == null ? [] : assos.posts)
    for (postId of assos.posts){
      Post.get({id:postId, token:Session.getToken()}, function(post) {
        post.nbLikes = (post.likes != null ? post.likes.length : 0)
        post.nbComments = (post.comments != null ? post.comments.length : 0)
        post.associationName = assos.name
        $scope.allPosts.push(post)
        $scope.allPosts.sort(function(a, b){return new Date(a.date).getTime()-new Date(b.date).getTime()});
        $scope.myPosts = $scope.allPosts
      });
    }
  }, function(error) {
      Session.destroyCredentials()
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
