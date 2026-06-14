import byte from "../lib/byte";

const TILE_SIZE_PIXELS = 8;
const SPRITE_ATTR_CGB_PALETTE_BIT = 0;
const SPRITE_ATTR_CGB_BANK_BIT = 3;
const SPRITE_ATTR_DMG_PALETTE_BIT = 4;
const SPRITE_ATTR_HORIZONTAL_FLIP_BIT = 5;
const SPRITE_ATTR_VERTICAL_FLIP_BIT = 6;
const SPRITE_ATTR_PRIORITY_BIT = 7;

/**
 * The Game Boy PPU can display up to 40 movable objects (or sprites), each 8×8 or 8×16 pixels. Because of a limitation of hardware, only ten objects can be displayed per scanline. Object tiles have the same format as BG tiles, but they are taken from tile blocks 0 and 1 located at $8000-8FFF and have unsigned numbering.
 */
export default class Sprite {
  constructor(id, x, y, is8x16, topTileId, attributes) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.is8x16 = is8x16;
    this.tileId = topTileId;
    this.attributes = attributes;
  }

  tileIdFor(insideY) {
    let index = +(insideY >= TILE_SIZE_PIXELS);
    if (this.is8x16 && this.flipY) index = +!index;

    return this.tileId + index;
  }

  shouldRenderInScanline(scanline) {
    const diffY = this.diffY(scanline);

    return diffY >= 0 && diffY < this.height;
  }

  diffY(scanline) {
    return scanline - this.y;
  }

  get cgbBank() {
    return byte.getBit(this.attributes, SPRITE_ATTR_CGB_BANK_BIT);
  }

  get cgbPalette() {
    return byte.getBits(this.attributes, SPRITE_ATTR_CGB_PALETTE_BIT, 3);
  }

  get isInFrontOfBackground() {
    return !byte.getBit(this.attributes, SPRITE_ATTR_PRIORITY_BIT);
  }

  get flipX() {
    return byte.getFlag(this.attributes, SPRITE_ATTR_HORIZONTAL_FLIP_BIT);
  }

  get flipY() {
    return byte.getFlag(this.attributes, SPRITE_ATTR_VERTICAL_FLIP_BIT);
  }

  get dmgPaletteId() {
    return byte.getBit(this.attributes, SPRITE_ATTR_DMG_PALETTE_BIT);
  }

  get height() {
    return this.is8x16 ? 16 : 8;
  }
}
