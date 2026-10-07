export interface SeekerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  date: string;
  status: "Pending Review" | "Approved" | "Initiated";
  experience: string;
  location?: string;
  motivation?: string;
}

export const API_URL = (import.meta.env["VITE_API_URL"] as string) || "http://localhost:5000";

export async function fetchAllUsers(): Promise<SeekerItem[]> {
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        return data.users
          .filter((u: any) => String(u.role).toLowerCase() !== "admin")
          .map((u: any) => ({
            id: u.id,
            name: u.full_name || "Unknown",
            email: u.email,
            phone: "N/A",
            program: "Platform User",
            date: new Date(u.created_at).toLocaleDateString(),
            status: "Approved",
            experience: "N/A",
            location: "N/A",
          }));
      }
    }
  } catch (err) {
    console.error("Failed to fetch users", err);
  }
  return [];
}

export async function deleteUserApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
    });
    
    if (res.ok) {
        return true;
    } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
    }
  } catch (e) {
    console.error("Delete user error", e);
    throw e;
  }
}
