import { Request, Response } from 'express'
import { Kinetic } from '../../lib'

export function airdropRoute({ kinetic }: { kinetic: Kinetic }) {
  return async (req: Request, res: Response) => {
    try {
      const result = await kinetic.airdrop({
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
