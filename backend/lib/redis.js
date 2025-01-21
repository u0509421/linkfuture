import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis(process.env.UPSTASH_REDIS_REST_URL);
// redis is a key-value store
// redis is used to store data in memory
// like a giant json object
