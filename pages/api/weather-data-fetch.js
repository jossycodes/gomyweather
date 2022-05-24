const api_key = process.env.API_KEY;


export default async function handler(req, res) {
  //get required body properties
 let bodyObject = JSON.parse(JSON.stringify(req.body)); 
 
 
 let url; 

  if (bodyObject.searchByCity) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${bodyObject.city}&appid=${api_key}&units=metric`;
  } else if(bodyObject.searchByCoords) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${bodyObject.latitude}&lon=${bodyObject.longitude}&appid=${api_key}&units=metric`; 
  } else {
    url = `https://api.openweathermap.org/data/2.5/onecall?lat=${bodyObject.latitude}&lon=${bodyObject.longitude}&appid=${api_key}&units=${bodyObject.unit.name || 'metric'}`  
  } 
  const response = await fetch(url); 
 const data = await response.json();
  
  console.log(data);
  res.status(200).json(data); 
}  