"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { toast } from "sonner";
import type { UserProfile, Photo, ConditionTag } from "@/types/database";

const CONDITION_OPTIONS: ConditionTag[] = [
  "Companionship",
  "Travel Partner",
  "Loyalty",
  "Discretion",
  "Exclusivity",
];

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [supportPreferences, setSupportPreferences] = useState("");
  const [conditions, setConditions] = useState<ConditionTag[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const { detecting, detect } = useGeolocation();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      const { data: pics } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", authUser.id)
        .order("position");

      const u = profile as UserProfile;
      setUser(u);
      setPhotos((pics as Photo[]) || []);
      setFullName(u.full_name);
      setBio(u.bio);
      setCity(u.city);
      setCountry(u.country);
      setInstagram(u.instagram || "");
      setPhone(u.phone || "");
      setSupportPreferences(u.support_preferences || "");
      setConditions((u.conditions as ConditionTag[]) || []);
      setBudgetMin(u.budget_min?.toString() || "");
      setBudgetMax(u.budget_max?.toString() || "");
      setLatitude(u.latitude ?? null);
      setLongitude(u.longitude ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    if (!user) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName,
        bio,
        city,
        country,
        latitude,
        longitude,
        instagram: instagram || null,
        phone: phone || null,
        support_preferences: supportPreferences || null,
        conditions,
        budget_min: budgetMin ? Math.max(0, parseInt(budgetMin, 10) || 0) : null,
        budget_max: budgetMax ? Math.max(0, parseInt(budgetMax, 10) || 0) : null,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
      router.push("/profile");
    }
  }

  async function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user || !e.target.files?.[0]) return;
    if (photos.length >= 6) {
      toast.error("Max 6 photos");
      return;
    }

    const file = e.target.files[0];
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("photos")
      .getPublicUrl(path);

    const { data: newPhoto, error: insertError } = await supabase
      .from("photos")
      .insert({
        user_id: user.id,
        url: urlData.publicUrl,
        position: photos.length + 1,
      })
      .select()
      .single();

    if (insertError) {
      toast.error(insertError.message);
    } else if (newPhoto) {
      setPhotos([...photos, newPhoto as Photo]);
      toast.success("Photo added!");
    }
  }

  async function handleDeletePhoto(photo: Photo) {
    if (!user) return;
    if (photos.length <= 2) {
      toast.error("You need at least 2 photos");
      return;
    }

    const supabase = createClient();

    // Delete from storage first (so we don't lose the reference if DB delete succeeds but storage fails)
    const storagePath = photo.url.split("/photos/")[1];
    if (storagePath) {
      await supabase.storage.from("photos").remove([storagePath]);
    }

    // Delete from DB with ownership check
    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete photo");
      return;
    }

    setPhotos(photos.filter((p) => p.id !== photo.id));
    toast.success("Photo removed");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <Label>Photos</Label>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeletePhoto(photo)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {photos.length < 6 && (
            <label className="aspect-square rounded-xl border-2 border-dashed border-rose-200 flex items-center justify-center cursor-pointer hover:border-rose-400 transition-all">
              <Plus className="w-8 h-8 text-rose-400" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAddPhoto}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 300))}
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {bio.length}/300
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-rose-200 text-rose-600"
          disabled={detecting}
          onClick={async () => {
            const result = await detect();
            if (result) {
              setCity(result.city);
              setCountry(result.country);
              setLatitude(result.latitude);
              setLongitude(result.longitude);
              toast.success("Location updated!");
            } else {
              toast.error("Could not detect location.");
            }
          }}
        >
          {detecting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          {detecting ? "Detecting..." : "Detect my location"}
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>City</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Instagram</Label>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="h-12"
          />
        </div>

        {user.role === "seeker" && (
          <div className="space-y-2">
            <Label>What support are you looking for?</Label>
            <Textarea
              value={supportPreferences}
              onChange={(e) => setSupportPreferences(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        )}

        {user.role === "partner" && (
          <>
            <div className="space-y-3">
              <Label>Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {CONDITION_OPTIONS.map((c) => (
                  <Badge
                    key={c}
                    variant={conditions.includes(c) ? "default" : "outline"}
                    className={`cursor-pointer text-sm py-2 px-4 transition-all ${
                      conditions.includes(c)
                        ? "bg-purple-500 hover:bg-purple-600"
                        : "hover:border-purple-300"
                    }`}
                    onClick={() =>
                      setConditions((prev) =>
                        prev.includes(c)
                          ? prev.filter((x) => x !== c)
                          : [...prev, c]
                      )
                    }
                  >
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Budget Min</Label>
                <Input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Budget Max</Label>
                <Input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-14 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
      </Button>
    </div>
  );
}
