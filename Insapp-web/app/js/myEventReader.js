app.controller('MyEventReader', ['$scope', '$resource', '$routeParams', 'Session', '$location', 'ngDialog', 'fileUpload', '$loadingOverlay', 'configuration', function($scope, $resource, $routeParams, Session, $location, ngDialog, fileUpload, $loadingOverlay, configuration) {
  var Event = $resource(configuration.api + '/event/:id?token=:token', null, { 'update': { method:'PUT' } });
  var Comment = $resource(configuration.api + '/event/:id/comment/:commentId?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === "myEvents";
  };

  $scope.master = (Session.getMaster() == 'true')
  $scope.eventImageIsDirty = false

    String.prototype.isPromotion = function(str){
      var lastIndex = this.lastIndexOf(str);
      return (lastIndex == 1 && str.length == this.length-1)|| (lastIndex == 0 && str.length == this.length)
    }

    $scope.promotionNames = ["EII", "GM", "GMA", "GCU", "INFO", "SGM", "SRC", "STPI", "Personnel/Enseignant", "Sans Promotion"]
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
      "Sans Promotion": true,
    }

    $scope.plateforms = {
      "android": true,
      "iOS": true,
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


  Event.get({id:$routeParams.id, token:Session.getToken()}, function(event) {
      event.nbParticipant = (event.participants != null ? event.participants.length : 0)
      $scope.eventImageFile = configuration.cdn + event.image
      $scope.oldEvent = event
      $scope.currentEvent = event
      $scope.currentEvent.imageUrl = configuration.cdn + event.image

      for (promo in $scope.promotions) {
          $scope.promotions[promo] = $scope.currentEvent.promotions.includes(promo.toUpperCase())
          if (promo == "Sans Promotion") $scope.promotions[promo] = $scope.currentEvent.promotions.includes("")
      }

      for (plateform in $scope.plateforms) {
          $scope.plateforms[plateform] = $scope.currentEvent.plateforms.includes(plateform)
      }

      if (event.palette && event.palette.length > 1) {
        $scope.palette = event.palette
        $scope.selectColor(event.selectedcolor)
      }

    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
  });

  $scope.isActive = function (viewLocation) {
    return viewLocation === "myEvents"
  };

  $scope.monitorLength = function (field, maxLength) {
    if ($scope.currentEvent[field] && $scope.currentEvent[field].length && $scope.currentEvent[field].length > maxLength) {
      $scope.currentEvent[field] = $scope.currentEvent[field].substring(0, maxLength);
    }
  }

  function distance(v1, v2){
      var i, d = 0;
      for (i = 0; i < v1.length; i++) {
          d += (v1[i] - v2[i])*(v1[i] - v2[i]);
      }
      return Math.sqrt(d);
  };


  $scope.$watch('eventImageFile', function() {
    if ($scope.eventImageFile && $scope.eventImageFile != $scope.oldEvent.eventImageFile){

      var preview = document.querySelector('#eventImage');
      var file    = $scope.eventImageFile
      var reader  = new FileReader();

      $("#eventImage").on('load',function(){
        if ($scope.eventImageIsDirty){
          $scope.eventPictureIsDirty = false
          $scope.uploadImage($scope.eventImageFile, null, function(response) {
            $scope.currentEvent.image = response.file
            $scope.currentEvent.palette = response.colors
            $scope.palette = response.colors
            $scope.selectColor(0)
          })
        }
      });

      reader.onloadend = function () {
        preview.src = reader.result
      }

      if (file) {
        reader.readAsDataURL(file);
      }
    }
  });

  $scope.selectColor = function(radio){
    var bgColor, fgColor = []
    bgColor = $scope.palette[radio]
    var d1 = distance(bgColor, [51,51,51])
    var d2 = distance(bgColor, [255,255,255])
    fgColor = (d1 > d2 ? [51,51,51] : [255,255,255])
    $scope.currentEvent.selectedcolor = radio
    $scope.currentEvent.bgColor = rgbToHex(bgColor[0],bgColor[1],bgColor[2])
    $scope.currentEvent.fgColor = rgbToHex(fgColor[0],fgColor[1],fgColor[2])
  }

  function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  $scope.removeFile = function(){
    var preview = document.querySelector('#eventImage');
    preview.src = null
    $scope.eventImageIsDirty = true
    $scope.eventImageFile = null
    $scope.palette = null
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

  $scope.updateEvent = function() {

      var promotions = Object.keys($scope.promotions).filter(function(promotion){
        return $scope.promotions[promotion]
      })

      $scope.currentEvent.promotions = []
      for (i in promotions) {
        var promotion = promotions[i]
        if (promotion == "Sans Promotion") $scope.currentEvent.promotions.push("")
        else $scope.currentEvent.promotions.push(promotion.toUpperCase())
      }

      $scope.currentEvent.plateforms = Object.keys($scope.plateforms).filter(function(plateform){
        return $scope.plateforms[plateform]
      })

      if ($scope.currentEvent.plateforms.length == 0 || $scope.currentEvent.promotions.length == 0) {
          ngDialog.open({
              template: "<h2 style='text-align:center;'>Choisis au moins 1 promotion et 1 plateforme</h2>",
              plain: true,
              className: 'ngdialog-theme-default'
          });
          return
      }

    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    Event.update({id:$scope.currentEvent.ID, token:Session.getToken()}, $scope.currentEvent, function(event) {
        ngDialog.open({
            template: "<h2 style='text-align:center;'>L'événément à été mis à jour</h2>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
        $loadingOverlay.hide()
        $scope.currentEvent = event
        $location.path('/myEvents')
    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
    });
  }

  $scope.deleteEvent = function() {
    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    Event.remove({id:$scope.currentEvent.ID, token:Session.getToken()}, function(event) {
      ngDialog.open({
          template: "<h2 style='text-align:center;'>L'événément à été supprimé</h2>",
          plain: true,
          className: 'ngdialog-theme-default'
      });
      $loadingOverlay.hide()
      $location.path('/myEvents')
    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
    });
  }


    $scope.deleteComment = function(commentId) {
      Comment.remove({id:$scope.currentEvent.ID, commentId: commentId, token:Session.getToken()}, function(event) {
        event.nbComments = (event.comments != null ? event.comments.length : 0)
        event.nbParticipant = (event.participants != null ? event.participants.length : 0)
        $scope.currentEvent = event
        $scope.currentEvent.imageUrl = configuration.cdn + event.image
        $scope.oldEvent = event
        ngDialog.open({
            template: "<h2 style='text-align:center;'>Le commentaire a été supprimé</h2>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
      }, function(error) {
          Session.destroyCredentials()
          $location.path('/login')
      });
    }

}]);
