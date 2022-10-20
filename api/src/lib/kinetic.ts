import { Keypair } from '@kin-kinetic/keypair'
import { AppConfigMint, KineticSdk, removeDecimals } from '@kin-kinetic/sdk'
import { Commitment } from '@kin-kinetic/solana'
import { TransactionType } from '@kin-tools/kin-memo'
import { ServerConfig } from '../server/server-config'

export class Kinetic {
  constructor(readonly config: ServerConfig, private readonly sdk: KineticSdk, private readonly keypair: Keypair) {}

  get mint(): AppConfigMint {
    return this.sdk.config!.mint!
  }

  get publicKey(): string {
    return this.keypair.publicKey
  }

  async airdrop({ amount, destination }: { amount: string; destination: string }) {
    // Set default airdrop amount if none is provided
    amount = amount || this.config.airdropAmount

    if (Number(amount) > Number(this.config.airdropMax)) {
      throw new Error(`Airdrop amount is too large, max is ${this.config.airdropMax}`)
    }

    if (!this.config.airdropAllowExisting) {
      // Check to see if the destination account already has funds
      const result = await this.sdk.getBalance({ account: destination })

      if (result && result.balance !== '0') {
        throw new Error(`Account '${destination}' is already funded: ${result.balance} Kin`)
      }
    }

    if (!this.config.airdropAllowNew) {
      const found = await this.sdk.getTokenAccounts({ account: destination })

      if (!found.length) {
        throw new Error(`Can't airdrop to new account ${destination}.`)
      }
    }

    try {
      console.log(`💧 Airdrop: sending ${amount} Kin to ${destination}...`)
      const tx = await this.submitPayment({
        amount,
        destination,
        senderCreate: this.config.airdropAllowNew,
      })
      console.log(`💧 Airdrop: sent ${amount} Kin to ${destination}... ${tx.explorer} `)
      return tx
    } catch (e) {
      throw new Error(`Account '${destination}' something went wrong: ${e}`)
    }
  }

  // Helper function initializes the Airdrop account.
  async findOrCreateAirdropAccount() {
    const publicKey = this.publicKey

    console.log(`💧 Airdrop address: ${publicKey}`)
    console.log(`💧 Airdrop account: ${this.sdk.getExplorerUrl(`address/${publicKey}`)}`)
    console.log(`💧 Airdrop amounts: default: ${this.config.airdropAmount}, max: ${this.config.airdropMax}`)
    console.log(`💧 Airdrop allow airdrop to empty accounts: ${this.config.airdropAllowNew ? 'yes' : 'no'}`)
    console.log(`💧 Airdrop allow airdrop to existing accounts: ${this.config.airdropAllowExisting ? 'yes' : 'no'}`)
    console.log(`💧 Airdrop secret: ${this.config.airdropSecret ? 'enabled' : 'disabled'}`)

    // Get the balance of this account
    const account = await this.sdk.getBalance({ account: this.publicKey })

    if (!account.tokens.length) {
      // If the account doesn't have any tokens, create it.
      await this.createAccount()
    }

    console.log(`💧 Airdrop balance: ${removeDecimals(account.balance, this.mint.decimals!)} ${this.mint.symbol} `)

    if (account.balance === '0') {
      // If the default Kinetic mint has airdrop enabled, we can fund ourselves...
      if (this.mint.airdrop && this.mint.airdropMax) {
        console.log(
          `💧 Airdrop account: ${publicKey} is empty, requesting airdrop of ${this.mint.airdropMax.toString()} ${
            this.mint.symbol
          }...`,
        )
        const airdropTx = await this.sdk.requestAirdrop({
          account: this.publicKey,
          amount: this.mint?.airdropMax.toString(),
        })
        console.log(`💧 Airdrop request: ${this.sdk.getExplorerUrl(`tx/${airdropTx.signature}`)}`)
      } else {
        console.log(`💧 Airdrop account: Make sure to fund this account with some ${this.mint.symbol}.`)
      }
    }
  }

  private async createAccount(): Promise<string[]> {
    console.log(`💧 Airdrop account: creating account ${this.publicKey}...`)
    // Create Account
    const created = await this.sdk.createAccount({
      owner: this.keypair,
      commitment: Commitment.Finalized,
    })
    console.log(`💧 Airdrop account: created account ${this.sdk.getExplorerUrl(`tx/${created.signature}`)}...`)
    // Resolve Token Account
    return this.sdk.getTokenAccounts({ account: this.publicKey })
  }

  private async submitPayment({
    amount,
    destination,
    senderCreate,
  }: {
    amount: string
    destination: string
    senderCreate: boolean
  }) {
    return this.sdk
      .makeTransfer({
        amount,
        commitment: Commitment.Confirmed,
        destination,
        owner: this.keypair,
        senderCreate,
        type: TransactionType.Earn,
      })
      .then(({ signature }) => {
        return {
          success: true,
          amount,
          destination,
          tx: signature,
          explorer: this.sdk.getExplorerUrl(`tx/${signature}`),
        }
      })
  }
}
