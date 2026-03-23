import 'dotenv/config'
import 'reflect-metadata'
import { AppDataSource } from './shared/infrastructure/database/DataSource'
import { setupContainer } from './shared/infrastructure/container'
import { createApp } from './shared/infrastructure/http/Server'

const PORT = Number(process.env.PORT ?? 3000)

async function bootstrap(): Promise<void> {
  // 1. Inicializar banco de dados
  await AppDataSource.initialize()
  console.log('[Database] Conexão estabelecida com PostgreSQL')

  // 2. Configurar container de DI (wiring)
  setupContainer(AppDataSource)
  console.log('[DI] Container configurado')

  // 3. Criar e iniciar o servidor HTTP
  const app = createApp()
  app.listen(PORT, () => {
    console.log(`[Server] Rodando em http://localhost:${PORT}`)
    console.log(`[Health] http://localhost:${PORT}/api/health`)
  })
}

bootstrap().catch((err) => {
  console.error('[Fatal] Falha ao iniciar aplicação:', err)
  process.exit(1)
})
