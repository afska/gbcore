import InMemoryRegister from "../../lib/InMemoryRegister";

/**
 * LY: LCD Y coordinate [read-only]
 * LY indicates the current scanline, which might be about to be drawn, being drawn, or just been drawn. LY can hold any value from 0 to 153, with values from 144 to 153 indicating the VBlank period.
 */
export default class LY extends InMemoryRegister.PPU {
  onRead() {
    return this.ppu.scanline;
  }
}
