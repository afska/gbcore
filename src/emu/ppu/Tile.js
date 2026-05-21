import byte from "../lib/byte";

const VRAM_BASE_UNSIGNED = 0x8000;
const VRAM_BASE_SIGNED = 0x9000;
const TILE_SIZE_BYTES = 16;

export default class Tile {
  constructor(memory, tileId, y, useSignedTileMode = false) {
    // the "unsigned" addressing mode interprets the byte as an unsigned 8-bit number and starts from 0x8000
    let vramBase = VRAM_BASE_UNSIGNED;

    if (useSignedTileMode) {
      // the "signed" addressing mode interprets the byte as a signed 8-bit number and starts from 0x9000
      vramBase = VRAM_BASE_SIGNED;
      tileId = byte.toS8(tileId);
    }

    const address = vramBase + tileId * TILE_SIZE_BYTES + y * 2;

    this._lowRow = memory.read(address);
    this._highRow = memory.read(address + 1);
  }

  getColorIndex(x) {
    const bitNumber = 7 - x;
    const lowBit = byte.getBit(this._lowRow, bitNumber);
    const highBit = byte.getBit(this._highRow, bitNumber);

    return byte.buildU2(highBit, lowBit);
  }
}
