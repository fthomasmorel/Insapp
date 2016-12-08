app.controller('MyEventReader', ['$scope', '$resource', '$routeParams', 'Session', '$location', 'ngDialog', 'fileUpload', '$loadingOverlay', 'configuration', function($scope, $resource, $routeParams, Session, $location, ngDialog, fileUpload, $loadingOverlay, configuration) {
  var Event = $resource(configuration.api + '/event/:id?token=:token', null, { 'update': { method:'PUT' } });

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
      return viewLocation === "myEvents";
  };

  $scope.master = (Session.getMaster() == 'true')
  $scope.eventImageIsDirty = false

  Event.get({id:$routeParams.id, token:Session.getToken()}, function(event) {
      event.nbParticipant = (event.participants != null ? event.participants.length : 0)
      $scope.eventImageFile = configuration.cdn + event.image
      $scope.oldEvent = event
      $scope.currentEvent = event
      $scope.currentEvent.imageUrl = configuration.cdn + event.image

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

}]);
