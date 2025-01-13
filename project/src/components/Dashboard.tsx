import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import type { Stock, PortfolioMetrics } from '../types';

interface DashboardProps {
  stocks: Stock[];
  metrics: PortfolioMetrics;
}

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];

export function Dashboard({ stocks, metrics }: DashboardProps) {
  const pieData = stocks.map(stock => ({
    name: stock.symbol,
    value: stock.current_price * stock.quantity,
  }));

  const lineData = stocks.map(stock => ({
    name: stock.symbol,
    value: stock.current_price * stock.quantity,
    price: stock.current_price,
    gain: ((stock.current_price - stock.purchase_price) / stock.purchase_price * 100).toFixed(2),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-4 rounded-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-indigo-300">
            Value: ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-300">
            Price: ${payload[0].payload.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className={payload[0].payload.gain >= 0 ? "text-emerald-400" : "text-red-400"}>
            {payload[0].payload.gain}% change
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-4 rounded-lg">
          <p className="text-white font-medium">{payload[0].name}</p>
          <p className="text-indigo-300">
            ${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-gray-300">
            {(payload[0].value / metrics.totalValue * 100).toFixed(2)}% of portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Existing metric cards remain the same */}
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Value</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${metrics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-indigo-900/50 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Gain/Loss</p>
              <p className={`text-2xl font-bold mt-1 ${
                metrics.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                ${Math.abs(metrics.totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${
              metrics.totalGainLoss >= 0 ? 'bg-emerald-900/50' : 'bg-red-900/50'
            }`}>
              {metrics.totalGainLoss >= 0 ? (
                <TrendingUp className="h-6 w-6 text-emerald-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Top Performer</p>
              {metrics.topPerformer ? (
                <>
                  <p className="text-lg font-semibold text-white mt-1">{metrics.topPerformer.symbol}</p>
                  <p className="text-sm text-emerald-400">
                    +${(metrics.topPerformer.current_price - metrics.topPerformer.purchase_price).toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-500 mt-1">No stocks yet</p>
              )}
            </div>
            <div className="bg-blue-900/50 p-3 rounded-lg">
              <Award className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Worst Performer</p>
              {metrics.worstPerformer ? (
                <>
                  <p className="text-lg font-semibold text-white mt-1">{metrics.worstPerformer.symbol}</p>
                  <p className="text-sm text-red-400">
                    ${(metrics.worstPerformer.current_price - metrics.worstPerformer.purchase_price).toFixed(2)}
                  </p>
                </>
              ) : (
                <p className="text-lg text-gray-500 mt-1">No stocks yet</p>
              )}
            </div>
            <div className="bg-amber-900/50 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Value Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#818CF8"
                  strokeWidth={2}
                  dot={{ fill: '#818CF8', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#818CF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-gray-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}