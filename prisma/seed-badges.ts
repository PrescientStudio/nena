import { BadgeService } from '../src/services/badgeService'

async function seedBadges() {
  const badgeService = new BadgeService()
  
  try {
    await badgeService.initializeDefaultBadges()
    console.log('✅ Default badges created successfully!')
  } catch (error) {
    console.error('❌ Error creating badges:', error)
  }
}

seedBadges()