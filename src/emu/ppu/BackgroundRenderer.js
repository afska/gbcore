import Tile from "./Tile";

const WIDTH = 160;
const TILES_PER_ROW = 32;
const FIXED_PALETTE = [0xff000000, 0xff555555, 0xffaaaaaa, 0xffffffff];

export default class BackgroundRenderer {
  constructor(ppu) {
    this.ppu = ppu;
  }

  renderScanline() {
    for (let x = 0; x < WIDTH; x += 8) {
      const tileMapY = Math.floor(this.ppu.ly / 8);
      const tileMapX = x / 8;
      const tileIndex = tileMapY * TILES_PER_ROW + tileMapX;

      const tileId = this.ppu.cpu.memory.read(0x9800 + tileIndex);
      const tile = new Tile(this.ppu.cpu.memory, tileId, this.ppu.ly % 8);

      for (let xx = 0; xx < 8; xx++) {
        const colorIndex = tile.getColorIndex(xx);
        const color = FIXED_PALETTE[colorIndex];
        this.ppu.plot(x + xx, this.ppu.ly, color);
      }
    }
  }
}
