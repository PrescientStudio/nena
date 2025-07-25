"use client"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/contexts/AuthContext"
import type { RecentActivity, ProgressData, KeyMetric, Achievement, Goal } from "@/lib/types"
import { UserNav } from "@/components/user-nav"
import {
  Mic,
  Upload,
  BrainCircuit,
  Clock,
  Target,
  TrendingUp,
  Award,
  Sparkles,
  Trophy,
  Gauge,
  Smile,
  Zap,
  Play,
  Star,
  FlameIcon as Fire,
  ChevronRight,
} from "lucide-react"

// Mock Data
const recentActivity: RecentActivity[] = [
  { id: 1, date: "July 20, 2025", duration: "5:32", score: 88, insight: "Your confidence really shines through!" },
  { id: 2, date: "July 18, 2025", duration: "7:15", score: 82, insight: "Great energy - try slowing down just a bit" },
  { id: 3, date: "July 16, 2025", duration: "4:50", score: 79, insight: "Love your storytelling style!" },
]

const progressData: ProgressData[] = [
  { name: "Jan", score: 65 },
  { name: "Feb", score: 68 },
  { name: "Mar", score: 75 },
  { name: "Apr", score: 72 },
  { name: "May", score: 78 },
  { name: "Jun", score: 82 },
  { name: "Jul", score: 85 },
]

const keyMetrics: KeyMetric[] = [
  { name: "Speaking Pace", value: "150 WPM", change: "+5 WPM", icon: <Gauge className="w-5 h-5 text-blue-500" /> },
  { name: "Clarity", value: "92%", change: "+3%", icon: <Zap className="w-5 h-5 text-green-500" /> },
  { name: "Confidence", value: "85%", change: "+5%", icon: <Smile className="w-5 h-5 text-yellow-500" /> },
  { name: "Filler Words", value: "2/min", change: "-1/min", icon: <Sparkles className="w-5 h-5 text-red-500" /> },
]

const achievements: Achievement[] = [
  { name: "First Steps", unlocked: true, icon: <Award className="w-6 h-6" /> },
  { name: "Practice Pro", unlocked: true, icon: <Clock className="w-6 h-6" /> },
  { name: "Streak Master", unlocked: false, icon: <Target className="w-6 h-6" /> },
  { name: "Confidence King", unlocked: false, icon: <Trophy className="w-6 h-6" /> },
]

const goals: Goal[] = [
  { name: "Complete daily practice streak", progress: 60 },
  { name: "Reach 90% confidence score", progress: 85 },
]

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-gradient-to-r from-blue-500 to-purple-500"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="url(#gradient)"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {percentage}%
      </span>
    </div>
  )
}

