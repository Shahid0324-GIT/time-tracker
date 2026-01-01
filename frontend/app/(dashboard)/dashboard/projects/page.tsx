"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectList } from "@/components/dashboard/projects/project-list";
import { ProjectForm } from "@/components/dashboard/projects/project-form";

export default function ProjectsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your projects and hourly rates.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* CREATE PROJECT DIALOG */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <ProjectForm onSuccess={() => setOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* PROJECT LIST */}
      <ProjectList />
    </div>
  );
}
