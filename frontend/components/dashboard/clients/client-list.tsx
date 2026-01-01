"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  SearchX,
  Building2,
  User as UserIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/lib/types";
import { useClients } from "@/lib/hooks/use-clients";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ClientForm } from "./client-form";
import ClientSkeleton from "@/components/layout/clients-skeleton";

interface ClientListProps {
  searchQuery?: string;
}

export function ClientList({ searchQuery = "" }: ClientListProps) {
  const { clients, isLoading, deleteClient } = useClients();
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // --- FILTER LOGIC ---
  const filteredClients = clients?.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query)
    );
  });

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // --- LOADING STATE ---
  if (isLoading) {
    return <ClientSkeleton />;
  }

  // --- EMPTY STATE (No clients) ---
  if (!clients || clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card">
        <div className="mb-4 rounded-full bg-muted p-4">
          <UserIcon className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold">No Clients Found</h3>
        <p className="text-sm max-w-sm mt-1 mb-4">
          Add your first client to start tracking projects and invoices.
        </p>
      </div>
    );
  }

  // --- EMPTY STATE (No search matches) ---
  if (filteredClients?.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-xl">
        <div className="mb-4 rounded-full bg-muted/50 p-4">
          <SearchX className="h-8 w-8 opacity-40" />
        </div>
        <h3 className="text-lg font-semibold">No matching clients</h3>
        <p className="text-sm">Try adjusting your search query.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-75">Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Joined</TableHead>
              <TableHead className="w-12.5"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients?.map((client) => (
              <TableRow key={client.id}>
                {/* NAME & EMAIL */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      {client.email && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {client.email}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* COMPANY */}
                <TableCell>
                  {client.company ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      {client.company}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50 text-sm italic">
                      —
                    </span>
                  )}
                </TableCell>

                {/* STATUS */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      client.is_active
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }
                  >
                    {client.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* JOINED DATE */}
                <TableCell className="text-right text-muted-foreground text-sm">
                  {format(new Date(client.created_at), "MMM d, yyyy")}
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => setClientToEdit(client)}
                        className="cursor-pointer"
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={() => setClientToDelete(client.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* EDIT MODAL */}
      <Dialog
        open={!!clientToEdit}
        onOpenChange={(open) => !open && setClientToEdit(null)}
      >
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {clientToEdit && (
              <ClientForm
                clientToEdit={clientToEdit}
                onSuccess={() => setClientToEdit(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this client?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove this
              client and may affect associated projects and invoices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (clientToDelete) deleteClient(clientToDelete);
                setClientToDelete(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