export function Dashboard() {
  const { user, initialLoading } = useAuth()
  const overallImprovement = 85

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <BrainCircuit className="mx-auto h-12 w-12 animate-pulse text-blue-500" />
          <p className="mt-4 text-lg font-semibold">Loading your progress...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 min-h-screen">
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Welcome Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <img src="/placeholder.svg?height=40&width=120" alt="Nena AI Logo" className="h-10" />
              </Link>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hey {user?.displayName || "there"}! 👋
                </h1>
                <p className="text-md text-gray-600 dark:text-gray-300">Ready to level up your confidence?</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full">
                <Fire className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-orange-700">5 day streak!</span>
              </div>
              <UserNav />
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/record" className="group">
              <Button
                size="lg"
                className="w-full h-32 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Mic className="h-8 w-8" />
                    <Play className="h-6 w-6" />
                  </div>
                  <span>Start Recording</span>
                  <span className="text-sm font-normal text-blue-100">Let's hear your amazing voice!</span>
                </div>
              </Button>
            </Link>

            <Link href="/upload" className="group">
              <Button
                size="lg"
                variant="outline"
                className="w-full h-32 text-xl font-bold border-2 border-purple-300 hover:border-purple-400 text-purple-700 hover:text-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center gap-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <span>Upload Recording</span>
                  <span className="text-sm font-normal text-purple-600">Get instant AI feedback</span>
                </div>
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Mic className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700">27</div>
                <div className="text-sm font-medium text-green-600">Recordings Made</div>
                <div className="text-xs text-green-500 mt-1">+3 this week 🎉</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-700">12.5</div>
                <div className="text-sm font-medium text-blue-600">Hours Practiced</div>
                <div className="text-xs text-blue-500 mt-1">You're on fire! 🔥</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-purple-700">+15%</div>
                <div className="text-sm font-medium text-purple-600">Improvement</div>
                <div className="text-xs text-purple-500 mt-1">Amazing progress! ⭐</div>
              </CardContent>
            </Card>
          </div>

          {/* Confidence Score */}
          <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200">
            <CardContent className="flex flex-col md:flex-row items-center justify-between p-8">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Your Confidence is Soaring! 🚀
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                  You're becoming more confident with every practice session
                </p>
                <div className="flex items-center justify-center md:justify-start gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Clarity: Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Pace: Perfect</span>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <CircularProgress percentage={overallImprovement} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Your Recent Wins
              </CardTitle>
              <CardDescription>Check out your latest practice sessions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentActivity.map((activity) => (
                    <Card key={activity.id} className="hover:shadow-md transition-all duration-200 hover:scale-105">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">{activity.date}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {activity.duration}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-3xl font-bold text-blue-500">{activity.score}</div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(activity.score / 20) ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          "{activity.insight}"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Mic className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Ready for your first recording?</h3>
                  <p className="mt-1 text-sm text-gray-500">Let's get started and see what you can do!</p>
                </div>
              )}
              <div className="text-center mt-6">
                <Button variant="ghost" asChild className="group">
                  <Link href="/recordings">
                    View All Sessions{" "}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Your Amazing Journey</CardTitle>
              <CardDescription>Look how much you've improved over time!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-[250px]">
                <ChartContainer
                  config={{
                    score: {
                      label: "Confidence Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={3}
                        dot={{ r: 5, fill: "var(--color-score)" }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {keyMetrics.map((metric) => (
                  <div
                    key={metric.name}
                    className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg text-center hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-center mb-2">{metric.icon}</div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{metric.name}</p>
                    <p className="text-xl font-bold">{metric.value}</p>
                    <p
                      className={`text-xs font-medium ${
                        metric.change.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {metric.change}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          {/* Personalized Feedback */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-6 w-6 text-orange-500" />
                <span>Your Personal Coach</span>
              </CardTitle>
              <CardDescription>AI insights tailored just for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/70 rounded-lg border border-yellow-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  What's Working Great
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Your confidence has jumped 5% this week! You're speaking with much more energy and your storytelling
                  is captivating.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Keep doing what you're doing!
                </div>
              </div>

              <div className="p-4 bg-white/70 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Quick Win Opportunity
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Try pausing for 1-2 seconds between main points. This will make your ideas even clearer and give you
                  time to breathe.
                </p>
                <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Practice Pausing Exercise
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Practice Suggestions */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-purple-500" />
                <span>Fun Practice Ideas</span>
              </CardTitle>
              <CardDescription>Quick exercises to boost your confidence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-between bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                variant="outline"
              >
                <span>🎭 Tell a 2-minute story</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                variant="outline"
              >
                <span>🎯 Practice power poses</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                className="w-full justify-between bg-white hover:bg-purple-50 text-purple-700 border border-purple-200"
                variant="outline"
              >
                <span>🌟 Record a compliment</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Badges
              </CardTitle>
              <CardDescription>Celebrate every milestone!</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {achievements.map((ach) => (
                <div
                  key={ach.name}
                  className={`flex flex-col items-center text-center p-3 rounded-lg transition-all ${
                    ach.unlocked
                      ? "bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-700 shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  <div className={ach.unlocked ? "animate-bounce" : ""}>{ach.icon}</div>
                  <span className="text-xs mt-2 font-medium">{ach.name}</span>
                  {ach.unlocked && <div className="text-xs text-yellow-600 mt-1">Unlocked! 🎉</div>}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                Your Goals
              </CardTitle>
              <CardDescription>You're so close to achieving these!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.name}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-sm font-bold text-blue-500">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-3" />
                  <div className="text-xs text-gray-500 mt-1">
                    {goal.progress >= 80 ? "Almost there! 🔥" : "Keep going! 💪"}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


