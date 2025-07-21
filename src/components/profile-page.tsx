"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import { UserNav } from "@/components/user-nav"
import {
  User,
  Camera,
  Save,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Star,
  Trophy,
  Target,
  Mic,
  Upload,
  Edit3,
} from "lucide-react"

export function ProfilePage() {
  const { user, updateUserProfile, initialLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: "",
    goals: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateUserProfile({
        displayName: formData.displayName,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 animate-pulse text-blue-500" />
          <p className="mt-4 text-lg font-semibold">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your account and preferences</p>
            </div>
          </div>
          <UserNav />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200">
              <CardHeader className="text-center">
                <div className="relative mx-auto">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                    <AvatarFallback className="text-2xl">{getInitials(user?.displayName)}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white shadow-md"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{user?.displayName}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{user?.email}</p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span className="capitalize text-green-600 font-medium">{user?.role} Member</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Mic className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-blue-700">27</div>
                    <div className="text-xs text-blue-600">Recordings</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <Trophy className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                    <div className="text-2xl font-bold text-purple-700">4</div>
                    <div className="text-xs text-purple-600">Badges</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Member since</div>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={isEditing ? formData.displayName : user?.displayName || ""}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input id="email" value={user?.email || ""} disabled className="bg-gray-50 pr-10" />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your speaking goals..."
                    value={
                      isEditing
                        ? formData.bio
                        : "Passionate about improving my communication skills and building confidence through practice."
                    }
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goals">Speaking Goals</Label>
                  <Textarea
                    id="goals"
                    placeholder="What do you want to achieve with your speaking practice?"
                    value={
                      isEditing
                        ? formData.goals
                        : "Improve confidence in public speaking, reduce filler words, and develop a more engaging presentation style."
                    }
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    rows={3}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Account Status
                </CardTitle>
                <CardDescription>Your account verification and security status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-green-800">Email Verified</div>
                      <div className="text-sm text-green-600">Your email address has been verified</div>
                    </div>
                  </div>
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-blue-800">Account Active</div>
                      <div className="text-sm text-blue-600">Your {user?.role} membership is active</div>
                    </div>
                  </div>
                  <Star className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest achievements and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <Mic className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">3</div>
                    <div className="text-sm text-green-600">Recordings this week</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">85%</div>
                    <div className="text-sm text-blue-600">Average confidence</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <Trophy className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">2</div>
                    <div className="text-sm text-purple-600">New badges earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
