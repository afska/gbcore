/** The GB Emulator. */
export default () =>
  class GB {
    constructor(onFrame = () => {}, onSample = () => {}) {
      this.onFrame = onFrame;
      this.onSample = onSample;
    }

    /** Loads a `rom` as the current cartridge. */
    load(rom, saveFileBytes = []) {}

    /** Runs the emulation for a whole video frame. */
    frame() {}

    /** Runs the emulation until the audio system generates `requestedSamples`. */
    samples(requestedSamples) {}

    /** Runs the emulation until the next scanline. */
    scanline(debug = false) {}

    /** Executes a step in the emulation (1 CPU instruction). */
    step() {}

    /** Sets the `button` state to `isPressed`. */
    setButton(button, isPressed) {}

    /** Sets all buttons to a non-pressed state. */
    clearButtons() {}

    /** Returns the save file bytes, or null. */
    getSaveFile() {}

    /** Returns a snapshot of the current state. */
    getSaveState() {}

    /** Restores state from a snapshot. */
    setSaveState(_saveState) {}

    _clockPPU(cpuCycles) {}

    _clockAPU(cpuCycles) {}
  };
