import * as dotenv from 'dotenv'
import { server } from './server/server'
import { getServerConfig, ServerConfig } from './server/server-config'

dotenv.config()

const config: ServerConfig = getServerConfig()

server(config).catch((e) => console.error(`An error occurred:`, e))
