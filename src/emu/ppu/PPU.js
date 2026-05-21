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

      if (this.scanline === HEIGHT) {
        this.frame++;
        this.cpu.requestInterrupt(interrupts.VBLANK);
        onFrame(this.frameBuffer);
        return;
      }

      if (this.scanline >= TOTAL_SCANLINES) this.scanline = 0;
    }
  }

  getMode() {
    if (this.scanline >= HEIGHT) return 1; // VBlank
    if (this.dot < 80) return 2; // OAM
    if (this.dot < 252) return 3; // Drawing
    return 0; // HBlank
  }
}
