import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InvoiceSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Skeleton className="h-6 w-full" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-full" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-full" />
          </TableHead>
          <TableHead>
            <Skeleton className="h-6 w-full" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[1, 2, 3, 4].map((i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-6 w-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
