import { useState } from 'react';
import axios from 'axios';

const API_KEY = '1b2b008bc7b5bff18547f6a26fd9d171';
const API_URL = import.meta.env.VITE_API_KEY;

function App(){
  //Estado para el input
  const [city, setCity] = useState('');
  //Estado para la respuesta de la API
  const [weather, setWeather] = useState(null);
  //Estados para control de interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getBackground = () => {
    if (!weather) return 'bg-gray-900'; //Color por defecto (sin datos)

    const temp = weather.main.temp;
    if (temp < 15) return 'bg-blue-600'; //Menor a 15, Azul
    if (temp >= 15 && temp <= 25) return 'bg-emerald-600'; // Entre 15 y 25, Verde
    return 'bg-orange-500'; //Mayor a 25, Naranjo
  };

  const fetchWeather = async (e) => {
    e.preventDefault(); //Evita que el formulario recargue la página

    if (!city.trim()) return; //Si el input está vacio, no hace nada

    //Preparación de la UI para la busqueda
    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const response = await axios.get(API_URL, {
        params: {
          q: city,
          appid: API_KEY,
          units: 'metric', //Para Celsius
          lang: 'es' // Descripción en español
        }
      });

      setWeather(response.data); //Guardar datos (Caso de exito)

    } catch (err) {
      // Manejo de errores
      if (err.response && err.response.status === 404) {
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
            className="w-full p-4 rounded-xl text-gray-900 outline-none focus:ring-4 focus:ring-yellow-400/50 placeholder:text-gray-500 font-medium"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <buton
            type="submit"
            className="bg-black/40 hover:bg-black/60 p-4 rounded-xl font-bold transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '...' : '🔍'}
          </buton>
        </form>
      </div>

    </div>
  )
}

export default App;