"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { Loader2, LogOut, Upload, Package, FileText, Clock, ChevronRight, User, Camera, Trash2 } from "lucide-react";
import Link from "next/link";

// Format date to readable string
function formatDate(date: Date | string | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// User Info Section with Avatar Upload
function UserInfoSection({ 
  user, 
  onAvatarUpdate 
}: { 
  user: { name: string; email: string; createdAt?: Date; image?: string | null };
  onAvatarUpdate: () => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      // Trigger session refresh to get updated user data
      onAvatarUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user.image) return;

    setIsRemoving(true);
    setError(null);

    try {
      const response = await fetch('/api/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove avatar');
      }

      onAvatarUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <section className="py-8 border-b border-border">
      <div className="flex items-start gap-6">
        {/* Avatar with Upload */}
        <div className="shrink-0 relative group">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-20 h-20 rounded-[12px] corner-squircle object-cover border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-[12px] corner-squircle bg-muted flex items-center justify-center border border-border">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          {/* Upload/Edit Overlay */}
          <div 
            className="absolute inset-0 rounded-[12px] corner-squircle bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>

          {/* Remove button (only if has image) */}
          {user.image && !isUploading && (
            <button
              onClick={handleRemoveAvatar}
              disabled={isRemoving}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-destructive text-white hover:bg-destructive/90 transition-colors shadow-sm"
              title="Remove avatar"
            >
              {isRemoving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{user.name}</h1>
          <p className="text-muted-foreground mt-0.5">{user.email}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Member since {formatDate(user.createdAt)}
          </p>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="shrink-0">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => signOut()}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </section>
  );
}

// Stats Overview Row
function StatsRow() {
  // TODO: Fetch actual stats from API
  const stats = [
    { label: "Active Orders", value: "0", icon: Package },
    { label: "Files Uploaded", value: "0", icon: FileText },
    { label: "Total Prints", value: "0", icon: Clock },
  ];

  return (
    <section className="py-8 border-b border-border">
      <div className="grid grid-cols-3 divide-x divide-border">
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 first:pl-0 last:pr-0">
            <div className="flex items-center gap-3">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Recent Orders Table
function RecentOrdersTable() {
  // TODO: Fetch actual orders from API
  const orders: { id: string; status: string; items: number; total: string; date: string }[] = [];

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
        <Link href="/orders" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="border border-border rounded-lg">
          <div className="px-6 py-12 text-center">
            <Package className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Upload a 3D file to get started with your first print
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Order ID</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Items</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Total</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{order.id}</td>
                  <td className="px-4 py-3 text-sm">{order.status}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{order.items}</td>
                  <td className="px-4 py-3 text-sm text-right">{order.total}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Recent Files Table
function RecentFilesTable() {
  // TODO: Fetch actual files from API
  const files: { id: string; name: string; status: string; dimensions: string; date: string }[] = [];

  return (
    <section className="py-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Files</h2>
        <Link href="/cart" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="border border-border rounded-lg">
          <div className="px-6 py-12 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No files uploaded</p>
            <p className="text-sm text-muted-foreground/80 mt-1 mb-4">
              Drop your STL, OBJ, or STEP files to get instant quotes
            </p>
            <Link href="/cart">
              <Button variant="primary" size="medium" className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">File Name</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Dimensions</th>
                <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">Uploaded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium truncate max-w-[200px]">{file.name}</td>
                  <td className="px-4 py-3 text-sm">{file.status}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{file.dimensions}</td>
                  <td className="px-4 py-3 text-sm text-right text-muted-foreground">{file.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// Quick Actions
function QuickActions() {
  const actions = [
    {
      label: "Upload New File",
      description: "Get an instant quote for your 3D model",
      href: "/cart",
      icon: Upload,
    },
    {
      label: "Browse Shop",
      description: "Explore our curated products",
      href: "/",
      icon: Package,
    },
  ];

  return (
    <section className="py-8 border-t border-border">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/20 transition-all"
          >
            <div className="p-2 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
              <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// Account Details Table
function AccountDetailsTable({ user }: { user: { name: string; email: string; emailVerified?: boolean; createdAt?: Date } }) {
  const details = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Email Verified", value: user.emailVerified ? "Yes" : "No" },
    { label: "Account Created", value: formatDate(user.createdAt) },
  ];

  return (
    <section className="py-8 border-t border-border">
      <h2 className="text-lg font-semibold mb-4">Account Details</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {details.map((detail) => (
              <tr key={detail.label}>
                <td className="px-4 py-3 text-sm text-muted-foreground w-1/3">{detail.label}</td>
                <td className="px-4 py-3 text-sm font-medium">{detail.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  if (!isPending && !session?.user) {
    router.push("/signin");
    return null;
  }

  if (isPending) {
    return (
      <main className="[&::-webkit-scrollbar]:hidden">
        <div className="max-w-5xl mx-auto">
          <Header />
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </main>
    );
  }

  const user = session?.user;

  if (!user) {
    return null;
  }

  // Force page reload to get fresh session data after avatar update
  const handleAvatarUpdate = () => {
    // Refetch session to get updated user data
    refetch();
  };

  return (
    <main className="[&::-webkit-scrollbar]:hidden">
      <div className="max-w-5xl mx-auto">
        <Header />
      </div>
      <div className="max-w-5xl mx-auto px-4">
        <UserInfoSection
          user={{
            name: user.name,
            email: user.email,
            createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
            image: user.image,
          }}
          onAvatarUpdate={handleAvatarUpdate}
        />

        <StatsRow />

        <RecentOrdersTable />

        <RecentFilesTable />

        <QuickActions />

        <AccountDetailsTable
          user={{
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
          }}
        />
      </div>
    </main>
  );
}
