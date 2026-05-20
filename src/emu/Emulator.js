import MemoryBus from "./MemoryBus";
import CPU from "./cpu/CPU";
import Cartridge from "./Cartridge";
import Controller from "./Controller";
import PPU from "./ppu/PPU";

const T_CYCLES_PER_MCYCLE = 4;

/** A GB emulator. */
export default class Emulator {
  constructor(onFrame, onSample) {
    this.onFrame = onFrame;
    this.onSample = onSample;

    this.memory = new MemoryBus();
    this.cpu = new CPU(this.memory);
    this.ppu = new PPU(this.cpu);
  }

  /**
   * Loads a ROM file.
   * `bytes`: `Uint8Array`
   * `saveFileBytes`: `Uint8Array` or null
   */
  load(bytes, saveFileBytes = null) {
    const cartridge = new Cartridge(bytes);
    const controller = new Controller();

    this.memory.onLoad(this.cpu, this.ppu, null, cartridge, controller);

    this.context = { cartridge, controller };
    this.cpu.reset();
  }

  /**
   * Updates a button's state.
   * `playerId`: `1` or `2`
   * `button`: One of "BUTTON_LEFT", "BUTTON_RIGHT", "BUTTON_UP", "BUTTON_DOWN", "BUTTON_A", "BUTTON_B", "BUTTON_X", "BUTTON_Y", "BUTTON_L", "BUTTON_R", "BUTTON_START", "BUTTON_SELECT"
   * `isPressed`: `boolean`
   */
  setButton(playerId, button, isPressed) {
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
    while (this.ppu.frame === currentFrame) this.step();
  }

  /**
   * Runs the emulation for `n` audio samples.
   * Used when "SYNC TO AUDIO" is active.
   * `n`: `number`
   */
  samples(n) {
    if (!this.context) return;

    // TODO: IMPLEMENT
  }

  /** Executes a step in the emulation (1 CPU instruction). */
  step() {
    const mCycles = this.cpu.step();
    const tCycles = mCycles * T_CYCLES_PER_MCYCLE;
    this._clockPPU(tCycles);
  }

  /**
   * Returns an array with the save file bytes, or null if the game doesn't have a save file.
   */
  getSaveFile() {
    if (!this.context) return;

    return null; // TODO: IMPLEMENT
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
    for (let i = 0; i < tCycles; i++) {
      this.ppu.step(this.onFrame);
    }
  }
}
