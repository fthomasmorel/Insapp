app.controller('CreatePost', ['$scope', '$resource', '$routeParams', 'fileUpload', 'Session', '$location', 'ngDialog', '$loadingOverlay', 'configuration', function($scope, $resource, $routeParams, fileUpload, Session, $location, ngDialog, $loadingOverlay, configuration) {
  var Post = $resource(configuration.api + '/post?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === "myPosts";
  };

  String.prototype.isPromotion = function(str){
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex == 0 && str.length == this.length-1)|| (lastIndex == 0 && str.length == this.length)
  }

  $scope.promotionNames = ["EII", "GM", "GMA", "GCU", "INFO", "SGM", "SRC", "STPI", "Personnel/Enseignant", "Sans Promotion"]
  $scope.showAdvancedSettings = false
  $scope.promotions = {
    "STPI1": true,
    "STPI2": true,
    "EII3": true,
    "EII4": true,
    "EII5": true,
    "GM3": true,
    "GM4": true,
    "GM5": true,
    "GMA3": true,
    "GMA4": true,
    "GMA5": true,
    "GCU3": true,
    "GCU4": true,
    "GCU5": true,
    "INFO3": true,
    "INFO4": true,
    "INFO5": true,
    "SGM3": true,
    "SGM4": true,
    "SGM5": true,
    "SRC3": true,
    "SRC4": true,
    "SRC5": true,
    "Personnel/Enseignant": true,
    "Sans Promotion": true,
  }

  $scope.plateforms = {
    "android": true,
    "iOS": true,
  }


  $scope.currentPost = {
      title       : "",
      association : Session.getAssociation(),
      description : "",
      image       : "",
      imageSize   : {},
      comments    : [],
      plateforms  : [],
      promotions  : [],
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

  $scope.select = function(promotion){
      Object.keys($scope.promotions).forEach(function (key) {
          if (key.isPromotion(promotion)) {
              $scope.promotions[key] = true
          }
      })
  }

  $scope.deselect = function(promotion){
      Object.keys($scope.promotions).forEach(function (key) {
          if (key.isPromotion(promotion)) {
              $scope.promotions[key] = false
          }
      })
  }

  $scope.selectYear = function(year){
      Object.keys($scope.promotions).forEach(function (key) {
          if ((key.includes(year) && year != 3) || key.includes(year+2) || (year == 1 && (key == "Personnel/Enseignant" || key == "Sans Promotion"))) {
              $scope.promotions[key] = true
          }
      })
  }

  $scope.deselectYear = function(year){
      Object.keys($scope.promotions).forEach(function (key) {
          if ((key.includes(year) && year != 3) || key.includes(year+2) || (year == 1 && (key == "Personnel/Enseignant" || key == "Sans Promotion"))) {
              $scope.promotions[key] = false
          }
      })
  }

  $scope.selectAllPromo = function(selected){
    Object.keys($scope.promotions).forEach(function (key) {
      $scope.promotions[key] = selected
    })
  }

  $scope.invertPromo = function(){
    Object.keys($scope.promotions).forEach(function (key) {
      $scope.promotions[key] = !$scope.promotions[key]
    })
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
    promotions = Object.keys($scope.promotions).filter(function(promotion){
        return $scope.promotions[promotion]
    })

    $scope.currentPost.promotions = []
    for (i in promotions) {
        promotion = promotions[i]
        if (promotion == "Sans Promotion") $scope.currentPost.promotions.push("")
        else $scope.currentPost.promotions.push(promotion.toUpperCase())
    }

    $scope.currentPost.plateforms = Object.keys($scope.plateforms).filter(function(plateform){
        return $scope.plateforms[plateform]
    })


    if $scope.currentPost.plateforms.length == 0 || $scope.currentPost.promotions == 0 {
        ngDialog.open({
            template: "<h2 style='text-align:center;'>Choisis au moins 1 promotion et 1 plateforme</h2>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
        return
    }

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
