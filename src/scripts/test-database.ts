// Load environment variables first
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'

async function testDatabase() {
  console.log('🗄️  Testing Database Connection')
  console.log('==============================')
  
  console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Missing')

  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL environment variable is missing')
    return
  }

  const prisma = new PrismaClient()
  
  try {
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Test query
    const userCount = await prisma.user.count()
    console.log(`✅ Users in database: ${userCount}`)
    
    // Test creating a user
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        displayName: 'Test User'
      }
    })
    console.log('✅ Test user created:', testUser.id)
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id }
    })
    console.log('✅ Test user cleaned up')
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)

    if (error.code === 'P1001') {
      console.log('💡 Database connection failed. Make sure PostgreSQL is running on localhost:5432')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()