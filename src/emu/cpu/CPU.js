import { Register8Bit, Register16Bit, RegisterPair } from "./Register";
import FlagsRegister from "./FlagsRegister";
import { getOperation } from "./opcodes";
import byte from "../lib/byte";
import Stack from "./Stack";
import interrupts from "../interrupts";

const PREFIX_INSTRUCTION = 0xcb;

export default class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registers = {
      a: new Register8Bit(),
      b: new Register8Bit(),
      c: new Register8Bit(),
      d: new Register8Bit(),
      e: new Register8Bit(),
      f: new Register8Bit(),
      h: new Register8Bit(),
      l: new Register8Bit()
    };

    this.registers.af = new RegisterPair(this.registers.a, this.registers.f);
    this.registers.bc = new RegisterPair(this.registers.b, this.registers.c);
    this.registers.de = new RegisterPair(this.registers.d, this.registers.e);
    this.registers.hl = new RegisterPair(this.registers.h, this.registers.l);

    this.registers.flags = new FlagsRegister();

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
