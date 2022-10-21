import { Request, Response } from 'express'
import { Kinetic } from '../../lib'

export function paymentRoute({ kinetic }: { kinetic: Kinetic }) {
  return async (req: Request, res: Response) => {
    if (
      kinetic.config.paymentSecret?.length &&
      (!req.headers.authorization || req.headers.authorization !== kinetic.config.paymentSecret)
    ) {
      return res.status(401).send('Unauthorized')
    }
    try {
      const result = await kinetic.payment({
        amount: req.params.amount,
        destination: req.params.destination,
      })
      return res.send(result)
    } catch (error) {
      res.status(400)
      return res.send({ error: `${error}` })
    }
  }
}
