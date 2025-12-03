'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ErrorMessage } from './FormError';
import { useToast } from './ui/Toast';

interface PointSystemTemplate {
  id: number;
  name: string;
  description: string | null;
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  pointsPerGoalScored: number;
  pointsPerGoalConceded: number;
}

// Validation schema
const tournamentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required").refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  endDate: z.string().optional().refine((date) => {
    if (!date) return true;
    return !isNaN(Date.parse(date));
  }, {
    message: "Invalid date format",
  }),
  pointsPerWin: z.number().int().min(0, "Points per win must be 0 or greater"),
  pointsPerDraw: z.number().int().min(0, "Points per draw must be 0 or greater"),
  pointsPerLoss: z.number().int().min(0, "Points per loss must be 0 or greater"),
  pointsPerGoalScored: z.number().int().min(0, "Points per goal scored must be 0 or greater"),
  pointsPerGoalConceded: z.number().int().min(0, "Points per goal conceded must be 0 or greater"),
}).refine((data) => {
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"],
});

interface TournamentFormProps {
  clubId?: number; // Optional: for club-specific tournaments
  initialData?: {
    id?: number;
    name: string;
    description?: string | null;
    startDate: string;
    endDate?: string | null;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    pointsPerGoalScored: number;
    pointsPerGoalConceded: number;
    pointSystemTemplateId?: number | null;
  };
  mode: 'create' | 'edit';
}

interface FormErrors {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  pointsPerWin?: string;
  pointsPerDraw?: string;
  pointsPerLoss?: string;
  pointsPerGoalScored?: string;
  pointsPerGoalConceded?: string;
  submit?: string;
}

