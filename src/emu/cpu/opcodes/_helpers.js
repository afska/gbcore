const tmp = new Register8Bit();

export function withHL(cpu, action, arg) {
  const hl = cpu.registers.hl.getValue();
  const value = cpu.memory.read(hl);

  tmp.setValue(value);
  action(cpu, tmp, arg);
  cpu.memory.write(hl, tmp.getValue());
}
