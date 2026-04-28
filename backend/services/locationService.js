import { extractLocationNER } from "./nerService.js";
import { geocodeLocation } from "./geocodeService.js";

const INDIA_PLACES = [

  // ── Delhi / NCR ──────────────────────────────────────────────────
  { name: "Delhi",              lat: 28.6139, lng: 77.2090, city: "Delhi",              state: "Delhi" },
  { name: "New Delhi",          lat: 28.6139, lng: 77.2090, city: "New Delhi",          state: "Delhi" },
  { name: "Connaught Place",    lat: 28.6315, lng: 77.2167, city: "Delhi",              state: "Delhi" },
  { name: "Dwarka",             lat: 28.5921, lng: 77.0460, city: "Delhi",              state: "Delhi" },
  { name: "Rohini",             lat: 28.7495, lng: 77.0594, city: "Delhi",              state: "Delhi" },
  { name: "Noida",              lat: 28.5355, lng: 77.3910, city: "Noida",              state: "Uttar Pradesh" },
  { name: "Gurgaon",            lat: 28.4595, lng: 77.0266, city: "Gurgaon",            state: "Haryana" },
  { name: "Gurugram",           lat: 28.4595, lng: 77.0266, city: "Gurgaon",            state: "Haryana" },
  { name: "Faridabad",          lat: 28.4089, lng: 77.3178, city: "Faridabad",          state: "Haryana" },
  { name: "Ghaziabad",          lat: 28.6692, lng: 77.4538, city: "Ghaziabad",          state: "Uttar Pradesh" },

  // ── Haryana ───────────────────────────────────────────────────────
  { name: "Kurukshetra",        lat: 29.9695, lng: 76.8783, city: "Kurukshetra",        state: "Haryana" },
  { name: "Ambala",             lat: 30.3782, lng: 76.7767, city: "Ambala",             state: "Haryana" },
  { name: "Panipat",            lat: 29.3909, lng: 76.9635, city: "Panipat",            state: "Haryana" },
  { name: "Rohtak",             lat: 28.8955, lng: 76.6066, city: "Rohtak",             state: "Haryana" },
  { name: "Hisar",              lat: 29.1492, lng: 75.7217, city: "Hisar",              state: "Haryana" },
  { name: "Karnal",             lat: 29.6857, lng: 76.9905, city: "Karnal",             state: "Haryana" },
  { name: "Sonipat",            lat: 28.9931, lng: 77.0151, city: "Sonipat",            state: "Haryana" },
  { name: "Rewari",             lat: 28.1975, lng: 76.6157, city: "Rewari",             state: "Haryana" },
  { name: "Yamunanagar",        lat: 30.1290, lng: 77.2674, city: "Yamunanagar",        state: "Haryana" },
  { name: "Panchkula",          lat: 30.6942, lng: 76.8606, city: "Panchkula",          state: "Haryana" },
  { name: "Bhiwani",            lat: 28.7930, lng: 76.1396, city: "Bhiwani",            state: "Haryana" },
  { name: "Sirsa",              lat: 29.5330, lng: 75.0277, city: "Sirsa",              state: "Haryana" },
  { name: "Jhajjar",            lat: 28.6079, lng: 76.6552, city: "Jhajjar",            state: "Haryana" },
  { name: "Palwal",             lat: 28.1487, lng: 77.3324, city: "Palwal",             state: "Haryana" },

  // ── Punjab ────────────────────────────────────────────────────────
  { name: "Amritsar",           lat: 31.6340, lng: 74.8723, city: "Amritsar",           state: "Punjab" },
  { name: "Ludhiana",           lat: 30.9010, lng: 75.8573, city: "Ludhiana",           state: "Punjab" },
  { name: "Jalandhar",          lat: 31.3260, lng: 75.5762, city: "Jalandhar",          state: "Punjab" },
  { name: "Patiala",            lat: 30.3398, lng: 76.3869, city: "Patiala",            state: "Punjab" },
  { name: "Bathinda",           lat: 30.2110, lng: 74.9455, city: "Bathinda",           state: "Punjab" },
  { name: "Mohali",             lat: 30.7046, lng: 76.7179, city: "Mohali",             state: "Punjab" },
  { name: "Pathankot",          lat: 32.2643, lng: 75.6421, city: "Pathankot",          state: "Punjab" },
  { name: "Hoshiarpur",         lat: 31.5143, lng: 75.9116, city: "Hoshiarpur",         state: "Punjab" },
  { name: "Moga",               lat: 30.8170, lng: 75.1742, city: "Moga",               state: "Punjab" },
  { name: "Firozpur",           lat: 30.9352, lng: 74.6149, city: "Firozpur",           state: "Punjab" },

  // ── Uttar Pradesh ─────────────────────────────────────────────────
  { name: "Lucknow",            lat: 26.8467, lng: 80.9462, city: "Lucknow",            state: "Uttar Pradesh" },
  { name: "Kanpur",             lat: 26.4499, lng: 80.3319, city: "Kanpur",             state: "Uttar Pradesh" },
  { name: "Agra",               lat: 27.1767, lng: 78.0081, city: "Agra",               state: "Uttar Pradesh" },
  { name: "Varanasi",           lat: 25.3176, lng: 82.9739, city: "Varanasi",           state: "Uttar Pradesh" },
  { name: "Meerut",             lat: 28.9845, lng: 77.7064, city: "Meerut",             state: "Uttar Pradesh" },
  { name: "Allahabad",          lat: 25.4358, lng: 81.8463, city: "Prayagraj",          state: "Uttar Pradesh" },
  { name: "Prayagraj",          lat: 25.4358, lng: 81.8463, city: "Prayagraj",          state: "Uttar Pradesh" },
  { name: "Gorakhpur",          lat: 26.7606, lng: 83.3732, city: "Gorakhpur",          state: "Uttar Pradesh" },
  { name: "Bareilly",           lat: 28.3670, lng: 79.4304, city: "Bareilly",           state: "Uttar Pradesh" },
  { name: "Aligarh",            lat: 27.8974, lng: 78.0880, city: "Aligarh",            state: "Uttar Pradesh" },
  { name: "Moradabad",          lat: 28.8386, lng: 78.7733, city: "Moradabad",          state: "Uttar Pradesh" },
  { name: "Saharanpur",         lat: 29.9680, lng: 77.5552, city: "Saharanpur",         state: "Uttar Pradesh" },
  { name: "Mathura",            lat: 27.4924, lng: 77.6737, city: "Mathura",            state: "Uttar Pradesh" },
  { name: "Vrindavan",          lat: 27.5797, lng: 77.6965, city: "Vrindavan",          state: "Uttar Pradesh" },
  { name: "Jhansi",             lat: 25.4484, lng: 78.5685, city: "Jhansi",             state: "Uttar Pradesh" },
  { name: "Muzaffarnagar",      lat: 29.4727, lng: 77.7085, city: "Muzaffarnagar",      state: "Uttar Pradesh" },
  { name: "Ayodhya",            lat: 26.7922, lng: 82.1998, city: "Ayodhya",            state: "Uttar Pradesh" },
  { name: "Faizabad",           lat: 26.7759, lng: 82.1450, city: "Faizabad",           state: "Uttar Pradesh" },
  { name: "Shahjahanpur",       lat: 27.8815, lng: 79.9053, city: "Shahjahanpur",       state: "Uttar Pradesh" },
  { name: "Rampur",             lat: 28.8159, lng: 79.0253, city: "Rampur",             state: "Uttar Pradesh" },

  // ── Rajasthan ─────────────────────────────────────────────────────
  { name: "Jaipur",             lat: 26.9124, lng: 75.7873, city: "Jaipur",             state: "Rajasthan" },
  { name: "Jodhpur",            lat: 26.2389, lng: 73.0243, city: "Jodhpur",            state: "Rajasthan" },
  { name: "Udaipur",            lat: 24.5854, lng: 73.7125, city: "Udaipur",            state: "Rajasthan" },
  { name: "Kota",               lat: 25.2138, lng: 75.8648, city: "Kota",               state: "Rajasthan" },
  { name: "Bikaner",            lat: 28.0229, lng: 73.3119, city: "Bikaner",            state: "Rajasthan" },
  { name: "Ajmer",              lat: 26.4499, lng: 74.6399, city: "Ajmer",              state: "Rajasthan" },
  { name: "Bhilwara",           lat: 25.3565, lng: 74.6313, city: "Bhilwara",           state: "Rajasthan" },
  { name: "Alwar",              lat: 27.5530, lng: 76.6346, city: "Alwar",              state: "Rajasthan" },
  { name: "Bharatpur",          lat: 27.2152, lng: 77.5030, city: "Bharatpur",          state: "Rajasthan" },
  { name: "Sikar",              lat: 27.6094, lng: 75.1399, city: "Sikar",              state: "Rajasthan" },
  { name: "Ganganagar",         lat: 29.9193, lng: 73.8772, city: "Sri Ganganagar",     state: "Rajasthan" },
  { name: "Jhunjhunu",          lat: 28.1318, lng: 75.3982, city: "Jhunjhunu",          state: "Rajasthan" },

  // ── Maharashtra ───────────────────────────────────────────────────
  { name: "Mumbai",             lat: 19.0760, lng: 72.8777, city: "Mumbai",             state: "Maharashtra" },
  { name: "Pune",               lat: 18.5204, lng: 73.8567, city: "Pune",               state: "Maharashtra" },
  { name: "Nagpur",             lat: 21.1458, lng: 79.0882, city: "Nagpur",             state: "Maharashtra" },
  { name: "Nashik",             lat: 19.9975, lng: 73.7898, city: "Nashik",             state: "Maharashtra" },
  { name: "Aurangabad",         lat: 19.8762, lng: 75.3433, city: "Aurangabad",         state: "Maharashtra" },
  { name: "Solapur",            lat: 17.6599, lng: 75.9064, city: "Solapur",            state: "Maharashtra" },
  { name: "Amravati",           lat: 20.9333, lng: 77.7500, city: "Amravati",           state: "Maharashtra" },
  { name: "Kolhapur",           lat: 16.7050, lng: 74.2433, city: "Kolhapur",           state: "Maharashtra" },
  { name: "Nanded",             lat: 19.1383, lng: 77.3210, city: "Nanded",             state: "Maharashtra" },
  { name: "Sangli",             lat: 16.8524, lng: 74.5815, city: "Sangli",             state: "Maharashtra" },
  { name: "Akola",              lat: 20.7096, lng: 77.0021, city: "Akola",              state: "Maharashtra" },
  { name: "Latur",              lat: 18.4088, lng: 76.5604, city: "Latur",              state: "Maharashtra" },
  { name: "Dhule",              lat: 20.9012, lng: 74.7748, city: "Dhule",              state: "Maharashtra" },
  { name: "Jalgaon",            lat: 21.0077, lng: 75.5626, city: "Jalgaon",            state: "Maharashtra" },
  { name: "Chandrapur",         lat: 19.9615, lng: 79.2961, city: "Chandrapur",         state: "Maharashtra" },
  { name: "Thane",              lat: 19.2183, lng: 72.9781, city: "Thane",              state: "Maharashtra" },
  { name: "Navi Mumbai",        lat: 19.0330, lng: 73.0297, city: "Navi Mumbai",        state: "Maharashtra" },
  { name: "Vasai",              lat: 19.4719, lng: 72.8199, city: "Vasai",              state: "Maharashtra" },

  // ── Karnataka ─────────────────────────────────────────────────────
  { name: "Bangalore",          lat: 12.9716, lng: 77.5946, city: "Bangalore",          state: "Karnataka" },
  { name: "Bengaluru",          lat: 12.9716, lng: 77.5946, city: "Bangalore",          state: "Karnataka" },
  { name: "Mysore",             lat: 12.2958, lng: 76.6394, city: "Mysore",             state: "Karnataka" },
  { name: "Hubli",              lat: 15.3647, lng: 75.1240, city: "Hubli",              state: "Karnataka" },
  { name: "Mangalore",          lat: 12.9141, lng: 74.8560, city: "Mangalore",          state: "Karnataka" },
  { name: "Belgaum",            lat: 15.8497, lng: 74.4977, city: "Belagavi",           state: "Karnataka" },
  { name: "Belagavi",           lat: 15.8497, lng: 74.4977, city: "Belagavi",           state: "Karnataka" },
  { name: "Gulbarga",           lat: 17.3297, lng: 76.8343, city: "Kalaburagi",         state: "Karnataka" },
  { name: "Kalaburagi",         lat: 17.3297, lng: 76.8343, city: "Kalaburagi",         state: "Karnataka" },
  { name: "Bellary",            lat: 15.1394, lng: 76.9214, city: "Ballari",            state: "Karnataka" },
  { name: "Bijapur",            lat: 16.8302, lng: 75.7100, city: "Vijayapura",         state: "Karnataka" },
  { name: "Shimoga",            lat: 13.9299, lng: 75.5681, city: "Shivamogga",         state: "Karnataka" },
  { name: "Tumkur",             lat: 13.3409, lng: 77.1010, city: "Tumakuru",           state: "Karnataka" },
  { name: "Udupi",              lat: 13.3409, lng: 74.7421, city: "Udupi",              state: "Karnataka" },
  { name: "Davangere",          lat: 14.4644, lng: 75.9218, city: "Davangere",          state: "Karnataka" },

  // ── Tamil Nadu ────────────────────────────────────────────────────
  { name: "Chennai",            lat: 13.0827, lng: 80.2707, city: "Chennai",            state: "Tamil Nadu" },
  { name: "Coimbatore",         lat: 11.0168, lng: 76.9558, city: "Coimbatore",         state: "Tamil Nadu" },
  { name: "Madurai",            lat: 9.9252,  lng: 78.1198, city: "Madurai",            state: "Tamil Nadu" },
  { name: "Tiruchirappalli",    lat: 10.7905, lng: 78.7047, city: "Tiruchirappalli",    state: "Tamil Nadu" },
  { name: "Trichy",             lat: 10.7905, lng: 78.7047, city: "Tiruchirappalli",    state: "Tamil Nadu" },
  { name: "Salem",              lat: 11.6643, lng: 78.1460, city: "Salem",              state: "Tamil Nadu" },
  { name: "Tirunelveli",        lat: 8.7139,  lng: 77.7567, city: "Tirunelveli",        state: "Tamil Nadu" },
  { name: "Vellore",            lat: 12.9165, lng: 79.1325, city: "Vellore",            state: "Tamil Nadu" },
  { name: "Erode",              lat: 11.3410, lng: 77.7172, city: "Erode",              state: "Tamil Nadu" },
  { name: "Tiruppur",           lat: 11.1085, lng: 77.3411, city: "Tiruppur",           state: "Tamil Nadu" },
  { name: "Thanjavur",          lat: 10.7870, lng: 79.1378, city: "Thanjavur",          state: "Tamil Nadu" },
  { name: "Dindigul",           lat: 10.3624, lng: 77.9695, city: "Dindigul",           state: "Tamil Nadu" },

  // ── Andhra Pradesh ────────────────────────────────────────────────
  { name: "Visakhapatnam",      lat: 17.6868, lng: 83.2185, city: "Visakhapatnam",      state: "Andhra Pradesh" },
  { name: "Vijayawada",         lat: 16.5062, lng: 80.6480, city: "Vijayawada",         state: "Andhra Pradesh" },
  { name: "Guntur",             lat: 16.3067, lng: 80.4365, city: "Guntur",             state: "Andhra Pradesh" },
  { name: "Nellore",            lat: 14.4426, lng: 79.9865, city: "Nellore",            state: "Andhra Pradesh" },
  { name: "Tirupati",           lat: 13.6288, lng: 79.4192, city: "Tirupati",           state: "Andhra Pradesh" },
  { name: "Rajahmundry",        lat: 17.0005, lng: 81.8040, city: "Rajahmundry",        state: "Andhra Pradesh" },
  { name: "Kakinada",           lat: 16.9891, lng: 82.2475, city: "Kakinada",           state: "Andhra Pradesh" },
  { name: "Kurnool",            lat: 15.8281, lng: 78.0373, city: "Kurnool",            state: "Andhra Pradesh" },
  { name: "Anantapur",          lat: 14.6819, lng: 77.6006, city: "Anantapur",          state: "Andhra Pradesh" },
  { name: "Kadapa",             lat: 14.4674, lng: 78.8241, city: "Kadapa",             state: "Andhra Pradesh" },

  // ── Telangana ─────────────────────────────────────────────────────
  { name: "Hyderabad",          lat: 17.3850, lng: 78.4867, city: "Hyderabad",          state: "Telangana" },
  { name: "Warangal",           lat: 17.9784, lng: 79.5941, city: "Warangal",           state: "Telangana" },
  { name: "Nizamabad",          lat: 18.6725, lng: 78.0941, city: "Nizamabad",          state: "Telangana" },
  { name: "Karimnagar",         lat: 18.4386, lng: 79.1288, city: "Karimnagar",         state: "Telangana" },
  { name: "Khammam",            lat: 17.2473, lng: 80.1514, city: "Khammam",            state: "Telangana" },
  { name: "Secunderabad",       lat: 17.4399, lng: 78.4983, city: "Secunderabad",       state: "Telangana" },
  { name: "Mahbubnagar",        lat: 16.7488, lng: 77.9874, city: "Mahbubnagar",        state: "Telangana" },
  { name: "Nalgonda",           lat: 17.0575, lng: 79.2671, city: "Nalgonda",           state: "Telangana" },

  // ── Kerala ────────────────────────────────────────────────────────
  { name: "Kochi",              lat: 9.9312,  lng: 76.2673, city: "Kochi",              state: "Kerala" },
  { name: "Thiruvananthapuram", lat: 8.5241,  lng: 76.9366, city: "Thiruvananthapuram", state: "Kerala" },
  { name: "Kozhikode",          lat: 11.2588, lng: 75.7804, city: "Kozhikode",          state: "Kerala" },
  { name: "Calicut",            lat: 11.2588, lng: 75.7804, city: "Kozhikode",          state: "Kerala" },
  { name: "Thrissur",           lat: 10.5276, lng: 76.2144, city: "Thrissur",           state: "Kerala" },
  { name: "Malappuram",         lat: 11.0510, lng: 76.0711, city: "Malappuram",         state: "Kerala" },
  { name: "Kannur",             lat: 11.8745, lng: 75.3704, city: "Kannur",             state: "Kerala" },
  { name: "Kollam",             lat: 8.8932,  lng: 76.6141, city: "Kollam",             state: "Kerala" },
  { name: "Palakkad",           lat: 10.7867, lng: 76.6548, city: "Palakkad",           state: "Kerala" },
  { name: "Alappuzha",          lat: 9.4981,  lng: 76.3388, city: "Alappuzha",          state: "Kerala" },
  { name: "Kottayam",           lat: 9.5916,  lng: 76.5222, city: "Kottayam",           state: "Kerala" },

  // ── Gujarat ───────────────────────────────────────────────────────
  { name: "Ahmedabad",          lat: 23.0225, lng: 72.5714, city: "Ahmedabad",          state: "Gujarat" },
  { name: "Surat",              lat: 21.1702, lng: 72.8311, city: "Surat",              state: "Gujarat" },
  { name: "Vadodara",           lat: 22.3072, lng: 73.1812, city: "Vadodara",           state: "Gujarat" },
  { name: "Rajkot",             lat: 22.3039, lng: 70.8022, city: "Rajkot",             state: "Gujarat" },
  { name: "Bhavnagar",          lat: 21.7645, lng: 72.1519, city: "Bhavnagar",          state: "Gujarat" },
  { name: "Jamnagar",           lat: 22.4707, lng: 70.0577, city: "Jamnagar",           state: "Gujarat" },
  { name: "Gandhinagar",        lat: 23.2156, lng: 72.6369, city: "Gandhinagar",        state: "Gujarat" },
  { name: "Junagadh",           lat: 21.5222, lng: 70.4579, city: "Junagadh",           state: "Gujarat" },
  { name: "Anand",              lat: 22.5645, lng: 72.9289, city: "Anand",              state: "Gujarat" },
  { name: "Morbi",              lat: 22.8173, lng: 70.8378, city: "Morbi",              state: "Gujarat" },
  { name: "Mehsana",            lat: 23.5880, lng: 72.3693, city: "Mehsana",            state: "Gujarat" },
  { name: "Navsari",            lat: 20.9467, lng: 72.9520, city: "Navsari",            state: "Gujarat" },

  // ── Madhya Pradesh ────────────────────────────────────────────────
  { name: "Bhopal",             lat: 23.2599, lng: 77.4126, city: "Bhopal",             state: "Madhya Pradesh" },
  { name: "Indore",             lat: 22.7196, lng: 75.8577, city: "Indore",             state: "Madhya Pradesh" },
  { name: "Gwalior",            lat: 26.2183, lng: 78.1828, city: "Gwalior",            state: "Madhya Pradesh" },
  { name: "Jabalpur",           lat: 23.1815, lng: 79.9864, city: "Jabalpur",           state: "Madhya Pradesh" },
  { name: "Ujjain",             lat: 23.1828, lng: 75.7772, city: "Ujjain",             state: "Madhya Pradesh" },
  { name: "Sagar",              lat: 23.8388, lng: 78.7378, city: "Sagar",              state: "Madhya Pradesh" },
  { name: "Dewas",              lat: 22.9623, lng: 76.0516, city: "Dewas",              state: "Madhya Pradesh" },
  { name: "Satna",              lat: 24.5794, lng: 80.8322, city: "Satna",              state: "Madhya Pradesh" },
  { name: "Rewa",               lat: 24.5362, lng: 81.2960, city: "Rewa",               state: "Madhya Pradesh" },
  { name: "Ratlam",             lat: 23.3315, lng: 75.0367, city: "Ratlam",             state: "Madhya Pradesh" },
  { name: "Burhanpur",          lat: 21.3101, lng: 76.2284, city: "Burhanpur",          state: "Madhya Pradesh" },
  { name: "Chhindwara",         lat: 22.0574, lng: 78.9382, city: "Chhindwara",         state: "Madhya Pradesh" },

  // ── Bihar ─────────────────────────────────────────────────────────
  { name: "Patna",              lat: 25.5941, lng: 85.1376, city: "Patna",              state: "Bihar" },
  { name: "Gaya",               lat: 24.7914, lng: 85.0002, city: "Gaya",               state: "Bihar" },
  { name: "Muzaffarpur",        lat: 26.1197, lng: 85.3910, city: "Muzaffarpur",        state: "Bihar" },
  { name: "Bhagalpur",          lat: 25.2440, lng: 86.9842, city: "Bhagalpur",          state: "Bihar" },
  { name: "Darbhanga",          lat: 26.1542, lng: 85.8918, city: "Darbhanga",          state: "Bihar" },
  { name: "Purnia",             lat: 25.7771, lng: 87.4753, city: "Purnia",             state: "Bihar" },
  { name: "Ara",                lat: 25.5568, lng: 84.6623, city: "Ara",                state: "Bihar" },
  { name: "Begusarai",          lat: 25.4182, lng: 86.1272, city: "Begusarai",          state: "Bihar" },
  { name: "Bihar Sharif",       lat: 25.1983, lng: 85.5236, city: "Bihar Sharif",       state: "Bihar" },
  { name: "Katihar",            lat: 25.5392, lng: 87.5648, city: "Katihar",            state: "Bihar" },
  { name: "Samastipur",         lat: 25.8630, lng: 85.7811, city: "Samastipur",         state: "Bihar" },
  { name: "Sitamarhi",          lat: 26.5932, lng: 85.4800, city: "Sitamarhi",          state: "Bihar" },

  // ── West Bengal ───────────────────────────────────────────────────
  { name: "Kolkata",            lat: 22.5726, lng: 88.3639, city: "Kolkata",            state: "West Bengal" },
  { name: "Howrah",             lat: 22.5958, lng: 88.2636, city: "Howrah",             state: "West Bengal" },
  { name: "Asansol",            lat: 23.6889, lng: 86.9661, city: "Asansol",            state: "West Bengal" },
  { name: "Siliguri",           lat: 26.7271, lng: 88.3953, city: "Siliguri",           state: "West Bengal" },
  { name: "Durgapur",           lat: 23.4800, lng: 87.3200, city: "Durgapur",           state: "West Bengal" },
  { name: "Bardhaman",          lat: 23.2324, lng: 87.8615, city: "Bardhaman",          state: "West Bengal" },
  { name: "Malda",              lat: 25.0108, lng: 88.1406, city: "Malda",              state: "West Bengal" },
  { name: "Murshidabad",        lat: 24.1800, lng: 88.2700, city: "Murshidabad",        state: "West Bengal" },
  { name: "Jalpaiguri",         lat: 26.5166, lng: 88.7166, city: "Jalpaiguri",         state: "West Bengal" },
  { name: "Darjeeling",         lat: 27.0360, lng: 88.2627, city: "Darjeeling",         state: "West Bengal" },
  { name: "Cooch Behar",        lat: 26.3452, lng: 89.4461, city: "Cooch Behar",        state: "West Bengal" },

  // ── Odisha ────────────────────────────────────────────────────────
  { name: "Bhubaneswar",        lat: 20.2961, lng: 85.8245, city: "Bhubaneswar",        state: "Odisha" },
  { name: "Cuttack",            lat: 20.4625, lng: 85.8830, city: "Cuttack",            state: "Odisha" },
  { name: "Rourkela",           lat: 22.2604, lng: 84.8536, city: "Rourkela",           state: "Odisha" },
  { name: "Berhampur",          lat: 19.3150, lng: 84.7941, city: "Berhampur",          state: "Odisha" },
  { name: "Sambalpur",          lat: 21.4669, lng: 83.9812, city: "Sambalpur",          state: "Odisha" },
  { name: "Puri",               lat: 19.8106, lng: 85.8314, city: "Puri",               state: "Odisha" },
  { name: "Balasore",           lat: 21.4942, lng: 86.9334, city: "Balasore",           state: "Odisha" },

  // ── Jharkhand ─────────────────────────────────────────────────────
  { name: "Ranchi",             lat: 23.3441, lng: 85.3096, city: "Ranchi",             state: "Jharkhand" },
  { name: "Jamshedpur",         lat: 22.8046, lng: 86.2029, city: "Jamshedpur",         state: "Jharkhand" },
  { name: "Dhanbad",            lat: 23.7957, lng: 86.4304, city: "Dhanbad",            state: "Jharkhand" },
  { name: "Bokaro",             lat: 23.6693, lng: 86.1511, city: "Bokaro",             state: "Jharkhand" },
  { name: "Deoghar",            lat: 24.4853, lng: 86.6952, city: "Deoghar",            state: "Jharkhand" },
  { name: "Hazaribagh",         lat: 23.9925, lng: 85.3637, city: "Hazaribagh",         state: "Jharkhand" },

  // ── Chhattisgarh ─────────────────────────────────────────────────
  { name: "Raipur",             lat: 21.2514, lng: 81.6296, city: "Raipur",             state: "Chhattisgarh" },
  { name: "Bhilai",             lat: 21.2097, lng: 81.4283, city: "Bhilai",             state: "Chhattisgarh" },
  { name: "Bilaspur",           lat: 22.0797, lng: 82.1391, city: "Bilaspur",           state: "Chhattisgarh" },
  { name: "Korba",              lat: 22.3595, lng: 82.7501, city: "Korba",              state: "Chhattisgarh" },
  { name: "Durg",               lat: 21.1904, lng: 81.2849, city: "Durg",               state: "Chhattisgarh" },
  { name: "Jagdalpur",          lat: 19.0739, lng: 82.0146, city: "Jagdalpur",          state: "Chhattisgarh" },

  // ── Uttarakhand ───────────────────────────────────────────────────
  { name: "Dehradun",           lat: 30.3165, lng: 78.0322, city: "Dehradun",           state: "Uttarakhand" },
  { name: "Haridwar",           lat: 29.9457, lng: 78.1642, city: "Haridwar",           state: "Uttarakhand" },
  { name: "Rishikesh",          lat: 30.0869, lng: 78.2676, city: "Rishikesh",          state: "Uttarakhand" },
  { name: "Nainital",           lat: 29.3803, lng: 79.4636, city: "Nainital",           state: "Uttarakhand" },
  { name: "Haldwani",           lat: 29.2219, lng: 79.5132, city: "Haldwani",           state: "Uttarakhand" },
  { name: "Roorkee",            lat: 29.8543, lng: 77.8880, city: "Roorkee",            state: "Uttarakhand" },

  // ── Himachal Pradesh ──────────────────────────────────────────────
  { name: "Shimla",             lat: 31.1048, lng: 77.1734, city: "Shimla",             state: "Himachal Pradesh" },
  { name: "Manali",             lat: 32.2396, lng: 77.1887, city: "Manali",             state: "Himachal Pradesh" },
  { name: "Dharamshala",        lat: 32.2190, lng: 76.3234, city: "Dharamshala",        state: "Himachal Pradesh" },
  { name: "Solan",              lat: 30.9045, lng: 77.0967, city: "Solan",              state: "Himachal Pradesh" },
  { name: "Mandi",              lat: 31.7088, lng: 76.9318, city: "Mandi",              state: "Himachal Pradesh" },
  { name: "Kullu",              lat: 31.9579, lng: 77.1095, city: "Kullu",              state: "Himachal Pradesh" },

  // ── Chandigarh ────────────────────────────────────────────────────
  { name: "Chandigarh",         lat: 30.7333, lng: 76.7794, city: "Chandigarh",         state: "Chandigarh" },

  // ── Goa ──────────────────────────────────────────────────────────
  { name: "Panaji",             lat: 15.4989, lng: 73.8278, city: "Panaji",             state: "Goa" },
  { name: "Margao",             lat: 15.2832, lng: 73.9862, city: "Margao",             state: "Goa" },
  { name: "Vasco",              lat: 15.3982, lng: 73.8113, city: "Vasco da Gama",      state: "Goa" },
  { name: "Mapusa",             lat: 15.5957, lng: 73.8091, city: "Mapusa",             state: "Goa" },

  // ── Jammu & Kashmir ───────────────────────────────────────────────
  { name: "Srinagar",           lat: 34.0837, lng: 74.7973, city: "Srinagar",           state: "Jammu and Kashmir" },
  { name: "Jammu",              lat: 32.7266, lng: 74.8570, city: "Jammu",              state: "Jammu and Kashmir" },
  { name: "Anantnag",           lat: 33.7311, lng: 75.1487, city: "Anantnag",           state: "Jammu and Kashmir" },
  { name: "Sopore",             lat: 34.2989, lng: 74.4672, city: "Sopore",             state: "Jammu and Kashmir" },

  // ── North East — Assam (kept from before) ─────────────────────────
  { name: "Guwahati",           lat: 26.1445, lng: 91.7362, city: "Guwahati",           state: "Assam" },
  { name: "Jorhat",             lat: 26.7509, lng: 94.2037, city: "Jorhat",             state: "Assam" },
  { name: "Silchar",            lat: 24.8333, lng: 92.7789, city: "Silchar",            state: "Assam" },
  { name: "Dibrugarh",          lat: 27.4728, lng: 94.9120, city: "Dibrugarh",          state: "Assam" },
  { name: "Tezpur",             lat: 26.6338, lng: 92.7926, city: "Tezpur",             state: "Assam" },
  { name: "Tinsukia",           lat: 27.4887, lng: 95.3558, city: "Tinsukia",           state: "Assam" },
  { name: "Nagaon",             lat: 26.3500, lng: 92.6833, city: "Nagaon",             state: "Assam" },
  { name: "Sivasagar",          lat: 26.9853, lng: 94.6366, city: "Sivasagar",          state: "Assam" },
  { name: "Bongaigaon",         lat: 26.4773, lng: 90.5582, city: "Bongaigaon",         state: "Assam" },
  { name: "Goalpara",           lat: 26.1716, lng: 90.6148, city: "Goalpara",           state: "Assam" },
  { name: "Barpeta",            lat: 26.3226, lng: 91.0037, city: "Barpeta",            state: "Assam" },
  { name: "Morigaon",           lat: 26.2486, lng: 92.3384, city: "Morigaon",           state: "Assam" },
  { name: "Haflong",            lat: 25.1613, lng: 93.0166, city: "Haflong",            state: "Assam" },
  { name: "Hailakandi",         lat: 24.6833, lng: 92.5667, city: "Hailakandi",         state: "Assam" },
  { name: "Karimganj",          lat: 24.8647, lng: 92.3560, city: "Karimganj",          state: "Assam" },
  { name: "Dhubri",             lat: 26.0200, lng: 89.9800, city: "Dhubri",             state: "Assam" },
  { name: "Kokrajhar",          lat: 26.4009, lng: 90.2712, city: "Kokrajhar",          state: "Assam" },
  { name: "Majuli",             lat: 26.9500, lng: 94.1500, city: "Majuli",             state: "Assam" },
  { name: "North Lakhimpur",    lat: 27.2355, lng: 94.1012, city: "North Lakhimpur",    state: "Assam" },
  { name: "Lakhimpur",          lat: 27.2355, lng: 94.1012, city: "North Lakhimpur",    state: "Assam" },
  { name: "Hojai",              lat: 26.0044, lng: 92.8523, city: "Hojai",              state: "Assam" },
  { name: "Golaghat",           lat: 26.5186, lng: 93.9668, city: "Golaghat",           state: "Assam" },
  { name: "Biswanath Chariali", lat: 26.7500, lng: 93.1500, city: "Biswanath Chariali", state: "Assam" },
  { name: "Diphu",              lat: 25.8442, lng: 93.4326, city: "Diphu",              state: "Assam" },
  { name: "Nalbari",            lat: 26.4450, lng: 91.4376, city: "Nalbari",            state: "Assam" },
  { name: "Dhemaji",            lat: 27.4805, lng: 94.5691, city: "Dhemaji",            state: "Assam" },
  { name: "Kaziranga",          lat: 26.5775, lng: 93.1711, city: "Kaziranga",          state: "Assam" },
  { name: "Kamrup",             lat: 26.1445, lng: 91.7362, city: "Guwahati",           state: "Assam" },
  { name: "Dispur",             lat: 26.1433, lng: 91.7898, city: "Dispur",             state: "Assam" },

  // ── North East — other states ─────────────────────────────────────
  { name: "Shillong",           lat: 25.5788, lng: 91.8933, city: "Shillong",           state: "Meghalaya" },
  { name: "Imphal",             lat: 24.8170, lng: 93.9368, city: "Imphal",             state: "Manipur" },
  { name: "Agartala",           lat: 23.8315, lng: 91.2868, city: "Agartala",           state: "Tripura" },
  { name: "Aizawl",             lat: 23.7307, lng: 92.7173, city: "Aizawl",             state: "Mizoram" },
  { name: "Kohima",             lat: 25.6751, lng: 94.1086, city: "Kohima",             state: "Nagaland" },
  { name: "Dimapur",            lat: 25.9066, lng: 93.7279, city: "Dimapur",            state: "Nagaland" },
  { name: "Itanagar",           lat: 27.0844, lng: 93.6053, city: "Itanagar",           state: "Arunachal Pradesh" },
  { name: "Gangtok",            lat: 27.3314, lng: 88.6138, city: "Gangtok",            state: "Sikkim" },
];

