"use strict";

angular.module("minesweeper", [])

.constant("cellsInRow", 8)

.constant("cellCount", 64) // cellsInRow^2

.constant("mineCount", 11)

.constant("CELL_FLAGS", {
  None: 0, // no user flags
  Mine: 1, // cell marked as mine
  Unsure: 2, // cell is suspisious
  cycleFlag: function(flag) {
    return ++flag > 2 ? 0 : flag;
  }
})

.controller("MainController", function($scope, Game, CELL_FLAGS) {

  $scope.Game = Game;
  $scope.flags = CELL_FLAGS;

  $scope.onCellClick = function(cell) {
    Game.openCell(cell);
  };

  $scope.onCellRightClick = function(cell) {
    Game.cycleFlag(cell);
  };

  // starting a new game on controller construction
  Game.startNewGame();

});
