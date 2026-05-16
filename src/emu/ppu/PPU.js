import PPUMemory from "./PPUMemory";
import VideoRegisters from "./VideoRegisters";
import BackgroundRenderer from "./BackgroundRenderer";
import SpriteRenderer from "./SpriteRenderer";
import LoopyRegister from "../lib/ppu/LoopyRegister";
import masterPalette from "../lib/ppu/masterPalette";
import interrupts from "../lib/cpu/interrupts";

const MEM_PALETTE = 0x3f00;
const PALETTE_SIZE_BYTES = 4;

export default class PPU {
  constructor(cpu) {
    this.cpu = cpu;

    this.cycle = 0;
    this.scanline = -1;
    this.frame = 0;

    this.memory = new PPUMemory();
    this.registers = new VideoRegisters(this);
    this.loopy = new LoopyRegister();
    this.frameBuffer = new Uint32Array(256 * 240);
    this.colorIndexes = new Uint8Array(256 * 240);

    this.backgroundRenderer = new BackgroundRenderer(this);
    this.spriteRenderer = new SpriteRenderer(this);
  }

  onLoad(mapper) {
    this.mapper = mapper;
  }

  step(onFrame, onInterrupt) {
    if (this.scanline === -1) this._onPreLine();
    else if (this.scanline >= 0 && this.scanline < 240) this._onVisibleLine();
    else if (this.scanline === 241) this._onVBlankLine(onInterrupt);

    this._incrementCounters(onFrame);
  }

  plotBG(x, y, color, colorIndex) {
    this.colorIndexes[y * 256 + x] = colorIndex;
    this.plot(x, y, color);
    if (this.registers.ppuMask.showBackground) this.loopy.onPlot(x);
  }

  plot(x, y, color) {
    this.frameBuffer[y * 256 + x] = this.registers.ppuMask.transform(color);
  }

  isBackgroundPixelOpaque(x, y) {
    return this.colorIndexes[y * 256 + x] > 0;
  }

  getPaletteColors(paletteId) {
    return [
      this.getColor(paletteId, 0),
      this.getColor(paletteId, 1),
      this.getColor(paletteId, 2),
      this.getColor(paletteId, 3)
    ];
  }

  getColor(paletteId, paletteIndex) {
    const startAddress = MEM_PALETTE + paletteId * PALETTE_SIZE_BYTES;
    const colorIndex = this.memory.read(startAddress + paletteIndex);

    return masterPalette[colorIndex % 64];
  }

  _onPreLine() {
    if (!this.registers.ppuMask.isRenderingEnabled()) return;

    if (this.cycle === 1) {
      this.registers.ppuStatus.spriteOverflow = 0;
      this.registers.ppuStatus.sprite0Hit = 0;
      this.registers.ppuStatus.isInVBlankInterval = 0;
    }

    this.loopy.onPreLine(this.cycle);
    if (this.cycle === 260) this.mapper.tick();
  }

  _onVisibleLine() {
    if (this.cycle === 0) {
      this.backgroundRenderer.renderScanline();
      this.spriteRenderer.renderScanline();
    }

    if (!this.registers.ppuMask.isRenderingEnabled()) return;

    this.loopy.onVisibleLine(this.cycle);
    if (this.cycle === 260) this.mapper.tick();
  }

  _onVBlankLine(onInterrupt) {
    if (this.cycle === 1) {
      this.registers.ppuStatus.isInVBlankInterval = 1;
      if (this.registers.ppuCtrl.generateNMIOnVBlank) {
        onInterrupt(interrupts.NMI);
      }
    }
  }

  _incrementCounters(onFrame) {
    this.cycle++;
    if (this.cycle >= 341) {
      this.cycle = 0;
      this.scanline++;

      if (this.scanline >= 261) {
        this.scanline = -1;
        this.frame++;

        onFrame(this.frameBuffer);
      }
    }
  }
}
