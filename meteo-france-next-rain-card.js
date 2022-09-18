const KEY_HOUR_FORECAST = '1_hour_forecast';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
    display: block;
}
.times,
.forecasts {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
}
.forecasts meteo-france-next-rain-ui-slot {
    width: 10%;
}
.coming {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
}
.coming svg {
    width: 32px;
    height: 32px;
}
.coming.pluieFaible {
    background: #5ec5ed;
}
.coming.pluieModeree {
    background: #009ee0;
}
.coming.pluieForte {
    background: #006ab3;
}
</style>
<div class="times">
    <div class="start"></div>
    <div class="end"></div>
</div>
<div class="forecasts"></div>
<div class="coming"></div>
`;

const strPad = (value) => {
    value = value + '';
    if (value.length == 1) {
        value = '0' + value;
    }
    return value;
};

const getCssClass = (state) => {
    let etat = 'sec';
    switch (state.toLowerCase()) {
        case 'pluie faible':
            etat = 'pluieFaible';
            break;
        case 'pluie modérée':
            etat = 'pluieModeree';
            break;
        case 'pluie forte':
            etat = 'pluieForte';
            break;
    }
    return etat;
}

class MeteoFranceNextRainUi extends HTMLElement {

    setState(state) {
        if (!this.forecasts) {
            this.attachShadow({
                mode: 'open'
            });
            this.shadowRoot.append(template.content.cloneNode(true));
            this.start = this.shadowRoot.querySelector('.start');
            this.end = this.shadowRoot.querySelector('.end');
            this.forecasts = this.shadowRoot.querySelector('.forecasts');
            this.coming = this.shadowRoot.querySelector('.coming');

            let nb = 0;
            Object.keys(state[KEY_HOUR_FORECAST]).forEach(key => {
                const slot = new MeteoFranceNextRainUiSlot();
                slot.classList.add(nb % 2 ? 'odd' : 'even');
                this.forecasts.appendChild(slot);
                slot.key = key;
                nb++;
            });
        }

        const startDate = new Date(state.forecast_time_ref);
        const endDate = new Date(state.forecast_time_ref);
        endDate.setTime(endDate.getTime() + 60 * 60 * 1000);
        this.start.innerHTML = strPad(startDate.getHours()) + ':' + strPad(startDate.getMinutes());
        this.end.innerHTML = strPad(endDate.getHours()) + ':' + strPad(endDate.getMinutes());

        let firstComing = false;
        let firstComingState = false;
        let nb = 0;
        Object.keys(state[KEY_HOUR_FORECAST]).forEach(key => {
            this.forecasts.children[nb].setState(state[KEY_HOUR_FORECAST][key]);
            nb++;
            if (state[KEY_HOUR_FORECAST][key] != 'Temps sec' && !firstComing) {
                firstComing = state[KEY_HOUR_FORECAST][key] + (key != '0 min' ? ' dans ' + key : '');
                firstComingState = getCssClass(state[KEY_HOUR_FORECAST][key]);
            }
        });

        if (firstComing) {
            this.coming.setAttribute('class', 'coming ' + firstComingState);
            this.coming.innerHTML = icons[firstComingState] + ' ' + firstComing;
        } else {
            this.coming.innerHTML = '';
        }
    }
}

customElements.define('meteo-france-next-rain-ui', MeteoFranceNextRainUi);

const icons = {
    sec: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.7 56.7" style="enable-background:new 0 0 56.7 56.7" xml:space="preserve"><path fill="#747474" d="m35.4 25.9 8.4-6.7-2-2.1-7.8 6.2c-2.5-4.4-5.8-8.1-5.8-8.1s-8.7 9.8-8.7 16.6c0 1 .1 1.9.3 2.8l-7.1 5.7 2 2.1 6.3-5 14.4-11.5c.1.1 0 .1 0 0zM22.7 39.2c1.4 1.3 3.2 2.1 5.3 2.2 4.8.2 8.9-3.6 9.1-8.6v-.9c0-1.2-.3-2.4-.7-3.7l-13.7 11z"/></svg>
  `,
    pluieFaible: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56.7 56.7" style="enable-background:new 0 0 56.7 56.7" xml:space="preserve"><path d="M28.3 15.3s-8.7 9.8-8.7 16.6c-.2 5 3.5 9.3 8.3 9.5s8.9-3.6 9.1-8.6v-.9c0-6.8-8.7-16.6-8.7-16.6z" fill="#fff"/></svg>
  `,
    pluieModeree: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 56.7 56.7" style="enable-background:new 0 0 56.7 56.7" xml:space="preserve"><path fill="#fff" d="M21.1 21.1s-8.6 9.8-8.6 16.6c-.2 5 3.5 9.2 8.2 9.5 4.8.2 8.8-3.6 9.1-8.6v-.9c-.1-6.8-8.7-16.6-8.7-16.6zM38.5 9.5s-5.8 6.5-5.8 11.1c-.2 3.3 2.3 6.2 5.5 6.3 3.2.2 5.9-2.4 6-5.7v-.6c0-4.5-5.7-11.1-5.7-11.1z"/></svg>
  `,
    pluieForte: `
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 56.7 56.7" style="enable-background:new 0 0 56.7 56.7" xml:space="preserve"><path fill="#fff" d="M29.4 25.1s-8.7 9.8-8.7 16.6c-.2 5 3.5 9.3 8.3 9.5s8.9-3.6 9.1-8.6v-.9c0-6.8-8.7-16.6-8.7-16.6zM41.1 4.8s-5.8 6.6-5.8 11.1c-.2 3.3 2.3 6.2 5.5 6.3 3.2.2 5.9-2.4 6.1-5.8v-.6c-.1-4.5-5.8-11-5.8-11zM14.9 13.5s-5.8 6.6-5.8 11.1c-.2 3.3 2.3 6.2 5.5 6.3 3.2.2 5.9-2.4 6.1-5.8v-.6c0-4.5-5.8-11-5.8-11z"/></svg>
  `
};

