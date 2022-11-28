export interface ServerConfig {
  apiUrl: string
  endpoint: string
  environment: string
  host: string
  index: number
  paymentAllowExisting: boolean
  paymentAllowNew: boolean
  paymentAuthSecret?: string
  paymentMax: string
  paymentSecret: string
  port: string
}

export function getServerConfig(): ServerConfig {
  const requiredEnvVars = [
    'ENDPOINT',
    'ENVIRONMENT',
    'INDEX',
    'PAYMENT_ALLOW_EXISTING',
    'PAYMENT_ALLOW_NEW',
    'PAYMENT_SECRET',
    'PORT',
  ]
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]?.length)

  if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(1)
  }

  const host = process.env.HOST || 'localhost'
  const port = process.env.PORT || '9876'

  const apiUrl = process.env.API_URL || `http://${host}:${port}`

  return {
    apiUrl,
    endpoint: process.env.ENDPOINT!,
    environment: process.env.ENVIRONMENT!,
    host,
    index: Number(process.env.INDEX),
    paymentAllowExisting: Boolean(process.env.PAYMENT_ALLOW_EXISTING?.toLowerCase() === 'true'),
    paymentAllowNew: Boolean(process.env.PAYMENT_ALLOW_NEW?.toLowerCase() === 'true'),
    paymentAuthSecret: process.env.PAYMENT_AUTH_SECRET,
    paymentMax: process.env.PAYMENT_MAX || process.env.PAYMENT_AMOUNT!,
    paymentSecret: process.env.PAYMENT_SECRET!,
    port,
  }
}
