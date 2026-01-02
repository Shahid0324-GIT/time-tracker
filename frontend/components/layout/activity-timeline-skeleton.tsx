import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function ActivityTimelineSkeleton() {
  return (
    <Card className="col-span-4 lg:col-span-3 h-full">
      <CardHeader>
        <Skeleton className="h-6 w-37.5 mb-2" />
        <Skeleton className="h-4 w-62.5" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-50" />
                <Skeleton className="h-3 w-37.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
