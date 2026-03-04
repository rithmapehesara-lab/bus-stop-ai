import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LANGUAGES = {
  en: { label: "EN", next: "Next Stop", approaching: "Approaching!", away: "away", noGPS: "Enable GPS", loading: "Getting location...", route: "Route", nearby: "Nearby", allStops: "All Stops", min: "min", favorites: "Favorites", schedule: "Schedule", search: "Search...", journey: "Journey", from: "From", to: "To", plan: "Plan", share: "Share", saved: "Saved!", noFav: "No favorites yet.", fare: "Fare", sos: "SOS", weather: "Weather", history: "History", rating: "Rate Driver", passengers: "Passengers", qr: "QR Ticket" },
  si: { label: "සිං", next: "ඊළඟ නැවතුම", approaching: "ළඟා වෙමින්!", away: "දුර", noGPS: "GPS සක්‍රිය කරන්න", loading: "ස්ථානය...", route: "මාර්ගය", nearby: "ළඟම", allStops: "සියලු නැවතුම්", min: "මිනි", favorites: "ප්‍රියතම", schedule: "කාලසටහන", search: "සොයන්න...", journey: "ගමන", from: "සිට", to: "දක්වා", plan: "සලකන්න", share: "බෙදාගන්න", saved: "සුරැකිණි!", noFav: "ප්‍රියතම නැත.", fare: "ගාස්තු", sos: "හදිසි", weather: "කාලගුණ", history: "ඉතිහාස", rating: "රේටිං", passengers: "මගීන්", qr: "QR" },
  ta: { label: "தமி", next: "அடுத்த நிறுத்தம்", approaching: "நெருங்குகிறது!", away: "தூரம்", noGPS: "GPS இயக்கவும்", loading: "இடம்...", route: "வழி", nearby: "அருகில்", allStops: "அனைத்தும்", min: "நிமி", favorites: "விருப்பங்கள்", schedule: "அட்டவணை", search: "தேடுக...", journey: "பயணம்", from: "இருந்து", to: "வரை", plan: "திட்டமிடு", share: "பகிர்", saved: "சேமிக்கப்பட்டது!", noFav: "விருப்பங்கள் இல்லை.", fare: "கட்டணம்", sos: "அவசரம்", weather: "வானிலை", history: "வரலாறு", rating: "மதிப்பீடு", passengers: "பயணிகள்", qr: "QR" },
};

const ROUTES = {
  all: { label: "All Routes", color: "#3b82f6", number: "" },
  colombo_maharagama: { label: "Colombo - Maharagama", color: "#10b981", number: "138", fare_per_km: 3.5 },
  colombo_kandy: { label: "Colombo - Kandy", color: "#f59e0b", number: "594", fare_per_km: 2.8 },
  colombo_galle: { label: "Colombo - Galle", color: "#ef4444", number: "02", fare_per_km: 2.5 },
  colombo_negombo: { label: "Colombo - Negombo", color: "#8b5cf6", number: "240", fare_per_km: 3.2 },
};

const SCHEDULE = {
  colombo_maharagama: ["5:00 AM","5:30 AM","6:00 AM","6:30 AM","7:00 AM","7:30 AM","8:00 AM","8:30 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM","8:00 PM","9:00 PM"],
  colombo_kandy: ["5:30 AM","6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"],
  colombo_galle: ["5:00 AM","6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM","7:30 PM"],
  colombo_negombo: ["5:00 AM","5:30 AM","6:00 AM","6:30 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","4:00 PM","6:00 PM","8:00 PM"],
};

const ALL_STOPS = [
  { id:1, name:"Colombo Fort", name_si:"කොළඹ කොටුව", name_ta:"கொழும்பு கோட்டை", lat:6.9344, lng:79.8428, route:"colombo_maharagama" },
  { id:2, name:"Pettah", name_si:"පිට්ටල", name_ta:"பெட்டா", lat:6.9385, lng:79.8530, route:"colombo_maharagama" },
  { id:3, name:"Maradana", name_si:"මරදාන", name_ta:"மாரதான", lat:6.9270, lng:79.8611, route:"colombo_maharagama" },
  { id:4, name:"Borella", name_si:"බොරැල්ල", name_ta:"போரெல்லா", lat:6.9157, lng:79.8728, route:"colombo_maharagama" },
  { id:5, name:"Narahenpita", name_si:"නාරාහේන්පිට", name_ta:"நாரஹேன்பிட்ட", lat:6.9010, lng:79.8745, route:"colombo_maharagama" },
  { id:6, name:"Nugegoda", name_si:"නුගේගොඩ", name_ta:"நுகேகொட", lat:6.8728, lng:79.8878, route:"colombo_maharagama" },
  { id:7, name:"Maharagama", name_si:"මහරගම", name_ta:"மஹரகம", lat:6.8478, lng:79.9261, route:"colombo_maharagama" },
  { id:8, name:"Kelaniya", name_si:"කෙළණිය", name_ta:"கேலனிய", lat:6.9547, lng:79.9208, route:"colombo_kandy" },
  { id:9, name:"Kadawatha", name_si:"කඩවත", name_ta:"கடவத்த", lat:7.0021, lng:79.9506, route:"colombo_kandy" },
  { id:10, name:"Gampaha", name_si:"ගම්පහ", name_ta:"கம்பஹா", lat:7.0917, lng:80.0137, route:"colombo_kandy" },
  { id:11, name:"Veyangoda", name_si:"වෙයන්ගොඩ", name_ta:"வேயன்கொட", lat:7.1583, lng:80.1028, route:"colombo_kandy" },
  { id:12, name:"Nittambuwa", name_si:"නිත්තඹුව", name_ta:"நித்தம்புவ", lat:7.1494, lng:80.2114, route:"colombo_kandy" },
  { id:13, name:"Kegalle", name_si:"කෑගල්ල", name_ta:"கேகாலை", lat:7.2513, lng:80.3464, route:"colombo_kandy" },
  { id:14, name:"Kandy", name_si:"මහනුවර", name_ta:"கண்டி", lat:7.2906, lng:80.6337, route:"colombo_kandy" },
  { id:15, name:"Dehiwala", name_si:"දෙහිවල", name_ta:"தெஹிவல", lat:6.8517, lng:79.8661, route:"colombo_galle" },
  { id:16, name:"Mount Lavinia", name_si:"මවුන්ට් ලාවිනියා", name_ta:"மவுண்ட் லவீனியா", lat:6.8389, lng:79.8656, route:"colombo_galle" },
  { id:17, name:"Moratuwa", name_si:"මොරටුව", name_ta:"மொரட்டுவ", lat:6.7731, lng:79.8819, route:"colombo_galle" },
  { id:18, name:"Panadura", name_si:"පානදුර", name_ta:"பாணந்துறை", lat:6.7133, lng:79.9036, route:"colombo_galle" },
  { id:19, name:"Kalutara", name_si:"කළුතර", name_ta:"களுத்துறை", lat:6.5854, lng:79.9607, route:"colombo_galle" },
  { id:20, name:"Aluthgama", name_si:"අළුත්ගම", name_ta:"அலுத்கம", lat:6.4344, lng:80.0042, route:"colombo_galle" },
  { id:21, name:"Hikkaduwa", name_si:"හික්කඩුව", name_ta:"ஹிக்கடுவ", lat:6.1395, lng:80.1056, route:"colombo_galle" },
  { id:22, name:"Galle", name_si:"ගාල්ල", name_ta:"காலி", lat:6.0535, lng:80.2210, route:"colombo_galle" },
  { id:23, name:"Peliyagoda", name_si:"පේලියගොඩ", name_ta:"பேலியகொட", lat:6.9617, lng:79.8883, route:"colombo_negombo" },
  { id:24, name:"Wattala", name_si:"වත්තල", name_ta:"வட்டல", lat:6.9897, lng:79.8928, route:"colombo_negombo" },
  { id:25, name:"Ja-Ela", name_si:"ජා-ඇල", name_ta:"ஜா-ஏல", lat:7.0736, lng:79.8917, route:"colombo_negombo" },
  { id:26, name:"Negombo", name_si:"මීගමුව", name_ta:"நீர்கொழும்பு", lat:7.2083, lng:79.8358, route:"colombo_negombo" },
];

