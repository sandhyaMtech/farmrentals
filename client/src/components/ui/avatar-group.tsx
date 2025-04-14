import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps {
  users: {
    id: number;
    name: string;
    image?: string;
  }[];
  max?: number;
  className?: string;
}

export function AvatarGroup({ users, max = 4, className }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const extraUsers = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayUsers.map((user) => (
        <Avatar key={user.id} className="border-2 border-white">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name} />
          ) : (
            <AvatarFallback className="bg-primary text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      {extraUsers > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs border-2 border-white">
          +{extraUsers}
        </div>
      )}
    </div>
  );
}
