import mongoose from "mongoose";

const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;


// =============================
// 👤 USER SCHEMA
// =============================

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String }
}, { timestamps: true });


// =============================
// 🚨 POST (HAZARD) SCHEMA
// =============================

const postSchema = new Schema({

  text: {
    type: String,
    required: true
  },

  label: {
    type: String,
    enum: ["accident", "pothole", "road_damage", "traffic", "animal"],
    required: true
  },

  confidence: {
    type: Number,
    required: true
  },

  // 🔥 GEOJSON (IMPORTANT FOR MAP)
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },

  locationName: {
    type: String
  },

  city: {
    type: String
  },

  state: {
    type: String
  },

  source: {
    type: String,
    enum: ["user", "twitter"],
    default: "user"
  },

  userId: {
    type: ObjectId,
    ref: "users"
  }

}, { timestamps: true });


// 🔥 VERY IMPORTANT (for map queries later)
postSchema.index({ location: "2dsphere" });


// =============================
// 🏢 AUTHORITY SCHEMA
// =============================

const authoritySchema = new Schema({

  city: {
    type: String,
    required: true
  },

  state: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  department: {
    type: String,
    default: "road_safety"
  }

}, { timestamps: true });


// =============================
// 🐦 TWEET LOG (OPTIONAL)
// =============================

const tweetSchema = new Schema({

  text: {
    type: String
  },

  processed: {
    type: Boolean,
    default: false
  },

  hazardDetected: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


// =============================
// 📦 EXPORT MODELS
// =============================

export const UserModel = model("users", userSchema);

export const PostModel = model("posts", postSchema);

export const AuthorityModel = model("authorities", authoritySchema);

export const TweetModel = model("tweets", tweetSchema);