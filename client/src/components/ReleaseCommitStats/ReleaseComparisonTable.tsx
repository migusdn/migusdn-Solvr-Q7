import React, { useState } from 'react';
import { ReleaseStats } from '../../types/releaseStats';

interface ReleaseComparisonTableProps {
  releases: ReleaseStats[];
  selectedRelease: string | null;
  onSelectRelease: (tagName: string | null) => void;
}

const ReleaseComparisonTable: React.FC<ReleaseComparisonTableProps> = ({
  releases,
  selectedRelease,
  onSelectRelease
}) => {
  const [sortField, setSortField] = useState<'date' | 'commits' | 'additions' | 'deletions' | 'files'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Handle sort click
  const handleSortClick = (field: 'date' | 'commits' | 'additions' | 'deletions' | 'files') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort releases
  const sortedReleases = [...releases].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'date':
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
      case 'commits':
        comparison = a.compareWithPrevious.totalCommits - b.compareWithPrevious.totalCommits;
        break;
      case 'additions':
        comparison = a.compareWithPrevious.totalAdditions - b.compareWithPrevious.totalAdditions;
        break;
      case 'deletions':
        comparison = a.compareWithPrevious.totalDeletions - b.compareWithPrevious.totalDeletions;
        break;
      case 'files':
        comparison = a.compareWithPrevious.totalFilesChanged - b.compareWithPrevious.totalFilesChanged;
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render sort indicator
  const renderSortIndicator = (field: 'date' | 'commits' | 'additions' | 'deletions' | 'files') => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (releases.length === 0) {
    return <div className="text-center text-gray-500 p-4">No release data available</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th 
              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-2 cursor-pointer"
              onClick={() => handleSortClick('date')}
            >
              릴리즈 {renderSortIndicator('date')}
            </th>
            <th 
              className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-2 cursor-pointer"
              onClick={() => handleSortClick('commits')}
            >
              커밋 {renderSortIndicator('commits')}
            </th>
            <th 
              className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-2 cursor-pointer"
              onClick={() => handleSortClick('additions')}
            >
              추가 {renderSortIndicator('additions')}
            </th>
            <th 
              className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-2 cursor-pointer"
              onClick={() => handleSortClick('deletions')}
            >
              삭제 {renderSortIndicator('deletions')}
            </th>
            <th 
              className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-2 cursor-pointer"
              onClick={() => handleSortClick('files')}
            >
              파일 {renderSortIndicator('files')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {sortedReleases.map(release => (
            <tr 
              key={release.tagName}
              className={`hover:bg-gray-50 cursor-pointer ${selectedRelease === release.tagName ? 'bg-blue-50' : ''}`}
              onClick={() => onSelectRelease(release.tagName === selectedRelease ? null : release.tagName)}
            >
              <td className="py-2 px-2">
                <div className="font-medium">{release.name}</div>
                <div className="text-xs text-gray-500">
                  {release.tagName} • {formatDate(release.publishedAt)}
                </div>
              </td>
              <td className="text-right py-2 px-2">
                {release.compareWithPrevious.totalCommits}
              </td>
              <td className="text-right py-2 px-2 text-green-600">
                +{release.compareWithPrevious.totalAdditions.toLocaleString()}
              </td>
              <td className="text-right py-2 px-2 text-red-600">
                -{release.compareWithPrevious.totalDeletions.toLocaleString()}
              </td>
              <td className="text-right py-2 px-2">
                {release.compareWithPrevious.totalFilesChanged}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReleaseComparisonTable;