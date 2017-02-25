app.controller('CreatePost', ['$scope', '$resource', '$routeParams', 'fileUpload', 'Session', '$location', 'ngDialog', '$loadingOverlay', 'configuration', '$window', function($scope, $resource, $routeParams, fileUpload, Session, $location, ngDialog, $loadingOverlay, configuration, $window) {
  var Post = $resource(configuration.api + '/post?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === "myPosts";
  };

  String.prototype.isPromotion = function(str){
    var lastIndex = this.lastIndexOf(str);
    return (lastIndex == 1 && str.length == this.length-1)|| (lastIndex == 0 && str.length == this.length)
  }

  $scope.promotionNames = ["EII", "GM", "GMA", "GCU", "INFO", "SGM", "SRC", "STPI", "Personnel/Enseignant", "Alternant", "Sans Promotion"]
  $scope.showAdvancedSettings = false
  $scope.promotions = {
    "1STPI": true,
    "2STPI": true,
    "3EII": true,
    "4EII": true,
    "5EII": true,
    "3GM": true,
    "4GM": true,
    "5GM": true,
    "3GMA": true,
    "4GMA": true,
    "5GMA": true,
    "3GCU": true,
    "4GCU": true,
    "5GCU": true,
    "3INFO": true,
    "4INFO": true,
    "5INFO": true,
    "3SGM": true,
    "4SGM": true,
    "5SGM": true,
    "3SRC": true,
    "4SRC": true,
    "5SRC": true,
    "Personnel/Enseignant": true,
    "Alternant": true,
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
      likes       : [],
      enableNotification: true
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
          if ((key.includes(year) && year != 3) || key.includes(year+2) || (year == 1 && (key == "Alternant" || key == "Personnel/Enseignant" || key == "Sans Promotion"))) {
              $scope.promotions[key] = true
          }
      })
  }

  $scope.deselectYear = function(year){
      Object.keys($scope.promotions).forEach(function (key) {
          if ((key.includes(year) && year != 3) || key.includes(year+2) || (year == 1 && (key == "Alternant" || key == "Personnel/Enseignant" || key == "Sans Promotion"))) {
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

  $scope.searchGif = function(){
      $window.open('http://giphy.com', '_blank');
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

      $scope.currentPost.nonotification = !$scope.currentPost.enableNotification

    var promotions = Object.keys($scope.promotions).filter(function(promotion){
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


    if ($scope.currentPost.plateforms.length == 0 || $scope.currentPost.promotions.length == 0) {
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
