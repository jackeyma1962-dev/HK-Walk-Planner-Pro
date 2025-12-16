import React, { useState } from 'react';
import RoutePlannerUI from './components/RoutePlannerUI';
import MapDisplay from './components/MapDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { getWalkingRoutes } from './services/geminiService';
import type { Route } from './types';

function App() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [restInterval, setRestInterval] = useState(1.5); // Default 1.5km
  
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleCalculate = async () => {
    if (!start || !end) {
      setError('請輸入起點和終點。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setRoutes(null);

    try {
      const calculatedRoutes = await getWalkingRoutes(start, end, restInterval);
      setRoutes(calculatedRoutes);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('發生未知錯誤。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex flex-row h-screen w-screen font-sans bg-gray-800">
      <RoutePlannerUI 
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        restInterval={restInterval}
        setRestInterval={setRestInterval}
        handleCalculate={handleCalculate}
        isLoading={isLoading}
        error={error}
        routes={routes}
        routesFound={!!routes && routes.length > 0}
      />
      <div className="flex-1 h-full">
        <MapDisplay routes={routes} />
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[1001] flex items-center justify-center">
            <LoadingSpinner />
        </div>
      )}
    </main>
  );
}

export default App;