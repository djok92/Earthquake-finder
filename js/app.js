Vue.component('earthquake-error', {
    props: ['err'],
    template:   `<div v-show="err">  
                    <div class="notification is-danger">
                        <button class="delete" @click="$emit(\'hideerror\')"></button>
                        {{ err }}
                    </div>
                </div>`,
});

Vue.component('earthquake-result', {
    props: ['msg'],
    template:   `<div v-show="msg">
                    <div class="notification is-primary">
                        <button class="delete" @click="$emit(\'hideresult\')"></button>
                        {{ msg }}
                    </div>
                </div>`,
});

Vue.component('earthquake-form', {
    template:   `<div class="wrapper">
                    <h1 class="title">Earthquakes | Finder</h1>
                    <div class="form-wrappear box">
                        <div class="field">
                            <label class="label">City</label>
                            <div class="control">
                                <input class="input" type="text" placeholder="Enter a city" v-model="city">
                            </div>
                        </div>

                        <div class="field">
                            <div class="field-body">
                                <div class="field">
                                    <label class="label">Radius(km)</label>
                                    <div class="control">
                                        <input class="input" type="number" placeholder="Enter radius in kilometers" v-model="radius">
                                    </div>
                                </div>

                                <div class="field">
                                    <label class="label">Start date</label>
                                    <div class="control">
                                        <input class="input" type="date" v-model="startDate">
                                    </div>
                                </div>
                                    
                                <div class="field">
                                    <label class="label">End date</label>
                                    <div class="control">
                                        <input class="input" type="date" v-model="endDate">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="field">
                            <label class="label">Find:</label>
                            <div class="field-body">
                                <div class="field">
                                    <div class="control">
                                        <div class="columns">
                                            <div class="column is-3">
                                                <label class="label">
                                                    <input type="radio" name="radioBtn" value="count" v-model="radioSelected">
                                                    Number of earthquakes for selected city
                                                </label>
                                            </div>

                                            <div class="column is-3">
                                                <label class="label">
                                                    <input type="radio" name="radioBtn" value="average" v-model="radioSelected">
                                                    Average earthquake magnitude for selected city
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="field is-grouped">
                            <div class="control">
                                <button class="button is-primary" @click="runSearch">Result</button>
                            </div>
                            <div class="control">
                                <button class="button is-text" @click="resetInputs">Reset</button>
                             </div>
                        </div>

                    </div>
                </div>`,

    data() {
        return {
            city: '',
            radius: '',
            startDate: '',
            endDate: '',
            radioSelected: '',
        }
    },

    methods: {
        resetInputs: function() {
            this.city = '';
            this.radius = '';
            this.startDate = '';
            this.endDate = '';
            this.$emit('hideresult');
            this.$emit('hideerror')
        },

        runSearch: function() {
            const latAndLong = `https://www.mapquestapi.com/geocoding/v1/address?key=fvBPkCf742T3gS1F755wgbrqjmOxfNcv&inFormat=kvp&outFormat=json&location=${encodeURI(this.city)}&thumbMaps=false&maxResults=1`;
            axios.get(latAndLong)
                .then(res => {
                    this.$emit('hideerror')
                    const lat = res.data.results[0].locations[0].displayLatLng.lat;
                    const long = res.data.results[0].locations[0].displayLatLng.lng;
                    const earthquakesUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4&
                                            starttime=${this.startDate}&
                                            endtime=${this.endDate}&
                                            latitude=${lat}&
                                            longitude=${long}&
                                            maxradiuskm=${this.radius}`;

                
                    axios.get(earthquakesUrl)
                    .then(res => {
                        let result = '';
                        let message = '';
                        if(this.radioSelected === 'count') {
                            result = res.data.features.length;
                            message = `The number of earthquakes for selected period is: ${result}.`
                            console.log(res)
                        } else if (this.radioSelected === 'average') {
                            const magnitudes = (res.data.features.map(item => item.properties.mag).reduce((a,b) => a + b)) / res.data.features.length;
                            result = magnitudes.toFixed(2);
                            message = `The average magnitude of earthquakes for selected period is: ${result}.`
                        } else {
                            alert('Please check one of search options!')
                        }

                        this.$emit('showresult', message);   
                    })
                    .catch(err => {
                        const errMessage = `Invalid request, please check all fields!`
                        this.$emit('showerror', errMessage)
                    });
                    
                }).catch(err => {
                    const errMessage = `Please check if you selected city!`
                    this.$emit('showerror', errMessage);
                });
        }
    }
})

new Vue({
    el: '#root',
    data: {
       msg: '',
       err: ''
    },

    methods: {
        showResult(msg) {
            this.msg = msg;
        }, 
        resetResult: function() {
            this.msg = '';
        },
        showError: function(err) {
            this.err = err
        },
        hideError: function() {
            this.err = '';
        }
    }
})