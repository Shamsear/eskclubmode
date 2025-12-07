'use client';

import { useState, ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

function FilterSection({ title, children, defaultExpanded = true }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const sectionId = `filter-section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
        type="button"
        aria-expanded={isExpanded}
        aria-controls={sectionId}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} filters`}
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div id={sectionId} className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200" role="group" aria-labelledby={`${sectionId}-label`}>
          <span id={`${sectionId}-label`} className="sr-only">{title} filter options</span>
          {children}
        </div>
      )}
    </div>
  );
}

export interface FilterConfig {
  [key: string]: string | string[] | number | boolean | undefined;
}

interface FilterPanelProps {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  filterSections?: Array<{
    id: string;
    title: string;
    type: 'checkbox' | 'radio' | 'range';
    options?: FilterOption[];
    min?: number;
    max?: number;
  }>;
  className?: string;
}

/**
 * FilterPanel component for multiple filters with AND logic
 * Implements Requirements 12.3 (AND logic for combining filters)
 * Implements Requirements 12.5 (active filter indicators with reset options)
 */
export function FilterPanel({
  filters,
  onFilterChange,
  filterSections = [],
  className = '',
}: FilterPanelProps) {
  const handleCheckboxChange = (sectionId: string, value: string) => {
    const currentValues = (filters[sectionId] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    
    onFilterChange({
      ...filters,
      [sectionId]: newValues.length > 0 ? newValues : undefined,
    });
  };

  const handleRadioChange = (sectionId: string, value: string) => {
    onFilterChange({
      ...filters,
      [sectionId]: value,
    });
  };

  const handleRangeChange = (sectionId: string, field: 'min' | 'max', value: string) => {
    const rangeKey = `${sectionId}_${field}`;
    onFilterChange({
      ...filters,
      [rangeKey]: value ? parseInt(value) : undefined,
    });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`} role="region" aria-label="Filter panel">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <h3 className="text-sm font-bold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full" role="status" aria-label={`${activeFilterCount} active filters`}>
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 min-h-[44px] min-w-[44px] lg:min-h-[32px] lg:min-w-[32px] justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg"
              aria-label="Clear all filters"
              type="button"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div>
        {filterSections.map((section) => (
          <FilterSection key={section.id} title={section.title}>
            {section.type === 'checkbox' && section.options && (
              <div className="space-y-2">
                {section.options.map((option) => {
                  const isChecked = ((filters[section.id] as string[]) || []).includes(option.value);
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(section.id, option.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {section.type === 'radio' && section.options && (
              <div className="space-y-2">
                {section.options.map((option) => {
                  const isChecked = filters[section.id] === option.value;
                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <input
                        type="radio"
                        checked={isChecked}
                        onChange={() => handleRadioChange(section.id, option.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                      {option.count !== undefined && (
                        <span className="text-xs text-gray-500">({option.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {section.type === 'range' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Min {section.min !== undefined && `(${section.min})`}
                  </label>
                  <input
                    type="number"
                    placeholder={section.min?.toString() || '0'}
                    value={(filters[`${section.id}_min`] as number) || ''}
                    onChange={(e) => handleRangeChange(section.id, 'min', e.target.value)}
                    min={section.min}
                    max={section.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max {section.max !== undefined && `(${section.max})`}
                  </label>
                  <input
                    type="number"
                    placeholder={section.max?.toString() || '∞'}
                    value={(filters[`${section.id}_max`] as number) || ''}
                    onChange={(e) => handleRangeChange(section.id, 'max', e.target.value)}
                    min={section.min}
                    max={section.max}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </FilterSection>
        ))}
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const section = filterSections.find((s) => 
                s.id === key || key.startsWith(`${s.id}_`)
              );
              
              if (!section) return null;

              if (Array.isArray(value)) {
                return value.map((v) => {
                  const option = section.options?.find((o) => o.value === v);
                  return (
                    <span
                      key={`${key}-${v}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-medium"
                    >
                      {option?.label || v}
                      <button
                        onClick={() => handleCheckboxChange(key, v)}
                        className="hover:text-primary-900"
                        aria-label={`Remove ${option?.label || v} filter`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                });
              }

              if (key.includes('_min') || key.includes('_max')) {
                const baseKey = key.replace(/_min|_max/, '');
                const minValue = filters[`${baseKey}_min`];
                const maxValue = filters[`${baseKey}_max`];
                
                if (key.endsWith('_min') && (minValue || maxValue)) {
                  return (
                    <span
                      key={baseKey}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                    >
                      {section.title}: {minValue || '0'} - {maxValue || '∞'}
                      <button
                        onClick={() => {
                          onFilterChange({
                            ...filters,
                            [`${baseKey}_min`]: undefined,
                            [`${baseKey}_max`]: undefined,
                          });
                        }}
                        className="hover:text-green-900"
                        aria-label={`Remove ${section.title} range filter`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  );
                }
                return null;
              }

              const option = section.options?.find((o) => o.value === value);
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                >
                  {option?.label || value}
                  <button
                    onClick={() => handleRadioChange(key, '')}
                    className="hover:text-purple-900"
                    aria-label={`Remove ${option?.label || value} filter`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
