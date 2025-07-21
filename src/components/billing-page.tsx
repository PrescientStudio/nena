"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { UserNav } from "@/components/user-nav"
import {
  CreditCard,
  ArrowLeft,
  Check,
  Star,
  Crown,
  Calendar,
  Download,
  AlertCircle,
  Sparkles,
  Mic,
  BrainCircuit,
} from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "",
    description: "Perfect for getting started with speech coaching",
    features: ["5 recordings per month", "Basic AI feedback", "Progress tracking", "Email support"],
    icon: <Mic className="h-6 w-6" />,
    color: "from-gray-500 to-gray-600",
    bgColor: "from-gray-50 to-gray-100",
    current: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "/month",
    description: "Advanced features for serious improvement",
    features: [
      "Unlimited recordings",
      "Advanced AI analysis",
      "Personalized coaching tips",
      "Progress analytics",
      "Priority support",
      "Custom exercises",
    ],
    icon: <Star className="h-6 w-6" />,
    color: "from-blue-500 to-purple-600",
    bgColor: "from-blue-50 to-purple-50",
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$49",
    period: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Premium",
      "Team management",
      "Advanced analytics",
      "Custom branding",
      "API access",
      "Dedicated support",
    ],
    icon: <Crown className="h-6 w-6" />,
    color: "from-purple-500 to-pink-600",
    bgColor: "from-purple-50 to-pink-50",
    current: false,
  },
]

const invoices = [
  {
    id: "INV-001",
    date: "2025-01-15",
    amount: "$19.00",
    status: "paid",
    plan: "Premium Monthly",
  },
  {
    id: "INV-002",
    date: "2024-12-15",
    amount: "$19.00",
    status: "paid",
    plan: "Premium Monthly",
  },
  {
    id: "INV-003",
    date: "2024-11-15",
    amount: "$19.00",
    status: "paid",
    plan: "Premium Monthly",
  },
]

export function BillingPage() {
  const { user, initialLoading } = useAuth()
  const [isChangingPlan, setIsChangingPlan] = useState(false)

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <CreditCard className="mx-auto h-12 w-12 animate-pulse text-blue-500" />
          <p className="mt-4 text-lg font-semibold">Loading billing information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
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
                Billing & Subscription
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your subscription and billing information</p>
            </div>
          </div>
          <UserNav />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Current Plan
                </CardTitle>
                <CardDescription>Your active subscription details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white">
                      <Star className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Premium</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    $19<span className="text-lg">/month</span>
                  </p>
                  <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Next billing date</span>
                    <span className="font-medium">Feb 15, 2025</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment method</span>
                    <span className="font-medium">•••• 4242</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Billing cycle</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full bg-transparent" variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Update Payment Method
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Change Billing Cycle
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5 text-green-500" />
                  This Month's Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recordings</span>
                    <span className="font-medium">27 / Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Analysis</span>
                    <span className="font-medium">27 / Unlimited</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Storage Used</span>
                    <span className="font-medium">2.1 GB / 10 GB</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    You're getting great value from your Premium plan!
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans and Billing History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Available Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Available Plans
                </CardTitle>
                <CardDescription>Choose the plan that best fits your needs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.name}
                      className={`relative p-6 rounded-lg border-2 transition-all ${
                        plan.current
                          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          Most Popular
                        </Badge>
                      )}
                      {plan.current && (
                        <Badge className="absolute -top-2 right-4 bg-green-500 text-white">Current Plan</Badge>
                      )}

                      <div className="text-center mb-4">
                        <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.bgColor} mb-3`}>
                          <div className={`text-transparent bg-gradient-to-r ${plan.color} bg-clip-text`}>
                            {plan.icon}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          <span className="text-gray-600">{plan.period}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className="w-full"
                        variant={plan.current ? "outline" : "default"}
                        disabled={plan.current || isChangingPlan}
                      >
                        {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Billing History
                  </CardTitle>
                  <CardDescription>Your recent invoices and payments</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg">
                          <CreditCard className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.plan}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()} • {invoice.id}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{invoice.amount}</div>
                          <Badge
                            variant="outline"
                            className={
                              invoice.status === "paid"
                                ? "text-green-600 border-green-200 bg-green-50"
                                : "text-yellow-600 border-yellow-200 bg-yellow-50"
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Important Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">Subscription Management</h4>
                  <p className="text-sm text-blue-700">
                    You can upgrade, downgrade, or cancel your subscription at any time. Changes will take effect at the
                    next billing cycle.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">Money-Back Guarantee</h4>
                  <p className="text-sm text-green-700">
                    Not satisfied? Get a full refund within 30 days of your purchase, no questions asked.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">Need Help?</h4>
                  <p className="text-sm text-purple-700">
                    Have questions about billing? Our support team is here to help. Contact us anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
