import Tile from "./Tile";

const WIDTH = 160;
const BG_WIDTH = 256;
const BG_HEIGHT = 256;
const TILES_PER_ROW = 32;
const TILEMAP_SIZE_BYTES = 1024;
const WINDOW_X_OFFSET = 7;
const WHITE = 0xffffffff;

export default class BackgroundRenderer {
  constructor(cpu, ppu) {
    this.cpu = cpu;
    this.ppu = ppu;
  }

  renderScanline() {
    const y = this.ppu.scanline;
    const lcdc = this.ppu.registers.lcdc;

    if (!lcdc.showBackgroundAndWindow || lcdc.needsWhiteFrame) {
      for (let x = 0; x < WIDTH; x++) {
        this.ppu.plotBG(x, y, WHITE, 0);
      }
      return;
    }

    const scrollX = this.ppu.registers.scx.value;
    const scrollY = this.ppu.registers.scy.value;
    const windowX = this.ppu.registers.wx.value - WINDOW_X_OFFSET;
    const windowY = this.ppu.registers.wy.value;
    const isWindowEnabled = !!lcdc.showWindow;
    let didRenderWindow = false;

    for (let x = 0; x < WIDTH; ) {
      const isWindow = isWindowEnabled && x >= windowX && y >= windowY;
      if (isWindow) didRenderWindow = true;

      const scrolledX = isWindow ? x - windowX : x + scrollX;
      const scrolledY = isWindow ? this.ppu.windowLine : y + scrollY;

      const backgroundX = scrolledX % BG_WIDTH;
      const backgroundY = scrolledY % BG_HEIGHT;

      const tileMapId = isWindow
        ? lcdc.windowTileMapId
        : lcdc.backgroundTileMapId;
      const tileMapAddress = 0x9800 + tileMapId * TILEMAP_SIZE_BYTES;
      const tileMapY = Math.floor(backgroundY / 8);
      const tileMapX = Math.floor(backgroundX / 8);
      const tileIndex = tileMapY * TILES_PER_ROW + tileMapX;

      const tileId = this.cpu.memory.read(tileMapAddress + tileIndex);
      const tileStartX = backgroundX % 8;
      const tileInsideY = backgroundY % 8;
      const tile = new Tile(
        this.cpu.memory,
        tileId,
        tileInsideY,
        !lcdc.useUnsignedTileMode
      );

      const tilePixels = Math.min(8 - tileStartX, WIDTH - x);

      for (let xx = 0; xx < tilePixels; xx++) {
        const colorIndex = tile.getColorIndex(tileStartX + xx);
        const color = this.ppu.registers.bgp.colorFor(colorIndex);
        this.ppu.plotBG(x + xx, y, color, colorIndex);
      }

      x += tilePixels;
    }

    if (didRenderWindow) this.ppu.windowLine++;
  }
}
