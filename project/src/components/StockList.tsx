import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { Stock } from '../types';

interface StockListProps {
  stocks: Stock[];
  onEdit: (stock: Stock) => void;
  onDelete: (id: string) => void;
}

export function StockList({ stocks, onEdit, onDelete }: StockListProps) {
  return (
    <div className="glass-effect rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-black/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Purchase Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {stocks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                  No stocks in your portfolio yet. Add your first stock to get started!
                </td>
              </tr>
            ) : (
              stocks.map((stock) => {
                const gainLoss = (stock.current_price - stock.purchase_price) * stock.quantity;
                const gainLossPercentage = ((stock.current_price - stock.purchase_price) / stock.purchase_price) * 100;
                
                return (
                  <tr key={stock.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-white">{stock.symbol}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{stock.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {stock.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${stock.purchase_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${stock.current_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <div>${Math.abs(gainLoss).toFixed(2)}</div>
                        <div className="text-xs">
                          {gainLossPercentage >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onEdit(stock)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(stock.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}