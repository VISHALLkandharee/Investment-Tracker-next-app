// prisma/prisma.config.ts
import 'dotenv/config'

export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}