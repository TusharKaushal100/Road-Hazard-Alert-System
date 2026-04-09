import mongoose from "mongoose";

const { Schema, model } = mongoose;
const ObjectId = mongoose.Types.ObjectId;




const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String }
}, { timestamps: true });



const postSchema = new Schema({

  text: {
    type: String,
    required: true
  },

  label: {
    type: String,
    enum: ["accident", "pothole", "road_damage", "traffic","flood","animal","none"],
    required: true
  },

  confidence: {
    type: Number,
    required: true
  },

 
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number], 
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
    type: String,
  default: "Assam" 
  },

  source: {
    type: String,
    enum: ["user", "mock", "reddit"],
    default: "mock"
  },

  userId: {
    type: ObjectId,
    ref: "users"
  },
  username: { type: String },

}, { timestamps: true });



postSchema.index({ location: "2dsphere" });




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



export const UserModel = model("users", userSchema);

export const PostModel = model("posts", postSchema);

export const AuthorityModel = model("authorities", authoritySchema);

export const TweetModel = model("tweets", tweetSchema);