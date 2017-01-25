app.controller('CreateEvent', ['$scope', '$resource', 'Session', '$location', 'Upload', 'fileUpload', 'ngDialog', '$loadingOverlay', 'configuration', function($scope, $resource, Session, $location, Upload, fileUpload, ngDialog, $loadingOverlay, configuration) {
  var Event = $resource(configuration.api + '/event?token=:token');

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

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

  $scope.currentEvent = {
      name        : "",
      association : Session.getAssociation(),
      description : "",
      image       : "",
      palette     : [],
      selectedcolor: 0,
      dateStart   : null,
      dateEnd     : null,
      promotions  : [],
      plateforms  : [],
      participants: [],
      bgColor     : "",
      fgColor     : ""
  }

  function distance(v1, v2){
    var i, d = 0;
    for (i = 0; i < v1.length; i++) {
      d += (v1[i] - v2[i])*(v1[i] - v2[i]);
    }
    return Math.sqrt(d);
  };

  $scope.monitorLength = function (field, maxLength) {
    if ($scope.currentEvent[field] && $scope.currentEvent[field].length && $scope.currentEvent[field].length > maxLength) {
      $scope.currentEvent[field] = $scope.currentEvent[field].substring(0, maxLength);
    }
  }

  $scope.$watch('eventImageFile', function() {
    if ($scope.eventImageFile){
      var preview = document.querySelector('#eventImage');
      var file    = $scope.eventImageFile
      var reader  = new FileReader();

      $("#eventImage").on('load',function(){
        $scope.uploadImage($scope.eventImageFile, null, function(response) {
          $scope.currentEvent.image = response.file
          $scope.currentEvent.palette = response.colors
          $scope.palette = response.colors
          $scope.selectColor(0)
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

  $scope.createEvent = function(isValid) {
    if (!isValid){ return }
    promotions = Object.keys($scope.promotions).filter(function(promotion){
      return $scope.promotions[promotion]
    })

    $scope.currentEvent.promotions = []
    for (i in promotions) {
      promotion = promotions[i]
      if (promotion == "Sans Promotion") $scope.currentEvent.promotions.push("")
      else $scope.currentEvent.promotions.push(promotion.toUpperCase())
    }

    $scope.currentEvent.plateforms = Object.keys($scope.plateforms).filter(function(plateform){
      return $scope.plateforms[plateform]
    })

    if ($scope.currentEvent.plateforms.length == 0 || $scope.currentEvent.promotions == 0) {
        ngDialog.open({
            template: "<h2 style='text-align:center;'>Choisis au moins 1 promotion et 1 plateforme</h2>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
        return
    }

    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    Event.save({token:Session.getToken()}, $scope.currentEvent, function(event) {
      ngDialog.open({
          template: "<h2 style='text-align:center;'>L'événement a bien été créé</h2>",
          plain: true,
          className: 'ngdialog-theme-default'
      });
      $scope.currentEvent = event
      $loadingOverlay.hide()
      $location.path('/myEvents')
    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
    });
  }

}]);
