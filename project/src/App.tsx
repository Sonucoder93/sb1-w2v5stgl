import React, { useState, useEffect } from 'react';
import { Plus, LogIn, Menu, X } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { StockList } from './components/StockList';
import { StockForm } from './components/StockForm';
import type { Stock, PortfolioMetrics } from './types';

function SRLogo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg transform rotate-3 transition-transform group-hover:rotate-6"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg transform -rotate-3 transition-transform group-hover:-rotate-6"></div>
        <div className="relative flex items-center justify-center w-full h-full bg-black rounded-lg">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">SR</span>
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">StockRise</span>
    </div>
  );
}

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalGainLoss: 0,
    topPerformer: null,
    worstPerformer: null,
  });

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setIsAuthenticated(true);
        await fetchStocks();
      } else {
        setIsAuthenticated(false);
        setStocks([]);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsAuthenticated(true);
      await fetchStocks();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setAuthError('');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setAuthError('Check your email for the confirmation link');
    } catch (error: any) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const fetchStocks = async () => {
    try {
      const { data, error } = await supabase
        .from('stocks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        setStocks(data);
        updateMetrics(data);
      }
    } catch (error: any) {
      console.error('Error fetching stocks:', error.message);
    }
  };

  const updateMetrics = (stocksData: Stock[]) => {
    const totalValue = stocksData.reduce((sum, stock) => 
      sum + (stock.current_price * stock.quantity), 0);

    const totalGainLoss = stocksData.reduce((sum, stock) => 
      sum + ((stock.current_price - stock.purchase_price) * stock.quantity), 0);

    const sortedByPerformance = [...stocksData].sort((a, b) => {
      const aPerformance = (a.current_price - a.purchase_price) / a.purchase_price;
      const bPerformance = (b.current_price - b.purchase_price) / b.purchase_price;
      return bPerformance - aPerformance;
    });

    setMetrics({
      totalValue,
      totalGainLoss,
      topPerformer: sortedByPerformance[0] || null,
      worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] || null,
    });
  };

  const handleAddStock = async (stockData: Partial<Stock>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!stockData.symbol || !stockData.name || !stockData.quantity || !stockData.purchase_price) {
        throw new Error('All fields are required');
      }

      const newStock = {
        symbol: stockData.symbol.toUpperCase(),
        name: stockData.name,
        quantity: stockData.quantity,
        purchase_price: stockData.purchase_price,
        current_price: stockData.purchase_price, // Using purchase price as current price for demo
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('stocks')
        .insert([newStock])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      // Update local state with the new stock
      const updatedStocks = [data, ...stocks];
      setStocks(updatedStocks);
      updateMetrics(updatedStocks);
      setShowAddForm(false);
      setEditingStock(null);
    } catch (error: any) {
      console.error('Error adding stock:', error.message);
      throw error; // Re-throw the error to be caught by the form's error handler
    }
  };

  const handleDeleteStock = async (id: string) => {
    try {
      const { error } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedStocks = stocks.filter(stock => stock.id !== id);
      setStocks(updatedStocks);
      updateMetrics(updatedStocks);
    } catch (error: any) {
      console.error('Error deleting stock:', error.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-indigo-950 p-4">
        <div className="glass-effect rounded-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center justify-center mb-8">
            <SRLogo />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
              Welcome to StockRise
            </h2>
            <p className="mt-2 text-center text-sm text-gray-400">
              Your professional portfolio tracking solution
            </p>
          </div>
          
          {authError && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/50 border border-red-800 text-red-400 text-sm">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg bg-black/20 border border-gray-800 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                required
              />
            </div>

            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                className="w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={handleSignUp}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-indigo-950">
      <nav className="glass-effect border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <SRLogo />
            </div>
            
            <div className="hidden sm:flex items-center space-x-4">
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Stock</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>

            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-400 hover:text-white"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden glass-effect border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!showAddForm && (
                <button
                  onClick={() => {
                    setShowAddForm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add Stock</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <div className="glass-effect rounded-xl p-6 mb-8 animate-fade-in">
            <StockForm
              stock={editingStock}
              onSubmit={handleAddStock}
              onCancel={() => {
                setShowAddForm(false);
                setEditingStock(null);
              }}
            />
          </div>
        )}

        <Dashboard stocks={stocks} metrics={metrics} />
        <StockList
          stocks={stocks}
          onEdit={(stock) => {
            setEditingStock(stock);
            setShowAddForm(true);
          }}
          onDelete={handleDeleteStock}
        />
      </main>
    </div>
  );
}