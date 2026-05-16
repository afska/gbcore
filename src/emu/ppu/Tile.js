import byte from "../lib/byte";

const PATTERN_TABLE_SIZE = 0x1000;
const TILE_SIZE_PIXELS = 8;
const TILE_TOTAL_BYTES = 16;

export default class Tile {
  constructor(ppu, patternTableId, tileId, y) {
    const startAddress = patternTableId * PATTERN_TABLE_SIZE;
    const firstPlane = tileId * TILE_TOTAL_BYTES;
    const secondPlane = firstPlane + TILE_TOTAL_BYTES / 2;

    this._lowRow = ppu.memory.read(startAddress + firstPlane + y);
    this._highRow = ppu.memory.read(startAddress + secondPlane + y);
  }

  getColorIndex(x) {
    const bitNumber = TILE_SIZE_PIXELS - 1 - x;
    const lowBit = byte.getBit(this._lowRow, bitNumber);
    const highBit = byte.getBit(this._highRow, bitNumber);

    return byte.buildU2(highBit, lowBit);
  }
}