export function TournamentForm({ clubId, initialData, mode }: TournamentFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [templates, setTemplates] = useState<PointSystemTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [useCustomConfig, setUseCustomConfig] = useState(!initialData?.pointSystemTemplateId);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    startDate: initialData?.startDate ? initialData.startDate.split('T')[0] : '',
    endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : '',
    pointSystemTemplateId: initialData?.pointSystemTemplateId || null,
    pointsPerWin: initialData?.pointsPerWin ?? 3,
    pointsPerDraw: initialData?.pointsPerDraw ?? 1,
    pointsPerLoss: initialData?.pointsPerLoss ?? 0,
    pointsPerGoalScored: initialData?.pointsPerGoalScored ?? 0,
    pointsPerGoalConceded: initialData?.pointsPerGoalConceded ?? 0,
  });

  // Fetch available templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/point-systems');
        if (response.ok) {
          const data = await response.json();
          setTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Failed to fetch point system templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  const validateForm = (): boolean => {
    try {
      tournamentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path as keyof FormErrors] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Determine the correct API endpoint based on whether this is a club-specific tournament
      const url = mode === 'create' 
        ? (clubId ? `/api/clubs/${clubId}/tournaments` : '/api/tournaments')
        : (clubId ? `/api/clubs/${clubId}/tournaments/${initialData?.id}` : `/api/tournaments/${initialData?.id}`);
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
          pointSystemTemplateId: useCustomConfig ? null : formData.pointSystemTemplateId,
          pointsPerWin: formData.pointsPerWin,
          pointsPerDraw: formData.pointsPerDraw,
          pointsPerLoss: formData.pointsPerLoss,
          pointsPerGoalScored: formData.pointsPerGoalScored,
          pointsPerGoalConceded: formData.pointsPerGoalConceded,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setErrors({ submit: data.error || 'An error occurred' });
        }
        showToast(data.error || 'Failed to save tournament', 'error');
        return;
      }

      // Success
      showToast(
        mode === 'create' ? 'Tournament created successfully' : 'Tournament updated successfully',
        'success'
      );
      
      if (mode === 'create') {
        // Redirect based on whether this is a club-specific tournament
        if (clubId) {
          router.push(`/dashboard/clubs/${clubId}/tournaments`);
        } else {
          router.push('/dashboard/tournaments');
        }
      } else {
        // Redirect to the appropriate tournament details page
        if (clubId) {
          router.push(`/dashboard/clubs/${clubId}/tournaments/${initialData?.id}`);
        } else {
          router.push(`/dashboard/tournaments/${initialData?.id}`);
        }
      }
      router.refresh();
    } catch (error) {
      // Handle network errors specifically
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      showToast(errorMessage, 'error');
      console.error('Tournament form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'edit' && initialData?.id) {
      // Redirect to the appropriate tournament details page
      if (clubId) {
        router.push(`/dashboard/clubs/${clubId}/tournaments/${initialData.id}`);
      } else {
        router.push(`/dashboard/tournaments/${initialData.id}`);
      }
    } else {
      // Redirect to the appropriate tournament list page
      if (clubId) {
        router.push(`/dashboard/clubs/${clubId}/tournaments`);
      } else {
        router.push('/dashboard/tournaments');
      }
    }
  };

  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(numValue)) {
      setFormData({ ...formData, [field]: numValue });
      // Clear error for this field when user makes changes
      if (errors[field as keyof FormErrors]) {
        setErrors({ ...errors, [field]: undefined });
      }
    }
  };

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field when user makes changes
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'custom') {
      setUseCustomConfig(true);
      setFormData({ ...formData, pointSystemTemplateId: null });
    } else {
      const selectedTemplate = templates.find(t => t.id === parseInt(templateId));
      if (selectedTemplate) {
        setUseCustomConfig(false);
        setFormData({
          ...formData,
          pointSystemTemplateId: selectedTemplate.id,
          pointsPerWin: selectedTemplate.pointsPerWin,
          pointsPerDraw: selectedTemplate.pointsPerDraw,
          pointsPerLoss: selectedTemplate.pointsPerLoss,
          pointsPerGoalScored: selectedTemplate.pointsPerGoalScored,
          pointsPerGoalConceded: selectedTemplate.pointsPerGoalConceded,
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label={`${mode === 'create' ? 'Create' : 'Edit'} tournament form`}>
      <Input
        label="Tournament Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter tournament name"
        required
      />

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
          rows={4}
          placeholder="Enter tournament description (optional)"
          aria-describedby={errors.description ? "description-error" : undefined}
          aria-invalid={errors.description ? "true" : "false"}
        />
        {errors.description && (
          <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">{errors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          value={formData.startDate}
          onChange={(e) => handleFieldChange('startDate', e.target.value)}
          error={errors.startDate}
          required
        />

        <Input
          label="End Date"
          type="date"
          value={formData.endDate}
          onChange={(e) => handleFieldChange('endDate', e.target.value)}
          error={errors.endDate}
          helperText="Optional"
        />
      </div>

      <fieldset className="border-t pt-6">
        <legend className="text-lg font-medium text-gray-900 mb-4">Point System Configuration</legend>
        <p className="text-sm text-gray-600 mb-4">
          Configure how points are awarded for match outcomes and goals
        </p>

        {/* Template Selection */}
        <div className="mb-6">
          <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
            Point System Template
          </label>
          {loadingTemplates ? (
            <div className="text-sm text-gray-500">Loading templates...</div>
          ) : (
            <select
              id="template-select"
              value={useCustomConfig ? 'custom' : (formData.pointSystemTemplateId?.toString() || 'custom')}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
            >
              <option value="custom">Use custom configuration</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {useCustomConfig 
              ? 'Configure point values manually below' 
              : 'Using a template will automatically set the point values'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Points Per Win"
            type="number"
            min="0"
            value={formData.pointsPerWin.toString()}
            onChange={(e) => handleNumberChange('pointsPerWin', e.target.value)}
            error={errors.pointsPerWin}
            disabled={!useCustomConfig}
            required
          />

          <Input
            label="Points Per Draw"
            type="number"
            min="0"
            value={formData.pointsPerDraw.toString()}
            onChange={(e) => handleNumberChange('pointsPerDraw', e.target.value)}
            error={errors.pointsPerDraw}
            disabled={!useCustomConfig}
            required
          />

          <Input
            label="Points Per Loss"
            type="number"
            min="0"
            value={formData.pointsPerLoss.toString()}
            onChange={(e) => handleNumberChange('pointsPerLoss', e.target.value)}
            error={errors.pointsPerLoss}
            disabled={!useCustomConfig}
            required
          />

          <Input
            label="Points Per Goal Scored"
            type="number"
            min="0"
            value={formData.pointsPerGoalScored.toString()}
            onChange={(e) => handleNumberChange('pointsPerGoalScored', e.target.value)}
            error={errors.pointsPerGoalScored}
            disabled={!useCustomConfig}
            required
          />

          <Input
            label="Points Per Goal Conceded"
            type="number"
            min="0"
            value={formData.pointsPerGoalConceded.toString()}
            onChange={(e) => handleNumberChange('pointsPerGoalConceded', e.target.value)}
            error={errors.pointsPerGoalConceded}
            disabled={!useCustomConfig}
            required
          />
        </div>
      </fieldset>

      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {mode === 'create' ? 'Create Tournament' : 'Update Tournament'}
        </Button>
      </div>
    </form>
  );
}
