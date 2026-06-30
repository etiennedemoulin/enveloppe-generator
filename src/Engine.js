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

    const triggerTime = now + 0.05;
    const stationaryTime = triggerTime + this.state.attack;
    const decayTime = stationaryTime + this.state.stationary;
    const decayEndTime = decayTime + this.state.decay;
    const releaseTime = triggerAtTime + this.state.duration;
    const endTime = releaseTime + this.state.release;

    const attackVolume = this.state.volume / 400;
    const sustainVolume = this.state.sustain / 400;

    // attack
    this.env.gain.setValueAtTime(0, triggerTime);
    this.env.gain.linearRampToValueAtTime(attackVolume, stationaryTime);

    // stationary
    this.env.gain.linearRampToValueAtTime(attackVolume, decayTime);

    // decay
    this.env.gain.linearRampToValueAtTime(sustainVolume, decayEndTime);

    // sustain
    this.env.gain.setValueAtTime(sustainVolume, releaseTime);
    this.env.gain.linearRampToValueAtTime(0, endTime);

    // frequency
    this.osc.frequency.setValueAtTime(this.state.startFreq, stationaryTime);
    this.osc.frequency.linearRampToValueAtTime(this.state.endFreq, releaseTime);

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

  requestUpdate(update) {
    this.state = update;
  }

}