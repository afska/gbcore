import Sprite from "../lib/ppu/Sprite";
import Tile from "./Tile";

const TILE_SIZE_PIXELS = 8;
const SPRITE_SIZE_BYTES = 4;
const SPRITE_BYTE_Y = 0;
const SPRITE_BYTE_TILE_ID = 1;
const SPRITE_BYTE_ATTRIBUTES = 2;
const SPRITE_BYTE_X = 3;
const SPRITE_8x16_PATTERN_TABLE_MASK = 0b1;
const SPRITE_8x16_TILE_ID_MASK = 0xfe;
const MAX_SPRITES = 64;
const MAX_SPRITES_PER_SCANLINE = 8;

export default class SpriteRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    if (!this.ppu.registers.ppuMask.showSprites) return;

    const sprites = this._evaluate();
    const buffer = this._render(sprites);
    this._draw(buffer);
  }

  _evaluate() {
    const sprites = [];

    for (let spriteId = 0; spriteId < MAX_SPRITES; spriteId++) {
      const sprite = this._createSprite(spriteId);

      if (sprite.shouldRenderInScanline(this.ppu.scanline)) {
        if (sprites.length < MAX_SPRITES_PER_SCANLINE) {
          sprites.push(sprite);
        } else {
          this.ppu.registers.ppuStatus.spriteOverflow = 1;
          break;
        }
      }
    }

    return sprites.reverse();
  }

  _render(sprites) {
    const y = this.ppu.scanline;
    const buffer = [];

    for (let sprite of sprites) {
      const insideY = sprite.diffY(y);
      const tileInsideY = insideY % TILE_SIZE_PIXELS;
      const tile = new Tile(
        this.ppu,
        sprite.patternTableId,
        sprite.tileIdFor(insideY),
        sprite.flipY ? TILE_SIZE_PIXELS - 1 - tileInsideY : tileInsideY
      );
      const paletteColors = this.ppu.getPaletteColors(sprite.paletteId);

      for (let insideX = 0; insideX < TILE_SIZE_PIXELS; insideX++) {
        const x = sprite.x + insideX;
        if (!this.ppu.registers.ppuMask.showSpritesInFirst8Pixels && x < 8)
          continue;

        const colorIndex = tile.getColorIndex(
          sprite.flipX ? TILE_SIZE_PIXELS - 1 - insideX : insideX
        );

        if (colorIndex > 0) {
          const color = paletteColors[colorIndex];
          buffer[x] = {
            x,
            color,
            isInFrontOfBackground: sprite.isInFrontOfBackground
          };

          if (
            sprite.id === 0 &&
            this.ppu.isBackgroundPixelOpaque(x, y) &&
            this.ppu.registers.ppuMask.showBackground &&
            this.ppu.registers.ppuMask.showSprites
          )
            this.ppu.registers.ppuStatus.sprite0Hit = 1;
        }
      }
    }

    return buffer;
  }

  _draw(buffer) {
    const y = this.ppu.scanline;

    for (let object of buffer) {
      if (!object) continue;

      const { x, color, isInFrontOfBackground } = object;
      const isBackgroundPixelOpaque = this.ppu.isBackgroundPixelOpaque(x, y);
      const shouldDraw = isInFrontOfBackground || !isBackgroundPixelOpaque;
      if (shouldDraw) this.ppu.plot(x, y, color);
    }
  }

  _createSprite(id) {
    const oamRam = this.ppu.memory.oamRam;
    const ppuCtrl = this.ppu.registers.ppuCtrl;

    const is8x16 = ppuCtrl.spriteSize === 1;

    const address = id * SPRITE_SIZE_BYTES;
    const yByte = oamRam[address + SPRITE_BYTE_Y];
    const tileIdByte = oamRam[address + SPRITE_BYTE_TILE_ID];
    const attributes = oamRam[address + SPRITE_BYTE_ATTRIBUTES];
    const x = oamRam[address + SPRITE_BYTE_X];

    const y = yByte + 1;
    const patternTableId = is8x16
      ? tileIdByte & SPRITE_8x16_PATTERN_TABLE_MASK
      : ppuCtrl.sprite8x8PatternTableId;
    const tileId = is8x16 ? tileIdByte & SPRITE_8x16_TILE_ID_MASK : tileIdByte;

    return new Sprite(
      this.ppu,
      id,
      x,
      y,
      is8x16,
      patternTableId,
      tileId,
      attributes
    );
  }
}
