import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const GREETINGS = [
  (name: string) => `Welcome back, ${name} 👋`,
  (name: string) => `Good to see you again, ${name}!`,
  (name: string) => `Hey ${name}! Ready to explore? 🚀`,
  (name: string) => `Welcome back, ${name}! Let's go 💪`,
];

const LoginGreeting = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (loading || !user) return;

    const flag = sessionStorage.getItem("wroob_just_logged_in");
    if (!flag) return;

    sessionStorage.removeItem("wroob_just_logged_in");

    const name = profile?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "there";
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];

    toast({
      title: greeting(name),
      duration: 3000,
    });
  }, [loading, user, profile, toast]);

  return null;
};

export default LoginGreeting;
