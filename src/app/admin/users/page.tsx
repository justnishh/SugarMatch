"use client";

import { useEffect, useState } from "react";
import { Search, BadgeCheck, Ban, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { UserProfile, Photo } from "@/types/database";

interface UserWithPhoto extends UserProfile {
  photo?: Photo;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithPhoto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      const userList = (data as UserProfile[]) || [];

      // Fetch first photo for each user
      const withPhotos: UserWithPhoto[] = [];
      for (const u of userList) {
        const { data: photos } = await supabase
          .from("photos")
          .select("*")
          .eq("user_id", u.id)
          .order("position")
          .limit(1);

        withPhotos.push({ ...u, photo: photos?.[0] as Photo | undefined });
      }

      setUsers(withPhotos);
      setLoading(false);
    }
    load();
  }, []);

  async function toggleActive(userId: string, isActive: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ is_active: !isActive })
      .eq("id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_active: !isActive } : u
      )
    );
    toast.success(isActive ? "User deactivated" : "User activated");
  }

  async function toggleVerified(userId: string, isVerified: boolean) {
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ is_verified: !isVerified })
      .eq("id", userId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_verified: !isVerified } : u
      )
    );
    toast.success(isVerified ? "Verification removed" : "User verified");
  }

  const filtered = users.filter(
    (u) =>
      (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.city || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Users</h2>
        <p className="text-muted-foreground">
          Manage all {users.length} users
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        {user.photo ? (
                          <AvatarImage src={user.photo.url} />
                        ) : null}
                        <AvatarFallback className="bg-rose-100 text-rose-600 text-sm">
                          {(user.full_name || "?").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm">
                            {user.full_name}
                          </span>
                          {user.is_verified && (
                            <BadgeCheck className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        user.role === "partner"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-rose-100 text-rose-700"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.city || "N/A"}, {user.country || "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.is_active ? "default" : "destructive"}
                      className={
                        user.is_active ? "bg-green-100 text-green-700" : ""
                      }
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleVerified(user.id, user.is_verified)
                        }
                        title={
                          user.is_verified
                            ? "Remove verification"
                            : "Verify user"
                        }
                      >
                        <BadgeCheck
                          className={`w-4 h-4 ${
                            user.is_verified
                              ? "text-blue-500"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleActive(user.id, user.is_active)
                        }
                        title={
                          user.is_active
                            ? "Deactivate user"
                            : "Activate user"
                        }
                      >
                        <Ban
                          className={`w-4 h-4 ${
                            !user.is_active
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
