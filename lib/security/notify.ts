import { db } from "@/lib/db";

export async function notifyAdmin(message: string) {
  await db.notification.create({
    data: {
      audience: "admin",
      title: "System Exception",
      body: message,
    },
  });
}

export async function notifyCustomer(userId: string, title: string, body: string) {
  await db.notification.create({
    data: { userId, audience: "customer", title, body },
  });
}
