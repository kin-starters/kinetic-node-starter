export interface ServerConfig {
  airdropAllowExisting: boolean
  airdropAllowNew: boolean
  airdropAmount: string
  airdropMax: string
  airdropMnemonic: string
  endpoint: string
  environment: string
  index: number
  port: string
}

export function getServerConfig(): ServerConfig {
  const requiredEnvVars = [
    'AIRDROP_ALLOW_EXISTING',
    'AIRDROP_ALLOW_NEW',
    'AIRDROP_AMOUNT',
    'AIRDROP_MNEMONIC',
    'ENDPOINT',
    'ENVIRONMENT',
    'INDEX',
    'PORT',
  ]
  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]?.length)

  if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`)
    process.exit(1)
  }

  return {
    airdropAllowExisting: Boolean(process.env.AIRDROP_ALLOW_EXISTING?.toLowerCase() === 'true'),
    airdropAllowNew: Boolean(process.env.AIRDROP_ALLOW_NEW?.toLowerCase() === 'true'),
    airdropAmount: process.env.AIRDROP_AMOUNT!,
    airdropMax: process.env.AIRDROP_MAX || process.env.AIRDROP_AMOUNT!,
    airdropMnemonic: process.env.AIRDROP_MNEMONIC!,
    endpoint: process.env.ENDPOINT!,
    environment: process.env.ENVIRONMENT!,
    index: Number(process.env.INDEX),
    port: process.env.PORT || '7890',
  }
}
