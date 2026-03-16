"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Transfer {
  id: number;
  playerId: number;
  fromClubId: number | null;
  toClubId: number | null;
  transferDate: Date;
  notes: string | null;
  player: {
    name: string;
    email: string;
  };
  fromClub: {
    name: string;
  } | null;
  toClub: {
    name: string;
  } | null;
}

interface TransfersListProps {
  transfers: Transfer[];
}

export default function TransfersList({ transfers }: TransfersListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEditClick = (transfer: Transfer) => {
    setEditingId(transfer.id);
    setEditDate(new Date(transfer.transferDate).toISOString().split('T')[0]);
  };

  const handleSave = async (transferId: number) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/transfers/${transferId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transferDate: editDate }),
      });

      if (!response.ok) {
        throw new Error("Failed to update transfer date");
      }

      setEditingId(null);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditDate("");
  };

  if (transfers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transfers Yet</h3>
        <p className="text-gray-600 mb-6">Record your first player transfer</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Player
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              From
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              →
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              To
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Notes
            </th>
            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {transfer.player.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transfer.player.name}</p>
                    <p className="text-sm text-gray-500">{transfer.player.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                {transfer.fromClub ? (
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-700 rounded-full">
                    {transfer.fromClub.name}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                    Free Agent
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </td>
              <td className="px-6 py-4">
                {transfer.toClub ? (
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
                    {transfer.toClub.name}
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-sm font-medium bg-orange-100 text-orange-700 rounded-full">
                    Free Agent
                  </span>
                )}
              </td>
              <td className="px-6 py-4">
                {editingId === transfer.id ? (
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-2 py-1 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {new Date(transfer.transferDate).toLocaleDateString()}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 max-w-xs truncate">
                  {transfer.notes || "-"}
                </p>
              </td>
              <td className="px-6 py-4">
                {editingId === transfer.id ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleSave(transfer.id)}
                      disabled={saving}
                      className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                      title="Save"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEditClick(transfer)}
                    className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors mx-auto block"
                    title="Edit date"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
