export class Engine {
  constructor(audioContext, state) {
    this.audioContext = audioContext;
    this.state = state;

    this.osc = this.audioContext.createOscillator();
    this.env = this.audioContext.createGain();
    this.osc.type = "sine";
    this.osc.connect(this.env);
    // this.env.connect(this.audioContext.destination);
    this.env.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.osc.start();

  }

  start() {
    this.stop();
    const now = this.audioContext.currentTime;

    // this.env.gain.cancelScheduledValues(now);
    // this.osc.frequency.cancelScheduledValues(now);

    const triggerAtTime = now + 0.05;
    const releaseStartTime = triggerAtTime + this.state.duration;

    const attackStartTime = triggerAtTime;
    const decayStartTime = triggerAtTime + this.state.attack;
    const sustainStartTime = decayStartTime + this.state.decay;
    const releaseEndTime = releaseStartTime + this.state.release;

    const attackVolume = this.state.volume / 400;
    const sustainVolume = attackVolume * this.state.sustain;

    // attack
    this.env.gain.setValueAtTime(0, attackStartTime);
    this.env.gain.linearRampToValueAtTime(attackVolume, decayStartTime);

    // decay
    this.env.gain.linearRampToValueAtTime(sustainVolume, sustainStartTime);

    // sustain
    this.env.gain.setValueAtTime(sustainVolume, releaseStartTime);
    this.env.gain.linearRampToValueAtTime(0, releaseEndTime);

    // frequency
    this.osc.frequency.setValueAtTime(this.state.startFreq, triggerAtTime);
    this.osc.frequency.linearRampToValueAtTime(this.state.endFreq, releaseStartTime);

  }

  stop() {
    const now = this.audioContext.currentTime;

    // if (this.env.gain.value !== 0) {
    //   this.env.gain.setValueAtTime(this.state.volume / 400, now);
    // }
    
    this.env.gain.cancelScheduledValues(now);
    this.osc.frequency.cancelScheduledValues(now);

    this.env.gain.linearRampToValueAtTime(0, now + 0.05);

  }

  getCurrentFreq() {
    return this.osc.frequency.value;
  }

  getCurrentVol() {
    // multiply by 400 because trimmed in start function
    return this.env.gain.value * 400;
  }

  connect(destination, input, output) {
    this.env.connect(destination, input, output);
  }

  disconnect() {
    this.env.disconnect();
  }
}