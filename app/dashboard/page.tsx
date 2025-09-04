"use client";


import BackgroundMask from "@/components/BackgroundMask";
import ScrollButton from "@/components/ScrollButton";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";

// Dashboard Stats Component
function DashboardStats() {
  return (
    <section className="py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Orders</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-white">$247.99</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Files Uploaded</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completed Orders</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Recent Orders Component
function RecentOrders() {
  return (
    <section className="py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">Recent Orders</h2>
        <Button variant="link" size="medium">
          View All Orders
        </Button>
      </div>

      <div className="space-y-4">
        {[
          { id: "ORD-001", item: "Custom Phone Case", status: "Processing", date: "2024-01-15", amount: "$29.99" },
          { id: "ORD-002", item: "Mechanical Keyboard Kit", status: "Shipped", date: "2024-01-12", amount: "$79.99" },
          { id: "ORD-003", item: "Desktop Organizer", status: "Delivered", date: "2024-01-08", amount: "$34.99" },
        ].map((order) => (
          <div key={order.id} className="p-6 bg-white/5 backdrop-blur-sm border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-semibold text-white">{order.item}</p>
                    <p className="text-sm text-gray-400">Order #{order.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="text-white">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Amount</p>
                  <p className="text-white font-semibold">{order.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-500/20 text-green-400' :
                    order.status === 'Shipped' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-orange-500/20 text-orange-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Quick Actions Component
function QuickActions() {
  return (
    <section className="py-16">
      <h2 className="text-3xl font-bold text-white mb-8">Quick Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Upload New File</h3>
            <p className="text-gray-400 text-sm">Upload STL files for 3D printing</p>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Quote</h3>
            <p className="text-gray-400 text-sm">Get a custom quote for your project</p>
          </div>
        </div>

        <div className="p-6 bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-lg">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Browse Products</h3>
            <p className="text-gray-400 text-sm">Explore our product catalog</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { isSignedIn, user, isLoaded } = useUser();

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </main>
    );
  }

  // Redirect to home if not signed in
  if (!isSignedIn) {
    redirect('/');
  }

  return (
    <main className="[&::-webkit-scrollbar]:hidden">
      <div className="absolute inset-0 -z-10">
        <BackgroundMask />
      </div>
      <div className="max-w-5xl mx-auto">
        <Header />
        
        {/* Welcome Section */}
        <section className="py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Manage your orders, files, and projects all in one place.
          </p>
        </section>

        <DashboardStats />
        <RecentOrders />
        <QuickActions />
      </div>
      <ScrollButton />
    </main>
  );
}
