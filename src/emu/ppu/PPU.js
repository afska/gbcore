import BackgroundRenderer from "./BackgroundRenderer";
import interrupts from "../interrupts";
import VideoRegisters from "./io";

const WIDTH = 160;
const HEIGHT = 144;
const DOTS_PER_SCANLINE = 456;
const RENDER_DOT = 252;
const TOTAL_SCANLINES = 154;

export default class PPU {
  constructor(cpu) {
    this.cpu = cpu;

    this.dot = 0;
    this.scanline = 0;
    this.frame = 0;

    this.frameBuffer = new Uint32Array(WIDTH * HEIGHT);

    this.registers = new VideoRegisters(this);

    this.backgroundRenderer = new BackgroundRenderer(this);
  }

  plot(x, y, color) {
    this.frameBuffer[y * WIDTH + x] = color;
  }

  step(onFrame) {
    this.dot++;

    if (this.scanline < HEIGHT && this.dot === RENDER_DOT) {
      this.backgroundRenderer.renderScanline();
    }

    if (this.dot >= DOTS_PER_SCANLINE) {
      this.dot = 0;
      this.scanline++;
      this._syncSTAT(true);

      if (this.scanline === HEIGHT) {
        this.frame++;
        this.cpu.requestInterrupt(interrupts.VBLANK);
        onFrame(this.frameBuffer);
        return;
      }

      if (this.scanline >= TOTAL_SCANLINES) {
        this.scanline = 0;
        this._syncSTAT();
      }
    } else {
      this._syncSTAT();
    }
  }

  _syncSTAT(didScanlineChange = false) {
    /**
     * // TODO: FIX STAT INTERRUPT
     * INT $48 — STAT interrupt
There are various sources which can trigger this interrupt to occur as described in STAT register ($FF41).

The various STAT interrupt sources (modes 0-2 and LYC=LY) have their state (inactive=low and active=high) logically ORed into a shared “STAT interrupt line” if their respective enable bit is turned on.

A STAT interrupt will be triggered by a rising edge (transition from low to high) on the STAT interrupt line.

STAT blocking

If a STAT interrupt source logically ORs the interrupt line high while (or immediately after) it’s already set high by another source, then there will be no low-to-high transition and so no interrupt will occur. This phenomenon is known as “STAT blocking” (test ROM example).

As mentioned in the description of the STAT register, the PPU cycles through the different modes in a fixed order. So for example, if interrupts are enabled for two consecutive modes such as Mode 0 and Mode 1, then no interrupt will trigger for Mode 1 (since the STAT interrupt line won’t have a chance to go low between them).
     */

    const oldMode = this.registers.stat.ppuMode;
    const currentMode = this._getMode();
    this.registers.stat.ppuMode = currentMode;
    if (currentMode !== oldMode) {
      const needsInterrupt =
        (currentMode === 0 && this.registers.stat.mode0InterruptSelect) ||
        (currentMode === 1 && this.registers.stat.mode1InterruptSelect) ||
        (currentMode === 2 && this.registers.stat.mode2InterruptSelect);
      if (needsInterrupt) this.cpu.requestInterrupt(interrupts.LCD);
    }

    if (this.scanline === this.registers.lyc.value) {
      this.registers.stat.lycEqualsLy = 1;
      if (didScanlineChange && this.registers.stat.lycInterruptSelect)
        this.cpu.requestInterrupt(interrupts.LCD);
    } else {
      this.registers.stat.lycEqualsLy = 0;
    }
  }

  _getMode() {
    if (this.scanline >= HEIGHT) return 1; // VBlank
    if (this.dot < 80) return 2; // OAM
    if (this.dot < 252) return 3; // Drawing
    return 0; // HBlank
  }
}
