import { config } from 'dotenv'
import path from 'path'

config({
  path: path.resolve(__dirname, '../.env'),
})
process.env.SERVER_URL = 'http://localhost:8080'
