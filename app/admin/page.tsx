import { db } from "@/db";
import { user, uploadedFile, cartItem } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { AdminDashboard } from "./client";

export default async function AdminPage() {
  // Fetch users
  const users = await db.select().from(user).orderBy(desc(user.createdAt));

  // Fetch files with user details
  const filesData = await db
    .select({
      file: uploadedFile,
      user: {
        name: user.name,
        email: user.email,
      }
    })
    .from(uploadedFile)
    .leftJoin(user, eq(uploadedFile.userId, user.id))
    .orderBy(desc(uploadedFile.createdAt));

  // Transform files data to match component interface
  const formattedFiles = filesData.map(({ file, user }) => ({
    ...file,
    user
  }));

  // Fetch cart items (orders) with file and user details
  const ordersData = await db
    .select({
      item: cartItem,
      file: uploadedFile,
      user: {
        name: user.name,
        email: user.email,
      }
    })
    .from(cartItem)
    .innerJoin(uploadedFile, eq(cartItem.uploadedFileId, uploadedFile.id))
    .leftJoin(user, eq(cartItem.userId, user.id))
    .orderBy(desc(cartItem.createdAt));

  // Transform orders data
  const formattedOrders = ordersData.map(({ item, file, user }) => ({
    ...item,
    uploadedFile: file,
    user
  }));

  return (
    <AdminDashboard 
      users={users} 
      files={formattedFiles} 
      orders={formattedOrders} 
    />
  );
}