const PLACE_INDEX = INDIA_PLACES.map(p => ({ ...p, key: p.name.toLowerCase() }));

function lookupTable(text) {
  const lower = text.toLowerCase();
  let best = null;
  for (const place of PLACE_INDEX) {
    if (lower.includes(place.key)) {
      if (!best || place.key.length > best.key.length) best = place;
    }
  }
  return best || null;
}

function regexFallback(text) {
  const patterns = [
    /near\s+([A-Za-z][A-Za-z0-9\s,]{2,40})/i,
    /\bin\s+([A-Z][A-Za-z\s]{2,30})/,
    /at\s+([A-Za-z][A-Za-z0-9\s,]{2,30})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1]
        .replace(/#\S+/g, "")
        .replace(/\s+(mein|pe|ka|ki|ke|aur|se|ko)\b.*/i, "")
        .trim();
      if (raw.length > 2) return raw;
    }
  }
  return null;
}

function parseStateFromDisplayName(displayName) {
  if (!displayName) return "Unknown";
  const parts = displayName.split(",").map(p => p.trim());
  if (parts.length >= 3) return parts[parts.length - 2] || "Unknown";
  return "Unknown";
}

export async function extractLocation(text) {
  try {
    const tableMatch = lookupTable(text);
    if (tableMatch) {
      console.log(`Location (table): ${tableMatch.name}`);
      return { name: tableMatch.name, lat: tableMatch.lat, lng: tableMatch.lng, city: tableMatch.city, state: tableMatch.state };
    }

    let locationName = await extractLocationNER(text);

    if (!locationName) {
      console.log("NER found nothing → trying regex fallback");
      locationName = regexFallback(text);
    }

    if (!locationName) throw new Error("No location found in text");

    const geo = await geocodeLocation(locationName);
    if (!geo) throw new Error(`Geocoding failed for: ${locationName}`);

    const stateName = parseStateFromDisplayName(geo.displayName);
    console.log(`Location (NER+geocode): ${locationName} → ${geo.lat}, ${geo.lng}`);
    return {
      name:  locationName,
      lat:   geo.lat,
      lng:   geo.lng,
      city:  geo.displayName?.split(",")[0]?.trim() || locationName,
      state: stateName,
    };

  } catch (err) {
    console.error("Location pipeline failed:", err.message);
    return { name: "India", lat: 20.5937, lng: 78.9629, city: "India", state: "Unknown" };
  }
}