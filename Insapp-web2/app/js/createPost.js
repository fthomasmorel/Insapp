app.controller('CreatePost', ['$scope', '$resource', '$routeParams', 'fileUpload', 'Session', '$location', 'ngDialog', '$loadingOverlay', 'configuration', function($scope, $resource, $routeParams, fileUpload, Session, $location, ngDialog, $loadingOverlay, configuration) {
  var Post = $resource(configuration.api + '/post?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === "myPosts";
  };

  $scope.currentPost = {
      title       : "",
      association : Session.getAssociation(),
      description : "",
      image       : "",
      imageSize   : {},
      comments    : [],
      likes       : []
  }

  $scope.monitorLength = function (field, maxLength) {
    if ($scope.currentPost[field] && $scope.currentPost[field].length && $scope.currentPost[field].length > maxLength) {
      $scope.currentPost[field] = $scope.currentPost[field].substring(0, maxLength);
    }
  }

  $scope.$watch('postImageFile', function() {
    if ($scope.postImageFile){
      var preview = document.querySelector('#postImage');
      var file    = $scope.postImageFile
      var reader  = new FileReader();

      $("#postImage").on('load',function(){
        $scope.uploadImage($scope.postImageFile, null, function(response) {
          console.log(response)
          $scope.currentPost.image = response.file
          $scope.currentPost.imageSize = response.size
        })
      });

      reader.onloadend = function () {
        preview.src = reader.result
      }

      if (file) {
        reader.readAsDataURL(file);
      }
    }
  });

  $scope.removeFile = function(){
    var preview = document.querySelector('#postImage');
    preview.src = null
    $scope.postImageFile = null
  }


  $scope.uploadImage = function (file, fileName, completion) {
    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    var uploadUrl = configuration.api + '/image' + (fileName && fileName.length > 10 ? "/" + fileName : "") + '?token=' + Session.getToken();
    $scope.promise = fileUpload.uploadFileToUrl(file, uploadUrl, function(success, response){
      $loadingOverlay.hide()
      console.log(success)
      if(success){
        completion(response)
      }else{
        $scope.removeFile()
        ngDialog.open({
            template: "<h2 style='text-align:center;'>Une erreur s'est produite :/</h2><p>" + response + "</p>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
      }
    });
  }

  $scope.createPost = function() {
    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    console.log($scope.currentPost)
    Post.save({token:Session.getToken()}, $scope.currentPost, function(post) {
      ngDialog.open({
          template: "<h2 style='text-align:center;'>Le post a bien été créé</h2>",
          plain: true,
          className: 'ngdialog-theme-default'
      });
      $loadingOverlay.hide()
      $scope.currentPost = post
      $location.path('/myPosts')
    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
    });
  }
}]);
