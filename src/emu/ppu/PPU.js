import interrupts from "../interrupts";
import byte from "../lib/byte";
import BackgroundRenderer from "./BackgroundRenderer";
import SpriteRenderer from "./SpriteRenderer";
import VideoRegisters from "./io";

export const WIDTH = 160;
export const HEIGHT = 144;
const DOTS_PER_SCANLINE = 456;
const RENDER_DOT = 252;
const TOTAL_SCANLINES = 154;
export const T_CYCLES_PER_FRAME = DOTS_PER_SCANLINE * TOTAL_SCANLINES;

const MODES = { HBLANK: 0, VBLANK: 1, OAM: 2, DRAWING: 3 };

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
    this.backgroundColorIndexes = new Uint8Array(WIDTH);
    this.backgroundPriorityPixels = new Uint8Array(WIDTH);

    this.registers = new VideoRegisters(this);

    this.backgroundRenderer = new BackgroundRenderer(this, this.memory);
    this.spriteRenderer = new SpriteRenderer(this, this.memory);

    this.syncSTAT();
    this.needsDisabledFrame = false;
  }

  disable() {
    this.needsDisabledFrame = true;

    this.dot = 0;
    this.scanline = 0;
    this.windowLine = 0;
    this.syncSTAT();
  }

  getColor(bankName, paletteId, colorIndex) {
    const lowByte =
      this.memory[bankName][(paletteId * 8 + colorIndex * 2) % 64];
    const highByte =
      this.memory[bankName][(paletteId * 8 + colorIndex * 2 + 1) % 64];
    const color = byte.buildU16(highByte, lowByte);
    const red /*   */ = (color & 0b000000000011111) >> 0;
    const green /* */ = (color & 0b000001111100000) >> 5;
    const blue /*  */ = (color & 0b111110000000000) >> 10;

    const r8 = Math.round((red * 255) / 31);
    const g8 = Math.round((green * 255) / 31);
    const b8 = Math.round((blue * 255) / 31);

    return (0xff << 24) | (b8 << 16) | (g8 << 8) | (r8 << 0);
  }

  plotBG(x, y, color, colorIndex, hasPriority) {
    this.backgroundColorIndexes[x] = colorIndex;
    this.backgroundPriorityPixels[x] = +hasPriority;
    this.plot(x, y, color);
  }

  plot(x, y, color) {
    this.frameBuffer[y * WIDTH + x] = color;
  }

  isBackgroundPixelOpaque(x) {
    return this.backgroundColorIndexes[x] > 0;
  }

  doesBackgroundPixelHavePriority(x) {
    return !!this.backgroundPriorityPixels[x];
  }

  step(onFrame) {
    if (!this.isEnabled) {
      if (this.needsDisabledFrame) {
        this.frameBuffer.fill(0xffffffff);
        this.backgroundColorIndexes.fill(0);
        this.backgroundPriorityPixels.fill(0);
        this.needsDisabledFrame = false;
      }
      return;
    }

    const previousMode = this.mode;
    this.dot++;

    if (this.scanline < HEIGHT && this.dot === RENDER_DOT) {
      this.backgroundRenderer.renderScanline();
      this.spriteRenderer.renderScanline();
    }

    if (previousMode !== MODES.HBLANK && this.mode === MODES.HBLANK)
      this.registers.vdmaLen.hdma();

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
    const currentMode = this.mode;
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

  get isDrawing() {
    return this.isEnabled && this.mode === MODES.DRAWING;
  }

  get isSearchingOam() {
    return this.isEnabled && this.mode === MODES.OAM;
  }

  get isOamBlocked() {
    return this.isSearchingOam || this.isDrawing;
  }

  get mode() {
    if (!this.isEnabled) return MODES.HBLANK;

    if (this.scanline >= HEIGHT) return MODES.VBLANK;
    if (this.dot < 80) return MODES.OAM;
    if (this.dot < 252) return MODES.DRAWING;
    return MODES.HBLANK;
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
      registers: this.registers.getSaveState(),
      needsDisabledFrame: this.needsDisabledFrame
    };
  }

  setSaveState(saveState) {
    this.dot = saveState.dot;
    this.scanline = saveState.scanline;
    this.windowLine = saveState.windowLine;
    this.frame = saveState.frame;
    this.registers.setSaveState(saveState.registers);
    this.needsDisabledFrame = saveState.needsDisabledFrame;
  }
}
