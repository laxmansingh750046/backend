import 'dotenv/config'
import express from 'express'
import connectDB from './db/index.js';

const app = express();

connectDB();
