var app = angular.module('insapp', ['ngRoute','ngResource','ui.bootstrap.datetimepicker', 'ngFileUpload', 'ngDialog', 'ngFileUpload', 'ngLoadingOverlay','angular-spinkit']);

app.constant('configuration', {
  api: 'http://localhost:9010/api/v1',
  cdn: 'http://localhost:9010/cdn',
  baseUrl: '/web',
});
