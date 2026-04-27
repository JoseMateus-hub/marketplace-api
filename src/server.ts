import { app } from './app'
import { env } from './env'

app.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  console.log(`🚀 Marketplace API rodando na porta ${env.PORT}`)
})