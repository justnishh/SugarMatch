"use client";

import { useEffect, useState } from "react";
import { Search, BadgeCheck, Ban, Trash2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile, Photo } from "@/types/database";

interface UserWithPhoto extends UserProfile {
  photo?: Photo;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithPhoto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithPhoto | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    await supabase
      .from("users")
      .update({ is_active: !isActive })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_active: !isActive } : u
      )
    );
    toast.success(isActive ? "User deactivated" : "User activated");
  }

  async function toggleVerified(userId: string, isVerified: boolean) {
    const supabase = createClient();
    await supabase
      .from("users")
      .update({ is_verified: !isVerified })
      .eq("id", userId);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_verified: !isVerified } : u
      )
    );
    toast.success(isVerified ? "Verification removed" : "User verified");
  }

  async function deleteUser(userId: string) {
    const supabase = createClient();
    await supabase.from("users").delete().eq("id", userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setDeleteConfirm(null);
    toast.success("User deleted");
  }

  async function viewUserDetails(user: UserWithPhoto) {
    setSelectedUser(user);
  }

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.city.toLowerCase().includes(search.toLowerCase())
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
                          {user.full_name.charAt(0)}
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
                    {user.city}, {user.country}
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                        title="View details"
                      >
                        <span className="text-xs font-medium px-1">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(user.id)}
                        title="Delete user"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">User Details</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                    ✕
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {selectedUser.photo ? (
                      <AvatarImage src={selectedUser.photo.url} />
                    ) : null}
                    <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
                      {selectedUser.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{selectedUser.full_name}</span>
                      {selectedUser.is_verified && (
                        <BadgeCheck className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Status</p>
                    <p className="font-medium">{selectedUser.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Location</p>
                    <p className="font-medium">{selectedUser.city}, {selectedUser.country}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Gender</p>
                    <p className="font-medium capitalize">{selectedUser.gender}</p>
                  </div>
                </div>

                {selectedUser.bio && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Bio</p>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleActive(selectedUser.id, selectedUser.is_active);
                      setSelectedUser(null);
                    }}
                  >
                    {selectedUser.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      toggleVerified(selectedUser.id, selectedUser.is_verified);
                      setSelectedUser(null);
                    }}
                  >
                    {selectedUser.is_verified ? "Remove Verify" : "Verify"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setDeleteConfirm(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Delete User?</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm mb-6">
                This will permanently delete the user and all associated data including photos, 
                messages, and matches.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => deleteUser(deleteConfirm)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
