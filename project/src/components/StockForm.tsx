import React, { useState, useEffect } from 'react';
import type { Stock } from '../types';

interface StockFormProps {
  stock?: Stock | null;
  onSubmit: (stockData: Partial<Stock>) => void;
  onCancel: () => void;
}

export function StockForm({ stock, onSubmit, onCancel }: StockFormProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '1',
    purchase_price: '0',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol,
        name: stock.name,
        quantity: stock.quantity.toString(),
        purchase_price: stock.purchase_price.toString(),
      });
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate the form
      if (!formData.symbol.trim()) {
        setError('Symbol is required');
        return;
      }
      if (!formData.name.trim()) {
        setError('Company name is required');
        return;
      }

      const quantity = parseInt(formData.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        setError('Quantity must be a positive number');
        return;
      }

      const purchasePrice = parseFloat(formData.purchase_price);
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        setError('Purchase price must be a positive number');
        return;
      }

      // Submit the form with properly parsed numeric values
      await onSubmit({
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        quantity: quantity,
        purchase_price: purchasePrice,
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300">
            Symbol *
          </label>
          <input
            type="text"
            id="symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            required
            placeholder="e.g., AAPL"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            required
            placeholder="e.g., Apple Inc."
          />
        </div>

        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            min="1"
            step="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            required
            placeholder="Number of shares"
          />
        </div>

        <div>
          <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-300">
            Purchase Price ($) *
          </label>
          <input
            type="number"
            id="purchase_price"
            min="0.01"
            step="0.01"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
            className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            required
            placeholder="Price per share"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {stock ? 'Update Stock' : 'Add Stock'}
        </button>
      </div>
    </form>
  );
}