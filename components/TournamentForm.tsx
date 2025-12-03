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
    <form onSubmit={handleSubmit} className="space-y-8" aria-label={`${mode === 'create' ? 'Create' : 'Edit'} tournament form`}>
      {/* Basic Information Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-500">Tournament name, description, and schedule</p>
          </div>
        </div>

        <Input
          label="Tournament Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          error={errors.name}
          placeholder="e.g., Summer Championship 2024"
          required
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors text-base resize-none"
            rows={4}
            placeholder="Describe the tournament, its format, and any special rules..."
            aria-describedby={errors.description ? "description-error" : undefined}
            aria-invalid={errors.description ? "true" : "false"}
          />
          {errors.description && (
            <p id="description-error" className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => handleFieldChange('startDate', e.target.value)}
              error={errors.startDate}
              required
            />
          </div>

          <div>
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => handleFieldChange('endDate', e.target.value)}
              error={errors.endDate}
              helperText="Leave empty for ongoing tournaments"
            />
          </div>
        </div>
      </div>

      {/* Point System Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Point System</h2>
            <p className="text-sm text-gray-500">Configure scoring rules for matches and goals</p>
          </div>
        </div>

        {/* Template Selection */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <label htmlFor="template-select" className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Choose a Template
          </label>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Loading templates...
            </div>
          ) : (
            <>
              <select
                id="template-select"
                value={useCustomConfig ? 'custom' : (formData.pointSystemTemplateId?.toString() || 'custom')}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="block w-full px-4 py-3 border border-blue-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base bg-white"
              >
                <option value="custom">✨ Custom Configuration</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    📋 {template.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-blue-700 flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>
                  {useCustomConfig 
                    ? 'You can manually configure point values below' 
                    : 'Template values are applied automatically. Switch to custom to modify.'}
                </span>
              </p>
            </>
          )}
        </div>
        
        {/* Point Configuration Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
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
            {!useCustomConfig && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Template
                </span>
              </div>
            )}
          </div>

          <div className="relative">
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
            {!useCustomConfig && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Template
                </span>
              </div>
            )}
          </div>

          <div className="relative">
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
            {!useCustomConfig && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Template
                </span>
              </div>
            )}
          </div>

          <div className="relative">
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
            {!useCustomConfig && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Template
                </span>
              </div>
            )}
          </div>

          <div className="relative">
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
            {!useCustomConfig && (
              <div className="absolute top-0 right-0 mt-1 mr-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Template
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {errors.submit && (
        <ErrorMessage
          title="Submission Error"
          message={errors.submit}
          onDismiss={() => setErrors({ ...errors, submit: undefined })}
        />
      )}

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200">
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
          {mode === 'create' ? (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Tournament
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Update Tournament
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
