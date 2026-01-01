"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientList } from "@/components/dashboard/clients/client-list";
import { ClientForm } from "@/components/dashboard/clients/client-form";
import { useClients } from "@/lib/hooks/use-clients";

export default function ClientsPage() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { clients } = useClients();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
            {clients && clients.length > 0 && (
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {clients.length}
              </span>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage your client relationships and contact details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CREATE CLIENT DIALOG */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-125">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ClientForm onSuccess={() => setOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="flex items-center justify-between">
        <div className="relative w-full sm:w-87.5">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, company, or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CLIENT LIST TABLE */}
      <ClientList searchQuery={searchQuery} />
    </div>
  );
}
