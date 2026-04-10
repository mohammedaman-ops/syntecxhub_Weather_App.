import { useState, useEffect } from 'react';

function App() {
  const [selectedCity, setSelectedCity] = useState("Sharjah");
  const [searchQuery, setSearchQuery] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = "be9a4a349a96b2242f7a5be0d9f05696";

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
      );

      if (!weatherRes.ok) throw new Error("City not found or API key activating.");

      const data = await weatherRes.json();
      
      setWeatherData({
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        icon: data.weather[0].icon,
        windSpeed: Math.round(data.wind.speed * 2.237),
        humidity: data.main.humidity,
        location: data.name,
        country: data.sys.country,
        pressure: data.main.pressure,
        visibility: (data.visibility / 1000).toFixed(1)
      });

      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        const dailyForecast = forecastData.list.filter(reading => reading.dt_txt.includes("12:00:00"));
        setForecast(dailyForecast);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
  }, [selectedCity]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchWeather(searchQuery);
      setSearchQuery("");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center font-sans">
      <div className="text-white text-xl animate-pulse">Searching World Weather...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-red-600 flex flex-col items-center justify-center p-6 text-center font-sans text-white">
      <p className="text-2xl font-bold mb-4 italic">Oops!</p>
      <p className="text-lg opacity-90 mb-8 max-w-sm">{error}</p>
      <button onClick={() => fetchWeather("Sharjah")} className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-xl active:scale-95 transition-all">
        Back to Sharjah
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#4A90E2] text-white font-sans relative overflow-x-hidden pb-10">
      <div className={`fixed inset-0 bg-gradient-to-b ${weatherData.temp > 28 ? 'from-orange-400 to-blue-600' : 'from-blue-400 to-blue-800'} transition-all duration-1000`}></div>

      <div className="relative z-10 p-6 max-w-md mx-auto">
        
        {/* WORLD SEARCH BAR */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input 
              type="text"
              placeholder="Search any city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/20 backdrop-blur-lg border border-white/30 text-white rounded-2xl p-4 outline-none placeholder-white/60 font-medium pr-12"
            />
            <button type="submit" className="absolute right-4 top-4 opacity-70">🔍</button>
          </div>
        </form>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-normal drop-shadow-md">{weatherData.location}, {weatherData.country}</h1>
          <img src={`https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`} alt="icon" className="w-32 h-32 mx-auto drop-shadow-2xl" />
          <p className="text-[100px] font-thin leading-none">{weatherData.temp}°</p>
          <p className="text-2xl font-medium opacity-90">{weatherData.condition}</p>
        </div>

        {/* 5-DAY FORECAST */}
        {forecast.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/20 shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-4">5-Day Forecast</p>
            <div className="space-y-4">
              {forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0">
                  <p className="w-12 font-medium">
                    {index === 0 ? "Today" : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <img src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="icon" className="w-10 h-10" />
                  <div className="flex space-x-4">
                    <p className="font-bold">{Math.round(day.main.temp_max)}°</p>
                    <p className="opacity-50">{Math.round(day.main.temp_min)}°</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ALERTS */}
        {(weatherData.windSpeed > 15 || weatherData.condition.toLowerCase().includes("rain")) && (
          <div className="bg-white/10 backdrop-blur-md border-l-4 border-yellow-400 rounded-r-2xl p-4 mb-6 shadow-xl">
            <p className="text-xs font-bold uppercase opacity-70 mb-1">Weather Alert</p>
            <p className="text-sm font-semibold">
              {weatherData.condition.toLowerCase().includes("rain") ? "Rain expected. " : ""}
              {weatherData.windSpeed > 15 ? `Strong winds: ${weatherData.windSpeed} mph.` : ""}
            </p>
          </div>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Wind</p>
            <p className="text-2xl font-medium">{weatherData.windSpeed} <span className="text-sm font-light">MPH</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Humidity</p>
            <p className="text-2xl font-medium">{weatherData.humidity}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Visibility</p>
            <p className="text-2xl font-medium">{weatherData.visibility} <span className="text-sm font-light">KM</span></p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl text-center">
            <p className="text-[10px] font-bold uppercase opacity-50 mb-1">Pressure</p>
            <p className="text-2xl font-medium">{weatherData.pressure}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;