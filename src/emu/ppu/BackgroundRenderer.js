import Tile from "./Tile";

const WIDTH = 160;
const TILES_PER_ROW = 32;
const TILEMAP_SIZE_BYTES = 1024;
const FIXED_PALETTE = [0xffffffff, 0xffaaaaaa, 0xff555555, 0xff000000];

export default class BackgroundRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    if (!this.ppu.registers.lcdc.showBackgroundAndWindow) {
      for (let x = 0; x < WIDTH; x++) {
        const color = FIXED_PALETTE[0];
        this.ppu.plot(x, this.ppu.scanline, color);
      }
      return;
    }

    for (let x = 0; x < WIDTH; x += 8) {
      const tileMapAddress =
        0x9800 +
        this.ppu.registers.lcdc.backgroundTileMapId * TILEMAP_SIZE_BYTES;
      const tileMapY = Math.floor(this.ppu.scanline / 8);
      const tileMapX = x / 8;
      const tileIndex = tileMapY * TILES_PER_ROW + tileMapX;

      const tileId = this.ppu.cpu.memory.read(tileMapAddress + tileIndex);
      const tile = new Tile(
        this.ppu.cpu.memory,
        tileId,
        this.ppu.scanline % 8,
        !this.ppu.registers.lcdc.useUnsignedTileMode
      );

      for (let xx = 0; xx < 8; xx++) {
        const colorIndex = tile.getColorIndex(xx);
        const color = FIXED_PALETTE[colorIndex];
        this.ppu.plot(x + xx, this.ppu.scanline, color);
      }
    }
  }
}
