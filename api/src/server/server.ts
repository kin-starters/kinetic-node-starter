import { Keypair } from '@kin-kinetic/keypair'
import { KineticSdk } from '@kin-kinetic/sdk'
import * as express from 'express'
import { Request, Response } from 'express'

import { Kinetic } from '../lib'
import { paymentRoute } from './routes/payment.route'
import { uptimeRoute } from './routes/uptime.route'
import { webhookRoute } from './routes/webhook.route'
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
  const kinetic = new Kinetic(config, sdk, Keypair.fromSecret(config.paymentSecret))

  // Set up Express server
  const app = express()
  app.use(express.json())

  // Payment Routes, pass in our Kinetic helper class
  app.use('/payment/:destination/:amount', paymentRoute({ kinetic }))

  // Webhook Routes, pass in our Kinetic helper class
  app.post('/webhook/:type', webhookRoute({ kinetic }))

  // Root Route, must be the last one.
  app.use('/uptime', uptimeRoute())
  app.use('*', (req: Request, res: Response) => res.status(404).send('Not Found'))

  // Start server
  app.listen(Number(config.port), '0.0.0.0').on('listening', async () => {
    console.log(`🚀 Listening on port ${config.port}`)

    console.log(`⬢ Webhook: Balance ${config.apiUrl}/webhook/balance`)
    console.log(`⬢ Webhook: Event ${config.apiUrl}/webhook/event`)
    console.log(`⬢ Webhook: Verify ${config.apiUrl}/webhook/verify`)
    console.log(`⬢ Kinetic: Connected to App: ${sdk.config?.app.name} ${sdk.config?.app.index} `)
    console.log(`⬢ Kinetic: Connected to API: ${sdk.config?.api.name} ${sdk.config?.api.version} `)
    console.log(
      `⬢ Kinetic: Connected to Environment: ${sdk.config?.environment?.name} (${sdk.config?.environment.cluster?.name}) `,
    )
    sdk.config?.mints.forEach((mint) => {
      console.log(
        `⬢ Kinetic: Mint: ${mint.name} ${mint.publicKey} (${mint.decimals} decimals) (Payment: ${
          mint.airdrop ? `max ${mint.airdropMax} ${mint.symbol}` : 'disabled'
        }) `,
      )
    })

    // Initialize PaymentAccount
    kinetic.findOrCreateAccount().then(() => {
      console.log(`⬢ Payment: link ${config.apiUrl}/payment/<destination>/<amount>`)
    })
  })
}
