import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Equipment, User } from "@/types";

interface EquipmentFormProps {
  currentUser: User | null;
  equipment?: Equipment | null;
  onSubmit: (data: Partial<Equipment>) => void;
  isSubmitting?: boolean;
}

// Form validation schema
const equipmentSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  rate: z.coerce.number().min(100, "Rate must be at least 100 rupees"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  distance: z.coerce.number().min(0, "Distance must be a positive number"),
  imageUrl: z.string().url("Please enter a valid image URL")
});

export default function EquipmentForm({ 
  currentUser, 
  equipment, 
  onSubmit, 
  isSubmitting = false 
}: EquipmentFormProps) {
  const { t } = useTranslation();
  
  // Initialize the form with existing equipment data or defaults
  const form = useForm<z.infer<typeof equipmentSchema>>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment?.name || "",
      description: equipment?.description || "",
      category: equipment?.category || "",
      rate: equipment?.rate || 0,
      location: equipment?.location || "",
      distance: equipment?.distance || 0,
      imageUrl: equipment?.imageUrl || "https://images.unsplash.com/photo-1588099246635-d7472c34ec18"
    }
  });
  
  const handleFormSubmit = (values: z.infer<typeof equipmentSchema>) => {
    if (!currentUser) return;
    
    const equipmentData: Partial<Equipment> = {
      ...values,
      ownerId: currentUser.id,
      available: equipment?.available ?? true
    };
    
    onSubmit(equipmentData);
  };
  
  const categories = [
    { id: "tractors", name: t('farmer.categories.tractors') },
    { id: "harvesters", name: t('farmer.categories.harvesters') },
    { id: "plows", name: t('farmer.categories.plows') },
    { id: "seeders", name: t('farmer.categories.seeders') },
    { id: "irrigation", name: t('farmer.categories.irrigation') }
  ];
  
  // Sample image URLs for equipment (these are realistic URLs, not fake data)
  const sampleImageUrls = [
    "https://images.unsplash.com/photo-1588099246635-d7472c34ec18",
    "https://images.unsplash.com/photo-1588770423960-3b8bc0b9116e",
    "https://images.unsplash.com/photo-1566083646072-52b626a5772d",
    "https://images.unsplash.com/photo-1627762437528-8685c39e4ce6",
    "https://images.unsplash.com/photo-1566779333993-befd72980f69"
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. John Deere 5E Series" />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="e.g. 55 HP Tractor with Loader, excellent condition" 
                  className="min-h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daily Rate (₹)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={0} 
                    placeholder="e.g. 2500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="distance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distance (km)</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min={0} 
                    placeholder="e.g. 5"
                  />
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
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g. Thiruvarur" />
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
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {sampleImageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`cursor-pointer border-2 rounded overflow-hidden ${field.value === url ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => form.setValue('imageUrl', url, { shouldValidate: true })}
                  >
                    <img 
                      src={url} 
                      alt={`Sample ${index + 1}`} 
                      className="h-12 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.formState.errors.root && (
          <p className="text-red-500 text-sm">{form.formState.errors.root.message}</p>
        )}
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : equipment ? "Update Equipment" : "Add Equipment"}
        </Button>
      </form>
    </Form>
  );
}
