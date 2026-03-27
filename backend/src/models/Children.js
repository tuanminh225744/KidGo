import mongoose from "mongoose";

const childSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  school: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  note: {
    type: String,
  },
  pickupPersons: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PickupPerson",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
});

export default mongoose.model("Children", childSchema);
