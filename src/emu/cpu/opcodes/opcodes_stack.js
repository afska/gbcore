import byte from "../../lib/byte";

/**
 * PUSH AF
 * Push the contents of register pair AF into the stack.
 * This is roughly equivalent to the following imaginary instructions:
 *   DEC SP
 *   LD [SP], A
 *   DEC SP
 *   LD [SP], F.Z << 7 | F.N << 6 | F.H << 5 | F.C << 4
 */
function PUSH_AF(cpu) {
  cpu.stack.push(cpu.registers.a.getValue());
  cpu.stack.push(cpu.registers.flags.getValue());
}

/**
 * POP AF
 * Pop register AF from the stack.
 * This is roughly equivalent to the following imaginary instructions:
 *   LD F, [SP]
 *   INC SP
 *   LD A, [SP]
 *   INC SP
 */
function POP_AF(cpu) {
  cpu.registers.flags.setValue(cpu.stack.pop());
  cpu.registers.a.setValue(cpu.stack.pop());
}
