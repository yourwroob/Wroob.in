import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TECHNOLOGIES = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "Go", "Rust", "Ruby",
  "React", "Vue", "Angular", "Node.js", "Django", "Flask", "Spring",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "PostgreSQL", "MongoDB",
  "GraphQL", "REST", "Machine Learning", "Data Engineering", "iOS", "Android",
];

const MOTIVATION_OPTIONS = ["Solving technical problems", "Building products"];
const CAREER_TRACK_OPTIONS = ["Individual contributor", "Manager"];
const ENVIRONMENT_OPTIONS = [
  "Clear role and set of responsibilities. Consistent feedback from management.",
  "Employees wear a lot of hats. Assignments often require employees to \"figure it out\" on their own.",
];
const JOB_PRIORITIES = [
  "Having a say in what I work on and how I work",
  "Opportunities to progress within the company",
  "Team members I can learn from",
  "A company with a good growth trajectory",
  "Having a say in the company's and/or my team's direction",
  "Mentorship opportunities",
  "Learn new things and develop my skills",
  "Challenging problems to work on",
  "A diverse team",
];
const IMPORTANCE_OPTIONS = ["Very important", "Important", "Not important"];

const OnboardingCulture = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateStep } = useOnboardingStatus();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    tech_interests: [] as string[],
    tech_avoid: [] as string[],
    motivation_type: "",
    career_track: "",
    environment_preference: "",
    job_priorities: [] as string[],
    remote_importance: "",
    quiet_importance: "",
    job_description_text: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_culture" as any)
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }: any) => {
        if (data) {
          setForm((f) => ({
            ...f,
            tech_interests: data.tech_interests || [],
            tech_avoid: data.tech_avoid || [],
            motivation_type: data.motivation_type || "",
            career_track: data.career_track || "",
            environment_preference: data.environment_preference || "",
            job_priorities: data.job_priorities || [],
            remote_importance: data.remote_importance || "",
            quiet_importance: data.quiet_importance || "",
            job_description_text: data.job_description_text || "",
          }));
        }
      });
  }, [user]);

  const toggleTech = (field: "tech_interests" | "tech_avoid", tech: string) => {
    setForm((f) => {
      const arr = f[field];
      if (arr.includes(tech)) return { ...f, [field]: arr.filter((t) => t !== tech) };
      if (arr.length >= 5) return f;
      return { ...f, [field]: [...arr, tech] };
    });
  };

  const togglePriority = (p: string) => {
    setForm((f) => {
      if (f.job_priorities.includes(p)) return { ...f, job_priorities: f.job_priorities.filter((x) => x !== p) };
      if (f.job_priorities.length >= 2) return f;
      return { ...f, job_priorities: [...f.job_priorities, p] };
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.job_description_text.trim()) {
      toast({ title: "Please describe what you're looking for", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from("student_culture" as any)
      .upsert({
        user_id: user.id,
        ...form,
      } as any, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      await updateStep(4);
      navigate("/onboarding/resume");
    }
    setLoading(false);
  };

  return (
    <OnboardingLayout
      currentStep={3}
      title="Find your culture fit"
      subtitle="Tell us about your interests and preferences and we'll find you the perfect startup jobs."
    >
      <Card>
        <CardContent className="space-y-8 p-6 sm:p-8">
          {/* Tech interests */}
          <div className="space-y-3">
            <Label className="font-semibold">
              Which technologies are you <strong className="underline">most</strong> interested in working with?
            </Label>
            <Select onValueChange={(v) => toggleTech("tech_interests", v)}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select up to 5 technologies" />
              </SelectTrigger>
              <SelectContent>
                {TECHNOLOGIES.filter((t) => !form.tech_interests.includes(t)).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {form.tech_interests.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTech("tech_interests", t)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Tech avoid */}
          <div className="space-y-3">
            <Label className="font-semibold">
              Which technologies are you <strong className="underline">not</strong> willing to work with?
            </Label>
            <Select onValueChange={(v) => toggleTech("tech_avoid", v)}>
              <SelectTrigger className="w-full sm:w-72">
                <SelectValue placeholder="Select up to 5 technologies" />
              </SelectTrigger>
              <SelectContent>
                {TECHNOLOGIES.filter((t) => !form.tech_avoid.includes(t)).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {form.tech_avoid.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleTech("tech_avoid", t)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Motivation */}
          <div className="space-y-3">
            <Label className="font-semibold">What motivates you more?</Label>
            <div className="flex flex-wrap gap-2">
              {MOTIVATION_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, motivation_type: opt }))}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm border transition-all",
                    form.motivation_type === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-4 w-4 rounded-full border-2", form.motivation_type === opt ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Career track */}
          <div className="space-y-3">
            <Label className="font-semibold">Over the next five years, what career track do you want to follow?</Label>
            <div className="flex flex-wrap gap-2">
              {CAREER_TRACK_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, career_track: opt }))}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm border transition-all",
                    form.career_track === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-4 w-4 rounded-full border-2", form.career_track === opt ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Environment */}
          <div className="space-y-3">
            <Label className="font-semibold">What environment do you work better in?</Label>
            <div className="space-y-2">
              {ENVIRONMENT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, environment_preference: opt }))}
                  className={cn(
                    "w-full rounded-lg px-4 py-3 text-sm text-left border transition-all",
                    form.environment_preference === opt
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <span className="flex items-start gap-2">
                    <span className={cn("mt-0.5 h-4 w-4 rounded-full border-2 shrink-0", form.environment_preference === opt ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Job priorities */}
          <div className="space-y-3">
            <Label className="font-semibold">What's most important to you in your next job? (Max 2)</Label>
            <div className="flex flex-wrap gap-2">
              {JOB_PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePriority(p)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm border transition-all",
                    form.job_priorities.includes(p)
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/40",
                    !form.job_priorities.includes(p) && form.job_priorities.length >= 2 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-4 w-4 rounded-full border-2", form.job_priorities.includes(p) ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {p}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Remote importance */}
          <div className="space-y-3">
            <Label className="font-semibold">How important is it that your next job has a flexible remote work policy?</Label>
            <div className="flex flex-wrap gap-2">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, remote_importance: opt }))}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm border transition-all",
                    form.remote_importance === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-4 w-4 rounded-full border-2", form.remote_importance === opt ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quiet office importance */}
          <div className="space-y-3">
            <Label className="font-semibold">How important is it that you work in a quiet office?</Label>
            <div className="flex flex-wrap gap-2">
              {IMPORTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, quiet_importance: opt }))}
                  className={cn(
                    "rounded-full px-5 py-2.5 text-sm border transition-all",
                    form.quiet_importance === opt
                      ? "border-primary bg-primary/5 font-medium"
                      : "border-border hover:border-muted-foreground/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-4 w-4 rounded-full border-2", form.quiet_importance === opt ? "border-primary bg-primary" : "border-muted-foreground/40")} />
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="font-semibold">
              <span className="text-primary mr-1">*</span>Describe what you are looking for in your next job
            </Label>
            <p className="text-xs text-muted-foreground">Startups tell us this is one of the first things they look at in a profile</p>
            <p className="text-xs text-muted-foreground">{form.job_description_text.length} / 300</p>
            <Textarea
              placeholder="e.g., I'm looking for a great, enthusiastic engineering team to work for that will provide me with challenging, interesting work that I can learn from and contribute to."
              value={form.job_description_text}
              onChange={(e) => {
                if (e.target.value.length <= 300) {
                  setForm((f) => ({ ...f, job_description_text: e.target.value }));
                }
              }}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-2">
        <p className="text-sm">
          <span className="text-green-600 font-medium">✔ You're almost done!</span>{" "}
          <span className="text-primary">Complete profile and start searching for your dream job.</span>
        </p>
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

export default OnboardingCulture;
