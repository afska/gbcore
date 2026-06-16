import hardware from "../hardware";
import interrupts from "../interrupts";
import byte from "../lib/byte";
import FlagsRegister from "./FlagsRegister";
import { Register8Bit, Register16Bit, RegisterPair } from "./Register";
import Stack from "./Stack";
import { getOperation } from "./opcodes";

const PREFIX_INSTRUCTION = 0xcb;

/**
 * The Game Boy’s SM83 processor possesses a CISC, variable-length instruction set.
 */
export default class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registers = {
      a: new Register8Bit(),
      b: new Register8Bit(),
      c: new Register8Bit(),
      d: new Register8Bit(),
      e: new Register8Bit(),
      h: new Register8Bit(),
      l: new Register8Bit()
    };

    this.registers.flags = new FlagsRegister();

    this.registers.af = new RegisterPair(
      this.registers.a,
      this.registers.flags
    );
    this.registers.bc = new RegisterPair(this.registers.b, this.registers.c);
    this.registers.de = new RegisterPair(this.registers.d, this.registers.e);
    this.registers.hl = new RegisterPair(this.registers.h, this.registers.l);

    this.registers.pc = new Register16Bit(0x0100);
    this.registers.sp = new Register16Bit(0xfffe);

    this.stack = new Stack(this.memory, this.registers.sp);

    this.cycles = 0;

    this.ime = 0;
    this.eiCountdown = 0;
    this.ie = 0;
    this.if = 0;
    this.halted = false;
  }

  setHardware(hardwareMode = hardware.GBC) {
    this.registers.a.setValue(0);
    this.registers.b.setValue(0);

    if (hardwareMode === hardware.GBC || hardwareMode === hardware.GBA) {
      this.registers.a.setValue(0x11);
      if (hardwareMode === hardware.GBA) this.registers.b.setValue(1);
    }
  }

  step() {
    this._processPendingEI();
    if (this._processPendingInterrupts()) return this._consumeCycles();

    let opcode = this.fetchProgramByte();
    const isPrefix = opcode === PREFIX_INSTRUCTION;
    if (isPrefix) opcode = this.fetchProgramByte();

    const operation = getOperation(opcode, isPrefix);
    if (operation == null) throw new Error(`Unknown opcode: ${opcode}`);

    operation.run(this);
    this.cycles += operation.cycles;

    return this._consumeCycles();
  }

  requestInterrupt(interrupt) {
    this.if |= interrupt.mask;
  }

  getSaveState() {
    return {
      registers: {
        a: this.registers.a.getSaveState(),
        b: this.registers.b.getSaveState(),
        c: this.registers.c.getSaveState(),
        d: this.registers.d.getSaveState(),
        e: this.registers.e.getSaveState(),
        h: this.registers.h.getSaveState(),
        l: this.registers.l.getSaveState(),
        flags: this.registers.flags.getSaveState(),
        pc: this.registers.pc.getSaveState(),
        sp: this.registers.sp.getSaveState()
      },
      cycles: this.cycles,
      ime: this.ime,
      eiCountdown: this.eiCountdown,
      ie: this.ie,
      if: this.if,
      halted: this.halted
    };
  }

  setSaveState(saveState) {
    for (let name of Object.keys(saveState.registers))
      this.registers[name].setSaveState(saveState.registers[name]);

    this.cycles = saveState.cycles;
    this.ime = saveState.ime;
    this.eiCountdown = saveState.eiCountdown;
    this.ie = saveState.ie;
    this.if = saveState.if;
    this.halted = saveState.halted;
  }

  fetchProgramByte() {
    const value = this.memory.read(this.registers.pc.getValue());
    this.registers.pc.increment();
    return value;
  }

  fetchProgramHalfword() {
    const low = this.fetchProgramByte();
    const high = this.fetchProgramByte();

    return byte.buildU16(high, low);
  }

  _processPendingEI() {
    if (this.eiCountdown <= 0) return;

    this.eiCountdown--;
    if (this.eiCountdown === 0) this.ime = 1;
  }

  _processPendingInterrupts() {
    const pending = this.ie & this.if;

    if (pending === 0) {
      if (this.halted) {
        // if halted, just burn cycles and stop execution
        this.cycles++;
        return true;
      }

      return false;
    }

    // --- there's a pending interrupt!!! ---

    // if halted, wake up
    this.halted = false;

    // if IME=0, we don't service anything
    if (this.ime === 0) return false;

    // clear IME and EI countdown (so the interrupt handler doesn't get interrupted until RETI)
    this.ime = 0;
    this.eiCountdown = 0;

    // service IRQ
    if (this._serviceIRQ(pending, interrupts.VBLANK)) return true;
    if (this._serviceIRQ(pending, interrupts.LCD)) return true;
    if (this._serviceIRQ(pending, interrupts.TIMER)) return true;
    if (this._serviceIRQ(pending, interrupts.SERIAL)) return true;
    if (this._serviceIRQ(pending, interrupts.JOYPAD)) return true;

    return false;
  }

  _serviceIRQ(pending, interrupt) {
    if (!(pending & interrupt.mask)) return false;

    // clear IF bit
    this.if &= ~interrupt.mask;

    // save current PC
    this.stack.push16(this.registers.pc.getValue());

    // jump to handler
    this.registers.pc.setValue(interrupt.vector);

    // the whole thing takes 5 M-cycles
    this.cycles += 5;

    return true;
  }

  _consumeCycles() {
    const cycles = this.cycles;
    this.cycles = 0;
    this.memory.timer.advance(cycles);
    return cycles;
  }
}
