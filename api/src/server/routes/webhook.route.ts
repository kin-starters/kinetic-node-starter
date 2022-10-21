import { Request, Response } from 'express'
import { Kinetic } from '../../lib'

export function webhookRoute({ kinetic }: { kinetic: Kinetic }) {
  return async (req: Request, res: Response) => {
    function error(message) {
      console.log(`⚠️ Webhook Error: ${message}`)
      res.status(404).send(message)
    }

    function success() {
      res.status(200).send('OK')
    }

    switch (req.params.type) {
      case 'balance':
        return kinetic.handleBalanceWebhook(req.body, error, success)
      case 'event':
        return kinetic.handleEventWebhook(req.body, error, success)
      case 'verify':
        return kinetic.handleVerifyWebhook(req.body, error, success)
      default:
        return error('Webhook type supported.')
    }
  }
}
ga
