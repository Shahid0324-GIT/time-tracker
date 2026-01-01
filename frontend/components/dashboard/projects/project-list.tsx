"use client";

import { useState } from "react";
import {
  MoreVertical,
  Calendar,
  DollarSign,
  Briefcase,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { format } from "date-fns";
import { ProjectWithClient } from "@/lib/types";
import { useProjects } from "@/lib/hooks/use-projects";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ProjectForm } from "./project-form";
import { formatCurrency } from "@/lib/utils/format";
import { getStatusColor } from "@/lib/utils/constants";
import ProjectsSkeleton from "@/components/layout/projects-skeleton";

export function ProjectList() {
  const { projects: rawProjects, isLoading, deleteProject } = useProjects();
  const projects = rawProjects as ProjectWithClient[] | undefined;

  const [projectToEdit, setProjectToEdit] = useState<ProjectWithClient | null>(
    null
  );
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  if (isLoading) {
    return <ProjectsSkeleton />;
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center text-muted-foreground bg-card">
        <div className="mb-4 rounded-full bg-muted p-4">
          <FolderOpen className="h-8 w-8 opacity-50" />
        </div>
        <h3 className="text-lg font-semibold">No Projects Found</h3>
        <p className="text-sm max-w-sm mt-1 mb-4">
          Create your first project to start tracking time and expenses.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md hover:border-primary/20"
          >
            {/* Color Strip */}
            <div
              className="absolute left-0 top-0 h-full w-1.5 transition-all group-hover:w-2"
              style={{ backgroundColor: project.color }}
            />

            <CardHeader className="pb-2 pl-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1 text-lg">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    {project.client ? (
                      <>
                        <Briefcase className="h-3 w-3" />
                        {project.client.name}
                      </>
                    ) : (
                      <span className="italic flex items-center gap-1.5">
                        <FolderOpen className="h-3 w-3" />
                        Internal Project
                      </span>
                    )}
                  </CardDescription>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="-mr-2 h-8 w-8 text-muted-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => setProjectToEdit(project)}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setProjectToDelete(project.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pl-6 pb-2">
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-10 mb-3">
                {project.description || "No description provided."}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={`${getStatusColor(
                    project.status
                  )} border-transparent pointer-events-none`}
                >
                  {project.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="pl-6 pt-4 border-t bg-muted/10 text-xs text-muted-foreground flex justify-between items-center">
              <div className="flex items-center gap-1.5" title="Hourly Rate">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-medium">
                  {formatCurrency(Number(project.hourly_rate))} / hr
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Created Date">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {format(new Date(project.created_at), "MMM d, yyyy")}
                </span>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!projectToEdit}
        onOpenChange={(open) => !open && setProjectToEdit(null)}
      >
        <DialogContent className="sm:max-w-150">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {projectToEdit && (
              <ProjectForm
                projectToEdit={projectToEdit}
                onSuccess={() => setProjectToEdit(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              <span className="font-semibold text-foreground">
                {" "}
                {projects?.find((p) => p.id === projectToDelete)?.name}{" "}
              </span>
              and all its associated time entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (projectToDelete) deleteProject(projectToDelete);
                setProjectToDelete(null);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
