import {
  useEffect,
  useState,
  useMemo
} from 'react'
import React from 'react'
import Swal from 'sweetalert2'
import useSWR from 'swr'
import Image from 'next/image'
import Script from 'next/script'
import Head from 'next/head'
import Toast from '/components/toasts'
import {useTheme} from 'next-themes'
 
export default function Weather() {


  //necessary variables
  const [myLat,
    setMyLat] = useState(null);
  const [myLon,
    setMyLon] = useState(null);
  const [pos,
    setPos] = useState(null);
  const [lat,
    setLat] = useState(null);
  const [long,
    setLong] = useState(null);
  const [city,
    setCity] = useState('');
  const [lookup,
    setLookup] = useState(false);
  const [view,
    setView] = useState(null);
  const [myView,
    setMyView] = useState(null);
  const [date,
    setDate] = useState(new Date());
  const {theme,
    setTheme} = useTheme(); 
  const [safe,setSafe] = useState(false);
 const metric = {name: "metric", tempUnit: "°C", speedUnit: "m/s"}
const imperial = {name: "imperial", tempUnit: "°F", speedUnit: "mi/h"} 
 const [unit,setUnit] = useState(metric);      
 
 
   
    
  const months = ['January',
    'Feburary',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'];
  const days = ['Sunday',
    'Monday',
    'Tuesday',
    'Wednessday',
    'Thursday',
    'Friday',
    'Saturday'];



  const fetcher = (...args) => fetch(...args).then((res) => res.json())

  const {
    data,
    error
  } = useSWR(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=503c0d115024c1db338943c3e194e4ec&units=${unit.name}`, fetcher);  


  useEffect(() => {
    
    setSafe(true);
    setUnit(getUnit() || metric); 
    UIkit.dropdown('#dropdown'); 
 
    //UIkit.sticky('#nav');

    function getLocation() {
      if (!pos) {
        Swal.close();
        if (!navigator.geolocation) {
          Swal.fire({
            icon: 'error',
            Title: "Your browser doesn't support location sharing"
          })
        } else {
          console.log('Checking location...');
          navigator.geolocation.getCurrentPosition(success, error);
        }
      }
      
    }


    //get last known location from section storage
    const getLastKnownLocation = () => {
      let coords = window.localStorage.getItem("coords");
      if (coords) {
      coords = JSON.parse(coords); 
      setLat(coords.latitude);
      setLong(coords.longitude);
      setView(coords.view); 
      
     Toast({message: `Couldn't get location! \nNow using last known location: (${coords.view})`}) 
       return true;  
      }
      return false;  
    }
    
  

    
    
    const error = err => {
     //if no location data is available set default location to lagos
       
     if(!getLastKnownLocation()) {
      setLat(6.465);
      setLong(3.406);
      setView('Lagos'); 
    return new Toast({ message: "Couldn't get location! \n Now using default location (Lagos)"});
     }   
   }


    function promptForLocation() {
      Swal.fire({
        html: `<div class="uk-text-center "><div><span class="bi-geo-alt-fill location-icon" style="font-size: 5em;"></span></div>
        <div class="uk-padding-small">For better accuracy, please allow this app use your device location</div>
        <div> <button class="uk-button uk-width-large uk-border-rounded uk-form-large swal-btn" id="confirmBtn">OK</button></div>
        `,
        customClass: 'swal',
        showConfirmButton: false,
        allowOutsideClick: false,
      })
    }

    promptForLocation();

    let btn = document.querySelector('#confirmBtn');
    btn.addEventListener('click',
      getLocation,
      false);
      
  function getUnit() {
    let unit = window.localStorage.getItem('unit');
    unit = JSON.parse(unit);
    if(unit) return unit
   return false; 
  }
      
  
  },
    [])


   const success = obj => { 
      
      //set location data
   
      setPos(obj);
      setLat(obj.coords.latitude);
      setLong(obj.coords.longitude);
      setMyLat(obj.coords.latitude);
      setMyLon(obj.coords.longitude);
      
      
      
      
      //fetch city name of location and set it

      fetcher(`https://api.openweathermap.org/data/2.5/weather?lat=${obj.coords.latitude}&lon=${obj.coords.longitude}&appid=503c0d115024c1db338943c3e194e4ec&units=metric`).then(data => {
        if (data.main) {   
          setView(data.name);
          setMyView(data.name);
          
         
         //store user location

        const coords = {
        view: data.name,
        latitude : obj.coords.latitude,
        longitude : obj.coords.longitude
        }   
      
      window.localStorage.setItem("coords",JSON.stringify(coords))
      
        }
      })
    } 

