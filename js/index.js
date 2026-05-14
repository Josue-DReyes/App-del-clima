const searchForm = document.querySelector('.search-loaction');
const cityValue = document.querySelector('.search-loaction input');
const cityName = document.querySelector('.city-name p');
const cardBody = document.querySelector('.card-body');
const timeImage = document.querySelector('.card-top img');
const mainCard = document.querySelector('#main-card');
const forecastSection = document.querySelector('#forecast-section');
const forecastContainer = document.querySelector('#forecast');

const API_KEY = "9859b9c46dfd36abbc5030963244f89a";
const spitOutCelcius = (kelvin) => {
    return Math.round(kelvin - 273.15);
}

const isDayTime = (icon) => icon.includes('d');

const updateWeatherApp = (city) => {
    const imageName = city.weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/wn/${imageName}@2x.png`;
    cityName.textContent = city.name;
    cardBody.innerHTML = `
    <div class="card-mid row">
        <div class="col-8 text-center temp">
            <span>${spitOutCelcius(city.main.temp)}°C</span>
        </div>
        <div class="col-4 condition-temp">
            <p class="condition">${city.weather[0].description}</p>
            <p class="high">${spitOutCelcius(city.main.temp_max)}°C</p>
            <p class="low">${spitOutCelcius(city.main.temp_min)}°C</p>
        </div>
    </div>
    <div class="icon-container card shadow mx-auto">
        <img src="${iconSrc}" />
    </div>
    <div class="card-bottom px-5 py-4 row">
        <div class="col text-center">
            <p>${spitOutCelcius(city.main.feels_like)}°C</p>
            <span>Feels Like</span>
        </div>
        <div class="col text-center">
            <p>${city.main.humidity}%</p>
            <span>Humidity</span>
        </div>
    </div>
    `;

    if (isDayTime(imageName)) {
        timeImage.setAttribute('src', 'img/day_image.svg');
        cityName.classList.add('text-black');
        cityName.classList.remove('text-white');
    } else {
        timeImage.setAttribute('src', 'img/night_image.svg');
        cityName.classList.add('text-white');
        cityName.classList.remove('text-black');
    }

    mainCard.classList.remove('d-none');
};
const mostrarForecast = (data) => {
    forecastContainer.innerHTML = "";
    let dias = {};
    data.list.forEach(item => {
        let fecha = item.dt_txt.split(" ")[0];
        if (!dias[fecha]) {
            dias[fecha] = item;
        }
    });
    const items = Object.values(dias); 
    items.forEach((dia, index) => {
        const fechaFormato = new Date(dia.dt * 1000).toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });

        const icon = `https://openweathermap.org/img/wn/${dia.weather[0].icon}.png`;
    const esUltimo = index === items.length - 1;
    forecastContainer.innerHTML += `
        <div class="d-flex align-items-center justify-content-between p-3 ${esUltimo ? '' : 'border-bottom'}">
            <div style="width: 100px;">
                <span class="text-capitalize fw-bold" style="font-size: 0.9rem;">${fechaFormato}</span>
            </div>
            <div class="d-flex align-items-center flex-grow-1 justify-content-center">
                <img src="${icon}" width="40">
                <span class="ms-2 text-muted d-none d-sm-inline text-capitalize">${dia.weather[0].description}</span>
            </div>
            <div class="text-end" style="width: 70px;">
                <span class="fw-bold">${Math.round(dia.main.temp)}°C</span>
            </div>
        </div>
        `;
    });
    forecastSection.classList.remove('d-none');
};

searchForm.addEventListener('submit', e => {
    e.preventDefault();
    const citySearched = cityValue.value.trim();
    if(!citySearched) return; // No buscar si está vacío
    searchForm.reset();
    requestCity(citySearched)
        .then((data) => {
            updateWeatherApp(data);
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            return fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
            );
        })
        .then(res => {
        if (!res.ok) throw new Error('Error en el forecast');
        return res.json();
    })
    .then(data => {
        mostrarForecast(data);
    })
    .catch(err => {
        console.error("Error detallado:", err);
        mainCard.classList.add('d-none');
        forecastSection.classList.add('d-none');
    });
});