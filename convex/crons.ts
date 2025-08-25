import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run every hour to check for and deactivate expired ladders
crons.interval(
  "deactivate expired ladders", 
  { hours: 24, }, 
  internal.ladders.deactivateExpiredLadders, 
  {}
);

export default crons;
