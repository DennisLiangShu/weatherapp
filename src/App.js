import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Chart from 'chart.js/auto';
import { Form, Button, Table } from 'react-bootstrap';
import './App.css';

const Weather = () => {
  const [location, setLocation] = useState('');
  const [initialLocation, setInitialLocation] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [chart, setChart] = useState(null);

  const handleChange = (event) => {
    setLocation(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchCoordinates();
  };



  const fetchCoordinates = async () => {
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=1c2dc679798140dfb2ce79473cbfe3af`
      );
      const { lat, lng } = response.data.results[0].geometry;
      setLatitude(lat);
      setLongitude(lng);
      setInitialLocation(location);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        if (latitude && longitude) {
          const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&appid=42de8aebb4f74752d44089e9af67105e`
          );
          setWeatherData(response.data);
          createChart(response.data.hourly);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, [latitude, longitude]);


  const createChart = (hourlyData) => {
    const labels = hourlyData.slice(0, 24).map((hour) => formatTime(hour.dt));
    const temperatures = hourlyData.slice(0, 24).map((hour) => convertKelvinToCelsius(hour.temp));

    const ctx = document.getElementById('temperatureChart').getContext('2d');

    if (chart) {
      chart.destroy();
    }

    setChart(
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Temperature (°C)',
              data: temperatures,
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Temperature (°C)',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Time',
              },
            },
          },
        },
      })
    );
  };


  // Render weather data
  return (
    <div className='weather-container'>
      <h1>Weather App</h1>
      <Form onSubmit={handleSubmit} className="form-container">
        <Form.Label htmlFor="locationInput" className="input-label">
          Enter location:
        </Form.Label>
        <Form.Control
          type="text"
          id="locationInput"
          value={location}
          onChange={handleChange}
          placeholder="E.g., New York, London"
          className="input-field"
        />
        <Button variant="primary" type="submit" className="submit-button">
          Get Weather
        </Button>
      </Form>
      <div className="chart-container">
        <div className="chart-wrapper">
          <canvas id="temperatureChart"></canvas>
        </div>
      </div>
      {weatherData ? (
        // Render weather information

        <div>
          <div>
            <h3>Hourly Forecast for Today:</h3>
            <Table responsive>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Temperature (°C)</th>
                  <th>Temperature (°F)</th>
                  <th>Weather</th>
                </tr>
              </thead>
              <tbody>
                {weatherData && weatherData.hourly && (
                  weatherData.hourly.slice(0, 24).map((hour, index) => (
                    <tr key={index}>
                      <td>{formatTime(hour.dt)}</td>
                      <td>{convertKelvinToCelsius(hour.temp)}°C</td>
                      <td>{convertKelvinToFahrenheit(hour.temp)}°F</td>
                      <td>{hour.weather[0].description}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
          <div>
            <h3>Weekly Forecast:</h3>
            <Table responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Temperature (°C)</th>
                  <th>Temperature (°F)</th>
                </tr>
              </thead>
              <tbody>
                {weatherData && weatherData.daily && (
                  weatherData.daily.map((day, index) => (
                    <tr key={index}>
                      <td>{formatDate(day.dt)}</td>
                      <td>{convertKelvinToCelsius(day.temp.day)}°C</td>
                      <td>{convertKelvinToFahrenheit(day.temp.day)}°F</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>
        
      ) : (
        // Render loading or error message
        <p>Enter a location and click "Get Weather" to retrieve the weather information.</p>
      )}
    </div>
  );
};

// Helper functions for temperature conversion
const convertKelvinToCelsius = (kelvin) => {
  return Math.round(kelvin - 273.15);
};

const convertKelvinToFahrenheit = (kelvin) => {
  return Math.round((kelvin - 273.15) * 9 / 5 + 32);
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else {
    return date.toLocaleDateString();
  }
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const options = { hour: 'numeric', minute: 'numeric' };
  return date.toLocaleTimeString([], options);
};

export default Weather;