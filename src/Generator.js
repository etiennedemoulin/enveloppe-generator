import { LitElement, html, css } from 'lit';

import '@ircam/sc-components';

class Generator extends LitElement {
	static properties = {
		currentFreq: { state: true },
		currentVol: { state: true },
		timeoutFunc: { state: true }
	};

	static styles = css`
	    :host {
	      display: block;
	      width: inherit;
	      height: inherit;
	    }

	    header {
	      display: block;
	      height: 70px;
	      line-height: 70px;
	      background-color: var(--sw-medium-background-color);
	      display: flex;
	      flex-direction: row;
	      justify-content: space-between;
	      align-items: stretch;
	      border-bottom: 1px solid var(--sw-lighter-background-color);
	    }

	    p {
	      font-size: 30px;
	      margin: 4px;
	      height: 30px;
	      line-height: 30px;
	      text-indent: 0px;
	      background-color: #454545;
	    }

	    .separator {
	    	height: 100px;
	    }

	    sc-number {
	    	width: 125px;
	    	margin: 4px;
	    }

	    sc-text {
	    	width: 125px;
	    	margin: 4px;
	    }

	    sc-button {
	    	width: 125px;
	    	margin: 4px;
	    }

	    .first {
	    	width: 264px;
	    }

	`;

	constructor() {
		super();
		this.state = null;
		this.engine = null;
	};

	render() {
		return html`
			<div>
				<sc-text class="first" value="Electroaimant #${this.state.id + 1}"></sc-text>
			  	<sc-text value="Start frequency"></sc-text>
				<sc-text value="End frequency"></sc-text>
				<sc-text value="Duration"></sc-text>
				<sc-text value="Volume"></sc-text>
				<sc-text value="Current freq"></sc-text>
			</div>
			<div>
				<sc-button
					value="Play"
					@input=${this.start}
				></sc-button>
				<sc-button
					value="Stop"
					@input=${this.stop}
				></sc-button>
			  	<sc-number
					min=0
					value=${this.state.startFreq}
					?integer=false
					@input=${e => this.state.startFreq = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.endFreq}
					?integer=false
					@input=${e => this.state.endFreq = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.duration}
					?integer=false
					@input=${e => this.state.duration = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					max=100
					value=${this.state.volume}
					?integer=false
					@input=${e => this.state.volume = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					value=${this.currentFreq}
					?integer=false
					?readonly=true
				></sc-number>
			</div>
			<div>
				<sc-text value="Attack time"></sc-text>
				<sc-text value="Decay time"></sc-text>
				<sc-text value="Sustain"></sc-text>
				<sc-text value="Release time"></sc-text>
				<sc-text value=""></sc-text>
				<sc-text value=""></sc-text>
				<sc-text value="Current volume"></sc-text>
			</div>
			<div>
			  	<sc-number
					min=0
					value=${this.state.attack}
					?integer=false
					@input=${e => this.state.attack = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.decay}
					?integer=false
					@input=${e => this.state.decay = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					max=1
					value=${this.state.sustain}
					?integer=false
					@input=${e => this.state.sustain = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					value=${this.state.release}
					?integer=false
					@input=${e => this.state.release = e.detail.value}
				></sc-number>
				<sc-button
					value="Save"
					@input=${this.save}
				></sc-button>
				<sc-button
					value="Read"
					@input=${this.read}
				></sc-button>
				<sc-number
					min=0
					value=${this.currentVol}
					?integer=false
					?readonly=true
				></sc-number>
			</div>
			<div class="separator"></div>
		`;
	}

	start() {
		this.engine.start();
		this.timeoutFunc = setInterval(() => {
      		this.currentFreq = this.engine.getCurrentFreq();
      		this.currentVol = this.engine.getCurrentVol();
    	}, 50);
	};

	stop() {
		this.engine.stop();
		clearInterval(this.timeoutFunc);
		this.currentFreq = 0;
		this.currentVol = 0;
	}

	async save() {
		const params = structuredClone(this.state);
		delete params.currentFreq;
		delete params.currentVol;
		delete params.timeoutFunc;

		const jparams = JSON.stringify(params);

		const opts = {
			suggestedName: 'config.json',
		types: [
		  {
		    description: "json configuration file",
		    accept: { "application/json": [".json"] },
		  },
		],
		};

		try {
			let fileHandle = await window.showSaveFilePicker(opts);
			const writable = await fileHandle.createWritable();
			await writable.write(jparams);
			await writable.close();
		} catch (err) {
			const a = document.createElement("a"),
        	 	file = new Blob([jparams]);
        	const url = URL.createObjectURL(file);
        	a.href = url;
        	a.download = 'config.json';
        	document.body.appendChild(a);
        	a.click();
        	setTimeout(function() {
            	document.body.removeChild(a);
            	window.URL.revokeObjectURL(url);  
        	}, 0); 
		}
	}


	read() {
    	const inputElement = document.createElement('input');
    	inputElement.style.display = 'none';
    	inputElement.type = 'file';

    	inputElement.addEventListener('change', () => {
        	if (inputElement.files) {
        		const file = inputElement.files[0];
        		const reader = new FileReader();
        		reader.onload = (e) => {
        			try {
        				this.state = JSON.parse(e.target.result);
        				this.requestUpdate();
        				this.engine.requestUpdate(this.state);
        			} catch (err) {
        				throw new Error(err);
        			}
        		}
        		reader.readAsText(file);
        	}
    	});
    	document.body.appendChild(inputElement);
    	inputElement.click();
	}


}


customElements.define('enveloppe-gen', Generator);