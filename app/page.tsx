'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FormData {
  building_type: string;
  square_footage: number;
  number_of_occupants: number;
  appliances_used: number;
}

interface PredictionResult {
  energy_consumption: number;
  unit?: string;
  factors?: {
    building_type?: number;
    square_footage?: number;
    number_of_occupants?: number;
    appliances_used?: number;
  };
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    building_type: 'Residential',
    square_footage: 250,
    number_of_occupants: 4,
    appliances_used: 20,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'building_type' ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      console.log('Frontend received prediction data:', data);
      console.log('Factors:', data.factors);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFactorData = () => {
    if (!result?.factors) return [];

    const factors = [
      { name: 'Building Type', value: result.factors.building_type || 0 },
      { name: 'Square Footage', value: result.factors.square_footage|| 0 },
      { name: 'Occupants', value: result.factors.number_of_occupants || 0 },
      { name: 'Appliances', value: result.factors.appliances_used || 0 },
    ];

    console.log('Chart data:', factors);
    return factors;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Energy Consumption Predictor</h1>
          <Link
            href="/dataset"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            View Dataset
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Prediction Form</h2>
            <p className="text-gray-600 mb-6">Enter building details to predict energy usage</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Building Type */}
          <div>
            <label htmlFor="building_type" className="block text-sm font-medium text-gray-700 mb-1">
              Building Type
            </label>
            <select
              id="building_type"
              name="building_type"
              value={formData.building_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
            </select>
          </div>

          {/* Square Footage */}
          <div>
            <label htmlFor="square_footage" className="block text-sm font-medium text-gray-700 mb-1">
              Square Footage
            </label>
            <input
              type="number"
              id="square_footage"
              name="square_footage"
              value={formData.square_footage}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Number of Occupants */}
          <div>
            <label htmlFor="number_of_occupants" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Occupants
            </label>
            <input
              type="number"
              id="number_of_occupants"
              name="number_of_occupants"
              value={formData.number_of_occupants}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Appliances Used */}
          <div>
            <label htmlFor="appliances_used" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Appliances
            </label>
            <input
              type="number"
              id="appliances_used"
              name="appliances_used"
              value={formData.appliances_used}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {loading ? 'Predicting...' : 'Predict Energy Consumption'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

            {/* Result */}
            {result && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-gray-600 mb-1">Predicted Monthly Energy Consumption:</p>
                <p className="text-3xl font-bold text-green-700">
                  {(result.energy_consumption/4).toFixed(2)}
                  <span className="text-lg ml-2">{result.unit || 'kWh'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Prediction Result Card */}
            {result && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Prediction Results</h2>

                {/* Main Result */}
                <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                  <p className="text-gray-600 text-sm mb-2">Predicted Monthly Energy Consumption</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-green-700">
                      {(result.energy_consumption/4).toFixed(2)}
                    </span>
                    <span className="text-xl text-gray-700">{result.unit || 'kWh'}</span>
                  </div>
                </div>

                {/* Factor Contribution Chart */}
                {getFactorData().length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Factor Contributions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getFactorData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Contribution (kWh)" />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-gray-600 mt-4">
                      This chart shows how each input factor contributes to the total energy consumption prediction.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No Result Placeholder */}
            {!result && !loading && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Submit the form to see results</h3>
                <p className="text-gray-600">The prediction results and factor analysis will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
