import $CPUMemory from "./CPUMemory";
import $CPU from "./cpu/CPU";
import $PPU from "./ppu/PPU";
import $APU from "./apu/APU";
import $Cartridge from "./Cartridge";
import $Controller from "./controller/Controller";
import $mappers from "./mappers/mappers";
import interrupts from "./lib/cpu/interrupts";
import saveStates from "./saveStates";

const PPU_STEPS_PER_CPU_CYCLE = 3;
const APU_STEPS_PER_CPU_CYCLE = 0.5;
const TIMEOUT_MS = 3000;
const MAX_STEP_MS = 300;
const BUTTONS = [
  "BUTTON_A",
  "BUTTON_B",
  "BUTTON_SELECT",
  "BUTTON_START",
  "BUTTON_UP",
  "BUTTON_DOWN",
  "BUTTON_LEFT",
  "BUTTON_RIGHT"
];

/** The GB Emulator. */
export default (customComponents = {}) =>
  class GB {
    constructor(onFrame = () => {}, onSample = () => {}) {
      this.customComponents = { ...customComponents };
      const components = { ...customComponents };
      if (!components.CPUMemory) components.CPUMemory = $CPUMemory;
      if (!components.CPU) components.CPU = $CPU;
      if (!components.PPU) components.PPU = $PPU;
      if (!components.APU) components.APU = $APU;
      if (!components.Cartridge) components.Cartridge = $Cartridge;
      if (!components.Controller) components.Controller = $Controller;
      if (!components.mappers) components.mappers = $mappers;
      if (!components.omitReset) components.omitReset = false;
      if (!components.unbroken) components.unbroken = false;
      this.components = components;

      this.onFrame = onFrame;
      this.onSample = (sample, pulse1, pulse2, triangle, noise, dmc) => {
        this.sampleCount++;
        onSample(sample, pulse1, pulse2, triangle, noise, dmc);
      };

      let cpuMemory = null;
      try {
        cpuMemory = new this.components.CPUMemory();
      } catch (error) {
        throw new Error(
          "🐒  Failure instantiating new CPUMemory(): " + error?.message
        );
      }

      try {
        this.cpu = new this.components.CPU(cpuMemory);
        if (components.unbroken) this.cpu.unbroken = true;
      } catch (error) {
        throw new Error(
          "🐒  Failure instantiating new CPU(): " + error?.message
        );
      }
      try {
        this.ppu = new this.components.PPU(this.cpu);
      } catch (error) {
        throw new Error(
          "🐒  Failure instantiating new PPU(cpu): " + error?.message
        );
      }
      try {
        this.apu = new this.components.APU(this.cpu);
      } catch (error) {
        throw new Error(
          "🐒  Failure instantiating new APU(cpu): " + error?.message
        );
      }

      this._patchCPUMemory();

      this.sampleCount = 0;
      this.pendingPPUCycles = 0;
      this.pendingAPUCycles = 0;

      this.onScanline = null;
    }

    /** Loads a `rom` as the current cartridge. */
    load(rom, saveFileBytes = []) {
      const cartridge = new this.components.Cartridge(rom);
      if (this.components.unbroken) cartridge.unbroken = true;
      const mapper = this.components.mappers.create(
        this.cpu,
        this.ppu,
        cartridge
      );

      const controller1 = new this.components.Controller(1);
      const controller2 = new this.components.Controller(2);
      controller1.other = controller2;
      controller2.other = controller1;
      const controllers = [controller1, controller2];
      controller1.cpu = this.cpu;
      controller2.cpu = this.cpu;

      try {
        this.cpu.memory.onLoad(this.ppu, this.apu, mapper, controllers);
      } catch (error) {
        throw new Error(
          "🐒  CPU::memory::onLoad(...) failed: " + error?.message
        );
      }
      try {
        this.ppu.onLoad?.(mapper);
      } catch (error) {
        throw new Error("🐒  PPU::onLoad(...) failed: " + error?.message);
      }
      try {
        this.ppu.memory?.onLoad?.(cartridge, mapper);
      } catch (error) {
        throw new Error(
          "🐒  PPU::memory::onLoad(...) failed: " + error?.message
        );
      }

      this.pendingPPUCycles = 0;
      this.pendingAPUCycles = 0;
      this.context = {
        cartridge,
        mapper,
        controllers
      };

      try {
        if (!this.components.omitReset) this.cpu.interrupt(interrupts.RESET);
      } catch (error) {
        throw new Error("🐒  RESET interrupt failed: " + error?.message);
      }

      this._setSaveFile(saveFileBytes);
    }

    /** Runs the emulation for a whole video frame. */
    frame() {
      if (!this.context) return;

      let lastTime = Date.now();
      let activeElapsed = 0;

      const currentFrame = this.ppu.frame;

      while (this.ppu.frame === currentFrame) {
        this.step();

        const now = Date.now();
        const gap = now - lastTime;
        lastTime = now;
        activeElapsed += gap < MAX_STEP_MS ? gap : 0; // long gaps = debugging

        if (activeElapsed > TIMEOUT_MS) {
          throw new Error(
            `🐒  The PPU is taking more than ${TIMEOUT_MS} ms to generate a single frame. This looks bad!`
          );
        }
      }
    }

    /** Runs the emulation until the audio system generates `requestedSamples`. */
    samples(requestedSamples) {
      if (!this.context) return;

      let lastTime = Date.now();
      let activeElapsed = 0;

      this.sampleCount = 0;

      while (this.sampleCount < requestedSamples) {
        this.step();

        const now = Date.now();
        const gap = now - lastTime;
        lastTime = now;
        activeElapsed += gap < MAX_STEP_MS ? gap : 0; // long gaps = debugging

        if (activeElapsed > TIMEOUT_MS) {
          throw new Error(
            `🐒  The APU is taking more than ${TIMEOUT_MS} ms to generate ${requestedSamples} samples. This looks bad!`
          );
        }
      }
    }

    /** Runs the emulation until the next scanline. */
    scanline(debug = false) {
      if (!this.context) return;

      let lastTime = Date.now();
      let activeElapsed = 0;

      const currentScanline = this.ppu.scanline;

      while (this.ppu.scanline === currentScanline) {
        this.step();

        const now = Date.now();
        const gap = now - lastTime;
        lastTime = now;
        activeElapsed += gap < MAX_STEP_MS ? gap : 0; // long gaps = debugging

        if (activeElapsed > TIMEOUT_MS) {
          throw new Error(
            `🐒  The PPU is taking more than ${TIMEOUT_MS} ms to generate a single scanline. This looks bad!`
          );
        }
      }

      let oldFrameBuffer;
      if (debug) {
        oldFrameBuffer = new Uint32Array(this.ppu.frameBuffer.length);
        for (let i = 0; i < this.ppu.frameBuffer.length; i++)
          oldFrameBuffer[i] = this.ppu.frameBuffer[i];
        for (let i = 0; i < 256; i++)
          this.ppu.plot(i, this.ppu.scanline, 0xff0000ff);
      }

      this.onFrame(this.ppu.frameBuffer);

      if (debug) {
        for (let i = 0; i < this.ppu.frameBuffer.length; i++)
          this.ppu.frameBuffer[i] = oldFrameBuffer[i];
      }
    }

    /** Executes a step in the emulation (1 CPU instruction). */
    step() {
      let cpuCycles = this.cpu.step();
      cpuCycles = this._clockPPU(cpuCycles);
      this._clockAPU(cpuCycles);
    }

    /** Sets the `button` state of `player` to `isPressed`. */
    setButton(player, button, isPressed) {
      if (!this.context) return;
      if (player !== 1 && player !== 2)
        throw new Error(`Invalid player: ${player}.`);

      this.context.controllers[player - 1].update(button, isPressed);
    }

    /** Sets all buttons of `player` to a non-pressed state. */
    clearButtons(player) {
      if (!this.context) return;
      if (player !== 1 && player !== 2)
        throw new Error(`Invalid player: ${player}.`);

      for (let button of BUTTONS)
        this.context.controllers[player - 1].update(button, false);
    }

    /** Returns the PRG RAM bytes, or null. */
    getSaveFile() {
      if (!this.context) return;
      const { prgRam } = this.context.mapper;
      if (!prgRam) return null;

      const bytes = [];
      for (let i = 0; i < prgRam.length; i++) bytes[i] = prgRam[i];

      return bytes;
    }

    /** Returns a snapshot of the current state. */
    getSaveState() {
      if (!this.context) return;

      return saveStates.getSaveState(this);
    }

    /** Restores state from a snapshot. */
    setSaveState(_saveState) {
      if (!this.context) return;

      const saveState = JSON.parse(JSON.stringify(_saveState)); // deep copy

      saveStates.setSaveState(this, saveState);
      this._setSaveFile(saveState.saveFile);
    }

    _clockPPU(cpuCycles) {
      const scanline = this.ppu.scanline;

      let unitCycles =
        this.pendingPPUCycles + cpuCycles * PPU_STEPS_PER_CPU_CYCLE;
      this.pendingPPUCycles = 0;

      const onIntr = (interrupt) => {
        const newCPUCycles = this.cpu.interrupt(interrupt);
        cpuCycles += newCPUCycles;
        unitCycles += newCPUCycles * PPU_STEPS_PER_CPU_CYCLE;
      };

      for (let i = 0; i < unitCycles; i++) {
        // <optimization>
        if (
          (this.ppu.cycle > 1 && this.ppu.cycle < 256) ||
          (this.ppu.cycle > 260 && this.ppu.cycle < 304) ||
          (this.ppu.cycle > 304 && this.ppu.cycle < 340)
        ) {
          this.ppu.cycle++;
          continue;
        }
        // </optimization>

        this.ppu.step(this.onFrame, onIntr);
      }

      if (this.ppu.scanline !== scanline && this.onScanline != null)
        this.onScanline();

      return cpuCycles;
    }

    _clockAPU(cpuCycles) {
      let unitCycles =
        this.pendingAPUCycles + cpuCycles * APU_STEPS_PER_CPU_CYCLE;

      const onIntr = (interrupt) => {
        const newCPUCycles = this.cpu.interrupt(interrupt);
        unitCycles += newCPUCycles * APU_STEPS_PER_CPU_CYCLE;
        this.pendingPPUCycles += newCPUCycles * PPU_STEPS_PER_CPU_CYCLE;
      };

      while (unitCycles >= 1) {
        this.apu.step(this.onSample, onIntr);
        unitCycles--;
      }

      this.pendingAPUCycles = unitCycles;
    }

    _setSaveFile(prgRamBytes) {
      const prgRam = this.context.mapper.prgRam;
      if (!prgRam || !prgRamBytes) return;

      for (let i = 0; i < prgRamBytes.length; i++) prgRam[i] = prgRamBytes[i];
    }

    _patchCPUMemory() {
      if (!this.cpu.memory) throw new Error("🐒  CPU::memory not found");

      this._patchCPUMemoryReads();
      this._patchCPUMemoryWrites();
    }

    _patchCPUMemoryReads() {
      const components = this.customComponents;
      const memory = this.cpu.memory;

      const read = memory.read;
      if (!read) throw new Error("🐒  CPU::memory::read(...) not found");

      memory.read = function(address) {
        // PPU registers
        if (!components.PPU || !components.CPUMemory) {
          if ((address >= 0x2000 && address <= 0x2007) || address === 0x4014)
            return this.ppu.registers?.read?.(address) ?? 0;
          else if (address >= 0x2008 && address <= 0x3fff)
            return (
              this.ppu.registers?.read?.(
                0x2000 + ((address - 0x2008) % 0x0008)
              ) ?? 0
            );
        }

        // APU registers
        if (!components.APU || !components.CPUMemory) {
          if ((address >= 0x4000 && address <= 0x4013) || address === 0x4015)
            return this.apu.registers?.read?.(address) ?? 0;
        }

        // Controller ports
        if (!components.Controller || !components.CPUMemory) {
          if (address === 0x4016) return this.controllers[0].onRead();
          else if (address === 0x4017) return this.controllers[1].onRead();
        }

        // APU and I/O functionality that is normally disabled
        if (address >= 0x4018 && address <= 0x401f) return 0;

        // Cartridge space: PRG ROM, PRG RAM, and mapper registers
        if (!components.mappers || !components.CPUMemory) {
          if (address >= 0x4020 && address <= 0xffff)
            return this.mapper.cpuRead(address);
        }

        // Original method call
        return read.call(this, address);
      };
    }

    _patchCPUMemoryWrites() {
      const components = this.customComponents;
      const memory = this.cpu.memory;

      const write = memory.write;
      if (!write) throw new Error("🐒  CPU::memory::write(...) not found");

      memory.write = function(address, value) {
        // PPU registers
        if (!components.PPU || !components.CPUMemory) {
          if ((address >= 0x2000 && address <= 0x2007) || address === 0x4014)
            return this.ppu.registers?.write?.(address, value);
          else if (address >= 0x2008 && address <= 0x3fff)
            return this.ppu.registers?.write?.(
              0x2000 + ((address - 0x2008) % 0x0008),
              value
            );
        }

        // APU registers
        if (!components.APU || !components.CPUMemory) {
          if (
            (address >= 0x4000 && address <= 0x4013) ||
            address === 0x4015 ||
            address === 0x4017
          )
            return this.apu.registers?.write?.(address, value);
        }

        // Controller ports
        if (!components.Controller || !components.CPUMemory) {
          if (address === 0x4016) return this.controllers[0].onWrite(value);
        }

        // APU and I/O functionality that is normally disabled
        if (address >= 0x4018 && address <= 0x401f) return;

        // Cartridge space: PRG ROM, PRG RAM, and mapper registers
        if (!components.mappers || !components.CPUMemory) {
          if (address >= 0x4020 && address <= 0xffff)
            return this.mapper.cpuWrite(address, value);
        }

        // Original method call
        return write.call(this, address, value);
      };
    }
  };
