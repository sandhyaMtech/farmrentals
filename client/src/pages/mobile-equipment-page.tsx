import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MobileLayout } from '@/components/layout/mobile-layout';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Equipment } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Pencil, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  MoreVertical,
  Tractor
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MobileEquipmentPageProps {
  language: string;
}

export default function MobileEquipmentPage({ language }: MobileEquipmentPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteEquipment, setDeleteEquipment] = useState<Equipment | null>(null);
  
  // Fetch equipment list
  const { data: equipmentList = [] } = useQuery<Equipment[]>({
    queryKey: ['/api/equipment'],
    enabled: !!user,
  });
  
  // Filter equipment by owner
  const ownerEquipment = equipmentList.filter(
    (equipment) => equipment.ownerId === user?.id
  );
  
  // Equipment form schema
  const equipmentSchema = z.object({
    name: z.string().min(3, {
      message: language === 'en' ? 'Name must be at least 3 characters' : 'பெயர் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்',
    }),
    description: z.string().min(10, {
      message: language === 'en' ? 'Description must be at least 10 characters' : 'விளக்கம் குறைந்தது 10 எழுத்துகள் இருக்க வேண்டும்',
    }),
    category: z.string().min(1, {
      message: language === 'en' ? 'Category is required' : 'வகை தேவை',
    }),
    rate: z.coerce.number().positive({
      message: language === 'en' ? 'Rate must be a positive number' : 'விகிதம் ஒரு நேர்மறை எண்ணாக இருக்க வேண்டும்',
    }),
    location: z.string().min(3, {
      message: language === 'en' ? 'Location must be at least 3 characters' : 'இருப்பிடம் குறைந்தது 3 எழுத்துகள் இருக்க வேண்டும்',
    }),
    imageUrl: z.string().url({
      message: language === 'en' ? 'Please enter a valid image URL' : 'சரியான படத்தின் URL ஐ உள்ளிடவும்',
    }),
    available: z.boolean().default(true),
  });
  
  // Form
  const form = useForm<z.infer<typeof equipmentSchema>>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      rate: 0,
      location: '',
      imageUrl: '',
      available: true,
    },
  });
  
  // Reset form with equipment data for editing
  const resetFormWithEquipment = (equipment: Equipment | null) => {
    if (equipment) {
      form.reset({
        name: equipment.name,
        description: equipment.description,
        category: equipment.category,
        rate: equipment.rate,
        location: equipment.location,
        imageUrl: equipment.imageUrl,
        available: equipment.available,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        category: '',
        rate: 0,
        location: '',
        imageUrl: '',
        available: true,
      });
    }
  };
  
  // Create/Update Equipment Mutation
  const equipmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof equipmentSchema>) => {
      if (editingEquipment) {
        // Update existing equipment
        const response = await apiRequest('PATCH', `/api/equipment/${editingEquipment.id}`, {
          ...data,
          ownerId: user?.id,
        });
        return response.json();
      } else {
        // Create new equipment
        const response = await apiRequest('POST', '/api/equipment', {
          ...data,
          ownerId: user?.id,
          distance: 0, // Default distance
          rating: 0, // Default rating
          ratingCount: 0, // Default rating count
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setIsFormDialogOpen(false);
      
      toast({
        title: editingEquipment
          ? language === 'en'
            ? 'Equipment updated!'
            : 'உபகரணம் புதுப்பிக்கப்பட்டது!'
          : language === 'en'
          ? 'Equipment added!'
          : 'உபகரணம் சேர்க்கப்பட்டது!',
      });
      
      setEditingEquipment(null);
    },
    onError: (error) => {
      toast({
        title: language === 'en' ? 'Action failed' : 'செயல் தோல்வியடைந்தது',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Delete Equipment Mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: async (equipmentId: number) => {
      const response = await apiRequest('DELETE', `/api/equipment/${equipmentId}`, undefined);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      setIsDeleteDialogOpen(false);
      
      toast({
        title: language === 'en' ? 'Equipment deleted!' : 'உபகரணம் நீக்கப்பட்டது!',
      });
      
      setDeleteEquipment(null);
    },
    onError: (error) => {
      toast({
        title: language === 'en' ? 'Delete failed' : 'நீக்கம் தோல்வியடைந்தது',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Toggle Equipment Availability Mutation
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, available }: { id: number; available: boolean }) => {
      const response = await apiRequest('PATCH', `/api/equipment/${id}`, {
        available,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment'] });
      
      toast({
        title: language === 'en' ? 'Equipment status updated!' : 'உபகரண நிலை புதுப்பிக்கப்பட்டது!',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'en' ? 'Update failed' : 'புதுப்பிப்பு தோல்வியடைந்தது',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof equipmentSchema>) => {
    equipmentMutation.mutate(data);
  };
  
  // Handle opening the form dialog for adding or editing
  const openFormDialog = (equipment: Equipment | null = null) => {
    setEditingEquipment(equipment);
    resetFormWithEquipment(equipment);
    setIsFormDialogOpen(true);
  };
  
  // Handle opening the delete confirmation dialog
  const openDeleteDialog = (equipment: Equipment) => {
    setDeleteEquipment(equipment);
    setIsDeleteDialogOpen(true);
  };
  
  // Toggle equipment availability
  const toggleAvailability = (equipment: Equipment) => {
    toggleAvailabilityMutation.mutate({
      id: equipment.id,
      available: !equipment.available,
    });
  };
  
  const translations = {
    en: {
      equipment: 'My Equipment',
      addNew: 'Add New',
      categories: {
        tractor: 'Tractor',
        harvester: 'Harvester',
        sprayer: 'Sprayer',
        plough: 'Plough',
        seeder: 'Seeder',
        other: 'Other'
      },
      addEquipment: 'Add Equipment',
      editEquipment: 'Edit Equipment',
      details: 'Enter equipment details',
      name: 'Equipment Name',
      description: 'Description',
      category: 'Category',
      rate: 'Daily Rate (₹)',
      location: 'Location',
      imageUrl: 'Image URL',
      available: 'Available for Rent',
      save: 'Save Equipment',
      update: 'Update Equipment',
      cancel: 'Cancel',
      deleteEquipment: 'Delete Equipment',
      deleteConfirm: 'Are you sure you want to delete this equipment? This action cannot be undone.',
      delete: 'Delete',
      noEquipment: 'You haven\'t added any equipment yet',
      addSome: 'Add your equipment to make it available for rent',
      available: 'Available',
      unavailable: 'Unavailable',
      selectCategory: 'Select Category',
      saving: 'Saving...',
      deleting: 'Deleting...'
    },
    ta: {
      equipment: 'எனது உபகரணங்கள்',
      addNew: 'புதிதாக சேர்க்க',
      categories: {
        tractor: 'டிராக்டர்',
        harvester: 'அறுவடை இயந்திரம்',
        sprayer: 'தெளிப்பான்',
        plough: 'கலப்பை',
        seeder: 'விதைப்பான்',
        other: 'மற்றவை'
      },
      addEquipment: 'உபகரணம் சேர்க்க',
      editEquipment: 'உபகரணத்தைத் திருத்து',
      details: 'உபகரண விவரங்களை உள்ளிடவும்',
      name: 'உபகரணத்தின் பெயர்',
      description: 'விளக்கம்',
      category: 'வகை',
      rate: 'தினசரி விகிதம் (₹)',
      location: 'இருப்பிடம்',
      imageUrl: 'பட URL',
      available: 'வாடகைக்கு கிடைக்கிறது',
      save: 'உபகரணத்தை சேமிக்கவும்',
      update: 'உபகரணத்தைப் புதுப்பிக்கவும்',
      cancel: 'ரத்து செய்',
      deleteEquipment: 'உபகரணத்தை நீக்கு',
      deleteConfirm: 'இந்த உபகரணத்தை நிச்சயமாக நீக்க விரும்புகிறீர்களா? இந்த செயலை மீட்டெடுக்க முடியாது.',
      delete: 'நீக்கு',
      noEquipment: 'நீங்கள் இன்னும் எந்த உபகரணத்தையும் சேர்க்கவில்லை',
      addSome: 'வாடகைக்கு கிடைக்க உங்கள் உபகரணத்தைச் சேர்க்கவும்',
      available: 'கிடைக்கிறது',
      unavailable: 'கிடைக்கவில்லை',
      selectCategory: 'வகையைத் தேர்ந்தெடுக்கவும்',
      saving: 'சேமிக்கிறது...',
      deleting: 'நீக்குகிறது...'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  
  return (
    <MobileLayout title={t.equipment} language={language}>
      <div className="space-y-4 py-4">
        {/* Add New Equipment Button */}
        <Button 
          onClick={() => openFormDialog()}
          className="w-full mobile-button"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t.addNew}
        </Button>
        
        {/* Equipment List */}
        {ownerEquipment.length > 0 ? (
          <div className="space-y-4">
            {ownerEquipment.map((equipment) => (
              <div 
                key={equipment.id}
                className="mobile-card"
              >
                <div className="relative pb-4">
                  {/* Equipment Image */}
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={equipment.imageUrl} 
                      alt={equipment.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Availability Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant={equipment.available ? 'success' : 'destructive'}>
                      {equipment.available ? t.available : t.unavailable}
                    </Badge>
                  </div>
                  
                  {/* Actions Dropdown */}
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openFormDialog(equipment)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Edit' : 'திருத்து'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleAvailability(equipment)}>
                          {equipment.available ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Mark as Unavailable' : 'கிடைக்காதது என குறி'}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Mark as Available' : 'கிடைக்கும் என குறி'}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(equipment)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Delete' : 'நீக்கு'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Equipment Details */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{equipment.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {equipment.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="inline-block bg-muted px-2 py-1 rounded text-xs">
                        {equipment.category}
                      </span>
                    </div>
                    <div className="font-bold">
                      ₹{equipment.rate}<span className="text-xs text-muted-foreground ml-1">/day</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <Tractor className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xl font-medium mb-2">{t.noEquipment}</p>
            <p className="text-muted-foreground">{t.addSome}</p>
          </div>
        )}
      </div>
      
      {/* Equipment Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEquipment ? t.editEquipment : t.addEquipment}
            </DialogTitle>
            <DialogDescription>
              {t.details}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.name}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.description}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.category}</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectCategory} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tractor">{t.categories.tractor}</SelectItem>
                          <SelectItem value="harvester">{t.categories.harvester}</SelectItem>
                          <SelectItem value="sprayer">{t.categories.sprayer}</SelectItem>
                          <SelectItem value="plough">{t.categories.plough}</SelectItem>
                          <SelectItem value="seeder">{t.categories.seeder}</SelectItem>
                          <SelectItem value="other">{t.categories.other}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.rate}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.location}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.imageUrl}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="available"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t.available}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={equipmentMutation.isPending}
                >
                  {equipmentMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full" />
                      {t.saving}
                    </div>
                  ) : (
                    editingEquipment ? t.update : t.save
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.deleteEquipment}</DialogTitle>
            <DialogDescription>
              {t.deleteConfirm}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteEquipment && deleteEquipmentMutation.mutate(deleteEquipment.id)}
              disabled={deleteEquipmentMutation.isPending}
            >
              {deleteEquipmentMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-b-transparent rounded-full" />
                  {t.deleting}
                </div>
              ) : (
                t.delete
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileLayout>
  );
}