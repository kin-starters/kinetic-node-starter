import { Keypair } from '@kin-kinetic/keypair'

export default async function () {
  const { mnemonic, secretKey, solanaSecretKey, publicKey } = Keypair.random()

  console.log('Generated keypair:', { mnemonic, secretKey, byteArray: `[${solanaSecretKey.join(',')}]`, publicKey })
}
