import React, { useState } from 'react';
import { Upload, X, Camera, MapPin, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { validateItemName, validateDescription, validateDate } from '@/utils/validation';

const CATEGORIES = [
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

export const ReportItem: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    dateLostFound: '',
    type: 'lost' as 'lost' | 'found',
    contactEmail: '',
    contactPhone: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate item name
    const nameError = validateItemName(formData.title);
    if (nameError) newErrors.title = nameError;

    // Validate description
    const descError = validateDescription(formData.description);
    if (descError) newErrors.description = descError;

    // Validate date
    const dateError = validateDate(formData.dateLostFound, 'past');
    if (dateError) newErrors.dateLostFound = dateError;

    // Required fields
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast({ title: 'Not signed in', variant: 'destructive' });
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.from('items').insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        date_lost_found: formData.dateLostFound,
        status: formData.type,
        type: formData.type,
        images: images,
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
      }).select().single();

      if (error) throw error;

      toast({
        title: "Item Reported Successfully!"
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to report item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${formData.type === 'lost' ? 'report-mood-bg-lost' : 'report-mood-bg-found'}`}>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="neo-page-shell mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-7 text-center md:mb-9">
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-slate-100">Report an Item</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Help someone find their lost belongings or report something you found
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
          {/* Type Selection */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">What would you like to report?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                className={`neo-interactive rounded-xl border p-5 text-left transition-colors ${
                  formData.type === 'lost'
                    ? 'border-lost/50 bg-lost/15 dark:border-lost/40 dark:bg-lost/20'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <X className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="mb-1 font-semibold tracking-tight text-slate-900 dark:text-slate-100">Lost Item</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  I lost something and need help finding it
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                className={`neo-interactive rounded-xl border p-5 text-left transition-colors ${
                  formData.type === 'found'
                    ? 'border-found/50 bg-found/15 dark:border-found/40 dark:bg-found/20'
                    : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                  <Plus className="h-6 w-6 text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="mb-1 font-semibold tracking-tight text-slate-900 dark:text-slate-100">Found Item</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  I found something and want to return it
                </p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="glass-card space-y-5 p-4 sm:p-6 sm:space-y-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Item Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., iPhone 14 Pro, Blue Backpack, Wedding Ring"
                className={errors.title ? 'border-destructive' : ''}
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide a detailed description including color, size, brand, any unique features..."
                className={`min-h-[100px] rounded-lg border border-input bg-slate-100/50 text-slate-900 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-400 ${errors.description ? 'border-destructive' : ''}`}
                required
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
                required
              >
                <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Location and Date */}
          <div className="glass-card space-y-5 p-4 sm:p-6 sm:space-y-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">Where and When?</h2>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Central Library, Main Street Coffee Shop, University Campus"
                className={errors.location ? 'border-destructive' : ''}
                required
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-700 dark:text-slate-300">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.dateLostFound}
                onChange={(e) => handleChange('dateLostFound', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={errors.dateLostFound ? 'border-destructive' : ''}
                required
              />
              {errors.dateLostFound && (
                <p className="text-sm text-destructive">{errors.dateLostFound}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="glass-card space-y-5 p-4 sm:p-6 sm:space-y-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              <Camera className="inline h-5 w-5 mr-2" />
              Photos (Optional)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Adding photos greatly increases the chances of a successful match.
            </p>

            {/* Upload Area */}
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center sm:p-8 dark:border-slate-700 dark:bg-slate-800/40">
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="h-8 w-8 text-slate-500 dark:text-slate-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Click to upload images</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 5MB each</p>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="h-24 w-full rounded-xl border border-slate-300 object-cover dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={loading}
              className={`flex-1 ${formData.type === 'lost'
                ? 'bg-lost text-lost-foreground hover:bg-lost/90'
                : 'bg-found text-found-foreground hover:bg-found/90'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Report ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`
              )}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};