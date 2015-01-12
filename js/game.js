/*
 * Game service controls the entire game proccess
 */

"use strict";

angular.module("minesweeper")

.service("Game", function($rootScope,Cell, cellsInRow, cellCount, mineCount, CELL_FLAGS) {
  var self = this;

  self.STATES = {
    Started: 0,
    MinesPlanted: 1,
    Over: 2
  };

  self.gameState = self.STATES.Started;
  self.gameWon = null; // null means game result is unknown yet
  self.cells = []; // Cell instances
  self.mines = []; // cells with mines (cached subset of self.cells)
  self.minesLeft = mineCount;
  self.timer = 0;
  self.timerId = null;
  // resets and initializes all the game variables
  self.startNewGame = function() {
    stopTimer();
    self.gameState = self.STATES.Started;
    self.gameWon = null;
    self.minesLeft = mineCount;
    self.timer = 0;
    self.cells = [];
    self.mines = [];

    // creating Cell instances.
    for (var i = 0; i < cellCount; i++) {
      var cell = new Cell(i);
      self.cells[cell.row] = self.cells[cell.row] || [];
      self.cells[cell.row][cell.col] = cell;
    }
  };

  /**
   * Opens cell on the field in respond of clicking on it.
   * Or does nothing if cell is already open
   * @param {Cell} cell - clicked one
   */
  self.openCell = function(cell) {
    if (self.gameState === self.STATES.Over) return;
    if (self.gameState === self.STATES.Started) {
      plantMines(cell);
      startTimer();
    }
    // game state changed only if open() returns true
    if (!cell.open()) return;
    // BOOM
    if (cell.hasMine) {
      // showing all mines
      self.mines.forEach(function(m) {
        m.open();
      });
      cell.isBlown = true;
      endGame(false);
      return;
    }
    // if this cell has no mines around it
    if (cell.minesAround === 0) {
      openArea(cell);
    }
    // game over - win
    if (areAllMinesFound()) {
      endGame(true);
      var id = 0;
      while ((cell = getCellById(id++)) !== null)
        if (!cell.isOpen && !cell.hasMine) cell.gameOver();
    }
  };

  /**
   * change cell's flag to next one
   * @param {Cell} cell
   */
  self.cycleFlag = function(cell) {
    if (self.gameState === self.STATES.Over) return;
    cell.cycleFlag();
    if (cell.flag === CELL_FLAGS.Mine) self.minesLeft--;
    if (cell.flag === CELL_FLAGS.Unsure) self.minesLeft++;
  };


  ////////////
  //Private //
  ////////////

  /**
   * plants mines on the field skipping passed cell (the clicked one)
   * @param {Cell} exceptCell - first cell clicked in this game session
   */
  function plantMines(exceptCell) {
    // building list of mined cell candidates
    var potentialMines = _.range(0, cellCount);
    _.pull(potentialMines, exceptCell.id);
    // planting mines
    for (var i = 0; i < mineCount; i++) {
      var cellId = potentialMines[Math.floor(Math.random() * potentialMines.length)];
      _.pull(potentialMines, cellId);
      var minedCell = getCellById(cellId);
      minedCell.hasMine = true;
      self.mines.push(minedCell);
    }
    setUpNeghbourCells();
    self.gameState = self.STATES.MinesPlanted;
  }


  // check if game is over due to all mines found
  // returns true if we can end game due to win
  function areAllMinesFound() {
    var id = 0,
      cell;

    while ((cell = getCellById(id++)) !== null)
      if (!cell.isOpen && !cell.hasMine) return false;

    return true;
  }

  /**
   * chain reaction to open several cells
   * if user clicked on a cell with no mines around it
   * @param {Cell} cell - clicked one
   */
  function openArea(cell) {
    cell.neighbours.forEach(function(neighbour) {
      if (neighbour.isOpen || neighbour.hasMine || neighbour.flag === CELL_FLAGS.Mine) return;
      neighbour.open();
      if (neighbour.minesAround === 0) openArea(neighbour);
    });
  }

  function endGame(win) {
    self.gameState = self.STATES.Over;
    self.gameWon = !!win;
    stopTimer();
  }

  function startTimer() {
    stopTimer();
    self.startTick = Date.now();
    self.timerId = window.setInterval(tickTimer, 1000);
  }

  function stopTimer() {
    if (self.timerId === null) return;
    window.clearInterval(self.timerId);
    self.timerId = null;
  }

  // timers drift so we calculate ellapsed time manually
  function tickTimer() {
    $rootScope.$apply(function(){
      self.timer = Math.floor((Date.now() - self.startTick) / 1000);
    });
  }

  // finds cell by id in 2d array
  function getCellById(id) {
    if (id >= cellCount) return null;
    return self.cells[Math.floor(id / cellsInRow)][id % cellsInRow];
  }

  // part of a new game set up process, moved out for readability
  function setUpNeghbourCells() {
    // traversing all cells
    for (var row = 0; row < cellsInRow; row++)
      for (var col = 0; col < cellsInRow; col++) {
        // finding my neighbours
        //  northwest, north, northeast, east, southeast, south, southwest, west
        var coords = [
          [row - 1, col - 1],
          [row - 1, col],
          [row - 1, col + 1],
          [row, col + 1],
          [row + 1, col + 1],
          [row + 1, col],
          [row + 1, col - 1],
          [row, col - 1]
        ];
        // removing invalid coords (outside of game field)
        _.remove(coords, cellHasWrongCoords);
        // filling neighbour  lists and mine counts
        _.forEach(coords, processNeighbourCell, self.cells[row][col]);
      }
  }

  // @param {[]} coords - row and col
  // @returns true or false
  function cellHasWrongCoords(coords) {
    return coords[0] === -1 || coords[0] === cellsInRow || coords[1] === -1 || coords[1] === cellsInRow;
  }

  // should be called with binding to Cell instance
  function processNeighbourCell(nbrCoords) {
    /* jshint validthis: true */
    var nbr = self.cells[nbrCoords[0]][nbrCoords[1]];
    this.neighbours.push(nbr);

    if (!this.hasMine && nbr.hasMine) this.minesAround++;
  }


});
