
app.config(['$loadingOverlayConfigProvider', 'configuration', function ($loadingOverlayConfigProvider, configuration) {
    $loadingOverlayConfigProvider.defaultConfig('<img style="display: block;margin-left: auto;margin-right: auto; width:50px" src="' + configuration.baseUrl + '/images/loader.gif"></img><h3>Chargement</h3>', 'rgba(0, 0, 0, 0.5)', '#fff');
  }
]);

app.config(function($routeProvider, $locationProvider, configuration) {
  $locationProvider.html5Mode(false);
  $routeProvider
        .when('/', {
          templateUrl: configuration.baseUrl + "/templates/login.html",
          controller:'LoginAssociation',
        })
        .when('/login', {
          templateUrl: configuration.baseUrl + "/templates/login.html",
          controller:'LoginAssociation',
        })
        .when('/logout', {
          templateUrl: configuration.baseUrl + "/templates/logout.html",
          controller:'LogoutAssociation',
        })
        .when('/myEvents', {
          templateUrl: configuration.baseUrl + "/templates/myEvents.html",
          controller:'MyEvents',
         })
        .when('/myPosts', {
          templateUrl: configuration.baseUrl + "/templates/myPosts.html",
          controller:'MyPosts',
        })
        .when('/myEvents/:id', {
          templateUrl: configuration.baseUrl + "/templates/myEventReader.html",
          controller:'MyEventReader',
         })
        .when('/myPosts/:id', {
          templateUrl: configuration.baseUrl + "/templates/myPostsReader.html",
          controller:'MyPostsReader',
        })
        .when('/myAssociation/:id', {
         templateUrl: configuration.baseUrl + "/templates/myAssociation.html",
         controller:'MyAssociation',
        })
        .when('/createEvent', {
         templateUrl: configuration.baseUrl + "/templates/createEvent.html",
         controller:'CreateEvent',
        })
        .when('/createPost', {
         templateUrl: configuration.baseUrl + "/templates/createPost.html",
         controller:'CreatePost',
        })
        .when('/users', {
         templateUrl: configuration.baseUrl + "/templates/users.html",
         controller:'Users',
        })
        .when('/validationEvent', {
         templateUrl: configuration.baseUrl + "/templates/validationEvent.html",
         controller:'ValidationEvent',
        })
        .when('/validationPost', {
         templateUrl: configuration.baseUrl + "/templates/validationPost.html",
         controller:'ValidationPost',
        })
        .when('/validationAssociation', {
         templateUrl: configuration.baseUrl + "/templates/validationAssociation.html",
         controller:'ValidationAssociation',
        })
        .when('/createAssociation', {
         templateUrl: configuration.baseUrl + "/templates/createAssociation.html",
         controller:'CreateAssociation',
        })
        .otherwise({
            template: 'does not exists'
        });
});

app.factory('Session', function () {

    var token = '';
    var associationID = '';
    var master = false;
    var loggedInCallback;

    return {
      destroyCredentials: function(){
        window.localStorage.removeItem("authToken");
        window.localStorage.removeItem("associationID");
        window.localStorage.removeItem("master");
        token = ''
        associationID = ''
        master = false
        loggedInCallback()
      },
      getToken: function () {
          token = window.localStorage.getItem("authToken");
          return token;
      },
      setToken: function (t) {
          window.localStorage.setItem("authToken", t);
          token = t;
      },
      setLoggedInCallback: function (f) {
          loggedInCallback = f
      },
      getAssociation: function () {
          associationID = window.localStorage.getItem("associationID");
          return associationID;
      },
      setAssociation: function (a) {
          window.localStorage.setItem("associationID", a);
          associationID = a;
      },
      setMaster: function(m){
        window.localStorage.setItem("master", m);
        master = m;
        loggedInCallback()
      },
      getMaster: function(){
        master = window.localStorage.getItem("master");
        return master;
      }
    };
});

app.directive('search', function () {
    return function ($scope, element) {
        element.bind("keyup", function (event) {
          var val = element.val();
          $scope.search(val);
        });
    };
});

app.service('fileUpload', ['$http', 'ngDialog',  function ($http, ngDialog) {
    this.uploadFileToUrl = function(file, uploadUrl, callback){
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(data, status, headers, config){
          callback(true, data)
        })
        .error(function(data, status, headers, config){
          callback(false, data)
        });
    }
}]);
