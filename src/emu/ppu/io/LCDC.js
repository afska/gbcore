import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * LCDC: LCD control
 * LCDC is the main LCD Control register.
 * Its bits toggle what elements are displayed on the screen, and how.
 */
export default class LCDC extends InMemoryRegister.PPU {
  onLoad() {
    this.addField("showBackgroundAndWindowOrCgbMasterPriority", 0)
      .addField("showSprites", 1)
      .addField("use8x16Sprites", 2)
      .addField("backgroundTileMapId", 3)
      .addField("useUnsignedTileMode", 4)
      .addField("showWindow", 5)
      .addField("windowTileMapId", 6)
      .addField("enableLCD", 7);

    this.setValue(0b10010001);

    this.needsWhiteFrame = false; // after re-enabling LCD, next frame is all white
  }

  onRead() {
    return this.value;
  }

  onWrite(value) {
    const enableLCD = this.enableLCD;

    this.setValue(value);

    if (enableLCD && !this.enableLCD) {
      // When the LCDC goes from ON to OFF, LY is reset to 0.
      this.ppu.dot = 0;
      this.ppu.scanline = 0;
      this.ppu.windowLine = 0;
    }

    if (!enableLCD && this.enableLCD) this.needsWhiteFrame = true;
  }

  getSaveState() {
    return {
      ...super.getSaveState(),
      needsWhiteFrame: this.needsWhiteFrame
    };
  }

  setSaveState(saveState) {
    super.setSaveState(saveState);

    this.needsWhiteFrame = saveState.needsWhiteFrame;
  }
}
