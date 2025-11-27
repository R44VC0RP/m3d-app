"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { User, UploadedFile, CartItem } from "@/db/schema";

interface FileWithUser extends UploadedFile {
  user: { name: string; email: string } | null;
}

interface OrderWithDetails extends CartItem {
  uploadedFile: UploadedFile;
  user: { name: string; email: string } | null;
}

interface AdminDashboardProps {
  users: User[];
  files: FileWithUser[];
  orders: OrderWithDetails[];
}

export function AdminDashboard({ users, files, orders }: AdminDashboardProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
            <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.emailVerified ? "default" : "secondary"}>
                        {u.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mass (g)</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {f.fileName}
                    </TableCell>
                    <TableCell>{f.user?.email || "Guest"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          f.status === "success"
                            ? "default"
                            : f.status === "error"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {f.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{f.massGrams?.toFixed(1) || "-"}</TableCell>
                    <TableCell>
                      {f.dimensions
                        ? `${f.dimensions.x.toFixed(0)}×${f.dimensions.y.toFixed(0)}×${f.dimensions.z.toFixed(0)}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(f.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {o.uploadedFile.fileName}
                    </TableCell>
                    <TableCell>{o.user?.email || "Guest"}</TableCell>
                    <TableCell>{o.material}</TableCell>
                    <TableCell>{o.color}</TableCell>
                    <TableCell>{o.quantity}</TableCell>
                    <TableCell>
                      {o.unitPrice ? `$${(o.unitPrice / 100).toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

