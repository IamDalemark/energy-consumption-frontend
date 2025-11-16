'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DataRow {
  building_type: string;
  square_footage: number;
  number_of_occupants: number;
  appliances_used: number;
  energy_consumption: number;
}

interface DatasetResponse {
  data: DataRow[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function DatasetPage() {
  const [dataset, setDataset] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(100);
  const [selectedMetric, setSelectedMetric] = useState<'energy_consumption' | 'square_footage' | 'number_of_occupants' | 'appliances_used'>('energy_consumption');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchDataset = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dataset?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dataset');
      }

      const data: DatasetResponse = await response.json();
      setDataset(data.data);
      setTotalPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const getFilteredData = () => {
    if (filterType === 'all') return dataset;
    return dataset.filter(row => row.building_type === filterType);
  };

  const LineGraph = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    const width = 1000;
    const height = 500;
    const padding = { top: 40, right: 60, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const values = filteredData.map(row => row[selectedMetric]);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = filteredData.map((row, i) => {
      const x = padding.left + (i / (filteredData.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((row[selectedMetric] - minValue) / range) * chartHeight;
      return { x, y, value: row[selectedMetric], buildingType: row.building_type };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const metricLabels = {
      energy_consumption: 'Energy Consumption (kWh)',
      square_footage: 'Square Footage',
      number_of_occupants: 'Number of Occupants',
      appliances_used: 'Appliances Used',
    };

    const buildingTypeColors = {
      Residential: '#3B82F6',
      Commercial: '#10B981',
      Industrial: '#F59E0B',
    };

    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {metricLabels[selectedMetric]}
          </h2>
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} data points
            {filterType !== 'all' && ` for ${filterType} buildings`}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="mx-auto">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = padding.top + (chartHeight / 4) * i;
              const value = maxValue - (range / 4) * i;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-600"
                  >
                    {value.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + chartHeight}
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="#6366F1"
              strokeWidth="2"
              className="drop-shadow-sm"
            />

            {/* Data points */}
            {points.map((point, i) => (
              <g key={i}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={buildingTypeColors[point.buildingType as keyof typeof buildingTypeColors] || '#6366F1'}
                  className="hover:r-6 cursor-pointer"
                >
                  <title>{`${point.buildingType}: ${point.value.toFixed(2)}`}</title>
                </circle>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x={20}
              y={padding.top + chartHeight / 2}
              transform={`rotate(-90 20 ${padding.top + chartHeight / 2})`}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              {metricLabels[selectedMetric]}
            </text>

            {/* X-axis label */}
            <text
              x={padding.left + chartWidth / 2}
              y={height - 20}
              textAnchor="middle"
              className="text-sm font-semibold fill-gray-700"
            >
              Data Point Index
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
            <span className="text-sm text-gray-700">Residential</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-sm text-gray-700">Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-sm text-gray-700">Industrial</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Training Dataset Visualization</h1>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Back to Predictor
          </Link>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-2">
                Metric to Display:
              </label>
              <select
                id="metric"
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as typeof selectedMetric)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="energy_consumption">Energy Consumption</option>
                <option value="square_footage">Square Footage</option>
                <option value="number_of_occupants">Number of Occupants</option>
                <option value="appliances_used">Appliances Used</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Building Type Filter:
              </label>
              <select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                Data Points:
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-md transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 rounded-md transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Graph */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">Loading dataset...</p>
          </div>
        ) : dataset.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">No data available</p>
          </div>
        ) : (
          <LineGraph />
        )}
      </div>
    </div>
  );
}
