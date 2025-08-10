import React, { useState } from 'react';
import { X, Upload, Tag, FileText, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLostFound } from '@/context/LostFoundContext';
import { useToast } from '@/hooks/use-toast';
import { LostFoundItem } from '@/lib/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { validateItemName, validateDescription, validateLocation } from '@/utils/validation';
import { supabase } from '@/lib/supabaseClient'; 

interface EditItemModalProps {
  item: LostFoundItem;
  isOpen: boolean;
  onClose: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, isOpen, onClose }) => {
  const { updateItem } = useLostFound();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    category: item.category,
    location: item.location,
    dateLostFound: new Date(item.dateLostFound),
    contactEmail: item.contactEmail || item.userEmail,
    contactPhone: item.contactPhone || '',
    images: item.images,
    type: item.type,
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Electronics',
    'Documents',
    'Clothing',
    'Jewelry',
    'Bags & Wallets',
    'Keys',
    'Sports Equipment',
    'Books',
    'Personal Items',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const titleError = validateItemName(formData.title);
    if (titleError) newErrors.title = titleError;

    const descError = validateDescription(formData.description);
    if (descError) newErrors.description = descError;

    const locationError = validateLocation(formData.location);
    if (locationError) newErrors.location = locationError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(prev => [...prev, ...files].slice(0, 5));
  };

  const removeImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Upload single image file to Supabase storage and return public URL
  const uploadImageToSupabase = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = fileName;

    const { error } = await supabase.storage
      .from('lostfound-images')
      .upload(filePath, file);

    if (error) throw error;

    const publicUrlResponse = supabase.storage.from('lostfound-images').getPublicUrl(filePath);
    if (!publicUrlResponse.data) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    if ('error' in publicUrlResponse && publicUrlResponse.error) {
      throw publicUrlResponse.error;
    }

    const publicURL = publicUrlResponse.data.publicUrl;

    return publicURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Upload all new selected images to Supabase Storage and get URLs
      const uploadedImageUrls = [];
      for (const file of selectedImages) {
        const url = await uploadImageToSupabase(file);
        uploadedImageUrls.push(url);
      }

      const updatedItem = {
        ...formData,
        images: [...formData.images, ...uploadedImageUrls],
        dateLostFound: formData.dateLostFound.toISOString(),
      };

      await updateItem(item.id, updatedItem);

      toast({
        title: "Item Updated",
        description: "Your item has been updated successfully.",
      });

      setSelectedImages([]);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImageUrls],
      }));

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
      console.error("Update item error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Edit Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Item Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: 'lost' | 'found') =>
                setFormData(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lost">Lost Item</SelectItem>
                <SelectItem value="found">Found Item</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-medium">
              Item Title *
            </Label>
            <div className="relative">
              <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value.substring(0, 100) }))}
                className="pl-10"
                placeholder="What item are you reporting?"
                maxLength={100}
                required
              />
            </div>
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
            <Label htmlFor="edit-description" className="text-sm font-medium">
              Description *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value.substring(0, 1000) }))}
                className="pl-10 min-h-[100px] resize-none"
                placeholder="Provide detailed description including color, size, brand, etc."
                maxLength={1000}
                required
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className={errors.description ? 'text-destructive' : 'text-muted-foreground'}>
                {errors.description || ''}
              </span>
              <span className="text-muted-foreground">
                {formData.description.length}/1000
              </span>
            </div>
          </div>

          {/* Category and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location" className="text-sm font-medium">
                Location *
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value.substring(0, 200) }))}
                  className="pl-10"
                  placeholder="Where was it lost/found?"
                  maxLength={200}
                  required
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className={errors.location ? 'text-destructive' : 'text-muted-foreground'}>
                  {errors.location || ''}
                </span>
                <span className="text-muted-foreground">
                  {formData.location.length}/200
                </span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
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
                  {formData.dateLostFound ? format(formData.dateLostFound, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.dateLostFound}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, dateLostFound: date }))}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-sm font-medium">
                Contact Email *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-sm font-medium">
                Contact Phone (Optional)
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">
              Images (Optional, max 5)
            </Label>

            {/* Existing Images */}
            {formData.images.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Current ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index, true)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {selectedImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">New images to add:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index, false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            {(formData.images.length + selectedImages.length) < 5 && (
              <div>
                <Input
                  id="edit-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Label
                  htmlFor="edit-images"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors group"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mx-auto mb-2 transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      Click to add images
                    </span>
                  </div>
                </Label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="hero"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Update Item'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
