import hardware from "../hardware";
import Sprite from "./Sprite";
import Tile from "./Tile";

const WIDTH = 160;
const MAX_SPRITES = 40;
const MAX_SPRITES_PER_SCANLINE = 10;
const SPRITE_SIZE_BYTES = 4;
const SPRITE_BYTE_Y = 0;
const SPRITE_BYTE_X = 1;
const SPRITE_BYTE_TILE_ID = 2;
const SPRITE_BYTE_ATTRIBUTES = 3;

/**
 * Sprite renderer.
 */
export default class SpriteRenderer {
  constructor(ppu, memory) {
    this.ppu = ppu;
    this.memory = memory;
  }

  renderScanline() {
    const lcdc = this.ppu.registers.lcdc;
    if (!lcdc.showSprites || lcdc.needsWhiteFrame) return;

    const sprites = this._evaluate();
    this._render(sprites);
  }

  _evaluate() {
    const sprites = [];

    for (let spriteId = 0; spriteId < MAX_SPRITES; spriteId++) {
      const sprite = this._createSprite(spriteId);

      if (
        sprite.shouldRenderInScanline(this.ppu.scanline) &&
        sprites.length < MAX_SPRITES_PER_SCANLINE + 1
      ) {
        if (sprites.length < MAX_SPRITES_PER_SCANLINE) {
          sprites.push(sprite);
        } else {
          break;
        }
      }
    }

    // sprite priority: smaller X wins; if X matches, lower OAM index wins
    return sprites.sort((a, b) => a.x - b.x || a.id - b.id);
  }

  _render(sprites) {
    const y = this.ppu.scanline;
    const claimedPixels = new Uint8Array(WIDTH);

    for (let sprite of sprites) {
      const palette = sprite.dmgPaletteId
        ? this.ppu.registers.obp1
        : this.ppu.registers.obp0;
      const insideY = sprite.diffY(y);
      const tileInsideY = insideY % 8;
      const tile = new Tile(
        this.memory,
        sprite.tileIdFor(insideY),
        sprite.flipY ? 7 - tileInsideY : tileInsideY,
        this.memory.hardwareMode !== hardware.DMG ? sprite.bank : 0
      );

      for (let insideX = 0; insideX < 8; insideX++) {
        const colorIndex = tile.getColorIndex(
          sprite.flipX ? 7 - insideX : insideX
        );
        if (colorIndex === 0) continue;

        const x = sprite.x + insideX;
        if (x < 0 || x >= WIDTH || claimedPixels[x]) continue;

        claimedPixels[x] = 1;

        const isCoveredByBackground =
          !sprite.isInFrontOfBackground &&
          this.ppu.isBackgroundPixelOpaque(x, y);
        if (isCoveredByBackground) continue;

        this.ppu.plot(x, y, palette.colorFor(colorIndex));
      }
    }
  }

  _createSprite(id) {
    const oam = this.memory.oam;
    const lcdc = this.ppu.registers.lcdc;

    const is8x16 = lcdc.use8x16Sprites === 1;

    const address = id * SPRITE_SIZE_BYTES;
    const y = oam[address + SPRITE_BYTE_Y] - 16;
    const x = oam[address + SPRITE_BYTE_X] - 8;
    const tileIdByte = oam[address + SPRITE_BYTE_TILE_ID];
    const attributes = oam[address + SPRITE_BYTE_ATTRIBUTES];

    const tileId = is8x16 ? tileIdByte & ~1 : tileIdByte;

    return new Sprite(id, x, y, is8x16, tileId, attributes);
  }
}