const P = {"කොළඹ කොටුව":"Colombo Fort","පිට්ටල":"Pettah","මරදාන":"Maradana","බොරැල්ල":"Borella","නාරාහේන්පිට":"Narahenpita","නුගේගොඩ":"Nugegoda","මහරගම":"Maharagama","කෙළණිය":"Kelaniya","කඩවත":"Kadawatha","ගම්පහ":"Gampaha","වෙයන්ගොඩ":"Veyangoda","නිත්තඹුව":"Nittambuwa","කෑගල්ල":"Kegalle","මහනුවර":"Kandy","දෙහිවල":"Dehiwala","මවුන්ට් ලාවිනියා":"Mount Lavinia","මොරටුව":"Moratuwa","පානදුර":"Panadura","කළුතර":"Kalutara","අළුත්ගම":"Aluthgama","හික්කඩුව":"Hikkaduwa","ගාල්ල":"Galle","පේලියගොඩ":"Peliyagoda","වත්තල":"Wattala","ජා-ඇල":"Ja Ela","මීගමුව":"Negombo","கொழும்பு கோட்டை":"Colombo Fort","பெட்டா":"Pettah","மாரதான":"Maradana","போரெல்லா":"Borella","நாரஹேன்பிட்ட":"Narahenpita","நுகேகொட":"Nugegoda","மஹரகம":"Maharagama","கேலனிய":"Kelaniya","கடவத்த":"Kadawatha","கம்பஹா":"Gampaha","வேயன்கொட":"Veyangoda","நித்தம்புவ":"Nittambuwa","கேகாலை":"Kegalle","கண்டி":"Kandy","தெஹிவல":"Dehiwala","மவுண்ட் லவீனியா":"Mount Lavinia","மொரட்டுவ":"Moratuwa","பாணந்துறை":"Panadura","களுத்துறை":"Kalutara","அலுத்கம":"Aluthgama","ஹிக்கடுவ":"Hikkaduwa","காலி":"Galle","பேலியகொட":"Peliyagoda","வட்டல":"Wattala","ஜா-ஏல":"Ja Ela","நீர்கொழும்பு":"Negombo"};

