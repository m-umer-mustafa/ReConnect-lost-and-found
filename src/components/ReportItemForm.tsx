import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  validateItemName,
  validateDescription,
  validateLocation,
  validateDate
} from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ReportItemFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  type: 'lost' | 'found';
}

export const ReportItemForm: React.FC<ReportItemFormProps> = ({
  onSubmit,
  loading = false,
  type
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLostFound: null as Date | null,
    contactEmail: '',
    contactPhone: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateItemName(formData.title);
    if (nameError) newErrors.title = nameError;

    const descError = validateDescription(formData.description);
    if (descError) newErrors.description = descError;

    const locationError = validateLocation(formData.location);
    if (locationError) newErrors.location = locationError;

    if (!formData.dateLostFound) {
      newErrors.dateLostFound = 'Date is required';
    } else {
      const dateError = validateDate(formData.dateLostFound.toISOString(), 'past');
      if (dateError) newErrors.dateLostFound = dateError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: string | Date | null) => {
    let limitedValue: any = value;

    if (typeof value === 'string') {
      if (field === 'title') {
        limitedValue = value.substring(0, 100);
      } else if (field === 'description') {
        limitedValue = value.substring(0, 1000);
      } else if (field === 'location') {
        limitedValue = value.substring(0, 200);
      }
    }

    setFormData(prev => ({ ...prev, [field]: limitedValue }));

    // Live validation
    let errorMsg = '';
    if (field === 'title' && typeof limitedValue === 'string')
      errorMsg = validateItemName(limitedValue) || '';
    if (field === 'description' && typeof limitedValue === 'string')
      errorMsg = validateDescription(limitedValue) || '';
    if (field === 'location' && typeof limitedValue === 'string')
      errorMsg = validateLocation(limitedValue) || '';
    if (field === 'dateLostFound' && limitedValue instanceof Date)
      errorMsg = validateDate(limitedValue.toISOString(), 'past') || '';

    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Item Name*</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="e.g., Blue iPhone 13, Black Leather Wallet"
          className={errors.title ? 'border-destructive' : ''}
          maxLength={100}
          required
        />
        <div className="flex justify-between text-sm">
          <span className={errors.title ? 'text-destructive' : 'text-muted-foreground'}>
            {errors.title || ''}
          </span>
          <span className="text-muted-foreground">
            {formData.title.length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Provide more details about the item..."
          className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
          maxLength={1000}
        />
        <div className="flex justify-between text-sm">
          <span className={errors.description ? 'text-destructive' : 'text-muted-foreground'}>
            {errors.description || ''}
          </span>
          <span className="text-muted-foreground">
            {formData.description.length}/1000
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="e.g., Electronics, Accessories, Documents"
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Location*</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Where was it lost/found?"
          className={errors.location ? 'border-destructive' : ''}
          maxLength={200}
          required
        />
        <div className="flex justify-between text-sm">
          <span className={errors.location ? 'text-destructive' : 'text-muted-foreground'}>
            {errors.location || ''}
          </span>
          <span className="text-muted-foreground">
            {formData.location.length}/200
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Date {type === 'lost' ? 'Lost' : 'Found'} *
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.dateLostFound && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formData.dateLostFound
                ? format(formData.dateLostFound, "PPP")
                : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={formData.dateLostFound}
              onSelect={(date) => date && handleChange('dateLostFound', date)}
              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        {errors.dateLostFound && (
          <p className="text-destructive text-sm mt-1">{errors.dateLostFound}</p>
        )}
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={(e) => handleChange('contactEmail', e.target.value)}
          placeholder="Alternative contact email"
        />
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          type="tel"
          value={formData.contactPhone}
          onChange={(e) => handleChange('contactPhone', e.target.value)}
          placeholder="Your phone number"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          `Report ${type === 'lost' ? 'Lost' : 'Found'} Item`
        )}
      </Button>
    </form>
  );
};