//check permissions status
  function getPermisson() {
    if(navigator.permissions) {
    navigator.permissions.query({
      name: 'geolocation'
    }).then(function(result) {
      if (result.state == 'granted') {
        setLat(myLat);
        setLong(myLon);
        setCity('');
        setView(myView);
      } else if (result.state == 'prompt') {
        report(result.state);
        navigator.geolocation.getCurrentPosition(success, error); 
      } else if (result.state == 'denied') {
        report(result.state);
      }
      result.onchange = function() {
        report(result.state);
      }
    });
    } else {
      navigator.geolocation.getCurrentPosition(success, function(){report('denied');});
    }  
  } 

  function report(state) {
    if (state == 'granted' || state == 'denied') {
      Swal.fire({
        html: `<h2>Permission ${state}</h2>
        <div>User ${state} access to device location</div>`, 
          customClass: 'swal',
      })  
    } 
  }

  function handleSubmit(e) {
    e.preventDefault();

    fetcher(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=503c0d115024c1db338943c3e194e4ec&units=metric`).then(data => {
      if (data.main) {
        setLat(data.coord.lat);
        setLong(data.coord.lon);
        setView(data.name);
      }
    })
  }

  

  function weatherIcon(main,
    des,
    me) {
    let m = me.split('');
    m = m[m.length - 1];
    if (main == "clouds") {
      if (m == "n") return 'partly-cloudy-night'
      return 'partly-cloudy-day'
    } else if (main == "clear") {
      if (m == "d") return 'clear-day'
      return "clear-night"
    } else if (main == "snow") {
      return 'overcast-snow'
    } else if (main == 'rain') {
      return 'rain'
    } else if (main == "drizzle") {
      return "drizzle"
    } else if (main == "thunderstorm") {
      return 'thunderstorms-extreme'
    } else if (main == 'mist') {
      return 'mist'
    } else if (main == 'haze') {
      return 'haze'
    } else if (main == 'dust' || main == 'sand') {
      return 'dust'
    } else if (main == 'fog') {
      return 'fog'
    } else if (main == 'smoke') {
      return 'smoke'
    } else if (main == 'tornado') {
      return 'tornado'
    } else if (main == 'squall') {
      return 'wind'
    }
  }



  function CalcTime( {
    offset, type, unix
  }) {
    // create Date object for current location
    useEffect(() => {
      const interval = setInterval(() => {
        setDate(new Date);
      }, 1000);
      return () => clearInterval(interval);
    }, [])

    if (!unix) {
      // convert to msec
      // subtract local time zone offset
      // get UTC time in msec
      var utc = date.getTime() + (date.getTimezoneOffset() * 60000);

      // create new Date object for different city
      // using supplied offset
      var nd = new Date(utc + (3600000*offset));
    } else {

      var utc = unix * 1000 + (date.getTimezoneOffset() * 60000);
      var nd = new Date(utc + (3600000*offset));
      // var nd = new Date(unix * 1000);
    }

    // return time as a string
    let hour = nd.getHours();
    let min = nd.getMinutes();
    let day = days[nd.getDay()];
    let month = months[nd.getMonth()];
    let m = 'AM'
    if (hour > 11) m = 'PM'
    if (hour > 12) hour -= 12;
    if (hour == 0) hour = 12;
    if (hour < 10) hour = '0'+ hour;
    if (min < 10) min = '0'+ min;

    if (type == 'day') return day;

    if (type == "hour")  return day.slice(0, 3)  + ' ' + hour+':'+min+' '+m;


    return nd.getDate() + ' ' + month + ', '  + hour+':'+min+' '+m;
  }

 function storeUnit(unit) {
    window.localStorage.setItem('unit',JSON.stringify(unit));
    hideDropdown();  
  }
 const hideDropdown = () => {
   UIkit.dropdown('#dropdown').hide(0); 
 } 


  const hourly = [];
  const daily = [];
  if (data !== undefined) {
    if (data.hourly !== undefined) {
      data.hourly.forEach((hour, id) => {
        if (id < 11) {
          let item = (
            <div className="uk-card uk-padding-small uk-margin-left hourly-weather-card uk-border-rounded">
            <h6 className="uk-text-center"><CalcTime unix={hour.dt} offset={data.timezone_offset/3600} type="hour" /></h6>
             <div className="uk-grid uk-grid-collapse">
              <div className="uk-width-auto">
               <div style={ { fontSize: '1.1em' }}>
            {Math.round(hour.temp)}°
            </div>
               <div className="uk-text-small">
            {hour.weather[0].description}
            </div>
            </div>
          <div className="uk-width-expand">
            <img src={`https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/${weatherIcon(hour.weather[0].main.toLowerCase(), hour.weather[0].description.toLowerCase(), hour.weather[0].icon)}.svg`} />
            </div>
            </div>
            </div>
          )
          hourly.push(item);
        }
      })
    };

    if (data.daily !== undefined) {
      data.daily.forEach((day, id) => {
        if (id > 0 && id < 7) {
          let item = (
            <div className='uk-card uk-padding-small  daily-weather-card uk-border-rounded  uk-width-1-2@s uk-width-1-3@m uk-margin-right'> 
           
             <h3 className="uk-text-center">{(id!==1)? (<CalcTime offset={data.timezone_offset/3600} unix={day.dt} type="day" />) : 'Tommorow'}</h3> 
               
             <div className="uk-grid uk-grid-collapse"> 
              <div className="uk-width-auto">
               <div className="uk-text-bold">
                <span className="bi-"></span>  {Math.round(day.temp.max)}°<span className="bi-arrow-up"></span>/ {Math.round(day.temp.min)}°<span className="bi-arrow-down"></span>
              </div>
               <h6>{day.clouds}% cloudiness</h6>
               
              </div>
              <div className="uk-width-expand">
              <div className="uk-text-right"> 
               <img src={`https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/${weatherIcon(day.weather[0].main.toLowerCase(), day.weather[0].description.toLowerCase(), day.weather[0].icon)}.svg`} />
                </div>
               <div className=" uk-text-right">
                  <span className="bi-info-circle"></span>&nbsp;{day.weather[0].description}
                </div>
              </div>
            </div>
            <h6>{day.pop * 100}% probability of precipitation</h6>  
            </div>
          )
          daily.push(item);
        }
      })
    }
  }

 

  return (
    <div>
    <Head>
     <title>Gomyweather</title>
     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.14.1/dist/css/uikit.min.css" />
    </Head>
     <Script src="https://cdn.jsdelivr.net/npm/uikit@3.14.1/dist/js/uikit.min.js" strategy="beforeInteractive" />
     <div id="nav" className="uk-padding-small-top uk-padding-remove-bottom uk-box-shadow-medium">  
      <div className="uk-padding-small ">
      <div className="uk-grid uk-grid-collapse">
      <div className="uk-width-auto">
   <button className={((myLon == long && myLat == lat && myLon !== null)? 'active': '')+ ' uk-button uk-button-default uk-padding-small  bi-geo-alt-fill  uk-border-rounded flex-center'} style={ { fontSize: '1.6em', color: 'var(--color)' }} onClick={getPermisson}></button> 
    </div> 
        <div className=" uk-width-expand  flex-center"> 
        <form onSubmit={handleSubmit}>
        <div className="uk-inline">
        <span className="uk-form-icon uk-form-icon-flip bi-search"></span><input id='city' type="search" className="uk-input uk-width-expand uk-border-rounded" placeholder="Enter a city name" value={city} onChange={(e) => setCity(e.target.value)} style={{background: 'transparent', color : "var(--color)"}}/>
      </div> 
      </form> 
    </div>
         <div className="uk-width-auto uk-padding-small-left">{(safe)?  (<button className={`uk-button uk-button-default flex-center  bi-${(theme == 'dark')? 'sun': 'moon-stars'}-fill uk-border-rounded`} style={ { fontSize: '1.6em', color : "var(--color)" }}  onClick={(e) => {(theme == 'dark')? setTheme('light') : setTheme('dark')}}></button>) : (<div className='uk-padding-small'></div>)}    
    </div>  
    <div className="uk-width-auto  uk-padding-small-left">
   <button type="button" className="uk-button flex-center uk-button-default   bi-three-dots-vertical uk-border-rounded" style={ { fontSize: '1.6em', color: 'var(--color)' }}></button>  
   <div uk-dropdown id="dropdown">
   
    <ul class="uk-nav uk-dropdown-nav">
    <li class="uk-nav-header">Units</li>
        <li onClick={() => {setUnit(metric);
        storeUnit(metric);
        }} className={(unit.name == "metric")? 'active' : ''}>Metric (°C)&nbsp;</li>     
        <li onClick={() => {setUnit(imperial); 
         storeUnit(imperial)}} className={(unit.name == "imperial")? 'active' : ''}>Imperial (°F)</li>        
    </ul>  
</div> 
    </div>
    </div>
    </div>
    </div> 
     <div className="container uk-padding-small">  
            <div className="uk-grid-row-large uk-grid-column-small uk-grid-match uk-grid uk-child-width-1-2@s   uk-margin-top"> 
      <div className="uk-margin-top">
      <div className="uk-card uk-box-shadow-medium uk-border-rounded uk-padding-small weather-card" id="mainCard">{(data !== undefined && data.current !== undefined)?
     (<div className="uk-grid uk-grid-collapse">
      <div className="uk-width-auto">
      <div className="uk-margin-top uk-text-capitalize" style={ { fontSize: '2em' }}>
        {view}
      </div>
      <div className="" style={ { fontSize: '1.4em' }}>
        {(data !== undefined)? Math.round(data.current.temp) + '' + unit.tempUnit: 'loading...'}
      </div>
      <div className="uk-text-muted">
        {(data !== undefined)? 'feels like '+Math.round(data.current.feels_like) + '' + unit.tempUnit: 'loading...'}
      </div> 
      </div>
       <div className="uk-text-center uk-width-expand">
        <div className="uk-text-center">
          {(data !== undefined)? <img className="weather-icon" src={`https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/${weatherIcon(data.current.weather[0].main.toLowerCase(), data.current.weather[0].description.toLowerCase(), data.current.weather[0].icon)}.svg`} alt="weather-icon" />: ''}
        </div>
      </div>
      </div>) : ''}
      
      {(data !== undefined && data.current !== undefined)?
       (
      <div className="uk-grid uk-child-width-1-2 uk-grid-collapse uk-padding-remove">
       <div>
          <span className="bi-calendar-check"></span>&nbsp;{(data !== undefined)?  <CalcTime offset={data.timezone_offset/3600} />: ''}
        </div>
      <div className="uk-text-right uk-text-muted">
          <span className="bi-info-circle"></span>&nbsp;{(data !== undefined)? data.current.weather[0].description: ''}
        </div>
      </div>) : '' } 
        <h5>Hourly Forecast <span className="bi-arrow-right-circle"></span></h5>
        <div id="hourlyWeatherContainer" className="uk-overflow-auto uk-border-rounded"> 

         {hourly}
      </div>
      </div> 
      </div>
      <div className="uk-margin-top">
      <div id="otherInfoCard" className="uk-card uk-border-rounded uk-padding-small  uk-box-shadow-medium weather-card">
      {(data !== undefined && data.current !== undefined)? (
          <ul className="uk-list uk-list-divider uk-text-small">
         <li>
         <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/sunrise.svg" alt="🌅" /> sunrise
          </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
            <CalcTime offset={data.timezone_offset/3600} unix={data.current.sunrise} type="hour" />
          </div>
          </div>
          </li>
         <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/sunset.svg" alt="🌄" /> sunset
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              <CalcTime offset={data.timezone_offset/3600} unix={data.current.sunset} type="hour" />
            </div>
          </div>
          </li>
          <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/uv-index.svg" alt="" /> UV
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              {data.current.uvi}
            </div>
          </div>
          </li>
          <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/thermometer-raindrop.svg" alt="" />  dew point
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              {data.current.dew_point}{unit.tempUnit} 
           </div>
          </div>
          </li>
          <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/mist.svg" alt="" /> humidty
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              {data.current.humidity}%
            </div>
          </div>
          </li>
         <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/wind.svg" alt="" /> wind speed
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              {data.current.wind_speed}{unit.speedUnit} 
            </div>
          </div>
          </li>
         <li>
          <div className="uk-grid uk-grid-collapse">
         <div className="uk-width-auto">
         <img className="uk-padding-right" src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/cloudy.svg" alt="" /> cloudiness
            </div>
         <div className="uk-width-expand uk-text-right uk-margin-small-top">
              {data.current.clouds}%
            </div>
          </div>
          </li>
          </ul>
        ): '' }
        </div>
      </div>
      </div>
      <div className="uk-card uk-border-rounded uk-box-shadow-medium uk-padding-small uk-margin-top" id="dailyWeatherCard">
       <h4>Next 7 days <span className="bi-arrow-right-circle"></span></h4>  
       <div className="uk-flex uk-overflow-auto">
       {daily} 
        </div>
      </div>
    </div>
      <style jsx>
      {`
     

      `}
    </style>
    </div>
  )
}