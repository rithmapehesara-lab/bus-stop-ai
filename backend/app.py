from flask import Flask, jsonify, request
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

bus_stops = [
    {"id": 1, "name": "Colombo Fort", "name_si": "කොළඹ කොටුව", "name_ta": "கொழும்பு கோட்டை", "lat": 6.9344, "lng": 79.8428},
    {"id": 2, "name": "Pettah", "name_si": "පිට්ටල", "name_ta": "பெட்டா", "lat": 6.9385, "lng": 79.8530},
    {"id": 3, "name": "Maradana", "name_si": "මරදාන", "name_ta": "மாரதான", "lat": 6.9270, "lng": 79.8611},
    {"id": 4, "name": "Borella", "name_si": "බොරැල්ල", "name_ta": "போரெல்லா", "lat": 6.9157, "lng": 79.8728},
    {"id": 5, "name": "Narahenpita", "name_si": "නාරාහේන්පිට", "name_ta": "நாரஹேன்பிட்ட", "lat": 6.9010, "lng": 79.8745},
    {"id": 6, "name": "Nugegoda", "name_si": "නුගේගොඩ", "name_ta": "நுகேகொட", "lat": 6.8728, "lng": 79.8878},
    {"id": 7, "name": "Maharagama", "name_si": "මහරගම", "name_ta": "மஹரகம", "lat": 6.8478, "lng": 79.9261},
    {"id": 8, "name": "Kelaniya", "name_si": "කෙළණිය", "name_ta": "கேலனிய", "lat": 6.9547, "lng": 79.9208},
    {"id": 9, "name": "Kadawatha", "name_si": "කඩවත", "name_ta": "கடவத்த", "lat": 7.0021, "lng": 79.9506},
    {"id": 10, "name": "Gampaha", "name_si": "ගම්පහ", "name_ta": "கம்பஹா", "lat": 7.0917, "lng": 80.0137},
    {"id": 11, "name": "Veyangoda", "name_si": "වෙයන්ගොඩ", "name_ta": "வேயன்கொட", "lat": 7.1583, "lng": 80.1028},
    {"id": 12, "name": "Nittambuwa", "name_si": "නිත්තඹුව", "name_ta": "நித்தம்புவ", "lat": 7.1494, "lng": 80.2114},
    {"id": 13, "name": "Kegalle", "name_si": "කෑගල්ල", "name_ta": "கேகாலை", "lat": 7.2513, "lng": 80.3464},
    {"id": 14, "name": "Kandy", "name_si": "මහනුවර", "name_ta": "கண்டி", "lat": 7.2906, "lng": 80.6337},
    {"id": 15, "name": "Dehiwala", "name_si": "දෙහිවල", "name_ta": "தெஹிவல", "lat": 6.8517, "lng": 79.8661},
    {"id": 16, "name": "Mount Lavinia", "name_si": "මවුන්ට් ලාවිනියා", "name_ta": "மவுண்ட் லவீனியா", "lat": 6.8389, "lng": 79.8656},
    {"id": 17, "name": "Moratuwa", "name_si": "මොරටුව", "name_ta": "மொரட்டுவ", "lat": 6.7731, "lng": 79.8819},
    {"id": 18, "name": "Panadura", "name_si": "පානදුර", "name_ta": "பாணந்துறை", "lat": 6.7133, "lng": 79.9036},
    {"id": 19, "name": "Kalutara", "name_si": "කළුතර", "name_ta": "களுத்துறை", "lat": 6.5854, "lng": 79.9607},
    {"id": 20, "name": "Aluthgama", "name_si": "අළුත්ගම", "name_ta": "அலுத்கம", "lat": 6.4344, "lng": 80.0042},
    {"id": 21, "name": "Hikkaduwa", "name_si": "හික්කඩුව", "name_ta": "ஹிக்கடுவ", "lat": 6.1395, "lng": 80.1056},
    {"id": 22, "name": "Galle", "name_si": "ගාල්ල", "name_ta": "காலி", "lat": 6.0535, "lng": 80.2210},
    {"id": 23, "name": "Peliyagoda", "name_si": "පේලියගොඩ", "name_ta": "பேலியகொட", "lat": 6.9617, "lng": 79.8883},
    {"id": 24, "name": "Wattala", "name_si": "වත්තල", "name_ta": "வட்டல", "lat": 6.9897, "lng": 79.8928},
    {"id": 25, "name": "Ja-Ela", "name_si": "ජා-ඇල", "name_ta": "ஜா-ஏல", "lat": 7.0736, "lng": 79.8917},
    {"id": 26, "name": "Negombo", "name_si": "මීගමුව", "name_ta": "நீர்கொழும்பு", "lat": 7.2083, "lng": 79.8358},
]

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371000
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

@app.route('/')
def home():
    return jsonify({"message": "Bus Stop AI Announcer API Running!", "status": "ok", "total_stops": len(bus_stops)})

@app.route('/api/stops', methods=['GET'])
def get_stops():
    return jsonify(bus_stops)

@app.route('/api/nearest', methods=['POST'])
def get_nearest_stop():
    data = request.json
    user_lat = data.get('lat')
    user_lng = data.get('lng')
    if not user_lat or not user_lng:
        return jsonify({"error": "Location required"}), 400
    nearest = None
    min_distance = float('inf')
    for stop in bus_stops:
        distance = calculate_distance(user_lat, user_lng, stop['lat'], stop['lng'])
        if distance < min_distance:
            min_distance = distance
            nearest = stop
    return jsonify({
        "nearest_stop": nearest,
        "distance_meters": round(min_distance),
        "approaching": min_distance < 300
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)