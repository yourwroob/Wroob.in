import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { useFollows } from "@/hooks/useFollows";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

const FollowButton = ({ targetUserId, className }: FollowButtonProps) => {
  const { user } = useAuth();
  const { isFollowing, follow, unfollow } = useFollows(targetUserId);

  if (!user || user.id === targetUserId) return null;

  const loading = follow.isPending || unfollow.isPending;

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      disabled={loading}
      className={`gap-2 ${className ?? ""}`}
      onClick={() => (isFollowing ? unfollow.mutate() : follow.mutate())}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;
