"use client"

import { useState } from "react"
import { ArrowRight, Zap, Trophy, Users, Star, Shield, Check, Play, ChevronDown, Sparkles } from "lucide-react"
import Layout from "./components/Layout"

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const features = [
    {
      icon: Trophy,
      title: "Compete & Win",
      description: "Join exciting competitions and win amazing prizes while showcasing your skills",
      color: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with thousands of creators, developers, and innovators worldwide",
      color: "text-[#22d3ee]",
      bg: "bg-[#22d3ee]/10",
    },
    {
      icon: Star,
      title: "Get Recognized",
      description: "Build your portfolio and get noticed by top companies and recruiters",
      color: "text-[#a78bfa]",
      bg: "bg-[#a78bfa]/10",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Fair judging, transparent rules, and secure payments guaranteed",
      color: "text-[#34d399]",
      bg: "bg-[#34d399]/10",
    },
  ]

  const stats = [
    { value: "10K+", label: "Active Users" },
    { value: "500+", label: "Competitions" },
    { value: "$2M+", label: "Prizes Awarded" },
    { value: "95%", label: "Satisfaction" },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Full Stack Developer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      content: "Zedidea helped me win my first hackathon and land a job at a top tech company!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "UI/UX Designer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      content: "The best platform for designers to showcase their skills and earn recognition.",
      rating: 5,
    },
    {
      name: "Elena Rodriguez",
      role: "AI Researcher",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      content: "Amazing community and challenging competitions that push you to innovate.",
      rating: 5,
    },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#6366f1] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e1e3f]/80 border border-[#2e2e5a] mb-8">
                <Sparkles className="w-4 h-4 text-[#22d3ee]" />
                <span className="text-[#c7d2fe] text-sm font-medium">Join the Future of Competition</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#f8fafc] mb-6 leading-tight">
                Where Ideas
                <br />
                <span className="text-gradient">Compete & Shine</span>
              </h1>

              <p className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mx-auto mb-10">
                Join thousands of creators, developers, and innovators competing in exciting challenges. Win prizes, build your portfolio, and get noticed.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  Start Competing Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 border border-[#2e2e5a] text-[#f8fafc] font-semibold rounded-xl hover:bg-[#1e1e3f] hover:border-[#3e3e7a] transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <p className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-1">{stat.value}</p>
                    <p className="text-[#94a3b8] text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-4">
                Why Choose <span className="text-gradient">Zedidea</span>?
              </h2>
              <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                Everything you need to compete, create, and succeed
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card rounded-2xl p-6 card-hover group"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#f8fafc] mb-2">{feature.title}</h3>
                  <p className="text-[#94a3b8]">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1a1a2e]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-4">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Create Account",
                  description: "Sign up for free and complete your profile",
                  icon: Users,
                },
                {
                  step: "02",
                  title: "Join Competition",
                  description: "Browse and enter exciting challenges",
                  icon: Trophy,
                },
                {
                  step: "03",
                  title: "Win & Grow",
                  description: "Earn prizes and build your reputation",
                  icon: Star,
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#6366f1] to-transparent" />
                  )}
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="text-5xl font-bold text-[#6366f1]/20 mb-4">{item.step}</div>
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#1e1e3f] flex items-center justify-center mb-4">
                      <item.icon className="w-8 h-8 text-[#6366f1]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#f8fafc] mb-2">{item.title}</h3>
                    <p className="text-[#94a3b8]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-4">
                Loved by <span className="text-gradient">Thousands</span>
              </h2>
              <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
                See what our community has to say
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="glass-card rounded-2xl p-6 card-hover">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-[#f59e0b] fill-[#f59e0b]" />
                    ))}
                  </div>
                  <p className="text-[#f8fafc] mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-[#f8fafc] font-semibold">{testimonial.name}</p>
                      <p className="text-[#94a3b8] text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#8b5cf6]/10" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-[#f8fafc] mb-4">
                  Ready to Start Competing?
                </h2>
                <p className="text-[#94a3b8] text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of creators and developers who are already competing and winning
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#6366f1]/30 hover:scale-105 transition-all duration-300">
                    Get Started Free
                  </button>
                  <button className="w-full sm:w-auto px-8 py-4 border border-[#2e2e5a] text-[#f8fafc] font-semibold rounded-xl hover:bg-[#1e1e3f] transition-all duration-300">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}