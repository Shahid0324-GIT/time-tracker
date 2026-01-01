import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Skeleton className="h-10 w-full" />
      </Card>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-16 w-full" />
        </Card>
      ))}
    </div>
  );
}
