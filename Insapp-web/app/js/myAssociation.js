app.controller('MyAssociation', ['$scope', '$resource', 'Session', '$location', 'ngDialog', 'Upload', 'fileUpload', '$loadingOverlay', '$routeParams', 'configuration',
function($scope, $resource, Session, $location, ngDialog, Upload, fileUpload, $loadingOverlay, $routeParams, configuration) {
  var Association = $resource(configuration.api + '/association/:id?token=:token', null, { 'update': { method:'PUT' } });

  if(Session.getToken() == null || Session.getAssociation() == null){
    $location.path('/login')
  }

  $scope.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };

  $scope.coverPictureIsDirty = false
  $scope.profilePictureIsDirty = false

  if (!$routeParams.id || $routeParams.id === "me") {
    $scope.associationId = Session.getAssociation()
  }else{
    $scope.associationId = $routeParams.id
  }

  Association.get({id:$scope.associationId, token:Session.getToken()}, function(assos) {
    $scope.profilePictureFile = (assos.profile != null ? configuration.cdn + assos.profile : null)
    $scope.coverPictureFile = (assos.cover != null ? configuration.cdn + assos.cover : null)

    assos.profilePictureUrl = (assos.profile != null ? configuration.cdn + assos.profile : null)
    assos.coverPictureUrl = (assos.cover != null ? configuration.cdn + assos.cover : null)

    $scope.oldAssociation = assos
    $scope.currentAssociation = assos

    if (assos.palette && assos.palette.length > 1) {
      $scope.palette = assos.palette
      $scope.selectColor(assos.selectedcolor)
    }
  }, function(error) {
      Session.destroyCredentials()
      $location.path('/login')
  });

  $scope.monitorLength = function (field, maxLength) {
    if ($scope.currentAssociation[field] && $scope.currentAssociation[field].length && $scope.currentAssociation[field].length > maxLength) {
      $scope.currentAssociation[field] = $scope.currentAssociation[field].substring(0, maxLength);
    }
    if (field == "name" && $scope.currentAssociation[field]){
      $scope.currentAssociation[field] = $scope.currentAssociation[field].replace(/\s/g, '');
    }
  }

  $scope.distance = function(v1, v2){
      var i, d = 0;
      for (i = 0; i < v1.length; i++) {
          d += (v1[i] - v2[i])*(v1[i] - v2[i]);
      }
      return Math.sqrt(d);
  };

  $scope.$watch('coverPictureFile', function() {
    if ($scope.coverPictureFile && $scope.coverPictureFile != $scope.oldAssociation.coverPictureFile){

      var preview = document.querySelector('#coverPicture');
      var file    = $scope.coverPictureFile
      var reader  = new FileReader();

      $("#coverPicture").on('load',function(){
        if ($scope.coverPictureIsDirty){
          $scope.coverPictureIsDirty = false
          $scope.uploadImage($scope.coverPictureFile, null, function(response) {
            console.log(response)
            $scope.currentAssociation.cover = response.file
            $scope.currentAssociation.palette = response.colors
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

  $scope.$watch('profilePictureFile', function() {
    if ($scope.profilePictureFile && $scope.profilePictureFile != $scope.oldAssociation.profilePictureFile){
      var preview = document.querySelector('#profilePicture');
      var file    = $scope.profilePictureFile
      var reader  = new FileReader();

      $("#profilePicture").on('load',function(){
        if ($scope.profilePictureIsDirty){
          $scope.profilePictureIsDirty = false
          $scope.uploadImage($scope.profilePictureFile, null, function(response) {
            console.log(response)
            $scope.currentAssociation.profile = response.file
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
    var d1 = $scope.distance(bgColor, [51,51,51])
    var d2 = $scope.distance(bgColor, [255,255,255])
    fgColor = (d1 > d2 ? [51,51,51] : [255,255,255])
    $scope.currentAssociation.selectedcolor = radio
    $scope.currentAssociation.bgColor = rgbToHex(bgColor[0],bgColor[1],bgColor[2])
    $scope.currentAssociation.fgColor = rgbToHex(fgColor[0],fgColor[1],fgColor[2])
  }

  $scope.removeCoverPicture = function(){
    var preview = document.querySelector('#coverPicture');
    preview.src = null
    $scope.coverPictureIsDirty = true
    $scope.coverPictureFile = null
    $scope.palette = null
  }

  $scope.removeProfilePicture = function(){
    var preview = document.querySelector('#profilePicture');
    preview.src = null
    $scope.profilePictureIsDirty = true
    $scope.profilePictureFile = null
  }

  function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  $scope.hexToRgb = function(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    return [r,g,b];
  }

  $scope.uploadImage = function (file, fileName, completion) {
    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    var uploadUrl = configuration.api + '/image' + (fileName && fileName.length > 10 ? "/" + fileName : "") + '?token=' + Session.getToken();
    $scope.promise = fileUpload.uploadFileToUrl(file, uploadUrl, function(success, response){
      $loadingOverlay.hide()
      console.log(response)
      if(success){
        completion(response)
      }else{
        if (file === $scope.coverPictureFile){
          $scope.removeCoverPicture()
        }else{
          $scope.removeProfilePicture()
        }
        ngDialog.open({
            template: "<h2 style='text-align:center;'>Une erreur s'est produite :/</h2><p>" + response + "</p>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
      }
    });
  }

  $scope.updateAssociation = function() {
    $loadingOverlay.show()
    $("html, body").animate({ scrollTop: 0 }, "slow");
    Association.update({id:$scope.associationId, token:Session.getToken()}, $scope.currentAssociation, function(assos) {
        ngDialog.open({
            template: "<h2 style='text-align:center;'>L'association a bien été mise à jour</h2>",
            plain: true,
            className: 'ngdialog-theme-default'
        });
        $loadingOverlay.hide()
        $scope.currentAssociation = assos
    }, function(error) {
        Session.destroyCredentials()
        $location.path('/login')
    });
  }

}]);
