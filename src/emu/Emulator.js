import Cartridge from "./Cartridge";
import Controller from "./Controller";
import MemoryBus from "./MemoryBus";
import APU from "./apu/APU";
import CPU from "./cpu/CPU";
import PPU, { T_CYCLES_PER_FRAME } from "./ppu/PPU";

const T_CYCLES_PER_MCYCLE = 4;

/**
 * A Game Boy emulator.
 */
export default class Emulator {
  constructor(onFrame, onSample) {
    this.sampleCount = 0;

    this.onFrame = onFrame;
    this.onSample = (left, right) => {
      this.sampleCount++;
      onSample(left, right);
    };

    this.memory = new MemoryBus();
    this.cpu = new CPU(this.memory);
    this.ppu = new PPU(this.cpu);
    this.apu = new APU(this.memory);
  }

  /**
   * Loads a ROM file.
   * `bytes`: `Uint8Array`
   * `saveFileBytes`: `Uint8Array` or null
   */
  load(bytes, saveFileBytes = null) {
    const cartridge = new Cartridge(bytes);
    const controller = new Controller(this.cpu);

    this.memory.onLoad(this.cpu, this.ppu, this.apu, cartridge, controller);

    this.context = { cartridge, controller };

    this._setSaveFile(saveFileBytes);
  }

  /**
   * Updates a button's state.
   * `playerId`: `1` or `2`
   * `button`: One of "BUTTON_LEFT", "BUTTON_RIGHT", "BUTTON_UP", "BUTTON_DOWN", "BUTTON_A", "BUTTON_B", "BUTTON_X", "BUTTON_Y", "BUTTON_L", "BUTTON_R", "BUTTON_START", "BUTTON_SELECT"
   * `isPressed`: `boolean`
   */
  setButton(playerId, button, isPressed) {
    if (playerId !== 1) return;
    if (!this.context) return;

    const { controller } = this.context;
    controller.setButton(button, isPressed);
  }

  /**
   * Runs the emulation for a whole frame.
   * Used when "SYNC TO VIDEO" is active.
   */
  frame() {
    if (!this.context) return;

    const currentFrame = this.ppu.frame;
    let elapsed = 0;

    while (elapsed < T_CYCLES_PER_FRAME) {
      elapsed += this.step();

      if (this.ppu.frame !== currentFrame) return;
    }
  }

  /**
   * Runs the emulation for `n` audio samples.
   * Used when "SYNC TO AUDIO" is active.
   * `n`: `number`
   */
  samples(n) {
    if (!this.context) return;

    this.sampleCount = 0;
    let elapsed = 0;

    while (this.sampleCount < n && elapsed < T_CYCLES_PER_FRAME) {
      elapsed += this.step();
    }
  }

  /** Executes a step in the emulation (1 CPU instruction). Returns the number of T-cycles. */
  step() {
    const mCycles = this.cpu.step();
    const tCycles = mCycles * T_CYCLES_PER_MCYCLE;
    this._clockPPU(tCycles);
    this._clockAPU(tCycles);

    return tCycles;
  }

  /**
   * Returns an array with the save file bytes, or null if the game doesn't have a save file.
   */
  getSaveFile() {
    if (!this.context) return;

    const mbc = this.context.cartridge.mbc;
    if (!mbc.hasSaveFile) return null;

    return mbc.getRam();
  }

  /**
   * Returns an object with a snapshot of the current state.
   */
  getSaveState() {
    if (!this.context) return;

    return {}; // TODO: IMPLEMENT
  }

  /*
   * Restores the current state from a snapshot.
   * `saveState`: the object returned by `getSaveState()`
   */
  setSaveState(saveState) {
    if (!this.context) return;

    // TODO: IMPLEMENT
  }

  _clockPPU(tCycles) {
    if (!this.ppu.isEnabled) return;

    for (let i = 0; i < tCycles; i++) {
      this.ppu.step(this.onFrame);
    }
  }

  _clockAPU(tCycles) {
    if (!this.apu.isEnabled) return;

    for (let i = 0; i < tCycles; i++) {
      this.apu.step(this.onSample);
    }
  }

  _setSaveFile(saveFileBytes) {
    if (!saveFileBytes) return;

    const mbc = this.context.cartridge.mbc;
    if (!mbc.hasSaveFile) return;

    mbc.setRam(saveFileBytes);
  }
}
