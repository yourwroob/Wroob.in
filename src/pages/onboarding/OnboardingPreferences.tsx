import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const JOB_SEARCH_OPTIONS = [
  { value: "ready", label: "Ready to interview", desc: "You're actively looking for new work and ready to interview. Your job profile will be visible by startups." },
  { value: "open", label: "Open to offers", desc: "You're not looking but open to hear about new opportunities. Your job profile will be visible to startups." },
  { value: "closed", label: "Closed to offers", desc: "You're not looking and don't want to hear about new opportunities. Your job profile will be hidden from startups." },
];

const JOB_TYPES = ["Full-time Employee", "Contractor", "Intern", "Co-founder"];
const ROLE_CATEGORIES = ["Engineering", "Design", "Product", "Marketing", "Sales", "Data Science", "Operations", "Finance", "HR", "Other"];
const CURRENCIES = ["United States Dollars ($)", "Euro (€)", "British Pound (£)", "Indian Rupee (₹)"];
const CURRENCY_MAP: Record<string, string> = { "United States Dollars ($)": "USD", "Euro (€)": "EUR", "British Pound (£)": "GBP", "Indian Rupee (₹)": "INR" };

const COMPANY_SIZES = [
  "Seed (1 - 10 employees)",
  "Early (11 - 50 employees)",
  "Mid-size (51 - 200 employees)",
  "Large (201 - 500 employees)",
  "Very Large (501 - 1000 employees)",
  "Massive (1001+ employees)",
];

