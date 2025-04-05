import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface ComplaintFormProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
}

export default function ComplaintForm({ isOpen, onClose, language }: ComplaintFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mock list of categories
  const complaintCategories = {
    en: [
      { value: 'equipment', label: 'Equipment Issue' },
      { value: 'service', label: 'Service Issue' },
      { value: 'driver', label: 'Driver Complaint' },
      { value: 'payment', label: 'Payment Dispute' },
      { value: 'booking', label: 'Booking Issue' },
      { value: 'other', label: 'Other' }
    ],
    ta: [
      { value: 'equipment', label: 'உபகரண பிரச்சனை' },
      { value: 'service', label: 'சேவை பிரச்சனை' },
      { value: 'driver', label: 'டிரைவர் புகார்' },
      { value: 'payment', label: 'பணம் சம்பந்தமான தகராறு' },
      { value: 'booking', label: 'முன்பதிவு பிரச்சனை' },
      { value: 'other', label: 'மற்றவை' }
    ]
  };
  
  // Translations
  const translations = {
    en: {
      title: 'Submit Complaint',
      formDescription: 'Tell us about your issue or complaint. We take all feedback seriously and will address it promptly.',
      category: 'Complaint Category',
      categoryPlaceholder: 'Select a category',
      subject: 'Subject',
      subjectPlaceholder: 'Brief subject of your complaint',
      descriptionField: 'Description',
      descriptionPlaceholder: 'Please provide details about the issue',
      booking: 'Related Booking',
      bookingPlaceholder: 'If applicable, enter booking ID',
      contactName: 'Contact Name',
      contactPhone: 'Contact Phone Number',
      contactPreferred: 'Preferred Contact Method',
      emailOption: 'Email',
      phoneOption: 'Phone',
      submit: 'Submit Complaint',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      successTitle: 'Complaint Submitted',
      successDescription: 'Your complaint has been received. We will investigate and get back to you soon.',
      errorTitle: 'Submission Failed',
      errorDescription: 'There was an error submitting your complaint. Please try again.',
      reference: 'Reference Number',
      contactNameDescription: 'Name of person to contact about this complaint',
      contactPhoneDescription: 'Phone number for follow-up communication'
    },
    ta: {
      title: 'புகார் சமர்ப்பிக்கவும்',
      formDescription: 'உங்கள் பிரச்சனை அல்லது புகாரைப் பற்றி எங்களுக்குச் சொல்லுங்கள். நாங்கள் அனைத்து கருத்துக்களையும் தீவிரமாக எடுத்துக்கொண்டு அதை உடனடியாக நிவர்த்தி செய்வோம்.',
      category: 'புகார் வகை',
      categoryPlaceholder: 'ஒரு வகையைத் தேர்ந்தெடுக்கவும்',
      subject: 'தலைப்பு',
      subjectPlaceholder: 'உங்கள் புகாரின் சுருக்கமான தலைப்பு',
      descriptionField: 'விளக்கம்',
      descriptionPlaceholder: 'பிரச்சனை பற்றிய விவரங்களை வழங்கவும்',
      booking: 'தொடர்புடைய முன்பதிவு',
      bookingPlaceholder: 'பொருந்தும் என்றால், முன்பதிவு ஐடியை உள்ளிடவும்',
      contactName: 'தொடர்பு பெயர்',
      contactPhone: 'தொடர்பு தொலைபேசி எண்',
      contactPreferred: 'விருப்பமான தொடர்பு முறை',
      emailOption: 'மின்னஞ்சல்',
      phoneOption: 'தொலைபேசி',
      submit: 'புகாரைச் சமர்ப்பிக்கவும்',
      cancel: 'ரத்து செய்',
      submitting: 'சமர்ப்பிக்கிறது...',
      successTitle: 'புகார் சமர்ப்பிக்கப்பட்டது',
      successDescription: 'உங்கள் புகார் பெறப்பட்டது. நாங்கள் விசாரித்து விரைவில் உங்களுக்குத் தெரிவிப்போம்.',
      errorTitle: 'சமர்ப்பிப்பு தோல்வியடைந்தது',
      errorDescription: 'உங்கள் புகாரை சமர்ப்பிப்பதில் பிழை ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.',
      reference: 'குறிப்பு எண்',
      contactNameDescription: 'இந்த புகார் குறித்து தொடர்பு கொள்ள வேண்டிய நபரின் பெயர்',
      contactPhoneDescription: 'தொடர்பு தொடர்புக்கான தொலைபேசி எண்'
    }
  };
  
  const t = translations[language === 'en' ? 'en' : 'ta'];
  const categories = complaintCategories[language === 'en' ? 'en' : 'ta'];
  
  // Form schema
  const formSchema = z.object({
    category: z.string({
      required_error: language === 'en' ? 'Please select a category' : 'தயவுசெய்து ஒரு வகையைத் தேர்ந்தெடுக்கவும்',
    }),
    subject: z.string({
      required_error: language === 'en' ? 'Subject is required' : 'தலைப்பு தேவை',
    }).min(5, {
      message: language === 'en' ? 'Subject must be at least 5 characters' : 'தலைப்பு குறைந்தது 5 எழுத்துகள் இருக்க வேண்டும்',
    }),
    description: z.string({
      required_error: language === 'en' ? 'Description is required' : 'விளக்கம் தேவை',
    }).min(20, {
      message: language === 'en' ? 'Description must be at least 20 characters' : 'விளக்கம் குறைந்தது 20 எழுத்துகள் இருக்க வேண்டும்',
    }),
    bookingId: z.string().optional(),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactMethod: z.enum(['email', 'phone']).default('email'),
  });
  
  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      subject: '',
      description: '',
      bookingId: '',
      contactName: user?.name || '',
      contactPhone: user?.phone || '',
      contactMethod: 'email',
    },
  });
  
  // Create complaint mutation
  const createComplaintMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would be an API call
      // const response = await apiRequest('POST', '/api/complaints', {
      //   ...data,
      //   userId: user?.id,
      //   createdAt: new Date(),
      // });
      // return response.json();
      
      // For demo, return mock response
      return {
        id: Math.floor(Math.random() * 1000000),
        reference: `CMP-${Math.floor(Math.random() * 100000)}`,
        status: 'submitted',
        ...data,
        userId: user?.id,
        createdAt: new Date(),
      };
    },
    onSuccess: (data) => {
      // Show success message
      toast({
        title: t.successTitle,
        description: `${t.successDescription} ${t.reference}: ${data.reference}`,
      });
      
      // Reset form and close dialog
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: t.errorTitle,
        description: t.errorDescription,
        variant: 'destructive',
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createComplaintMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>
            {t.formDescription}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Category */}
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
                        <SelectValue placeholder={t.categoryPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.value} 
                          value={category.value}
                        >
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.subject}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.subjectPlaceholder} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.descriptionField}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t.descriptionPlaceholder} 
                      rows={4}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Booking ID */}
            <FormField
              control={form.control}
              name="bookingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.booking}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t.bookingPlaceholder} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contactName}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t.contactNameDescription}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.contactPhone}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      {t.contactPhoneDescription}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t.cancel}
                </Button>
              </DialogClose>
              <Button 
                type="submit"
                disabled={createComplaintMutation.isPending}
              >
                {createComplaintMutation.isPending ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.submitting}
                  </div>
                ) : (
                  t.submit
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}