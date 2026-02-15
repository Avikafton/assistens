console.log("App virker 🔥");

/* =====================================================
GLOBAL ELEMENTS 
===================================================== */

const routeBtn = document.getElementById("routeBtn");
const personSelect = document.getElementById("personSelect");
const startInput = document.getElementById("start");
const useLocationBtn = document.getElementById("useLocationBtn");
const realMap = document.getElementById("realMap");

/* =====================================================
MAP OVERLAY LAYER (INDEX)
===================================================== */

let mapOverlay = document.getElementById("mapOverlay");

if(!mapOverlay && realMap){
  mapOverlay = document.createElement("div");
  mapOverlay.id = "mapOverlay";
  realMap.parentElement.style.position = "relative";
  realMap.parentElement.appendChild(mapOverlay);
}

/* =====================================================
GRAVE COORDINATES (INDEX + PERSON NAVIGATION)
===================================================== */

const graveCoords = {
  "Dan Turèll grav Assistens Cemetery Copenhagen": "55.6867,12.5483",
  "H.C. Andersen grav Assistens Cemetery Copenhagen": "55.6863,12.5479",
  "Søren Kierkegaard grav Assistens Cemetery Copenhagen": "55.6865,12.5475",
  "Niels Bohr grav Assistens Cemetery Copenhagen": "55.6871,12.5488",
  "Natasja grav Assistens Cemetery Copenhagen": "55.6869,12.5493",
  "H.C. Ørsted grav Assistens Cemetery Copenhagen": "55.6860,12.5485",
  "Michael Strunge grav Assistens Cemetery Copenhagen": "55.6868,12.5490",
  "Master Fatman grav Assistens Cemetery Copenhagen": "55.6864,12.5494",
  "Hans Scherfig grav Assistens Cemetery Copenhagen": "55.6872,12.5481",
  "Ib Spang Olsen grav Assistens Cemetery Copenhagen": "55.6861,12.5478",
  "Henry Heerup grav Assistens Cemetery Copenhagen": "55.6870,12.5476",
  "Emilie Sannom grav Assistens Cemetery Copenhagen": "55.6862,12.5489",
  "C.W. Eckersberg grav Assistens Cemetery Copenhagen": "55.6873,12.5484"
};

/* =====================================================
INDEX PAGE — MAP INTERACTION
===================================================== */

/* Zoom map when person chosen */
if(personSelect){
  personSelect.addEventListener("change", ()=>{
    const selected = personSelect.value;
    const coords = graveCoords[selected];

    if(!coords || !realMap) return;

    realMap.src = `https://www.google.com/maps?q=${coords}&z=18&output=embed`;
  });
}

/* =====================================================
INDEX — USE MY LOCATION
===================================================== */

function getUserLocation(){
  if(!navigator.geolocation){
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos)=>{
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if(startInput){
      startInput.value = `${lat}, ${lng}`;
    }

    if(realMap){
      realMap.src = `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    }

    showUserDot(lat, lng);
  },
  ()=>{
    alert("Allow location access to use this feature");
  });
}

if(useLocationBtn){
  useLocationBtn.addEventListener("click", getUserLocation);
}

/* =====================================================
INDEX — START ROUTE BUTTON
===================================================== */

if(routeBtn){
  routeBtn.addEventListener("click", ()=>{

    const destination = personSelect.value;
    let start = startInput.value;

    if(destination === ""){
      alert("Choose a person first");
      return;
    }

    if(start === ""){
      if(!navigator.geolocation){
        alert("Location not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition((pos)=>{
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        start = `${lat},${lng}`;
        const url = `https://www.google.com/maps?q=${destination}&output=embed&directionsmode=walking&origin=${start}`;
        if(realMap){
          realMap.src = url;
        }

        addGravePins();
        showRouteInfo(destination, start);
      });

      return;
    }

    const url = `https://www.google.com/maps?q=${destination}&output=embed&directionsmode=walking&origin=${start}`;
    if(realMap){
      realMap.src = url;
    }

    addGravePins();
    showRouteInfo(destination, start);
  });
}

/* =====================================================
INDEX — ROUTE INFO BOX (FAKE MAPS UI)
===================================================== */

function showRouteInfo(destination, start){

  let old = document.getElementById("routeInfoBox");
  if(old) old.remove();

  function haversine(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI/180;
    const dLon = (lon2 - lon1) * Math.PI/180;

    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  let distance = "";
  let time = "";

  try{
    const startParts = start.split(",");
    const startLat = parseFloat(startParts[0]);
    const startLng = parseFloat(startParts[1]);

    const coords = graveCoords[destination].split(",");
    const destLat = parseFloat(coords[0]);
    const destLng = parseFloat(coords[1]);

    const km = haversine(startLat, startLng, destLat, destLng);
    const meters = Math.round(km * 1000);
    const minutes = Math.max(1, Math.round((km / 5) * 60));

    if(meters < 1000){
      distance = meters + " m";
    } else {
      distance = km.toFixed(1) + " km";
    }

    time = minutes + " min walk";

  } catch(e){
    distance = "—";
    time = "—";
  }

  const box = document.createElement("div");
  box.id = "routeInfoBox";

  box.innerHTML = `
    <div class="route-ui">
      <div class="route-top">
        <strong>Walking route</strong>
        <span>🚶 ${time}</span>
      </div>
      <div class="route-bottom">
        <span>📍 ${distance}</span>
        <span>Destination selected</span>
      </div>
    </div>
  `;

  document.body.appendChild(box);
}

/* =====================================================
INDEX — USER DOT + PINS
===================================================== */

function showUserDot(){
  if(!mapOverlay) return;

  let dot = document.getElementById("userDot");
  if(dot) dot.remove();

  dot = document.createElement("div");
  dot.id = "userDot";
  mapOverlay.appendChild(dot);
}

function addGravePins(){
  if(!mapOverlay) return;

  document.querySelectorAll(".gravePin").forEach(p=>p.remove());

  Object.keys(graveCoords).forEach(name=>{
    const pin = document.createElement("div");
    pin.className = "gravePin";
    pin.title = name;
    mapOverlay.appendChild(pin);
  });
}

/* =====================================================
INDEX — SMOOTH MAP ZOOM
===================================================== */

function smoothZoom(newSrc){
  if(!realMap) return;

  realMap.style.transition = "transform 0.6s ease";
  realMap.style.transform = "scale(1.08)";

  setTimeout(()=>{
    realMap.src = newSrc;
    realMap.style.transform = "scale(1)";
  },300);
}