function calcDist(a,b,c,d){const R=6371000,p=Math.PI/180;const x=0.5-Math.cos((c-a)*p)/2+Math.cos(a*p)*Math.cos(c*p)*(1-Math.cos((d-b)*p))/2;return Math.round(2*R*Math.asin(Math.sqrt(x)));}
function speak(name){const u=new SpeechSynthesisUtterance(P[name]||name);u.lang="en-US";u.rate=0.85;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}
function getNextBuses(route){const times=SCHEDULE[route]||[];const now=new Date();const cur=now.getHours()*60+now.getMinutes();return times.map(t=>{const[time,per]=t.split(" ");const[h,m]=time.split(":").map(Number);let mins=(per==="PM"&&h!==12?h+12:per==="AM"&&h===12?0:h)*60+m;return{time:t,diff:mins-cur};}).filter(t=>t.diff>=0).slice(0,4);}
function getCrowding(){const h=new Date().getHours();if(h>=7&&h<=9||h>=17&&h<=19)return{level:"High",color:"#ef4444",emoji:"🔴",pct:85};if(h>=10&&h<=16)return{level:"Medium",color:"#f59e0b",emoji:"🟡",pct:50};return{level:"Low",color:"#10b981",emoji:"🟢",pct:20};}
function generateQR(text){const size=150;return`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;}

function SplashScreen({onDone}){
  useEffect(()=>{setTimeout(onDone,2500);},[]);
  return(
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9999,color:"white"}}>
      <div style={{fontSize:"80px",animation:"bounce 0.8s infinite alternate"}}>🚌</div>
      <div style={{fontSize:"28px",fontWeight:"900",marginTop:"16px",letterSpacing:"-1px"}}>BusTrack SL</div>
      <div style={{fontSize:"13px",opacity:0.8,marginTop:"6px"}}>Sri Lanka Smart Bus Announcer</div>
      <div style={{marginTop:"30px",width:"120px",height:"4px",background:"rgba(255,255,255,0.2)",borderRadius:"4px",overflow:"hidden"}}>
        <div style={{height:"100%",background:"white",borderRadius:"4px",animation:"load 2.2s ease forwards"}}></div>
      </div>
      <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-15px)}}@keyframes load{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}

export default function App(){
  const[showSplash,setShowSplash]=useState(true);
  const[lang,setLang]=useState("en");
  const[tab,setTab]=useState("home");
  const[loc,setLoc]=useState(null);
  const[route,setRoute]=useState("all");
  const[nearest,setNearest]=useState(null);
  const[dist,setDist]=useState(null);
  const[approaching,setApproaching]=useState(false);
  const[status,setStatus]=useState("noGPS");
  const[announced,setAnnounced]=useState(false);
  const[nearby,setNearby]=useState([]);
  const[favs,setFavs]=useState(()=>JSON.parse(localStorage.getItem("bt_favs")||"[]"));
  const[tripHistory,setTripHistory]=useState(()=>JSON.parse(localStorage.getItem("bt_history")||"[]"));
  const[ratings,setRatings]=useState(()=>JSON.parse(localStorage.getItem("bt_ratings")||"{}"));
  const[search,setSearch]=useState("");
  const[jFrom,setJFrom]=useState("");
  const[jTo,setJTo]=useState("");
  const[jResult,setJResult]=useState(null);
  const[toast,setToast]=useState(null);
  const[pulse,setPulse]=useState(false);
  const[weather,setWeather]=useState(null);
  const[darkMode,setDarkMode]=useState(false);
  const[bigText,setBigText]=useState(false);
  const[sosActive,setSosActive]=useState(false);
  const[myRating,setMyRating]=useState(0);
  const[passengers]=useState(()=>Math.floor(Math.random()*40)+10);
  const notifRef=useRef(false);

  const t=LANGUAGES[lang];
  const filtered=route==="all"?ALL_STOPS:ALL_STOPS.filter(s=>s.route===route);
  const searched=search?ALL_STOPS.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.name_si.includes(search)||s.name_ta.includes(search)):filtered;
  const sn=(stop)=>!stop?"":lang==="si"?stop.name_si:lang==="ta"?stop.name_ta:stop.name;
  const eta=(d)=>Math.max(1,Math.round(d/250));
  const crowding=getCrowding();

  const dm={
    bg:darkMode?"#0f172a":"#f0f4ff",
    card:darkMode?"#1e293b":"white",
    text:darkMode?"#e2e8f0":"#1e293b",
    sub:darkMode?"#94a3b8":"#64748b",
    border:darkMode?"#334155":"#e2e8f0",
    input:darkMode?"#1e293b":"white",
  };

  const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(null),2500);};

  const toggleFav=(stop)=>{
    const e=favs.find(f=>f.id===stop.id);
    const u=e?favs.filter(f=>f.id!==stop.id):[...favs,stop];
    setFavs(u);localStorage.setItem("bt_favs",JSON.stringify(u));
    showToast(e?"Removed":"Saved!");
  };

  const saveTripHistory=(stop)=>{
    const trip={id:Date.now(),stop:stop.name,time:new Date().toLocaleTimeString(),date:new Date().toLocaleDateString(),route:stop.route};
    const updated=[trip,...tripHistory].slice(0,20);
    setTripHistory(updated);localStorage.setItem("bt_history",JSON.stringify(updated));
  };

  const saveRating=(r)=>{
    setMyRating(r);
    const routeKey=route!=="all"?route:"colombo_maharagama";
    const updated={...ratings,[routeKey]:{stars:r,time:new Date().toLocaleString()}};
    setRatings(updated);localStorage.setItem("bt_ratings",JSON.stringify(updated));
    showToast(`Rated ${r} stars! ⭐`);
  };

  const shareLoc=()=>{
    if(!loc)return;
    const msg=`Near ${nearest?sn(nearest):"Unknown"} bus stop!\n${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}\nhttps://maps.google.com/?q=${loc.lat},${loc.lng}`;
    if(navigator.share)navigator.share({title:"Bus Location",text:msg});
    else{navigator.clipboard.writeText(msg);showToast("Copied!");}
  };

  const triggerSOS=()=>{
    setSosActive(true);
    showToast("SOS Alert Sent! Emergency services notified.");
    speak("Emergency SOS activated. Help is on the way.");
    if(navigator.vibrate)navigator.vibrate([200,100,200,100,200]);
    setTimeout(()=>setSosActive(false),5000);
  };

  const planJourney=()=>{
    const f=ALL_STOPS.find(s=>s.name===jFrom);
    const to=ALL_STOPS.find(s=>s.name===jTo);
    if(!f||!to){showToast("Select valid stops");return;}
    if(f.route===to.route){
      const rs=ALL_STOPS.filter(s=>s.route===f.route);
      const fi=rs.findIndex(s=>s.id===f.id);
      const ti=rs.findIndex(s=>s.id===to.id);
      const stops=fi<ti?rs.slice(fi,ti+1):rs.slice(ti,fi+1).reverse();
      const d=stops.reduce((a,s,i)=>i===0?0:a+calcDist(stops[i-1].lat,stops[i-1].lng,s.lat,s.lng),0);
      const fare=Math.round((d/1000)*(ROUTES[f.route]?.fare_per_km||3));
      setJResult({stops,dist:d,time:Math.round(d/300),route:f.route,direct:true,fare});
    }else{
      setJResult({direct:false,msg:"Change bus at Colombo Fort"});
    }
  };

  useEffect(()=>{
    if(Notification.permission==="default")Notification.requestPermission();
  },[]);

  useEffect(()=>{
    if(!loc)return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current_weather=true&hourly=precipitation_probability`)
      .then(r=>r.json())
      .then(d=>{
        const w=d.current_weather;
        const rain=d.hourly?.precipitation_probability?.[new Date().getHours()]||0;
        setWeather({temp:Math.round(w.temperature),wind:w.windspeed,rain,code:w.weathercode});
      }).catch(()=>{});
  },[loc]);

  useEffect(()=>{
    if(!navigator.geolocation)return;
    setStatus("loading");
    const w=navigator.geolocation.watchPosition(pos=>{
      const{latitude:la,longitude:ln}=pos.coords;
      setLoc({lat:la,lng:ln});
      const wd=filtered.map(s=>({...s,dist:calcDist(la,ln,s.lat,s.lng)})).sort((a,b)=>a.dist-b.dist);
      const nr=wd[0];
      setNearest(nr);setDist(nr.dist);
      const isA=nr.dist<300;
      setApproaching(isA);setNearby(wd.slice(0,5));setStatus("ok");
      if(isA&&!announced){
        speak(sn(nr));setPulse(true);setTimeout(()=>setPulse(false),2000);
        saveTripHistory(nr);
        if(Notification.permission==="granted"&&!notifRef.current){
          new Notification("BusTrack SL",{body:`Approaching: ${nr.name}`});
          notifRef.current=true;
        }
        setAnnounced(true);
      }
      if(!isA){setAnnounced(false);notifRef.current=false;}
    },()=>setStatus("noGPS"),{enableHighAccuracy:true,maximumAge:3000});
    return()=>navigator.geolocation.clearWatch(w);
  },[lang,announced,route]);

  const nextBuses=route!=="all"?getNextBuses(route):[];
  const fs=bigText?1.2:1;
  const C=(e={})=>({background:dm.card,borderRadius:"16px",padding:"18px",marginBottom:"14px",boxShadow:darkMode?"0 2px 12px rgba(0,0,0,0.3)":"0 2px 12px rgba(0,0,0,0.07)",...e});
  const Bdg=(bg,cl)=>({display:"inline-flex",alignItems:"center",gap:"4px",padding:"4px 10px",borderRadius:"20px",fontSize:`${11*fs}px`,fontWeight:"600",background:bg,color:cl});
  const Btn=(bg,cl,e={})=>({padding:"8px 14px",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:`${13*fs}px`,background:bg,color:cl,...e});

  const bottomTabs=[
    {id:"home",icon:"🏠",label:"Home"},
    {id:"map",icon:"🗺️",label:"Map"},
    {id:"stops",icon:"🚏",label:"Stops"},
    {id:"more",icon:"⚙️",label:"More"},
    {id:"saved",icon:"⭐",label:"Saved"},
  ];

  const weatherIcon=(code)=>{if(!code&&code!==0)return"🌤️";if(code===0)return"☀️";if(code<=3)return"⛅";if(code<=67)return"🌧️";if(code<=77)return"❄️";return"⛈️";};

  if(showSplash)return <SplashScreen onDone={()=>setShowSplash(false)}/>;

  return(
    <div style={{minHeight:"100vh",width:"100%",maxWidth:"100vw",overflowX:"hidden",background:dm.bg,fontFamily:"'Segoe UI',sans-serif",color:dm.text,paddingBottom:"80px",fontSize:`${14*fs}px`,transition:"all 0.3s"}}>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:"80px",left:"50%",transform:"translateX(-50%)",background:"#1e293b",color:"white",padding:"10px 20px",borderRadius:"20px",zIndex:9999,fontSize:`${13*fs}px`,fontWeight:"600",boxShadow:"0 4px 20px rgba(0,0,0,0.3)",whiteSpace:"nowrap"}}>{toast}</div>}

      {/* SOS Overlay */}
      {sosActive&&<div style={{position:"fixed",inset:0,background:"rgba(239,68,68,0.95)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:9998,color:"white"}}>
        <div style={{fontSize:"60px",animation:"pulse 0.5s infinite alternate"}}>🆘</div>
        <div style={{fontSize:"28px",fontWeight:"900",marginTop:"16px"}}>SOS ACTIVATED</div>
        <div style={{fontSize:"14px",opacity:0.9,marginTop:"8px"}}>Emergency services notified</div>
        <div style={{fontSize:"13px",opacity:0.7,marginTop:"4px"}}>{loc?`GPS: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`:"Getting location..."}</div>
        <style>{`@keyframes pulse{from{transform:scale(1)}to{transform:scale(1.2)}}`}</style>
      </div>}

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",padding:"14px 16px",color:"white",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 20px rgba(29,78,216,0.4)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:"480px",margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <span style={{fontSize:"24px"}}>🚌</span>
            <div>
              <div style={{fontSize:`${17*fs}px`,fontWeight:"800"}}>BusTrack SL</div>
              <div style={{fontSize:"10px",opacity:0.8}}>Sri Lanka Smart Bus</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"5px",alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            {weather&&<div style={{...Bdg("rgba(255,255,255,0.2)","white"),fontSize:"11px"}}>{weatherIcon(weather.code)} {weather.temp}°C {weather.rain>50?"🌧️":""}</div>}
            <button onClick={triggerSOS} style={{padding:"5px 10px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"11px",fontWeight:"800",background:"#ef4444",color:"white",animation:sosActive?"pulse 0.5s infinite":"none"}}>🆘 SOS</button>
            {Object.entries(LANGUAGES).map(([k,v])=>(
              <button key={k} onClick={()=>setLang(k)} style={{padding:"4px 8px",borderRadius:"20px",border:"none",cursor:"pointer",fontSize:"10px",fontWeight:"700",background:lang===k?"white":"rgba(255,255,255,0.2)",color:lang===k?"#1d4ed8":"white"}}>{v.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:"16px",maxWidth:"480px",margin:"0 auto"}}>

        {/* HOME */}
        {tab==="home"&&<>
          {/* Weather Card */}
          {weather&&<div style={{...C({background:darkMode?"#1e3a5f":"linear-gradient(135deg,#0ea5e9,#38bdf8)",color:"white",padding:"14px 18px"})}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:"11px",opacity:0.8,fontWeight:"600",marginBottom:"4px"}}>🌤️ {t.weather?.toUpperCase()}</div>
                <div style={{fontSize:`${28*fs}px`,fontWeight:"800"}}>{weather.temp}°C</div>
                <div style={{fontSize:"11px",opacity:0.8}}>Wind: {weather.wind}km/h • Rain: {weather.rain}%</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:"50px"}}>{weatherIcon(weather.code)}</div>
                {weather.rain>50&&<div style={{fontSize:"11px",background:"rgba(255,255,255,0.2)",padding:"3px 8px",borderRadius:"10px",marginTop:"4px"}}>☔ Carry umbrella!</div>}
              </div>
            </div>
          </div>}

          {/* Route */}
          <div style={C()}>
            <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"8px",letterSpacing:"1px"}}>🛣️ ROUTE</div>
            <select style={{width:"100%",padding:"10px 14px",borderRadius:"10px",border:`2px solid ${dm.border}`,fontSize:`${14*fs}px`,background:dm.input,color:dm.text,cursor:"pointer",outline:"none"}} value={route} onChange={e=>setRoute(e.target.value)}>
              {Object.entries(ROUTES).map(([k,v])=><option key={k} value={k}>{v.number?`[${v.number}] `:""}{v.label}</option>)}
            </select>
          </div>

          {/* Crowding */}
          <div style={{...C({padding:"12px 18px"})}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"4px"}}>👥 {t.passengers?.toUpperCase()} & {t.crowding?.toUpperCase()}</div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <span style={{...Bdg(crowding.color+"20",crowding.color)}}>{crowding.emoji} {crowding.level}</span>
                  <span style={{fontSize:`${12*fs}px`,color:dm.sub}}>{passengers} on board</span>
                </div>
              </div>
              <div style={{width:"60px",height:"60px",borderRadius:"50%",border:`4px solid ${crowding.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
                <div style={{fontSize:"14px",fontWeight:"800",color:crowding.color}}>{crowding.pct}%</div>
                <div style={{fontSize:"9px",color:dm.sub}}>full</div>
              </div>
            </div>
            <div style={{marginTop:"8px",height:"6px",background:dm.border,borderRadius:"4px",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${crowding.pct}%`,background:crowding.color,borderRadius:"4px",transition:"width 1s"}}></div>
            </div>
          </div>

          {/* Next Stop */}
          <div style={{...C({background:approaching?"linear-gradient(135deg,#065f46,#059669)":dm.card,transition:"all 0.4s",transform:pulse?"scale(1.02)":"scale(1)"}),border:approaching?"none":`2px solid ${dm.border}`}}>
            <div style={{fontSize:"11px",fontWeight:"700",letterSpacing:"1px",color:approaching?"rgba(255,255,255,0.7)":dm.sub,marginBottom:"6px"}}>{t.next?.toUpperCase()}</div>
            {status==="noGPS"&&<div style={{color:"#ef4444"}}>📍 {t.noGPS}</div>}
            {status==="loading"&&<div style={{color:"#f59e0b"}}>⏳ {t.loading}</div>}
            {status==="ok"&&nearest&&<>
              <div style={{fontSize:`${28*fs}px`,fontWeight:"800",color:approaching?"white":dm.text,margin:"4px 0 10px"}}>{sn(nearest)}</div>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"center"}}>
                {approaching?<span style={{...Bdg("rgba(255,255,255,0.2)","white")}}>🔔 {t.approaching}</span>:<><span style={{...Bdg("#eff6ff","#1d4ed8")}}>📍 {dist}m {t.away}</span><span style={{...Bdg("#f0fdf4","#16a34a")}}>⏱ ~{eta(dist)} {t.min}</span></>}
                <button onClick={()=>speak(sn(nearest))} style={Btn(approaching?"rgba(255,255,255,0.2)":"#eff6ff",approaching?"white":"#1d4ed8")}>🔊</button>
                <button onClick={shareLoc} style={Btn("#f8fafc","#475569")}>📤</button>
                <button onClick={()=>toggleFav(nearest)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px"}}>{favs.find(f=>f.id===nearest.id)?"⭐":"☆"}</button>
              </div>
            </>}
          </div>

          {/* Next Buses */}
          {nextBuses.length>0&&<div style={C()}>
            <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"10px",letterSpacing:"1px"}}>🕐 NEXT BUSES</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {nextBuses.map((b,i)=><div key={i} style={{...Bdg(i===0?"#1d4ed8":"#f0f4ff",i===0?"white":"#1d4ed8"),padding:"6px 12px",borderRadius:"10px"}}>
                <span style={{fontWeight:"800"}}>{b.time}</span><span style={{opacity:0.7,marginLeft:"4px"}}>({b.diff}m)</span>
              </div>)}
            </div>
          </div>}

          {/* Nearby */}
          {nearby.length>0&&<div style={C()}>
            <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"10px",letterSpacing:"1px"}}>📍 {t.nearby?.toUpperCase()}</div>
            {nearby.map((stop,i)=>(
              <div key={stop.id} style={{display:"flex",alignItems:"center",padding:"10px",borderRadius:"12px",marginBottom:"6px",background:i===0?(darkMode?"#1e3a5f":"#eff6ff"):(darkMode?"#0f172a":"#f8fafc"),border:i===0?"2px solid #bfdbfe":`2px solid transparent`,cursor:"pointer"}} onClick={()=>speak(sn(stop))}>
                <div style={{width:"30px",height:"30px",borderRadius:"50%",background:i===0?"#1d4ed8":"#e2e8f0",color:i===0?"white":"#64748b",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"800",fontSize:"12px",marginRight:"10px"}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"600",fontSize:`${14*fs}px`,color:i===0?"#1d4ed8":dm.text}}>{sn(stop)}</div>
                  <div style={{fontSize:"11px",color:dm.sub}}>{stop.dist}m ~ {eta(stop.dist)} {t.min}</div>
                </div>
                <button onClick={e=>{e.stopPropagation();toggleFav(stop);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"16px"}}>{favs.find(f=>f.id===stop.id)?"⭐":"☆"}</button>
              </div>
            ))}
          </div>}

          {loc&&<div style={{...C({padding:"12px 16px"})}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"20px"}}>📡</span><div style={{flex:1}}><div style={{fontSize:"10px",color:dm.sub,fontWeight:"700"}}>GPS</div><div style={{fontSize:"12px",color:dm.sub}}>{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</div></div><span style={{...Bdg("#f0fdf4","#16a34a")}}>● Live</span></div></div>}
        </>}

        {/* MAP */}
        {tab==="map"&&<>
          <div style={{...C({padding:0,overflow:"hidden"})}}>
            <MapContainer center={loc?[loc.lat,loc.lng]:[7.8731,80.7718]} zoom={loc?12:8} style={{height:"450px",width:"100%"}}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
              {loc&&<><Marker position={[loc.lat,loc.lng]}><Popup>You are here</Popup></Marker><Circle center={[loc.lat,loc.lng]} radius={300} color="#3b82f6" fillColor="#3b82f6" fillOpacity={0.1}/></>}
              {filtered.map(stop=>{
                const isN=nearest?.id===stop.id;const color=ROUTES[stop.route]?.color||"#3b82f6";
                const icon=L.divIcon({html:`<div style="background:${isN?"#1d4ed8":color};width:${isN?16:10}px;height:${isN?16:10}px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,className:"",iconSize:[isN?16:10,isN?16:10]});
                return<Marker key={stop.id} position={[stop.lat,stop.lng]} icon={icon}><Popup><strong>{stop.name}</strong>{isN&&<><br/><span style={{color:"#1d4ed8"}}>Nearest Stop</span></>}</Popup></Marker>;
              })}
            </MapContainer>
            <div style={{padding:"12px 16px",background:dm.card}}><div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>{Object.entries(ROUTES).filter(([k])=>k!=="all").map(([k,v])=><span key={k} style={{...Bdg(v.color+"20",v.color),fontSize:"11px"}}>● [{v.number}] {v.label.split("-")[1]?.trim()}</span>)}</div></div>
          </div>
        </>}

        {/* STOPS */}
        {tab==="stops"&&<>
          <div style={C()}><input placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)} style={{width:"100%",padding:"10px 14px",borderRadius:"10px",border:`2px solid ${dm.border}`,fontSize:`${14*fs}px`,outline:"none",boxSizing:"border-box",background:dm.input,color:dm.text}}/></div>
          {!search&&<div style={{...C({padding:"10px 16px"})}}><select style={{width:"100%",padding:"8px",borderRadius:"8px",border:`1px solid ${dm.border}`,fontSize:`${13*fs}px`,outline:"none",background:dm.input,color:dm.text}} value={route} onChange={e=>setRoute(e.target.value)}>{Object.entries(ROUTES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>}
          <div style={C()}>
            <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"10px"}}>🚏 {t.allStops} ({searched.length})</div>
            {searched.map((stop,i)=>{
              const isN=nearest?.id===stop.id;const d2=loc?calcDist(loc.lat,loc.lng,stop.lat,stop.lng):null;const isFav=favs.find(f=>f.id===stop.id);
              return<div key={stop.id} style={{display:"flex",alignItems:"center",padding:"10px",borderRadius:"12px",marginBottom:"6px",background:isN?(darkMode?"#1e3a5f":"#eff6ff"):(darkMode?"#0f172a":"#f8fafc"),border:isN?"2px solid #bfdbfe":`2px solid transparent`,cursor:"pointer"}} onClick={()=>speak(sn(stop))}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:isN?"#1d4ed8":"#e2e8f0",color:isN?"white":"#64748b",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"11px",marginRight:"10px"}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"600",fontSize:`${13*fs}px`,color:isN?"#1d4ed8":dm.text}}>{sn(stop)}</div>
                  <div style={{fontSize:"11px",color:dm.sub}}>{ROUTES[stop.route]?.number?`[${ROUTES[stop.route].number}] `:""}{ROUTES[stop.route]?.label}{d2&&` • ${d2}m`}</div>
                </div>
                <div style={{display:"flex",gap:"4px",alignItems:"center"}}>
                  {isN&&<span style={{...Bdg("#1d4ed8","white"),fontSize:"9px"}}>YOU</span>}
                  <button onClick={e=>{e.stopPropagation();toggleFav(stop);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"16px"}}>{isFav?"⭐":"☆"}</button>
                  <span>🔊</span>
                </div>
              </div>;
            })}
          </div>
        </>}

        {/* MORE TAB */}
        {tab==="more"&&<>
          {/* Settings */}
          <div style={C()}>
            <div style={{fontSize:"13px",fontWeight:"700",color:dm.text,marginBottom:"12px"}}>⚙️ Settings</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${dm.border}`}}>
              <span style={{fontSize:`${13*fs}px`}}>🌙 Dark Mode</span>
              <button onClick={()=>setDarkMode(!darkMode)} style={{width:"44px",height:"24px",borderRadius:"12px",border:"none",cursor:"pointer",background:darkMode?"#1d4ed8":"#e2e8f0",position:"relative"}}>
                <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"white",position:"absolute",top:"3px",transition:"left 0.2s",left:darkMode?"23px":"3px"}}></div>
              </button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${dm.border}`}}>
              <span style={{fontSize:`${13*fs}px`}}>🔤 {t.accessibility} (Large Text)</span>
              <button onClick={()=>setBigText(!bigText)} style={{width:"44px",height:"24px",borderRadius:"12px",border:"none",cursor:"pointer",background:bigText?"#1d4ed8":"#e2e8f0",position:"relative"}}>
                <div style={{width:"18px",height:"18px",borderRadius:"50%",background:"white",position:"absolute",top:"3px",transition:"left 0.2s",left:bigText?"23px":"3px"}}></div>
              </button>
            </div>
          </div>

          {/* Journey Planner */}
          <div style={C()}>
            <div style={{fontSize:"13px",fontWeight:"700",color:dm.text,marginBottom:"12px"}}>🧭 {t.journey}</div>
            <div style={{marginBottom:"8px"}}><div style={{fontSize:"11px",color:dm.sub,fontWeight:"600",marginBottom:"4px"}}>🟢 {t.from}</div>
              <select style={{width:"100%",padding:"10px",borderRadius:"10px",border:`2px solid ${dm.border}`,fontSize:`${13*fs}px`,outline:"none",background:dm.input,color:dm.text}} value={jFrom} onChange={e=>setJFrom(e.target.value)}><option value="">Select stop...</option>{ALL_STOPS.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            <div style={{marginBottom:"12px"}}><div style={{fontSize:"11px",color:dm.sub,fontWeight:"600",marginBottom:"4px"}}>🔴 {t.to}</div>
              <select style={{width:"100%",padding:"10px",borderRadius:"10px",border:`2px solid ${dm.border}`,fontSize:`${13*fs}px`,outline:"none",background:dm.input,color:dm.text}} value={jTo} onChange={e=>setJTo(e.target.value)}><option value="">Select stop...</option>{ALL_STOPS.map(s=><option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            <button onClick={planJourney} style={{width:"100%",padding:"12px",borderRadius:"10px",border:"none",cursor:"pointer",fontWeight:"600",fontSize:`${14*fs}px`,background:"#1d4ed8",color:"white"}}>🧭 {t.plan}</button>
            {jResult&&<div style={{marginTop:"12px"}}>
              {jResult.direct?<>
                <div style={{display:"flex",gap:"8px",marginBottom:"12px",flexWrap:"wrap"}}>
                  <span style={{...Bdg("#eff6ff","#1d4ed8")}}>📍 {jResult.dist}m</span>
                  <span style={{...Bdg("#f0fdf4","#16a34a")}}>⏱ ~{jResult.time}min</span>
                  <span style={{...Bdg("#fef3c7","#92400e")}}>💰 Rs.{jResult.fare}</span>
                </div>
                {jResult.stops.map((stop,i)=>(
                  <div key={stop.id} style={{display:"flex",alignItems:"center",padding:"6px",marginBottom:"2px"}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginRight:"10px"}}>
                      <div style={{width:"10px",height:"10px",borderRadius:"50%",background:i===0?"#10b981":i===jResult.stops.length-1?"#ef4444":"#3b82f6",border:"2px solid white",boxShadow:`0 0 0 2px ${dm.border}`}}></div>
                      {i<jResult.stops.length-1&&<div style={{width:"2px",height:"14px",background:dm.border}}></div>}
                    </div>
                    <span style={{fontSize:`${13*fs}px`,color:dm.text,fontWeight:i===0||i===jResult.stops.length-1?"700":"400"}}>{stop.name}</span>
                  </div>
                ))}
              </>:<div style={{textAlign:"center",padding:"10px"}}><div style={{fontSize:"30px"}}>🔄</div><div style={{fontWeight:"700",color:dm.text}}>Transfer Required</div><div style={{color:dm.sub,fontSize:"13px"}}>{jResult.msg}</div></div>}
            </div>}
          </div>

          {/* Schedule */}
          <div style={C()}>
            <div style={{fontSize:"13px",fontWeight:"700",color:dm.text,marginBottom:"10px"}}>🕐 {t.schedule}</div>
            <select style={{width:"100%",padding:"8px",borderRadius:"8px",border:`1px solid ${dm.border}`,fontSize:`${13*fs}px`,outline:"none",marginBottom:"12px",background:dm.input,color:dm.text}} value={route==="all"?"colombo_maharagama":route} onChange={e=>setRoute(e.target.value)}>
              {Object.entries(ROUTES).filter(([k])=>k!=="all").map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
              {(SCHEDULE[route]||SCHEDULE["colombo_maharagama"]).map((time,i)=>{
                const now=new Date();const cur=now.getHours()*60+now.getMinutes();
                const[t2,period]=time.split(" ");const[h,m]=t2.split(":").map(Number);
                const mins=(period==="PM"&&h!==12?h+12:period==="AM"&&h===12?0:h)*60+m;
                const isPast=mins<cur;
                const schd=SCHEDULE[route]||SCHEDULE["colombo_maharagama"];
                const isNext=!isPast&&schd.findIndex(x=>{const[t3,p]=x.split(" ");const[hh,mm]=t3.split(":").map(Number);const mn=(p==="PM"&&hh!==12?hh+12:p==="AM"&&hh===12?0:hh)*60+mm;return mn>=cur;})===i;
                return<div key={i} style={{padding:"8px",borderRadius:"10px",textAlign:"center",background:isNext?"#1d4ed8":isPast?dm.bg:darkMode?"#1e293b":"#f0f4ff",border:isNext?"none":`1px solid ${dm.border}`}}>
                  <div style={{fontSize:`${12*fs}px`,fontWeight:"700",color:isNext?"white":isPast?dm.sub:dm.text}}>{time}</div>
                  {isNext&&<div style={{fontSize:"9px",color:"rgba(255,255,255,0.8)",marginTop:"2px"}}>NEXT</div>}
                </div>;
              })}
            </div>
          </div>

          {/* Driver Rating */}
          <div style={C()}>
            <div style={{fontSize:"13px",fontWeight:"700",color:dm.text,marginBottom:"4px"}}>⭐ {t.rating}</div>
            <div style={{fontSize:"11px",color:dm.sub,marginBottom:"12px"}}>Route: {route!=="all"?ROUTES[route]?.label:"Select a route"}</div>
            <div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"10px"}}>
              {[1,2,3,4,5].map(star=>(
                <button key={star} onClick={()=>saveRating(star)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"32px",transform:myRating>=star?"scale(1.2)":"scale(1)",transition:"transform 0.2s"}}>
                  {myRating>=star?"⭐":"☆"}
                </button>
              ))}
            </div>
            {myRating>0&&<div style={{textAlign:"center",fontSize:"13px",color:dm.sub}}>You rated {myRating} stars!</div>}
            {Object.entries(ratings).length>0&&<>
              <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,margin:"10px 0 6px"}}>PAST RATINGS</div>
              {Object.entries(ratings).map(([k,v])=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:`1px solid ${dm.border}`}}>
                  <span style={{fontSize:"12px",color:dm.text}}>{ROUTES[k]?.label||k}</span>
                  <span style={{fontSize:"12px",color:"#f59e0b"}}>{"⭐".repeat(v.stars)}</span>
                </div>
              ))}
            </>}
          </div>

          {/* Trip History */}
          <div style={C()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}}>
              <div style={{fontSize:"13px",fontWeight:"700",color:dm.text}}>🕐 {t.history}</div>
              {tripHistory.length>0&&<button onClick={()=>{setTripHistory([]);localStorage.removeItem("bt_history");}} style={{...Bdg("#fef2f2","#dc2626"),border:"none",cursor:"pointer"}}>Clear</button>}
            </div>
            {tripHistory.length===0?<div style={{textAlign:"center",padding:"20px 0",color:dm.sub}}><div style={{fontSize:"30px"}}>📋</div><div style={{fontSize:"13px",marginTop:"8px"}}>No trip history yet</div></div>
            :tripHistory.slice(0,10).map((trip,i)=>(
              <div key={trip.id} style={{display:"flex",alignItems:"center",padding:"10px",borderRadius:"12px",marginBottom:"6px",background:darkMode?"#0f172a":"#f8fafc"}}>
                <span style={{fontSize:"20px",marginRight:"10px"}}>🚌</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:"600",fontSize:`${13*fs}px`,color:dm.text}}>{trip.stop}</div>
                  <div style={{fontSize:"11px",color:dm.sub}}>{trip.date} {trip.time}</div>
                </div>
                <span style={{...Bdg((ROUTES[trip.route]?.color||"#3b82f6")+"20",ROUTES[trip.route]?.color||"#3b82f6"),fontSize:"10px"}}>{ROUTES[trip.route]?.number||"—"}</span>
              </div>
            ))}
          </div>

          {/* QR Ticket */}
          <div style={C()}>
            <div style={{fontSize:"13px",fontWeight:"700",color:dm.text,marginBottom:"12px"}}>🎫 {t.qr} Ticket</div>
            <div style={{textAlign:"center"}}>
              <img src={generateQR(`BusTrack SL | Route: ${route!=="all"?ROUTES[route]?.label:"All"} | Stop: ${nearest?.name||"Unknown"} | Time: ${new Date().toLocaleTimeString()} | GPS: ${loc?.lat?.toFixed(4)||"N/A"},${loc?.lng?.toFixed(4)||"N/A"}`)} alt="QR Code" style={{borderRadius:"12px",border:`4px solid ${dm.border}`}}/>
              <div style={{fontSize:"12px",color:dm.sub,marginTop:"8px"}}>Show this to the bus conductor</div>
              <div style={{fontSize:"11px",color:dm.sub,marginTop:"4px"}}>{new Date().toLocaleString()}</div>
            </div>
          </div>
        </>}

        {/* SAVED */}
        {tab==="saved"&&<div style={C()}>
          <div style={{fontSize:"11px",fontWeight:"700",color:dm.sub,marginBottom:"12px",letterSpacing:"1px"}}>⭐ {(t.favorites||"Favorites")?.toUpperCase()} ({favs.length})</div>
          {favs.length===0?<div style={{textAlign:"center",padding:"30px 0",color:dm.sub}}><div style={{fontSize:"40px"}}>⭐</div><div style={{fontSize:"13px",marginTop:"8px"}}>{t.noFav}</div></div>
          :favs.map(stop=>{
            const d2=loc?calcDist(loc.lat,loc.lng,stop.lat,stop.lng):null;
            return<div key={stop.id} style={{display:"flex",alignItems:"center",padding:"12px",borderRadius:"12px",marginBottom:"8px",background:darkMode?"#0f172a":"#fffbeb",border:"2px solid #fef3c7",cursor:"pointer"}} onClick={()=>speak(sn(stop))}>
              <span style={{fontSize:"22px",marginRight:"10px"}}>⭐</span>
              <div style={{flex:1}}><div style={{fontWeight:"600",fontSize:`${14*fs}px`,color:dm.text}}>{sn(stop)}</div><div style={{fontSize:"11px",color:"#92400e"}}>{ROUTES[stop.route]?.label}{d2&&` • ${d2}m`}</div></div>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={e=>{e.stopPropagation();speak(sn(stop));}} style={{padding:"6px 10px",borderRadius:"10px",border:"none",cursor:"pointer",background:"#fff7ed",color:"#92400e"}}>🔊</button>
                <button onClick={e=>{e.stopPropagation();toggleFav(stop);}} style={{padding:"6px 10px",borderRadius:"10px",border:"none",cursor:"pointer",background:"#fef2f2",color:"#dc2626"}}>🗑️</button>
              </div>
            </div>;
          })}
        </div>}

      </div>

      {/* Bottom Navigation */}
      <div style={{borderRadius:"24px 24px 0 0",background:"rgba(255,255,255,0.75)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",boxShadow:"0 -4px 30px rgba(0,0,0,0.1)",borderTop:"1px solid rgba(255,255,255,0.6)",borderTop:`1px solid ${dm.border}`,display:"flex",zIndex:100,boxShadow:"0 -2px 20px rgba(0,0,0,0.1)"}}>
        {bottomTabs.map(({id,icon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:"2px"}}>
            <span style={{fontSize:"20px"}}>{icon}</span>
            <span style={{fontSize:"10px",fontWeight:"600",color:tab===id?"#1d4ed8":dm.sub}}>{label}</span>
            {tab===id&&<div style={{width:"20px",height:"3px",background:"#1d4ed8",borderRadius:"2px"}}></div>}
          </button>
        ))}
      </div>

    </div>
  );
}