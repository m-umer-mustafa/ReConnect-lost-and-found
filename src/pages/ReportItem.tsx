import React, { useState } from 'react';
import { Upload, X, Camera, MapPin, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLostFound } from '@/context/LostFoundContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

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
  const { addItem } = useLostFound();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast({ title: 'Not signed in', variant: 'destructive' });
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.category || !formData.location.trim() || !formData.dateLostFound) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Report an Item</h1>
          <p className="text-muted-foreground">
            Help someone find their lost belongings or report something you found
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Type Selection */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold mb-4">What would you like to report?</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  formData.type === 'lost'
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border hover:border-destructive/50'
                }`}
              >
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold mb-1">Lost Item</h3>
                <p className="text-sm text-muted-foreground">
                  I lost something and need help finding it
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  formData.type === 'found'
                    ? 'border-success bg-success/10'
                    : 'border-border hover:border-success/50'
                }`}
              >
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-semibold mb-1">Found Item</h3>
                <p className="text-sm text-muted-foreground">
                  I found something and want to return it
                </p>
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            
            <div className="space-y-2">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., iPhone 14 Pro, Blue Backpack, Wedding Ring"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Provide a detailed description including color, size, brand, any unique features..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
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
            </div>
          </div>

          {/* Location and Date */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">Where and When?</h2>
            
            <div className="space-y-2">
              <Label htmlFor="location">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location *
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Central Library, Main Street Coffee Shop, University Campus"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.dateLostFound}
                onChange={(e) => setFormData(prev => ({ ...prev, dateLostFound: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          {/* Images */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-lg font-semibold">
              <Camera className="inline h-5 w-5 mr-2" />
              Photos (Optional)
            </h2>
            <p className="text-sm text-muted-foreground">
              Adding photos greatly increases the chances of a successful match.
            </p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
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
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload images</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB each</p>
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
                      className="w-full h-24 object-cover rounded-lg"
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
          <div className="flex space-x-4">
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
              variant="hero"
              disabled={loading}
              className="flex-1"
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
  );
};