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
	    	width: 140px;
	    	margin: 4px;
	    }

	    sc-text {
	    	width: 140px;
	    	margin: 4px;
	    }

	    sc-button {
	    	width: 140px;
	    	margin: 4px;
	    }

	    sc-number {
	    	width: 140px;
	    }

	    .first {
	    	width: 294px;
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
			  	<sc-text value="Fréquence de départ"></sc-text>
				<sc-text value="Fréquence d'arrivée"></sc-text>
				<sc-text value="Durée"></sc-text>
				<sc-text value="Volume"></sc-text>
				<sc-text value="Fréquence actuelle"></sc-text>
			</div>
			<div>
				<sc-button
					value="Lecture"
					@input=${this.start}
				></sc-button>
				<sc-button
					value="Stop"
					@input=${this.stop}
				></sc-button>
			  	<sc-number
					min=0
					value=${this.state.startFreq}
					@input=${e => this.state.startFreq = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.endFreq}
					@input=${e => this.state.endFreq = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.duration}
					@input=${e => this.state.duration = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					max=100
					value=${this.state.volume}
					@input=${e => this.state.volume = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					value=${this.currentFreq}
					readonly=true
				></sc-number>
				<sc-button
					value="Save"
					@input=${this.save}
				></sc-button>
			</div>
			<div>
				<sc-text value="Temps d'attaque"></sc-text>
				<sc-text value="Temps de release"></sc-text>
				<sc-text value="Temps stationnaire"></sc-text>
				<sc-text value="Temps de decay"></sc-text>
				<sc-text value="Volume de decay"></sc-text>
				<sc-text value=""></sc-text>
				<sc-text value="Volume actuel"></sc-text>
			</div>
			<div>
			  	<sc-number
					min=0
					value=${this.state.attack}
					@input=${e => this.state.attack = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					value=${this.state.release}
					@input=${e => this.state.release = e.detail.value}
				></sc-number>
			  	<sc-number
					min=0
					value=${this.state.stationary}
					@input=${e => this.state.stationary = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					max=100
					value=${this.state.decay}
					@input=${e => this.state.decay = e.detail.value}
				></sc-number>
				<sc-number
					min=0
					value=${this.state.sustain}
					@input=${e => this.state.sustain = e.detail.value}
				></sc-number>
				<sc-text
				></sc-text>
				<sc-number
					min=0
					value=${this.currentVol}
					readonly=true
				></sc-number>
				<sc-button
					value="Read"
					@input=${this.read}
				></sc-button>
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