import InMemoryRegister from "../../lib/InMemoryRegister";
import byte from "../../lib/byte";

/**
 * AUDENA (aka NR52): Audio master control
 */
export default class AUDENA extends InMemoryRegister.APU {
  onLoad() {
    this.addField("enableAudio", 7);

    this.setValue(0b10000000);
  }

  onRead() {
    return byte.bitfield(
      +this.apu.channels.pulses[0].isPlaying,
      +this.apu.channels.pulses[1].isPlaying,
      +false,
      +false,
      0,
      0,
      0,
      this.enableAudio
    );
  }

  onWrite(value) {
    const wasAudioEnabled = this.enableAudio;

    this.setValue(value);

    if (wasAudioEnabled && !this.enableAudio) this.apu.reset();
  }
}