const templateSlot = document.createElement('template');
templateSlot.innerHTML = `
<style>
:host {
    display: flex;
    flex-direction: column;
}
:host(.even) span {
    opacity: 0;
}
.icon.pluieFaible {
    background: #5ec5ed;
}
.icon.pluieModeree {
    background: #009ee0;
}
.icon.pluieForte {
    background: #006ab3;
}
span {
    margin-top: -2px;
    text-align: center;
    font-size: 80%;
}
</style>
<div class="icon"></div>
<span></span>
`;

class MeteoFranceNextRainUiSlot extends HTMLElement {

    set key(key) {
        this._key = key;
    }

    setState(state) {
        if (!this.icon) {
            this.attachShadow({
                mode: 'open'
            });
            this.shadowRoot.append(templateSlot.content.cloneNode(true));
            this.icon = this.shadowRoot.querySelector('.icon');
            this.span = this.shadowRoot.querySelector('span');
        }

        let etat = getCssClass(state);

        this.icon.setAttribute('class', 'icon ' + etat);
        this.icon.innerHTML = icons[etat];
        this.span.innerHTML = this._key;
    }
}

customElements.define('meteo-france-next-rain-ui-slot', MeteoFranceNextRainUiSlot);

class MeteoFranceNextRain extends HTMLElement {
    // Whenever the state changes, a new `hass` object is set. Use this to
    // update your content.
    set hass(hass) {
        // Initialize the content if it's not there yet.
        const state = hass.states[this.config.entity].attributes;
        if (!this.ui) {
            const name = this.config.name && this.config.name ? this.config.name : state.friendly_name.replace(' Next rain', ' pluie dans l\'heure');
            this.innerHTML = `
        <ha-card header="${name}">
          <div class="card-content">
            <meteo-france-next-rain-ui></meteo-france-next-rain-ui>
          </div>
        </ha-card>
      `;
            this.ui = this.querySelector('meteo-france-next-rain-ui');
        }

        this.ui.setState(state);
    }

    // The user supplied configuration. Throw an exception and Home Assistant
    // will render an error card.
    setConfig(config) {
        if (!config.entity) {
            throw new Error('You need to define an entity');
        }
        this.config = config;
    }

    static getStubConfig(hass, entities, entitiesFallback) {
        const foundEntities = [];

        Object.keys(hass.states).forEach(stateName => {
            if (
                stateName.startsWith('sensor.') && stateName.endsWith('_next_rain') &&
                hass.states[stateName].attributes &&
                hass.states[stateName].attributes[KEY_HOUR_FORECAST]
            ) {
                foundEntities.push(stateName);
            }
        });

        return {
            entity: foundEntities[0] || "",
            name: ""
        };
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return 2;
    }
}

customElements.define('meteo-france-next-rain', MeteoFranceNextRain);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "meteo-france-next-rain",
    name: "Météo France pluie dans l'heure",
    preview: true, // Optional - defaults to false
    description: "A card to show rain in the hour provided by Météo France"
});