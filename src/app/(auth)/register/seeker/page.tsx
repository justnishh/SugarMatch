"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { PhotoUploader } from "@/components/onboarding/PhotoUploader";
import { ProfilePreview } from "@/components/onboarding/ProfilePreview";
import { createClient } from "@/lib/supabase/client";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { toast } from "sonner";
import type { Gender } from "@/types/database";
import { MapPin } from "lucide-react";

const TOTAL_STEPS = 5;

export default function SeekerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { loading: detecting, detect } = useGeolocation();

  // Step 1: Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2: Personal info
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<Gender>("female");

  // Step 3: Contact & location
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  // Step 4: Bio & preferences
  const [bio, setBio] = useState("");
  const [supportPreferences, setSupportPreferences] = useState("");

  // Step 5: Photos
  const [photos, setPhotos] = useState<File[]>([]);

  function getAge(dateStr: string): number {
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return email.length > 0 && password.length >= 6;
      case 1:
        return fullName.length > 0 && dob.length > 0 && getAge(dob) >= 18;
      case 2:
        return city.length > 0 && country.length > 0;
      case 3:
        return bio.length > 0;
      case 4:
        return photos.length >= 2;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    if (step < TOTAL_STEPS - 1) {
      if (step === 1 && getAge(dob) < 18) {
        toast.error("You must be at least 18 years old");
        return;
      }
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      const userId = authData.user.id;

      // 2. Create profile
      const { error: profileError } = await supabase.from("users").insert({
        id: userId,
        role: "seeker",
        full_name: fullName,
        dob,
        gender,
        email,
        phone: phone || null,
        instagram: instagram || null,
        facebook_url: facebookUrl || null,
        bio,
        city,
        country,
        support_preferences: supportPreferences || null,
      });
      if (profileError) throw profileError;

      // 3. Upload photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("photos")
          .getPublicUrl(path);

        await supabase.from("photos").insert({
          user_id: userId,
          url: urlData.publicUrl,
          position: i + 1,
        });
      }

      toast.success("Welcome to SugarMatch!");
      router.push("/home");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)}>
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </button>
        ) : (
          <Link href="/register">
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </Link>
        )}
        <div className="flex-1">
          <StepIndicator totalSteps={TOTAL_STEPS} currentStep={step} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col"
        >
          {/* Step 0: Account */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Create your account</h2>
                <p className="text-muted-foreground text-sm">Your email and password</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
          )}

          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">About you</h2>
                <p className="text-muted-foreground text-sm">Tell us the basics</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-12"
                />
                {dob && getAge(dob) < 18 && (
                  <p className="text-sm text-destructive">Must be 18+</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["female", "male", "bisexual"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`h-12 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        gender === g
                          ? "border-rose-500 bg-rose-50 text-rose-600"
                          : "border-border hover:border-rose-200"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Contact & Location</h2>
                <p className="text-muted-foreground text-sm">How can matches reach you?</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram (optional)</Label>
                <Input
                  id="instagram"
                  placeholder="@username"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook URL (optional)</Label>
                <Input
                  id="facebook"
                  placeholder="facebook.com/yourprofile"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const loc = await detect();
                  if (loc) {
                    if (loc.city) setCity(loc.city);
                    if (loc.country) setCountry(loc.country);
                    toast.success(`Location detected: ${loc.city}, ${loc.country}`);
                  }
                }}
                disabled={detecting}
                className="w-full"
              >
                {detecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="w-4 h-4 mr-2" />
                )}
                Detect My Location
              </Button>
            </div>
          )}

          {/* Step 3: Bio & Preferences */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold mb-1">Your profile</h2>
                <p className="text-muted-foreground text-sm">Make a great first impression</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell potential matches about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 300))}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {bio.length}/300
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefs">What support are you looking for? (optional)</Label>
                <Textarea
                  id="prefs"
                  placeholder="Financial support, mentorship, travel..."
                  value={supportPreferences}
                  onChange={(e) => setSupportPreferences(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Photos + Preview */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Add your photos</h2>
                <p className="text-muted-foreground text-sm">Show your best side</p>
              </div>
              <PhotoUploader
                photos={photos}
                onAdd={(files) => setPhotos((prev) => [...prev, ...files])}
                onRemove={(i) => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
              />

              {photos.length >= 2 && (
                <ProfilePreview
                  name={fullName}
                  age={getAge(dob)}
                  city={city}
                  bio={bio}
                  photos={photos}
                  role="seeker"
                />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom button */}
      <div className="pt-6">
        <Button
          onClick={handleSubmit}
          disabled={!canProceed() || loading}
          className="w-full h-14 text-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : step === TOTAL_STEPS - 1 ? (
            "Create Profile"
          ) : (
            <>
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
