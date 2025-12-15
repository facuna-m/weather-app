import { useState } from 'react';
import axios from 'axios';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

function App(){
  //Estado para el input
  const [city, setCity] = useState('');
  //Estado para la respuesta de la API
  const [weather, setWeather] = useState(null);
  //Estados para control de interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  //Estado para la lista de días futuros (Forecast)
  const [forecast, setForecast] = useState([]);

  const getBackground = () => {
    if (!weather) return 'bg-gray-900'; //Color por defecto (sin datos)

    const temp = weather.main.temp;
    if (temp < 15) return 'bg-blue-600'; //Menor a 15, Azul
    if (temp >= 15 && temp <= 25) return 'bg-emerald-600'; // Entre 15 y 25, Verde
    return 'bg-orange-400'; //Mayor a 25, Naranjo
  };

  const fetchWeather = async (e) => {
    e.preventDefault(); //Evita que el formulario recargue la página

    if (!city.trim()) return; //Si el input está vacio, no hace nada

    //Preparación de la UI para la busqueda
    setLoading(true);
    setError('');
    setWeather(null);
    setForecast([]);

    try {
      const currentRes = await axios.get(API_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric', //Para Celsius
          lang: 'es' // Descripción en español
        }
      });

      setWeather(currentRes.data); //Guardar datos (Caso de exito)

      const forecastRes = await axios.get(FORECAST_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric',
          lang: 'es'
        }
      });
      
      const dailyData = forecastRes.data.list.filter(reading =>
        reading.dt_txt.includes("12:00:00")
      );

      setForecast(dailyData);


    } catch (err) {
      // Manejo de errores
      if (err.currentRes && err.currentRes.status === 404) {
        setError('Ciudad no encontrada. Revisa el nombre.');
      } else {
        setError('Error de conexión o API KEY inválida.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center text-white transition-colors duration-700 ${getBackground()}`}>

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <h1 className="text-4xl font-bold text-center mb-8 drop-shadow-md">Weather App 🌤️</h1>
        {/* Formulario */}
        <form onSubmit={fetchWeather} className='flex gap-2 mb-6'>
          <input
            type="text"
            placeholder="Ej: Santiago, Buenos Aires..."
            className="w-full p-4 rounded-xl text-white-900 outline-none focus:ring-4 focus:ring-yellow-400/50 placeholder:text-gray-500 font-medium"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            type="submit"
            className="bg-black/40 hover:bg-black/60 p-4 rounded-xl font-bold transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '...' : '🔍'}
          </button>
        </form>

        {/*Errores*/}
        {error && (
          <div className="bg-red-500/80 p-4 rounded-xl mb-6 text-center font-bold animate-pulse border border-red-400">
            {error}
          </div>
        )}

        {/*Tarjeta*/}
        {weather && (
          <div className="text-center animate-bounce-in">
            <h2 className="text-3xl font-bold">{weather.name} {weather.sys.county}</h2>

            <div className="flex justify-center items-center py-4">
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                alt="icon"
                className="w-32 h-32 drop-shadow-lg"
              />
              <p className="text-7xl font-extrabold ml-[-10px]">{Math.round(weather.main.temp)}°</p>
            </div>

            <p className="text-2xl capitalize mb-8 font-light italic">{weather.weather[0].description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                <span className="text-sm text-gray-300 uppercase tracking-wider">Humedad</span>
                <p className="text-2xl font-bold mt-1">{weather.main.humidity}%</p>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm">
                <span className="text-sm text-gray-300 uppercase tracking-wider">Viento</span>
                <p className="text-2xl font-bold mt-1">{weather.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}

        {/*Pronostico Extendido*/}
        {forecast.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-center mb-4 text-white-90">Próximos Días</h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {forecast.map((day) => (
                <div key={day.dt} className="bg-black/30 p-3 rounded-xl text-center backdrop-blur-sm border border-white/10 hover:bg-black/40 transition">

                  {/*Fecha*/}
                  <p className="text-sm font-bold text-yellow-300">
                    {new Date(day.dt_txt).toLocaleDateString('es-ES', { weekday: 'short' })}
                  </p>

                  {/*Icono*/}
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt="icon"
                    className="w-10 h-10 mx-auto"
                  />

                  {/*Temperatura*/}
                  <p className="font-bold text-lg">{Math.round(day.main.temp)}°</p>

                  {/*Descripción corta*/}
                  <p className="text-xs text-gray-300 capitalize truncate">
                    {day.weather[0].description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default App;