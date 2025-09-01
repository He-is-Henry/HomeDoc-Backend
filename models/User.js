const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    sessions: [
      {
        device: String, // e.g., "Chrome on Android"
        location: String, // e.g., "Lagos, Nigeria"
        ipAddress: String, // from req.ip or headers
        accessToken: String, // optional: for tracing
        refreshToken: String, // the only session identifier needed
        userAgent: String, // raw user-agent string
        browser: String, // parsed (optional)
        os: String, // parsed (optional)
        platform: String, // "mobile" / "desktop"
        isMobile: Boolean, // optional
        lastUsed: { type: Date, default: Date.now() }, // update on refresh
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dob: Date,
    sex: { type: String, enum: ["male", "female", "other"], default: "other" },
    height: Number, // in cm
    weight: Number, // in kg
    bloodGroup: String, // e.g., "A+", "O-"
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    smokingStatus: { type: String, enum: ["never", "former", "current"] },
    alcoholConsumption: {
      type: String,
      enum: ["none", "occasional", "regular"],
    },
    activityLevel: String,
    enum: ["sedentary", "moderate", "active"],

    // Additional fields later:
  }, // medicalHistory: [String], etc.

  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with hashed one
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
