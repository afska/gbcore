/** Save states unit. */
export default {
  getSaveState(gb) {
    return {
      cpu: gb.cpu.getSaveState?.() ?? {
        pc: gb.cpu.pc.getValue(),
        sp: gb.cpu.sp.getValue(),
        flags: gb.cpu.flags.getValue(),
        cycle: gb.cpu.cycle,
        a: gb.cpu.a.getValue(),
        x: gb.cpu.x.getValue(),
        y: gb.cpu.y.getValue(),
        memory: {
          ram: Array.from(gb.cpu.memory.ram),
          ppuRegisters: [
            gb.ppu.registers?.ppuCtrl.value,
            gb.ppu.registers?.ppuMask.value,
            gb.ppu.registers?.ppuStatus.value,
            gb.ppu.registers?.oamAddr.value,
            gb.ppu.registers?.oamData.value,
            gb.ppu.registers?.ppuScroll.value,
            gb.ppu.registers?.ppuAddr.value,
            gb.ppu.registers?.ppuData.value,
            gb.ppu.registers?.oamDma.value
          ],
          apuRegisters: [
            gb.apu.registers?.pulses[0].control.value,
            gb.apu.registers?.pulses[0].sweep.value,
            gb.apu.registers?.pulses[0].timerLow.value,
            gb.apu.registers?.pulses[0].timerHighLCL.value,
            gb.apu.registers?.pulses[1].control.value,
            gb.apu.registers?.pulses[1].sweep.value,
            gb.apu.registers?.pulses[1].timerLow.value,
            gb.apu.registers?.pulses[1].timerHighLCL.value,
            gb.apu.registers?.triangle.lengthControl.value,
            0,
            gb.apu.registers?.triangle.timerLow.value,
            gb.apu.registers?.triangle.timerHighLCL.value,
            gb.apu.registers?.noise.control.value,
            0,
            gb.apu.registers?.noise.form.value,
            gb.apu.registers?.noise.lcl.value,
            gb.apu.registers?.dmc.control.value,
            gb.apu.registers?.dmc.load.value,
            gb.apu.registers?.dmc.sampleAddress.value,
            gb.apu.registers?.dmc.sampleLength.value
          ],
          apuControl: gb.apu.registers?.apuControl.value,
          apuFrameCounter: gb.apu.registers?.apuFrameCounter.value
        }
      },
      ppu: gb.ppu.getSaveState?.() ?? {
        frame: gb.ppu.frame,
        scanline: gb.ppu.scanline,
        cycle: gb.ppu.cycle,
        memory: {
          vram: Array.from(gb.ppu.memory?.vram || []),
          paletteRam: Array.from(gb.ppu.memory?.paletteRam || []),
          oamRam: Array.from(gb.ppu.memory?.oamRam || []),
          mirroringId: gb.ppu.memory?.mirroringId
        },
        loopy: gb.ppu.loopy?.getSaveState()
      },
      apu: gb.apu.getSaveState?.() ?? {
        sampleCounter: gb.apu.sampleCounter,
        frameSequencerCounter: gb.apu.frameSequencer?.counter || 0,
        sample: gb.apu.sample,
        pulse1: this._getAPUPulse(gb, 0),
        pulse2: this._getAPUPulse(gb, 1),
        triangle: this._getAPUTriangle(gb),
        noise: this._getAPUNoise(gb),
        dmc: this._getAPUDMC(gb)
      },
      mapper: gb.context.mapper.getSaveState(),
      saveFile: gb.getSaveFile()
    };
  },
  setSaveState(gb, saveState) {
    // CPU
    if (gb.cpu.setSaveState == null) {
      gb.cpu.pc.setValue(saveState.cpu.pc);
      gb.cpu.sp.setValue(saveState.cpu.sp);
      gb.cpu.flags.setValue(saveState.cpu.flags);
      gb.cpu.cycle = saveState.cpu.cycle;
      gb.cpu.a.setValue(saveState.cpu.a);
      gb.cpu.x.setValue(saveState.cpu.x);
      gb.cpu.y.setValue(saveState.cpu.y);
      gb.cpu.memory.ram.set(saveState.cpu.memory.ram);
      [
        gb.ppu.registers?.ppuCtrl,
        gb.ppu.registers?.ppuMask,
        gb.ppu.registers?.ppuStatus,
        gb.ppu.registers?.oamAddr,
        gb.ppu.registers?.oamData,
        gb.ppu.registers?.ppuScroll,
        gb.ppu.registers?.ppuAddr,
        gb.ppu.registers?.ppuData,
        gb.ppu.registers?.oamDma
      ].forEach((register, i) => {
        register?.setValue(saveState.cpu.memory.ppuRegisters[i]);
      });
      [
        gb.apu.registers?.pulses[0].control,
        gb.apu.registers?.pulses[0].sweep,
        gb.apu.registers?.pulses[0].timerLow,
        gb.apu.registers?.pulses[0].timerHighLCL,
        gb.apu.registers?.pulses[1].control,
        gb.apu.registers?.pulses[1].sweep,
        gb.apu.registers?.pulses[1].timerLow,
        gb.apu.registers?.pulses[1].timerHighLCL,
        gb.apu.registers?.triangle.lengthControl,
        null,
        gb.apu.registers?.triangle.timerLow,
        gb.apu.registers?.triangle.timerHighLCL,
        gb.apu.registers?.noise.control,
        null,
        gb.apu.registers?.noise.form,
        gb.apu.registers?.noise.lcl,
        gb.apu.registers?.dmc.control,
        gb.apu.registers?.dmc.load,
        gb.apu.registers?.dmc.sampleAddress,
        gb.apu.registers?.dmc.sampleLength
      ].forEach((register, i) => {
        register?.setValue(saveState.cpu.memory.apuRegisters[i]);
      });
      gb.apu.registers?.apuControl?.setValue(saveState.cpu.memory.apuControl);
      gb.apu.registers?.apuFrameCounter?.setValue(
        saveState.cpu.memory.apuFrameCounter
      );
    } else {
      gb.cpu.setSaveState(saveState.cpu, gb);
    }

    // PPU
    if (gb.ppu.setSaveState == null) {
      gb.ppu.frame = saveState.ppu.frame;
      gb.ppu.scanline = saveState.ppu.scanline;
      gb.ppu.cycle = saveState.ppu.cycle;
      gb.ppu.memory?.vram?.set(saveState.ppu.memory.vram);
      gb.ppu.memory?.paletteRam?.set(saveState.ppu.memory.paletteRam);
      gb.ppu.memory?.oamRam?.set(saveState.ppu.memory.oamRam);
      if (saveState.ppu.memory.mirroringId != null)
        gb.ppu.memory?.changeNameTableMirroringTo?.(
          saveState.ppu.memory.mirroringId
        );
      if (saveState.ppu.loopy != null)
        gb.ppu.loopy?.setSaveState?.(saveState.ppu.loopy);
    } else {
      gb.ppu.setSaveState(saveState.ppu, gb);
    }

    // APU
    if (gb.apu.setSaveState == null) {
      gb.apu.sampleCounter = saveState.apu.sampleCounter;
      if (gb.apu.frameSequencer != null)
        gb.apu.frameSequencer.counter = saveState.apu.frameSequencerCounter;
      gb.apu.sample = saveState.apu.sample;
      this._setAPUPulse(gb, 0, "pulse1", saveState);
      this._setAPUPulse(gb, 1, "pulse2", saveState);
      if (saveState.apu.triangle != null) this._setAPUTriangle(gb, saveState);
      if (saveState.apu.noise != null) this._setAPUNoise(gb, saveState);
      if (saveState.apu.dmc != null) this._setAPUDMC(gb, saveState);
    } else {
      gb.apu.setSaveState(saveState.apu, gb);
    }

    // Mapper
    gb.context.mapper.setSaveState(saveState.mapper);
  },

  _getAPUPulse(gb, index) {
    const channel = gb.apu.channels?.pulses[index];
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      oscillator:
        channel.oscillator != null
          ? {
              frequency: channel.oscillator.frequency,
              dutyCycle: channel.oscillator.dutyCycle,
              volume: channel.oscillator.volume
            }
          : null,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      volumeEnvelope:
        channel.volumeEnvelope != null
          ? this._getAPUEnvelope(channel.volumeEnvelope)
          : null,
      frequencySweep:
        channel.frequencySweep != null
          ? {
              startFlag: channel.frequencySweep.startFlag,
              dividerCount: channel.frequencySweep.dividerCount,
              sweepDelta: channel.frequencySweep.sweepDelta,
              mute: channel.frequencySweep.mute
            }
          : null,
      timer: channel.timer || 0
    };
  },

  _setAPUPulse(gb, index, name, saveState) {
    const channel = gb.apu.channels?.pulses[index];
    const pulseState = saveState.apu[name];

    if (channel == null || pulseState == null) return;

    channel.outputSample = pulseState.outputSample;
    if (pulseState.oscillator != null && channel.oscillator != null) {
      channel.oscillator.frequency = pulseState.oscillator.frequency;
      channel.oscillator.dutyCycle = pulseState.oscillator.dutyCycle;
      channel.oscillator.volume = pulseState.oscillator.volume;
    }
    if (pulseState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = pulseState.lengthCounter.counter;
    if (pulseState.volumeEnvelope != null && channel.volumeEnvelope != null)
      this._setAPUEnvelope(channel.volumeEnvelope, pulseState.volumeEnvelope);
    if (pulseState.frequencySweep != null && channel.frequencySweep != null) {
      channel.frequencySweep.startFlag = pulseState.frequencySweep.startFlag;
      channel.frequencySweep.dividerCount =
        pulseState.frequencySweep.dividerCount;
      channel.frequencySweep.sweepDelta = pulseState.frequencySweep.sweepDelta;
      channel.frequencySweep.mute = pulseState.frequencySweep.mute;
    }
    channel.timer = pulseState.timer;
  },

  _getAPUTriangle(gb) {
    const channel = gb.apu.channels?.triangle;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      oscillator:
        channel.oscillator != null
          ? {
              frequency: channel.oscillator.frequency
            }
          : null,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      linearLengthCounter:
        channel.linearLengthCounter != null
          ? {
              counter: channel.linearLengthCounter.counter,
              reload: channel.linearLengthCounter.reload,
              reloadFlag: channel.linearLengthCounter.reloadFlag
            }
          : null
    };
  },

  _setAPUTriangle(gb, saveState) {
    const channel = gb.apu.channels?.triangle;
    const triangleState = saveState.apu.triangle;

    if (channel == null || triangleState == null) return;

    channel.outputSample = triangleState.outputSample;
    if (triangleState.oscillator != null && channel.oscillator != null)
      channel.oscillator.frequency = triangleState.oscillator.frequency;
    if (triangleState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = triangleState.lengthCounter.counter;
    if (
      triangleState.linearLengthCounter != null &&
      channel.linearLengthCounter != null
    ) {
      channel.linearLengthCounter.counter =
        triangleState.linearLengthCounter.counter;
      channel.linearLengthCounter.reload =
        triangleState.linearLengthCounter.reload;
      channel.linearLengthCounter.reloadFlag =
        triangleState.linearLengthCounter.reloadFlag;
    }
  },

  _getAPUNoise(gb) {
    const channel = gb.apu.channels?.noise;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      lengthCounter:
        channel.lengthCounter != null
          ? {
              counter: channel.lengthCounter.counter
            }
          : null,
      volumeEnvelope:
        channel.volumeEnvelope != null
          ? this._getAPUEnvelope(channel.volumeEnvelope)
          : null,
      shift: channel.shift || 1,
      dividerCount: channel.dividerCount || 0
    };
  },

  _setAPUNoise(gb, saveState) {
    const channel = gb.apu.channels?.noise;
    const noiseState = saveState.apu.noise;

    if (channel == null || noiseState == null) return;

    channel.outputSample = noiseState.outputSample;
    if (noiseState.lengthCounter != null && channel.lengthCounter != null)
      channel.lengthCounter.counter = noiseState.lengthCounter.counter;
    if (noiseState.volumeEnvelope != null && channel.volumeEnvelope != null)
      this._setAPUEnvelope(channel.volumeEnvelope, noiseState.volumeEnvelope);
    channel.shift = noiseState.shift;
    channel.dividerCount = noiseState.dividerCount;
  },

  _getAPUDMC(gb) {
    const channel = gb.apu.channels?.dmc;
    if (!channel) return null;

    return {
      outputSample: channel.outputSample || 0,
      startFlag: channel.dpcm?.startFlag || false,
      isActive: channel.dpcm?.isActive || false,
      buffer: channel.dpcm?.buffer,
      cursorByte: channel.dpcm?.cursorByte || 0,
      cursorBit: channel.dpcm?.cursorBit || 0,
      dividerPeriod: channel.dpcm?.dividerPeriod || 0,
      dividerCount: channel.dpcm?.dividerCount || 0,
      sampleAddress: channel.dpcm?.sampleAddress || 0,
      sampleLength: channel.dpcm?.sampleLength || 0
    };
  },

  _setAPUDMC(gb, saveState) {
    const channel = gb.apu.channels?.dmc;
    const dmcState = saveState.apu.dmc;

    if (channel == null || dmcState == null) return;

    channel.outputSample = dmcState.outputSample;
    if (channel.dpcm != null) {
      channel.dpcm.startFlag = dmcState.startFlag;
      channel.dpcm.isActive = dmcState.isActive;
      channel.dpcm.buffer = dmcState.buffer;
      channel.dpcm.cursorByte = dmcState.cursorByte;
      channel.dpcm.cursorBit = dmcState.cursorBit;
      channel.dpcm.dividerPeriod = dmcState.dividerPeriod;
      channel.dpcm.dividerCount = dmcState.dividerCount;
      channel.dpcm.sampleAddress = dmcState.sampleAddress;
      channel.dpcm.sampleLength = dmcState.sampleLength;
    }
  },

  _getAPUEnvelope(envelope) {
    return {
      startFlag: envelope.startFlag,
      dividerCount: envelope.dividerCount,
      volume: envelope.volume
    };
  },

  _setAPUEnvelope(envelope, envelopeState) {
    envelope.startFlag = envelopeState.startFlag;
    envelope.dividerCount = envelopeState.dividerCount;
    envelope.volume = envelopeState.volume;
  }
};
