import { Register8Bit, Register16Bit, RegisterPair } from "./Register";
import FlagsRegister from "./FlagsRegister";
import { getOperation } from "./opcodes";
import byte from "../lib/byte";
import Stack from "./Stack";

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

    this.registers.pc = new Register16Bit();
    this.registers.sp = new Register16Bit();

    this.stack = new Stack(this.memory, this.registers.sp);

    this.cycle = 0;

    this.ime = 0;
    this.eiCountdown = 0;
    this.ie = 0;
    this.halted = false;
  }

  step() {
    let opcode = this.fetchProgramByte();
    const isPrefix = opcode === PREFIX_INSTRUCTION;
    if (isPrefix) opcode = this.fetchProgramByte();

    const operation = getOperation(opcode, isPrefix);
    if (operation == null) throw new Error(`Unknown opcode: ${opcode}`);

    operation.run(this);

    this._processPendingEI();
  }

  reset() {
    // TODO: IMPLEMENT
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
}
