import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const STEP_ROUTES = [
  "/onboarding/profile",
  "/onboarding/preferences",
  "/onboarding/culture",
  "/onboarding/resume",
  "/onboarding/done",
];

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const [onboardingCheck, setOnboardingCheck] = useState<"loading" | "needs" | "done">("loading");
  const [onboardingRoute, setOnboardingRoute] = useState("/onboarding/profile");

  useEffect(() => {
    if (loading || !user || role !== "student") {
      if (!loading) setOnboardingCheck("done");
      return;
    }

    supabase
      .from("student_profiles")
      .select("onboarding_status, onboarding_step")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        const d = data as any;
        if (d && d.onboarding_status !== "completed") {
          const step = Math.min(Math.max((d.onboarding_step || 1) - 1, 0), 4);
          setOnboardingRoute(STEP_ROUTES[step]);
          setOnboardingCheck("needs");
        } else {
          setOnboardingCheck("done");
        }
      });
  }, [user, role, loading]);

  if (loading || onboardingCheck === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect students who haven't completed onboarding
  if (onboardingCheck === "needs") {
    return <Navigate to={onboardingRoute} replace />;
  }

  if (role === "student") return <Navigate to="/internships" replace />;
  if (role === "employer") return <Navigate to="/my-internships" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;

  return <Navigate to="/" replace />;
};

export default Dashboard;