const OnboardingPreferences = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep } = useOnboardingStatus();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    job_search_status: "",
    job_types: [] as string[],
    desired_salary: "",
    currency: "United States Dollars ($)",
    preferred_roles: [] as string[],
    preferred_locations: [] as string[],
    location_input: "",
    remote_ok: false,
    us_authorized: null as boolean | null,
    needs_sponsorship: null as boolean | null,
    company_size_preferences: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_preferences" as any)
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }: any) => {
        if (data) {
          const currLabel = Object.entries(CURRENCY_MAP).find(([, v]) => v === data.currency)?.[0] || "United States Dollars ($)";
          setForm((f) => ({
            ...f,
            job_search_status: data.job_search_status || "",
            job_types: data.job_types || [],
            desired_salary: data.desired_salary?.toString() || "",
            currency: currLabel,
            preferred_roles: data.preferred_roles || [],
            preferred_locations: data.preferred_locations || [],
            remote_ok: data.remote_ok || false,
            us_authorized: data.us_authorized,
            needs_sponsorship: data.needs_sponsorship,
            company_size_preferences: data.company_size_preferences || {},
          }));
        }
      });
  }, [user]);

  const toggleJobType = (type: string) => {
    setForm((f) => ({
      ...f,
      job_types: f.job_types.includes(type)
        ? f.job_types.filter((t) => t !== type)
        : [type], // only one for now
    }));
  };

  const toggleRole = (role: string) => {
    setForm((f) => ({
      ...f,
      preferred_roles: f.preferred_roles.includes(role)
        ? f.preferred_roles.filter((r) => r !== role)
        : [...f.preferred_roles, role],
    }));
  };

  const addLocation = () => {
    if (form.location_input.trim() && !form.preferred_locations.includes(form.location_input.trim())) {
      setForm((f) => ({
        ...f,
        preferred_locations: [...f.preferred_locations, f.location_input.trim()],
        location_input: "",
      }));
    }
  };

  const setSizePreference = (size: string, value: string) => {
    setForm((f) => ({
      ...f,
      company_size_preferences: { ...f.company_size_preferences, [size]: value },
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.job_search_status) {
      toast({ title: "Please select your job search status", variant: "destructive" });
      return;
    }

    setLoading(true);
    const payload = {
      user_id: user.id,
      job_search_status: form.job_search_status,
      job_types: form.job_types,
      desired_salary: form.desired_salary ? parseFloat(form.desired_salary) : null,
      currency: CURRENCY_MAP[form.currency] || "USD",
      preferred_roles: form.preferred_roles,
      preferred_locations: form.preferred_locations,
      remote_ok: form.remote_ok,
      us_authorized: form.us_authorized,
      needs_sponsorship: form.needs_sponsorship,
      company_size_preferences: form.company_size_preferences,
    };

    const { error } = await supabase
      .from("student_preferences" as any)
      .upsert(payload as any, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await updateStep(3);
      navigate("/onboarding/culture");
    }
    setLoading(false);
  };

  return (
    <OnboardingLayout
      currentStep={2}
      title="Set your job search preferences"
      subtitle="Your answers determine which jobs we recommend for you and which startups see your profile."
    >
      <Card>
        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Job search status */}
          <div className="space-y-3">
            <Label className="font-semibold">
              <span className="text-primary mr-1">*</span>Where are you in your job search?
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              {JOB_SEARCH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, job_search_status: opt.value }))}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-all",
                    form.job_search_status === opt.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2",
                      form.job_search_status === opt.value ? "border-primary bg-primary" : "border-muted-foreground/40"
                    )} />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Job type */}
          <div className="space-y-3">
            <Label className="font-semibold">
              <span className="text-primary mr-1">*</span>What type of job are you interested in?
            </Label>
            <p className="text-xs text-muted-foreground">Choose just one for now. You can change this later</p>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleJobType(type)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium border transition-all",
                    form.job_types.includes(type)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-muted-foreground/40"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label className="font-semibold">What is your desired salary?</Label>
            <p className="text-xs text-muted-foreground">This information will <strong>never be shown</strong> on your public profile</p>
            <div className="flex gap-3 max-w-sm">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  className="pl-7"
                  type="number"
                  value={form.desired_salary}
                  onChange={(e) => setForm((f) => ({ ...f, desired_salary: e.target.value }))}
                />
              </div>
              <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Role category */}
          <div className="space-y-3">
            <Label className="font-semibold">
              <span className="text-primary mr-1">*</span>What kind of role are you looking for?
            </Label>
            <p className="text-xs text-muted-foreground">Tip: You can select more than one</p>
            <div className="flex flex-wrap gap-2">
              {form.preferred_roles.map((r) => (
                <Badge key={r} className="gap-1 bg-primary text-primary-foreground">
                  {r} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleRole(r)} />
                </Badge>
              ))}
            </div>
            <Select onValueChange={(v) => toggleRole(v)}>
              <SelectTrigger className="w-full sm:w-60">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_CATEGORIES.filter((r) => !form.preferred_roles.includes(r)).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Locations */}
          <div className="space-y-3">
            <Label className="font-semibold">
              <span className="text-primary mr-1">*</span>What locations do you want to work in?
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.preferred_locations.map((loc) => (
                <Badge key={loc} className="gap-1 bg-primary text-primary-foreground">
                  {loc}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setForm((f) => ({ ...f, preferred_locations: f.preferred_locations.filter((l) => l !== loc) }))} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                placeholder="Search for a location"
                value={form.location_input}
                onChange={(e) => setForm((f) => ({ ...f, location_input: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remote-ok"
                checked={form.remote_ok}
                onCheckedChange={(v) => setForm((f) => ({ ...f, remote_ok: !!v }))}
              />
              <Label htmlFor="remote-ok" className="text-sm">I'm open to working remotely</Label>
            </div>
          </div>

          {/* US Auth */}
          <div className="rounded-lg border p-5 space-y-4">
            <h3 className="font-semibold text-primary flex items-center gap-2">
              <span className="text-primary mr-1">*</span>US work authorization 🇺🇸
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Are you legally authorized to work in the United States?</span>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, us_authorized: val }))}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-all",
                        form.us_authorized === val ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-right">
                <span className="text-sm text-left">Do you or will you require sponsorship for a US employment visa (e.g. H-1B)?</span>
                <div className="flex gap-4">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, needs_sponsorship: val }))}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-all",
                        form.needs_sponsorship === val ? "border-primary bg-primary" : "border-muted-foreground/40"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-8 text-xs text-muted-foreground -mt-2">
                <span>Yes</span><span>No</span>
              </div>
            </div>
          </div>

          {/* Company size */}
          <div className="space-y-3">
            <Label className="font-semibold">Would you like to work at companies of these sizes?</Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-4 border-b bg-muted/30 py-2 px-4 text-sm font-medium">
                <span></span>
                <span className="text-center">Ideal</span>
                <span className="text-center">Yes</span>
                <span className="text-center">No</span>
              </div>
              {COMPANY_SIZES.map((size) => (
                <div key={size} className="grid grid-cols-4 border-b last:border-0 py-3 px-4 items-center">
                  <span className="text-sm">{size}</span>
                  {["ideal", "yes", "no"].map((val) => (
                    <div key={val} className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setSizePreference(size, val)}
                        className={cn(
                          "h-5 w-5 rounded-full border-2 transition-all",
                          form.company_size_preferences[size] === val ? "border-primary bg-primary" : "border-muted-foreground/30"
                        )}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
          className="rounded-full h-12 px-10 brand-gradient border-0 text-white shadow-lg shadow-primary/20"
        >
          {loading ? "Saving..." : "Save and continue"}
        </Button>
      </div>
    </OnboardingLayout>
  );
};

export default OnboardingPreferences;
