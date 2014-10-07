'use strict'

var wallet = angular.module('walletApp', [
  'ngRoute',
  'ngStorage',
  'walletApp.directives',
  'walletApp.controllers'
]);


wallet.config([
  '$routeProvider',
  function( $routeProvider ) {
    $routeProvider.when('/', {
      templateUrl: 'js/views/home.html',
      controller: 'WalletController'
    });

    $routeProvider.otherwise({redirectTo: '/'});
  }
]);
