import { LitElement, html, render } from 'lit';

import resumeAudioContext from '../lib/resume-audio-context.js';

import './Generator.js';
import { Engine } from './Engine.js';

const audioContext = new AudioContext();

const states = [];
const numChannels = audioContext.destination.maxChannelCount;
console.log('> Num Channels:', numChannels);

audioContext.destination.channelCount = numChannels;
audioContext.destination.channelCountMode = "explicit";
audioContext.destination.channelInterpretation = 'discrete';

await resumeAudioContext(audioContext);

const merger = audioContext.createChannelMerger(numChannels);

merger.channelInterpretation = 'discrete';
merger.connect(audioContext.destination);

for (let i = 0; i < numChannels; i++) {
  states.push({
    id:i,
    startFreq:440, // freq, Hz
    endFreq:442, // freq, Hz
    duration:2, // time, second
    volume:40, // relative, 0/100
    attack:0.05, // time, second
    decay:0, // time, second
    sustain:1, // relative to volume, 0/1
    release:1, // time, second
    timeoutFunc:null,
    currentFreq:null,
    currentVol:null
  });

}

render(html`
  <h1>enveloppe-generator</h1>
  ${states.map(state => {
    const engine = new Engine(audioContext, state);
    engine.connect(merger, 0, state.id);
    return html`
      <enveloppe-gen .state=${state} .engine=${engine}></enveloppe-gen>
    `;
  })}
`, document.body);



