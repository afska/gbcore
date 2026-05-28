import Sprite from "./Sprite";
import Tile from "./Tile";

const MAX_SPRITES = 40;
const MAX_SPRITES_PER_SCANLINE = 10;
const SPRITE_SIZE_BYTES = 4;
const SPRITE_BYTE_Y = 0;
const SPRITE_BYTE_X = 1;
const SPRITE_BYTE_TILE_ID = 2;
const SPRITE_BYTE_ATTRIBUTES = 3;
const FIXED_PALETTE = [0xffffffff, 0xffaaaaaa, 0xff555555, 0xff000000];

export default class SpriteRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    if (!this.ppu.registers.lcdc.showSprites) return;

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

    return sprites.reverse();
  }

  _render(sprites) {
    for (let sprite of sprites) {
      const insideY = sprite.diffY(this.ppu.scanline);
      const tileInsideY = insideY % 8;
      const tile = new Tile(
        this.ppu.cpu.memory,
        sprite.tileIdFor(insideY),
        sprite.flipY ? 7 - tileInsideY : tileInsideY
      );

      for (let insideX = 0; insideX < 8; insideX++) {
        const colorIndex = tile.getColorIndex(
          sprite.flipX ? 7 - insideX : insideX
        );
        if (colorIndex > 0)
          this.ppu.plot(
            sprite.x + insideX,
            this.ppu.scanline,
            FIXED_PALETTE[colorIndex]
          );
      }
    }
  }

  _createSprite(id) {
    const oam = this.ppu.cpu.memory.oam;
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
