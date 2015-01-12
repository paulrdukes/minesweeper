/*
 *  Cell class represents one cell on a minefild,
 *  holds all related to the cell data and most of the methods.
 */

"use strict";

angular.module("minesweeper")

.factory("Cell", function(CELL_FLAGS, cellsInRow) {

  function Cell(id) {

    // zero-based sequental cell number
    // counting from top left corner by cols then by rows
    this.id = id;
    // zero based row and col number
    this.row = Math.floor(id / cellsInRow);
    this.col = id % cellsInRow;

    this.isOpen = false;
    this.hasMine = false;
    this.isBlown = false; // will be true for the first mined cell clicked
    this.flag = CELL_FLAGS.None;
    this.minesAround = 0;
    this.icon = ''; // unicode character to show as cell icon
    this.neighbours = []; // 3-8 Cell instances adjacent to current cell

  }

  ////////////
  // Public //
  ////////////

  /**
   * Changes state of the cell to "open", if possible
   * @return {bool} false - if cell is already open, or can't be opened for other reason
   */
  Cell.prototype.open = function() {
    if (this.isOpen || this.flag === CELL_FLAGS.Mine) return false;
    this.isOpen = true;
    this.flag = CELL_FLAGS.none;

    this.setIcon();
    return true;
  };

  // Changes cell to the "game is over" state
  Cell.prototype.gameOver = function() {
    if (this.isOpen || !this.hasMine) return;
    this.flag = CELL_FLAGS.Mine;
    this.setIcon();
  };

  // Changes cell flags and icons in a cycle with every call
  Cell.prototype.cycleFlag = function() {
    if (this.isOpen) return;
    this.flag = CELL_FLAGS.cycleFlag(this.flag);
    this.setIcon();
  };


  /////////////
  // Private // (normally i would hide members below using one of techniques)
  /////////////

  // Call this after cell state/data was changed to set proper icon
  Cell.prototype.setIcon = function() {
    if (this.isOpen) {
      if (this.hasMine)
        this.icon = this.icons.bomb;
        else
          this.icon = (this.minesAround || '').toString();
        } else {
          this.icon = this.icons[this.flag];
        }
      };


  Cell.prototype.icons = {};
  Cell.prototype.icons[CELL_FLAGS.None] = '';
  Cell.prototype.icons[CELL_FLAGS.Mine] = '\uf024';
  Cell.prototype.icons[CELL_FLAGS.Unsure] = '\uf059';
  Cell.prototype.icons.bomb = '\uf1e2';

  return Cell;
});
