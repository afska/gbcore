import interrupts from "../interrupts";
import BackgroundRenderer from "./BackgroundRenderer";
import SpriteRenderer from "./SpriteRenderer";
import VideoRegisters from "./io";

export const WIDTH = 160;
export const HEIGHT = 144;
const DOTS_PER_SCANLINE = 456;
const RENDER_DOT = 252;
const TOTAL_SCANLINES = 154;
export const T_CYCLES_PER_FRAME = DOTS_PER_SCANLINE * TOTAL_SCANLINES;

/**
 * The Game Boy outputs graphics to a 160×144 pixel LCD, using a quite complex mechanism to facilitate rendering.
 */
export default class PPU {
  constructor(cpu) {
    this.cpu = cpu;
    this.memory = cpu.memory;

    this.dot = 0;
    this.scanline = 0;
    this.windowLine = 0;
    this.frame = 0;

    this.frameBuffer = new Uint32Array(WIDTH * HEIGHT);
    this.backgroundColorIndexes = new Uint8Array(WIDTH * HEIGHT);

    this.registers = new VideoRegisters(this);

    this.backgroundRenderer = new BackgroundRenderer(this, this.memory);
    this.spriteRenderer = new SpriteRenderer(this, this.memory);

    this.syncSTAT();
  }

  plotBG(x, y, color, colorIndex) {
    this.backgroundColorIndexes[y * WIDTH + x] = colorIndex;
    this.plot(x, y, color);
  }

  plot(x, y, color) {
    this.frameBuffer[y * WIDTH + x] = color;
  }

  isBackgroundPixelOpaque(x, y) {
    return this.backgroundColorIndexes[y * WIDTH + x] > 0;
  }

  step(onFrame) {
    this.dot++;

    if (this.scanline < HEIGHT && this.dot === RENDER_DOT) {
      this.backgroundRenderer.renderScanline();
      this.spriteRenderer.renderScanline();
    }

    if (this.dot >= DOTS_PER_SCANLINE) {
      this.dot = 0;
      this.scanline++;

      if (this.scanline >= TOTAL_SCANLINES) {
        this.scanline = 0;
        this.windowLine = 0;
      }

      this.syncSTAT();

      if (this.scanline === HEIGHT) {
        this.frame++;
        this.cpu.requestInterrupt(interrupts.VBLANK);
        onFrame(this.frameBuffer);
        this.registers.lcdc.needsWhiteFrame = false;
        return;
      }
    } else {
      this.syncSTAT();
    }
  }

  syncSTAT() {
    const stat = this.registers.stat;
    const currentMode = this._getMode();
    const lycEqualsLy = this.scanline === this.registers.lyc.value;

    stat.ppuMode = currentMode;
    stat.lycEqualsLy = +lycEqualsLy;

    const interruptLine = !!(
      (currentMode === 0 && stat.mode0InterruptSelect) ||
      (currentMode === 1 && stat.mode1InterruptSelect) ||
      (currentMode === 2 && stat.mode2InterruptSelect) ||
      (lycEqualsLy && stat.lycInterruptSelect)
    );

    if (interruptLine && !stat.interruptLine)
      this.cpu.requestInterrupt(interrupts.LCD);

    stat.interruptLine = interruptLine;
  }

  get isEnabled() {
    return !!this.registers.lcdc.enableLCD;
  }

  getSaveState() {
    return {
      dot: this.dot,
      scanline: this.scanline,
      windowLine: this.windowLine,
      frame: this.frame,
      registers: this.registers.getSaveState()
    };
  }

  setSaveState(saveState) {
    this.dot = saveState.dot;
    this.scanline = saveState.scanline;
    this.windowLine = saveState.windowLine;
    this.frame = saveState.frame;
    this.registers.setSaveState(saveState.registers);
  }

  _getMode() {
    if (this.scanline >= HEIGHT) return 1; // VBlank
    if (this.dot < 80) return 2; // OAM
    if (this.dot < 252) return 3; // Drawing
    return 0; // HBlank
  }
}
