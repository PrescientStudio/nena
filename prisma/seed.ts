import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create initial badges
  const badges = [
    {
      name: "First Steps",
      description: "Complete your first recording",
      category: "milestone",
      iconName: "award",
      criteria: JSON.stringify({ recordings: 1 })
    },
    {
      name: "Practice Pro",
      description: "Complete 10 recording sessions",
      category: "milestone",
      iconName: "target",
      criteria: JSON.stringify({ recordings: 10 })
    },
    {
      name: "Streak Master",
      description: "Practice for 7 days in a row",
      category: "consistency",
      iconName: "flame",
      criteria: JSON.stringify({ streak: 7 })
    },
    {
      name: "Confidence Builder",
      description: "Achieve 90% average confidence",
      category: "improvement",
      iconName: "smile",
      criteria: JSON.stringify({ averageConfidence: 0.9 })
    },
    {
      name: "Speed Demon",
      description: "Speak at optimal pace (150-160 WPM)",
      category: "improvement",
      iconName: "gauge",
      criteria: JSON.stringify({ speakingPace: { min: 150, max: 160 } })
    },
    {
      name: "Clean Speaker",
      description: "Reduce filler words to under 2 per minute",
      category: "improvement",
      iconName: "sparkles",
      criteria: JSON.stringify({ fillersPerMinute: { max: 2 } })
    }
  ]

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })