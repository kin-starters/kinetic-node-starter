export interface ServerConfig {
  endpoint: string
  environment: string
  index: number
  paymentAllowExisting: boolean
  paymentAllowNew: boolean
  paymentAuthSecret?: string
  paymentMax: string
  paymentMnemonic: string
  port: string
}

export function getServerConfig(): ServerConfig {
  const requiredEnvVars = [
    'ENDPOINT',
    'ENVIRONMENT',
    'INDEX',
    'PAYMENT_ALLOW_EXISTING',
    'PAYMENT_ALLOW_NEW',
    'PAYMENT_MNEMONIC',
    'PORT',
  ]
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]?.length)

  if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(1)
  }

  return {
    endpoint: process.env.ENDPOINT!,
    environment: process.env.ENVIRONMENT!,
    index: Number(process.env.INDEX),
    paymentAllowExisting: Boolean(process.env.PAYMENT_ALLOW_EXISTING?.toLowerCase() === 'true'),
    paymentAllowNew: Boolean(process.env.PAYMENT_ALLOW_NEW?.toLowerCase() === 'true'),
    paymentAuthSecret: process.env.PAYMENT_AUTH_SECRET,
    paymentMax: process.env.PAYMENT_MAX || process.env.PAYMENT_AMOUNT!,
    paymentMnemonic: process.env.PAYMENT_MNEMONIC!,
    port: process.env.PORT || '9876',
  }
}
