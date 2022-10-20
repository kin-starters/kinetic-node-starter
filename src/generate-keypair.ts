import { Keypair } from '@kin-kinetic/keypair'
const { mnemonic, secretKey, publicKey } = Keypair.random()

console.log('Generated keypair:', { mnemonic, secretKey, publicKey })
