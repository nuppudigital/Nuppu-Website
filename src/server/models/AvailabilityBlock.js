// one row per manually-blocked slot the consultant marked unavailable, layered on top of the
// default Mon-Fri 9-17 Europe/Helsinki working-hours template in src/server/availability/slots.js

import mongoose from "mongoose";

const availabilityBlockSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "YYYY-MM-DD", Europe/Helsinki calendar date
    startTime: { type: String, default: null }, // "09:00".."16:00", or null = whole day blocked
  },
  { timestamps: true },
);

availabilityBlockSchema.index({ date: 1, startTime: 1 }, { unique: true });

export const AvailabilityBlock = mongoose.model("AvailabilityBlock", availabilityBlockSchema);
export default AvailabilityBlock;
