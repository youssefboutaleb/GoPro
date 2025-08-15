import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

type Doctor = Tables<"doctors">;
type Brick = Tables<"bricks">;

interface DoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
}

const DoctorDialog: React.FC<DoctorDialogProps> = ({
  open,
  onOpenChange,
  doctor,
}) => {
  const initialFormData = {
    first_name: "",
    last_name: "",
    specialty: "",
    brick_id: "",
  };
  const [formData, setFormData] = React.useState(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load bricks for selection
  const { data: bricks, isLoading: bricksLoading } = useQuery({
    queryKey: ["bricks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bricks")
        .select("id, name")
        .order("name");

      if (error) throw error;
      return data.filter((brick) => brick.id && brick.name) as Brick[];
    },
  });

  React.useEffect(() => {
    if (doctor) {
      setFormData({
        first_name: doctor.first_name || "",
        last_name: doctor.last_name || "",
        specialty: doctor.specialty || "",
        brick_id: doctor.brick_id || "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [doctor]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("doctors").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        specialty: data.specialty || null,
        brick_id: data.brick_id === "none" ? null : data.brick_id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setFormData(initialFormData); // Reset form after successful creation
      onOpenChange(false);
      toast({
        title: "Succès",
        description: "Médecin créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du médecin",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!doctor) return;

      const { error } = await supabase
        .from("doctors")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          specialty: data.specialty || null,
          brick_id: data.brick_id === "none" ? null : data.brick_id || null,
        })
        .eq("id", doctor.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      onOpenChange(false);
      toast({
        title: "Succès",
        description: "Médecin mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du médecin",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast({
        title: "Erreur",
        description: "Le prénom et le nom sont requis",
        variant: "destructive",
      });
      return;
    }

    if (doctor) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || bricksLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {doctor ? "Modifier le médecin" : "Ajouter un médecin"}
          </DialogTitle>
          <DialogDescription>
            {doctor
              ? "Modifiez les informations du médecin."
              : "Ajoutez un nouveau médecin à la base de données."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="first_name" className="text-right">
                Prénom
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="last_name" className="text-right">
                Nom
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="specialty" className="text-right">
                Spécialité
              </Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specialty: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brick_id" className="text-right">
                Brick
              </Label>
              <Select
                value={formData.brick_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, brick_id: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un brick" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun brick</SelectItem>
                  {bricks?.map((brick) => (
                    <SelectItem key={brick.id} value={brick.id}>
                      {brick.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Chargement..." : doctor ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorDialog;
