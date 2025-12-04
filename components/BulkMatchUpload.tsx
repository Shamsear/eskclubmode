'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './ui/Toast';

interface Participant {
  id: number;
  name: string;
}

interface BulkMatchUploadProps {
  tournamentId: number;
  participants: Participant[];
}

interface ParsedMatch {
  playerAName: string;
  playerBName: string;
  playerAGoals: number;
  playerBGoals: number;
  matchDate: string;
  walkover?: string; // 'normal', 'both', playerName
}

interface FormMatch extends ParsedMatch {
  id: number;
  playerAId: number;
  playerBId: number;
}

type UploadMode = 'form' | 'csv';

export function BulkMatchUpload({ tournamentId, participants }: BulkMatchUploadProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [mode, setMode] = useState<UploadMode>('form');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ParsedMatch[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  
  // Form mode state
  const today = new Date().toISOString().split('T')[0];
  const [formMatches, setFormMatches] = useState<FormMatch[]>([
    { id: 1, playerAId: 0, playerBId: 0, playerAName: '', playerBName: '', playerAGoals: 0, playerBGoals: 0, matchDate: today, walkover: 'normal' }
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showToast('Please select a CSV file', 'error');
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      setErrors(['CSV file must contain at least a header row and one data row']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['playera', 'playerb', 'playeragoals', 'playerbgoals', 'matchdate'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      setErrors([`Missing required columns: ${missingHeaders.join(', ')}. Optional: walkover`]);
      return;
    }

    const matches: ParsedMatch[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const match: ParsedMatch = {
        playerAName: '',
        playerBName: '',
        playerAGoals: 0,
        playerBGoals: 0,
        matchDate: '',
        walkover: 'normal',
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        switch (header) {
          case 'playera':
            match.playerAName = value;
            break;
          case 'playerb':
            match.playerBName = value;
            break;
          case 'playeragoals':
            match.playerAGoals = parseInt(value) || 0;
            break;
          case 'playerbgoals':
            match.playerBGoals = parseInt(value) || 0;
            break;
          case 'matchdate':
            match.matchDate = value;
            break;
          case 'walkover':
            match.walkover = value.toLowerCase() || 'normal';
            break;
        }
      });

      if (!match.playerAName || !match.playerBName) {
        parseErrors.push(`Row ${i + 1}: Player names are required`);
      } else if (!match.matchDate) {
        parseErrors.push(`Row ${i + 1}: Match date is required`);
      } else {
        matches.push(match);
      }
    }

    setPreview(matches);
    setErrors(parseErrors);
  };

  const handleUpload = async () => {
    if (preview.length === 0) {
      showToast('No valid matches to upload', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: preview }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to upload matches', 'error');
        return;
      }

      showToast(
        `Successfully added ${data.added} match(es). ${data.skipped || 0} skipped.`,
        'success'
      );
      
      router.push(`/dashboard/tournaments/${tournamentId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const playerNames = participants.map(p => p.name).slice(0, 4);
    const template = `playerA,playerB,playerAGoals,playerBGoals,matchDate,walkover
${playerNames[0] || 'Player 1'},${playerNames[1] || 'Player 2'},3,1,2024-01-15,normal
${playerNames[2] || 'Player 3'},${playerNames[3] || 'Player 4'},2,2,2024-01-16,normal
${playerNames[0] || 'Player 1'},${playerNames[2] || 'Player 3'},0,0,2024-01-17,${playerNames[0] || 'Player 1'}
${playerNames[1] || 'Player 2'},${playerNames[3] || 'Player 4'},0,0,2024-01-18,both

Instructions:
- playerA and playerB must match participant names exactly
- Goals must be non-negative integers
- matchDate format: YYYY-MM-DD
- walkover options:
  * normal (or empty) = regular match with goals
  * both = both players forfeited (no points)
  * player name = that player won by walkover

Available Participants:
${participants.map(p => p.name).join(', ')}`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matches_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Form mode handlers
  const addFormMatch = () => {
    const newId = Math.max(...formMatches.map(m => m.id), 0) + 1;
    setFormMatches([...formMatches, { 
      id: newId, 
      playerAId: 0, 
      playerBId: 0, 
      playerAName: '', 
      playerBName: '', 
      playerAGoals: 0, 
      playerBGoals: 0, 
      matchDate: today,
      walkover: 'normal'
    }]);
  };

  const removeFormMatch = (id: number) => {
    if (formMatches.length > 1) {
      setFormMatches(formMatches.filter(m => m.id !== id));
    }
  };

  const updateFormMatch = (id: number, field: keyof FormMatch, value: any) => {
    setFormMatches(formMatches.map(match => {
      if (match.id === id) {
        const updated = { ...match, [field]: value };
        
        // Auto-populate names when IDs change
        if (field === 'playerAId') {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerAName = participant?.name || '';
        } else if (field === 'playerBId') {
          const participant = participants.find(p => p.id === Number(value));
          updated.playerBName = participant?.name || '';
        }
        
        return updated;
      }
      return match;
    }));
  };

  const handleFormSubmit = async () => {
    // Validate form matches
    const validationErrors: string[] = [];
    formMatches.forEach((match, index) => {
      if (!match.playerAId || match.playerAId === 0) {
        validationErrors.push(`Match ${index + 1}: Player A is required`);
      }
      if (!match.playerBId || match.playerBId === 0) {
        validationErrors.push(`Match ${index + 1}: Player B is required`);
      }
      if (match.playerAId === match.playerBId && match.playerAId !== 0) {
        validationErrors.push(`Match ${index + 1}: Players must be different`);
      }
      if (!match.matchDate) {
        validationErrors.push(`Match ${index + 1}: Match date is required`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsUploading(true);

    try {
      const matchesData = formMatches.map(match => ({
        playerAName: match.playerAName,
        playerBName: match.playerBName,
        playerAGoals: match.playerAGoals,
        playerBGoals: match.playerBGoals,
        matchDate: match.matchDate,
        walkover: match.walkover || 'normal',
      }));

      const response = await fetch(`/api/tournaments/${tournamentId}/matches/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches: matchesData }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to upload matches', 'error');
        return;
      }

      showToast(
        `Successfully added ${data.added} match(es). ${data.skipped || 0} skipped.`,
        'success'
      );
      
      router.push(`/dashboard/tournaments/${tournamentId}`);
      router.refresh();
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Method</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('form')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              mode === 'form'
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${
              mode === 'form' ? 'text-violet-700' : 'text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Form Entry</span>
            </div>
            <p className={`text-xs mt-1 ${
              mode === 'form' ? 'text-violet-600' : 'text-gray-500'
            }`}>Add matches one by one</p>
          </button>
          <button
            onClick={() => setMode('csv')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
              mode === 'csv'
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`flex items-center justify-center gap-2 ${
              mode === 'csv' ? 'text-violet-700' : 'text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="font-medium">CSV Upload</span>
            </div>
            <p className={`text-xs mt-1 ${
              mode === 'csv' ? 'text-violet-600' : 'text-gray-500'
            }`}>Upload multiple matches at once</p>
          </button>
        </div>
      </div>

      {/* Form Mode */}
      {mode === 'form' && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Match Details</h2>
              <button
                onClick={addFormMatch}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Match
              </button>
            </div>

            <div className="space-y-4">
              {formMatches.map((match, index) => (
                <div key={match.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Match {index + 1}</h3>
                    {formMatches.length > 1 && (
                      <button
                        onClick={() => removeFormMatch(match.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Player A */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player A
                      </label>
                      <select
                        value={match.playerAId}
                        onChange={(e) => updateFormMatch(match.id, 'playerAId', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value={0}>Select Player A</option>
                        {participants
                          .filter(p => p.id !== match.playerBId)
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* Player B */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player B
                      </label>
                      <select
                        value={match.playerBId}
                        onChange={(e) => updateFormMatch(match.id, 'playerBId', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value={0}>Select Player B</option>
                        {participants
                          .filter(p => p.id !== match.playerAId)
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* Player A Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player A Goals
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={match.playerAGoals}
                        onChange={(e) => updateFormMatch(match.id, 'playerAGoals', Number(e.target.value))}
                        disabled={match.walkover !== 'normal'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {match.walkover !== 'normal' && (
                        <p className="mt-1 text-xs text-gray-500">Goals not recorded for walkover</p>
                      )}
                    </div>

                    {/* Player B Goals */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Player B Goals
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={match.playerBGoals}
                        onChange={(e) => updateFormMatch(match.id, 'playerBGoals', Number(e.target.value))}
                        disabled={match.walkover !== 'normal'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      />
                      {match.walkover !== 'normal' && (
                        <p className="mt-1 text-xs text-gray-500">Goals not recorded for walkover</p>
                      )}
                    </div>

                    {/* Walkover */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Walkover / Forfeit
                      </label>
                      <select
                        value={match.walkover || 'normal'}
                        onChange={(e) => {
                          updateFormMatch(match.id, 'walkover', e.target.value);
                          // Reset goals when walkover is selected
                          if (e.target.value !== 'normal') {
                            updateFormMatch(match.id, 'playerAGoals', 0);
                            updateFormMatch(match.id, 'playerBGoals', 0);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="normal">Normal Match (no walkover)</option>
                        <option value="both">Both Players Forfeited</option>
                        {match.playerAName && (
                          <option value={match.playerAName}>{match.playerAName} Won by Walkover</option>
                        )}
                        {match.playerBName && (
                          <option value={match.playerBName}>{match.playerBName} Won by Walkover</option>
                        )}
                      </select>
                      {match.walkover && match.walkover !== 'normal' && (
                        <p className="mt-1 text-sm text-orange-600">
                          {match.walkover === 'both' 
                            ? '⚠️ Both players forfeited - no points will be awarded'
                            : `✓ ${match.walkover} wins by walkover`
                          }
                        </p>
                      )}
                    </div>

                    {/* Match Date */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Match Date
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={match.matchDate}
                          onChange={(e) => updateFormMatch(match.id, 'matchDate', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-900"
                        />
                        <button
                          type="button"
                          onClick={() => updateFormMatch(match.id, 'matchDate', today)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Today
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Match Outcome Display */}
                  {match.playerAId !== 0 && match.playerBId !== 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Match Outcome:</span>
                        <div className="flex items-center gap-2">
                          {match.walkover === 'both' ? (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                              Both Forfeited
                            </span>
                          ) : match.walkover === match.playerAName ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerAName} Wins (Walkover)
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerBName} Loses (Forfeit)
                              </span>
                            </>
                          ) : match.walkover === match.playerBName ? (
                            <>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerAName} Loses (Forfeit)
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerBName} Wins (Walkover)
                              </span>
                            </>
                          ) : match.playerAGoals > match.playerBGoals ? (
                            <>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerAName} Wins
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerBName} Loses
                              </span>
                            </>
                          ) : match.playerBGoals > match.playerAGoals ? (
                            <>
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                {match.playerAName} Loses
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {match.playerBName} Wins
                              </span>
                            </>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                              Draw
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Validation Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Form Submit */}
          <div className="flex justify-end">
            <button
              onClick={handleFormSubmit}
              disabled={isUploading}
              className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Matches
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* CSV Mode */}
      {mode === 'csv' && (
        <>
          {/* Instructions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Download the CSV template</li>
              <li>Fill in match details (playerA, playerB, playerAGoals, playerBGoals, matchDate are required)</li>
              <li>Player names must match tournament participants exactly</li>
              <li>Goals must be non-negative integers</li>
              <li>Date format: YYYY-MM-DD</li>
              <li>Walkover column (optional): &quot;normal&quot;, &quot;both&quot;, or player name</li>
              <li>Upload the CSV file and review the preview</li>
              <li>Click &quot;Upload Matches&quot; to add them to the tournament</li>
            </ol>
            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download CSV Template
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none p-2"
              />
              {file && (
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {file.name}
                </span>
              )}
            </div>
          </div>

          {/* CSV Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Errors</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Preview ({preview.length} matches)
                </h2>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || errors.length > 0}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Matches
                    </>
                  )}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player A</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player B</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outcome</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((match, index) => {
                      const isPlayerAWinner = match.playerAGoals > match.playerBGoals;
                      const isPlayerBWinner = match.playerBGoals > match.playerAGoals;
                      const isDraw = match.playerAGoals === match.playerBGoals;
                      
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{match.playerAName}</span>
                              {isPlayerAWinner && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Winner
                                </span>
                              )}
                              {isPlayerBWinner && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Loser
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{match.playerBName}</span>
                              {isPlayerBWinner && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                  Winner
                                </span>
                              )}
                              {isPlayerAWinner && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">
                                  Loser
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-medium">
                            {match.playerAGoals} - {match.playerBGoals}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {isDraw ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Draw
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Decisive
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{match.matchDate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
