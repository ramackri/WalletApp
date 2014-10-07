
/* Directives */

var directives = angular.module('walletApp.directives', ['ngRoute','ngSanitize','ngStorage']);

// event system
directives.directive('notification', [
  '$timeout',
  function( $timeout ) {
    return {
      restrict: 'E',
      templateUrl: 'js/views/notification.html',
      link: function( scope, elem, attrs ) {

        scope.$on('SEND_NOTIFICATION', function( event, message ) {
          scope.active       = true;
          scope.notification = message;

          // remove error after 3s
          $timeout(function() {
            scope.active = false;
          }, 3000);
        
        });
      }
    };
  }
]);

directives.directive('navigationBar', [
  '$rootScope',
  function( $rootScope ) {
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'js/views/navigation-bar.html',
      link: function( scope, element, attribute ) {

        scope.reset = function() {
          var r = confirm("Do you want to reset your Wallet?");
          if ( r ) {
            scope.$broadcast( 'RESET_WALLET' );
          }

        };
        
      }
    };
  }
]);

// Wallet 
directives.directive('wallet', [
  '$rootScope',
  '$localStorage',
  function( $rootScope, $localStorage ) {

    var ADDED    = 'in';
    var REMOVED = 'out';

    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'js/views/wallet.html',
      link: function( scope, element, attribute ) {

        // currencies as an array of objects which are scalable
        scope.currencies = [
          {
            "val": "Euro",
            "symbol": "€",
            "icon": "eur"
          }, {
            "val": "GBP",
            "symbol": "£",
            "icon": "gbp"
          } 
        ];

        // data should persist on a page refresh
        var currencyIdx      = $localStorage.activeCurrencyIdx || 0;
        scope.activeCurrency = scope.currencies[ currencyIdx ];

        scope.transitions    = $localStorage.transitions || [];
        scope.total          = $localStorage.total || 0;

        // checks if the text input is a number or not
        var isNotNumber = function() {
          if ( isNaN( scope.amount ) ) {
            scope.$emit( 'SEND_NOTIFICATION', 'please insert a Valid Number' );
            return true;
          }
          return false;
        };

        // checks if the grandTotal is negative
        var isTotalNegative = function() {
          if ( scope.total - scope.amount < 0 ) {
            scope.$emit( 'SEND_NOTIFICATION', 'The wallet can never contain a negative amount' );
            return true;
          }
          return false;
        };


        var pushTransition = function( type ) {
		var description ="ADDED";
		 if(type !="in")
		 {
			description = "REMOVED";
		 }
		
          scope.transitions.push({
            "type": type,
            "amount": scope.amount,
            "date": new Date(),
			"description": description
          });

          $localStorage.transitions = scope.transitions;
        };

        scope.setCurrency = function( index ) {
          scope.activeCurrency = scope.currencies[ index ];
          $localStorage.activeCurrencyIdx = index;
        };

        scope.addAmount = function() {
          if ( isNotNumber() ) {
            return;
          }
          scope.total += scope.amount;
          $localStorage.total = scope.total;

          pushTransition( ADDED );
        };

        scope.removeAmount = function() {
          if ( isNotNumber() ) {
            return;
          }
          if ( isTotalNegative() ) {
            return;
          }

          scope.total -= scope.amount;
          $localStorage.total = scope.total;

          pushTransition( REMOVED );
        };

        scope.$on('RESET_WALLET', function( event ) {
          scope.transitions.splice(0, scope.transitions.length);
          $localStorage.transitions.splice(0, $localStorage.transitions.length);
          
          scope.total          = 0;
           $localStorage.total = null;
        });

      }
    };
  }
]);
