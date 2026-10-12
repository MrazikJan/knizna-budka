const map=L.map("map").setView([48.1486,17.1077],13);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
let budky=[],userMarker=null,nearestMarker=null;
const navrhyKey="knizne-budky-navrhy";
const navrhy=JSON.parse(localStorage.getItem(navrhyKey)||"[]");
function pridajMarker(b,navrh=false){const marker=L.marker([b.lat,b.lng]).addTo(map).bindPopup("");marker.bindPopup(document.createTextNode(b.nazov));if(navrh)marker.bindTooltip("Návrh (uložený v tomto zariadení)");return marker;}
fetch("budky.json").then(r=>r.json()).then(data=>{budky=data.concat(navrhy);data.forEach(b=>pridajMarker(b));navrhy.forEach(b=>pridajMarker(b,true));});
document.getElementById("btn").addEventListener("click",najdiNajblizsiu);
const form=document.getElementById("add-form"),locationStatus=document.getElementById("location-status");
document.getElementById("add-btn").addEventListener("click",()=>{form.hidden=false;document.getElementById("booth-name").focus();});
document.getElementById("close-form").addEventListener("click",()=>{form.hidden=true;});
document.getElementById("location-btn").addEventListener("click",()=>{
if(!navigator.geolocation){locationStatus.textContent="Tento prehliadač nepodporuje určovanie polohy.";return;}
locationStatus.textContent="Zisťujem tvoju polohu…";
navigator.geolocation.getCurrentPosition(pos=>{
document.getElementById("latitude").value=pos.coords.latitude.toFixed(6);
document.getElementById("longitude").value=pos.coords.longitude.toFixed(6);
locationStatus.textContent="Poloha je vyplnená. Pred uložením môžeš súradnice upraviť.";
},err=>{locationStatus.textContent=err.code===1?"Poloha nebola povolená. Povoľ prístup alebo zadaj súradnice ručne.":"Polohu sa nepodarilo zistiť. Skús to znova alebo zadaj súradnice ručne.";},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
});
form.addEventListener("submit",event=>{
event.preventDefault();
if(!form.reportValidity())return;
const navrh={nazov:document.getElementById("booth-name").value.trim(),lat:Number(document.getElementById("latitude").value),lng:Number(document.getElementById("longitude").value)};
if(!navrh.nazov)return;
try{navrhy.push(navrh);localStorage.setItem(navrhyKey,JSON.stringify(navrhy));}catch(error){locationStatus.textContent="Návrh sa nepodarilo uložiť v tomto zariadení.";return;}
budky.push(navrh);pridajMarker(navrh,true).openPopup();map.flyTo([navrh.lat,navrh.lng],16);form.reset();form.hidden=true;locationStatus.textContent="Návrh je uložený v tomto zariadení.";
});
function najdiNajblizsiu(){navigator.geolocation.getCurrentPosition(pos=>{const lat=pos.coords.latitude,lng=pos.coords.longitude;if(userMarker)map.removeLayer(userMarker);userMarker=L.circleMarker([lat,lng],{radius:8,color:"blue",fillOpacity:1}).addTo(map);let min=Infinity,n=null;budky.forEach(b=>{const d=map.distance([lat,lng],[b.lat,b.lng]);if(d<min){min=d;n=b;}});if(!n)return;if(nearestMarker)map.removeLayer(nearestMarker);nearestMarker=L.circle([n.lat,n.lng],{radius:50,color:'green'}).addTo(map);map.flyTo([n.lat,n.lng],16);document.getElementById('status').innerHTML=`<strong>${n.nazov}</strong><br>Vzdialenosť: ${Math.round(min)} m<br><a class="nav-button" target="_blank" href="https://maps.google.com/?q=${n.lat},${n.lng}">Navigovať</a>`;},err=>{document.getElementById('status').textContent='Povoľ GPS lokalizáciu alebo otvor aplikáciu cez HTTPS.';});}
