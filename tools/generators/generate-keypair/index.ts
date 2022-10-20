import { Keypair } from '@kin-kinetic/keypair';

export default async function () {
  const { mnemonic, secretKey, publicKey } = Keypair.random();

  console.log('Generated keypair:', { mnemonic, secretKey, publicKey });
}
