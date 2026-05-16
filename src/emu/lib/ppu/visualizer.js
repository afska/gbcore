const TEST_PALETTE = [0xffffffff, 0xffcecece, 0xff686868, 0xff000000];
const TILES_PER_PATTERN_TABLE = 256;
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const TILE_SIZE = 8;
const TILES_PER_ROW = SCREEN_WIDTH / TILE_SIZE;
const ROWS_PER_PATTERN_TABLE = Math.ceil(SCREEN_HEIGHT / TILES_PER_ROW);
const MARGIN = 14;

/** A debug visualizer. */
export default {
  drawPatternTables(ppu, Tile) {
    this._drawPatternTable(ppu, Tile, 0);
    this._drawPatternTable(ppu, Tile, 1);
  },

  _drawPatternTable(ppu, Tile, patternTableId) {
    const baseY =
      patternTableId * (ROWS_PER_PATTERN_TABLE + MARGIN) * TILE_SIZE;

    for (let tileId = 0; tileId < TILES_PER_PATTERN_TABLE; tileId++) {
      const startX = (tileId * TILE_SIZE) % SCREEN_WIDTH;
      const startY = Math.floor(tileId / TILES_PER_ROW) * 8;

      for (let y = 0; y < 8; y++) {
        const tile = new Tile(ppu, patternTableId, tileId, y);

        for (let x = 0; x < 8; x++) {
          const colorIndex = tile.getColorIndex(x);
          ppu.plot(startX + x, baseY + startY + y, TEST_PALETTE[colorIndex]);
        }
      }
    }
  }
};
