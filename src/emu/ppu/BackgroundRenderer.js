import Tile from "./Tile";

const WIDTH = 160;
const HEIGHT = 240;
const TILES_PER_ROW = 32;
const TILEMAP_SIZE_BYTES = 1024;
const FIXED_PALETTE = [0xffffffff, 0xffaaaaaa, 0xff555555, 0xff000000];

export default class BackgroundRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    const y = this.ppu.scanline;

    if (!this.ppu.registers.lcdc.showBackgroundAndWindow) {
      for (let x = 0; x < WIDTH; x++) {
        const color = FIXED_PALETTE[0];
        this.ppu.plot(x, y, color);
      }
      return;
    }

    // scroll coordinates:
    const scrollX = this.ppu.registers.scx.value;
    const scrollY = this.ppu.registers.scy.value;

    for (let x = 0; x < WIDTH; ) {
      // current point to draw:
      const scrolledX = x + scrollX;
      const scrolledY = y + scrollY;

      const screenX = scrolledX % WIDTH;
      const screenY = scrolledY % HEIGHT;

      const tileMapAddress =
        0x9800 +
        this.ppu.registers.lcdc.backgroundTileMapId * TILEMAP_SIZE_BYTES;
      const tileMapY = Math.floor(screenY / 8);
      const tileMapX = screenX / 8;
      const tileIndex = tileMapY * TILES_PER_ROW + tileMapX;

      const tileId = this.ppu.cpu.memory.read(tileMapAddress + tileIndex);
      const tileStartX = screenX % 8;
      const tileInsideY = screenY % 8;
      const tile = new Tile(
        this.ppu.cpu.memory,
        tileId,
        tileInsideY,
        !this.ppu.registers.lcdc.useUnsignedTileMode
      );

      const tilePixels = Math.min(8 - tileStartX, WIDTH - screenX);

      for (let xx = 0; xx < tilePixels; xx++) {
        const colorIndex = tile.getColorIndex(tileStartX + xx);
        const color = FIXED_PALETTE[colorIndex];
        this.ppu.plot(x + xx, y, color);
      }

      x += tilePixels;
    }
  }
}
