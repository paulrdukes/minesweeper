"use strict";

angular.module("minesweeper")

.directive('ngRightClick', function($parse, $document) {
  return function(scope, element, attrs) {

    var fn = $parse(attrs.ngRightClick);

    var handler = function(event) {
      event.preventDefault();
      scope.$apply(function() {
        fn(scope, {
          $event: event
        });
      });
    };

    element.bind('contextmenu', handler);

    scope.$on('$destroy', function() {
      $document.unbind('contextmenu', handler);
    });
  };
});
