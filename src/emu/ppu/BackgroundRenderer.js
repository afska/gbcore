import hardware from "../hardware";
import byte from "../lib/byte";
import Tile from "./Tile";

const WIDTH = 160;
const BG_WIDTH = 256;
const BG_HEIGHT = 256;
const TILES_PER_ROW = 32;
const TILEMAP_SIZE_BYTES = 1024;
const WINDOW_X_OFFSET = 7;
const WHITE = 0xffffffff;

/**
 * Background + Window renderer.
 */
export default class BackgroundRenderer {
  constructor(ppu, memory) {
    this.ppu = ppu;
    this.memory = memory;
  }

  renderScanline() {
    const y = this.ppu.scanline;
    const lcdc = this.ppu.registers.lcdc;

    // DMG mode: LCDC.0 == 0 disables bg
    if (
      (this.memory.hardwareMode === hardware.DMG &&
        !lcdc.showBackgroundAndWindowOrCgbMasterPriority) ||
      lcdc.needsWhiteFrame
    ) {
      for (let x = 0; x < WIDTH; x++) {
        this.ppu.plotBG(x, y, WHITE, 0, false);
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

      let tileBank = 0;
      let tileFlipX = false,
        tileFlipY = false;
      let paletteId = 0;
      let hasPriority = false;
      if (this.memory.hardwareMode !== hardware.DMG) {
        const tileAttributes = this.memory.readVram(
          tileMapAddress + tileIndex,
          1
        );
        paletteId = byte.getBits(tileAttributes, 0, 3);
        if (byte.getFlag(tileAttributes, 3)) tileBank = 1;
        if (byte.getFlag(tileAttributes, 5)) tileFlipX = true;
        if (byte.getFlag(tileAttributes, 6)) tileFlipY = true;
        if (byte.getFlag(tileAttributes, 7)) hasPriority = true;
      }

      const tileId = this.memory.readVram(tileMapAddress + tileIndex);
      const tileStartX = backgroundX % 8;
      const tileInsideY = backgroundY % 8;
      const tile = new Tile(
        this.memory,
        tileId,
        tileFlipY ? 7 - tileInsideY : tileInsideY,
        tileBank,
        !lcdc.useUnsignedTileMode
      );

      const tilePixels = Math.min(8 - tileStartX, WIDTH - x);

      for (let xx = 0; xx < tilePixels; xx++) {
        const insideX = tileStartX + xx;
        const colorIndex = tile.getColorIndex(
          tileFlipX ? 7 - insideX : insideX
        );
        const color =
          this.memory.hardwareMode !== hardware.DMG
            ? this.ppu.getColor("paletteRamBackground", paletteId, colorIndex)
            : this.ppu.registers.bgp.colorFor(colorIndex);
        this.ppu.plotBG(x + xx, y, color, colorIndex, hasPriority);
      }

      x += tilePixels;
    }

    if (didRenderWindow) this.ppu.windowLine++;
  }
}
