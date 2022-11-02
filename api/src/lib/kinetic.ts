import { Keypair } from '@kin-kinetic/keypair'
import { AppConfigMint, KineticSdk, Transaction } from '@kin-kinetic/sdk'
import { Commitment, TransactionType } from '@kin-kinetic/solana'

import { ServerConfig } from '../server/server-config'

export class Kinetic {
  constructor(readonly config: ServerConfig, readonly sdk: KineticSdk, private readonly keypair: Keypair) {}

  get mint(): AppConfigMint {
    return this.sdk.config!.mint!
  }

  get publicKey(): string {
    return this.keypair.publicKey
  }

  async payment({ amount, destination }: { amount: string; destination: string }) {
    // Check if amount is below the maximum
    if (Number(amount) > Number(this.config.paymentMax)) {
      throw new Error(`Payment amount is too large, max is ${this.config.paymentMax}`)
    }

    // If we don't allow funding existing accounts, check if the destination account has funds
    if (!this.config.paymentAllowExisting) {
      // Check to see if the destination account already has funds
      const result = await this.sdk.getBalance({ account: destination })

      if (result && result.balance !== '0') {
        throw new Error(`Account '${destination}' is already funded: ${result.balance} Kin`)
      }
    }

    // If we don't allow new accounts, check to see if the account exists
    if (!this.config.paymentAllowNew) {
      // Check to see if the destination account exists
      const found = await this.sdk.getTokenAccounts({ account: destination })

      if (!found.length) {
        throw new Error(`Can't send payment to new account ${destination}.`)
      }
    }

    try {
      console.log(`⬢ Payment: sending ${amount} Kin to ${destination}...`)
      const tx = await this.submitPayment({
        amount,
        destination,
        senderCreate: this.config.paymentAllowNew,
      })
      console.log(`⬢ Payment: sent ${amount} Kin to ${destination}... ${tx.explorer} `)
      return tx
    } catch (e) {
      throw new Error(`Account '${destination}' something went wrong: ${e}`)
    }
  }

  // Helper function initializes the account.
  async findOrCreateAccount() {
    const publicKey = this.publicKey

    console.log(`⬢ Payment: account: ${this.sdk.getExplorerUrl(`address/${publicKey}`)}`)
    console.log(`⬢ Payment: address: ${publicKey}`)
    console.log(`⬢ Payment: allow empty accounts: ${this.config.paymentAllowNew ? 'yes' : 'no'}`)
    console.log(`⬢ Payment: allow existing accounts: ${this.config.paymentAllowExisting ? 'yes' : 'no'}`)
    console.log(`⬢ Payment: max: ${this.config.paymentMax}`)
    console.log(`⬢ Payment: secret: ${this.config.paymentSecret ? 'enabled' : 'disabled'}`)

    // Get the balance of this account
    const account = await this.sdk.getBalance({ account: this.publicKey })

    if (!account.tokens.length) {
      // If the account doesn't have any tokens, create it.
      await this.createAccount()
    }

    console.log(`⬢ Payment: balance: ${account.balance} ${this.mint.symbol} `)

    if (account.balance === '0') {
      // If the default Kinetic mint has airdrop enabled, we can fund ourselves...
      if (this.mint.airdrop && this.mint.airdropMax) {
        console.log(
          `⬢ Payment: account: ${publicKey} is empty, requesting airdrop of ${this.mint.airdropMax.toString()} ${
            this.mint.symbol
          }...`,
        )
        const tx = await this.sdk.requestAirdrop({
          account: this.publicKey,
          amount: this.mint?.airdropMax.toString(),
        })
        console.log(`⬢ Payment: request: ${this.sdk.getExplorerUrl(`tx/${tx.signature}`)}`)
      } else {
        console.log(`⬢ Payment: account: Make sure to fund this account with some ${this.mint.symbol}.`)
      }
    }
  }

  // Use the balance webhook to listen for balance changes under the specified threshold
  handleBalanceWebhook(
    { balance, change }: { balance: string; change: string },
    error: (message) => void,
    success: () => void,
  ) {
    console.log(`📨 Webhook: Balance: ${JSON.stringify({ balance, change }, null, 2)}`)
    return success()
  }

  // Use the event webhook to listen for finalized transactions
  handleEventWebhook(transaction: Transaction, error: (message) => void, success: () => void) {
    const amount = transaction.amount
    const destination = transaction.destination
    const signature = transaction.signature

    console.log(`📨 Webhook: Event: sent ${amount} to ${destination} ${this.sdk.getExplorerUrl(`tx/${signature}`)}`)
    return success()
  }

  // Add verification for transactions here.
  handleVerifyWebhook(transaction: Transaction, error: (message) => void, success: () => void) {
    const amount = transaction.amount
    const destination = transaction.destination

    // Check if the amount is above the minimum
    if (Number(amount) < 100) {
      return error('Amount too low...')
    }
    // Check if the destination address is not the payment account
    if (destination === this.publicKey) {
      return error('Destination is payment account...')
    }

    // Add your own verification here...
    console.log(`📨 Webhook: Verify: sending ${amount} to ${destination} `)
    return success()
  }

  private async createAccount(): Promise<string[]> {
    console.log(`⬢ Payment: account: creating account ${this.publicKey}...`)
    // Create Account
    const created = await this.sdk.createAccount({
      owner: this.keypair,
      commitment: Commitment.Finalized,
    })
    console.log(`⬢ Payment: account: created account ${this.sdk.getExplorerUrl(`tx/${created.signature}`)}...`)
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
