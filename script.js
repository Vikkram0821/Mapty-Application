'use strict';




const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const resetbtn = document.querySelector(".resetAll")
const inputType = document.querySelector('.form__input--type');

const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let mapEvent;

class Workout{
    date = new Date();
    id = (Date.now()+"").slice(-10);
    constructor(coords,distance,duration)
{
    this.coords=coords;
    this.duration=duration;
    this.distance=distance;
    
}
_setDescription(){
// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
}}


class Running extends Workout{
    type = "running";
    constructor(coords,distance,duration,cadence) {
        super(coords,duration,distance);
        this.cadence=cadence;
        this.calcPace();
        this._setDescription();
    }
    calcPace(){
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}

class Cycling extends Workout{
    type = "cycling";
    constructor(coords,distance,duration,elevationGain) {
        super(coords,duration,distance);
        this.elevationGain=elevationGain;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed(){
        this.speed = this.distance/this.duration;
        return this.speed;
    }
}

const run1 = new Running([50,20],5.5,20,250);
const cycl1 = new Cycling([30,20],6.5,10,150);


//App
class App {
    #map;
    #workouts = [];
    mapZoomLevel = 13;
    constructor(){
        resetbtn.classList.add("reset-hidden")
        this._getCurrPosition();
        this._getLocalStorage();
       //Dom Elements
       form.addEventListener("submit",this._newWorkout.bind(this));
       
      
        resetbtn.addEventListener("click",function(){
        app.reset();
        resetbtn.classList.add("reset-hidden")
    })
  
       inputType.addEventListener("change",this._toggleElevation.bind(this));

       containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }

    _getCurrPosition(){

        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),function(){
            alert(":Could not get your Co-ords")
        })
    }

    _loadMap(position){

        const {latitude} = position.coords;
        const {longitude} = position.coords;
       
        const coords = [latitude,longitude]
    
        this.#map = L.map('map').setView(coords, 13);
    
        L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        this.#map.on("click",this._showForm.bind(this))

        this.#workouts.forEach (wrk => this.renderWorkoutMarker(wrk) )
    }

    
  _hideForm() {
    // Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

    
    _showForm(mapE){
        mapEvent =mapE
            console.log(mapEvent);
            form.classList.remove("hidden");
            inputDistance.focus();
    }
    _toggleElevation(){
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    }

    _newWorkout(e){
        e.preventDefault();
       const {lat,lng} = mapEvent.latlng;
       const allPositive =  (...input) => input.every( inpt => inpt>0)
      const ValidInput = (...input) => input.every( inpt => Number.isFinite(inpt));
      //to get datas

      const type = inputType.value;
      const distance = +inputDistance.value;
      const duration = +inputDuration.value;

       //Running
     if(type === "running"){

        const cadence = +inputCadence.value;
        //check if the data is valid
        console.log(typeof(cadence));
        if(!ValidInput(distance,duration,cadence) || !allPositive(distance,duration,cadence) ){
            return alert("You should enter a positive number!")
        }let workout;
        workout = new Running([lat,lng],distance,duration,cadence);
        this.#workouts.push(workout);
        this.renderWorkoutMarker(workout);
        this.renderWorkout(workout);
     }
       //Cycling (can have negative elevation value)
       if(type === "cycling"){
     
        const elevationGain = +inputElevation.value;
        //check if the data is valid
        if(!ValidInput(distance,duration,elevationGain)  || !allPositive(distance,duration)){
            return alert("You should eneter a positive number!")
        }let workout;
        workout = new Cycling([lat,lng],distance,duration,elevationGain);
        this.#workouts.push(workout);
        this.renderWorkoutMarker(workout);
        this.renderWorkout(workout);
     }
        //Clear Input fields
    
        this._hideForm();
    
       
        this._setLocalStorage();
    }

  
    renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth:250,
            minWidth:100,
            autoClose:false,
            closeOnClick:false,
            className:`${workout.type}-popup`
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup();
        form.classList.add("hidden")
    }

    renderWorkout(workout){
    let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
          <h2 class="workout__title">${workout.description} <span><button class="deletebtn" style="font-size:15px; margin-left:130px; background:none;
          border: none;
          
          outline: inherit; color: rgb(223, 132, 132);">Delete</button></span></h2>
        
          <div class="workout__details">
            <span class="workout__icon">${workout.type === "running" ? "🏃" : "🚴‍♀️"}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `; 
        
        if(workout.type === "running")
        html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
      </li>
        `;

        if(workout.type === "cycling")
        html+= `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
      </li>
        `;

        form.insertAdjacentHTML("afterend",html);
        resetbtn.classList.remove("reset-hidden")
        const deleteBtn = document.querySelector(".deletebtn");

    }

    _moveToPopup(e){
        if(!this.#map) return;
        
        const MoveWorkout = e.target.closest(".workout");

        if(!MoveWorkout) return;

        const workout = this.#workouts.find( wrk => wrk.id === MoveWorkout.dataset.id);

        this.#map.setView(workout.coords, this.mapZoomLevel, {
         animate: true,
         pan:{
            duration:1,
         }

        })
    }
    _setLocalStorage(){
              localStorage.setItem("workouts", JSON.stringify(this.#workouts))
    }
    _getLocalStorage(){
       const data = JSON.parse(localStorage.getItem("workouts"));

       if(!data) return;

       this.#workouts = data;

       this.#workouts.forEach (wrk => this.renderWorkout(wrk) )
       
    }
    reset(){
    localStorage.removeItem('workouts');
    location.reload();
    }

   
           
        
    
}

const app = new App();
