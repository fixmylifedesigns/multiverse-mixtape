// src/components/ShippingForm.js
"use client";

import { useState } from "react";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  // Add more countries as needed
];

export default function ShippingForm({ onSubmit, onBack, isProcessing }) {
  const [country, setCountry] = useState("US");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!country) {
      setError("Please select a country");
      return;
    }
    onSubmit({ country });
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select your country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
          >
            Back to Cart
          </button>
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isProcessing ? "Processing..." : "Continue to Checkout"}
          </button>
        </div>
      </form>
    </div>
  );
}
