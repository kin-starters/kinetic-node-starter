import { Keypair } from '@kin-kinetic/keypair'
import { KineticSdk } from '@kin-kinetic/sdk'
import * as express from 'express'

import { Kinetic } from '../lib'
import { airdropRoute } from './routes/airdrop.route'
import { uptimeRoute } from './routes/uptime.route'
import { ServerConfig } from './server-config'

export async function server(config: ServerConfig) {
  // Setup Kinetic SDK
  const sdk = await KineticSdk.setup({
    environment: config.environment,
    endpoint: config.endpoint,
    index: config.index,
    logger: console,
  })

  // Create instance of our Kinetic helper class
  const kinetic = new Kinetic(config, sdk, Keypair.fromMnemonic(config.airdropMnemonic))

  // Set up Express server
  const app = express()
  app.use(express.json())

  // Airdrop Routes, pass in our Kinetic helper class
  app.use('/airdrop/:destination/:amount', airdropRoute({ kinetic }))
  app.use('/airdrop/:destination', airdropRoute({ kinetic }))

  // Root Route, must be the last one.
  app.use('/', uptimeRoute())

  // Start server
  app.listen(Number(config.port), '0.0.0.0').on('listening', async () => {
    console.log(`🚀 Listening on port ${config.port}`)

    console.log(`⬢ Kinetic: Connected to App: ${sdk.config?.app.name} ${sdk.config?.app.index} `)
    console.log(`⬢ Kinetic: Connected to API: ${sdk.config?.api.name} ${sdk.config?.api.version} `)
    console.log(
      `⬢ Kinetic: Connected to Environment: ${sdk.config?.environment?.name} (${sdk.config?.environment.cluster?.name}) `,
    )
    sdk.config?.mints.forEach((mint) => {
      console.log(
        `⬢ Kinetic: Mint: ${mint.name} ${mint.publicKey} (${mint.decimals} decimals) (Airdrop: ${
          mint.airdrop ? `max ${mint.airdropMax} ${mint.symbol}` : 'disabled'
        }) `,
      )
    })

    // Initialize AirdropAccount
    kinetic.findOrCreateAirdropAccount().then(() => {
      console.log(`💧 Ready to drop!`)
    })
  })
}
