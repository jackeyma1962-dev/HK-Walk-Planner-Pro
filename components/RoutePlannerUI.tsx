import React from 'react';
import type { Route } from '../types';

interface RoutePlannerUIProps {
  start: string;
  setStart: (value: string) => void;
  end: string;
  setEnd: (value: string) => void;
  restInterval: number;
  setRestInterval: (value: number) => void;
  handleCalculate: () => void;
  isLoading: boolean;
  error: string | null;
  routes: Route[] | null;
  routesFound: boolean;
}

const RoutePlannerUI: React.FC<RoutePlannerUIProps> = ({
  start,
  setStart,
  end,
  setEnd,
  restInterval,
  setRestInterval,
  handleCalculate,
  isLoading,
  error,
  routes,
  routesFound
}) => {
  const generateGoogleMapsUrl = (route: Route): string => {
    if (route.path.length < 2) return '#';

    const origin = `${route.path[0].lat},${route.path[0].lng}`;
    const destination = `${route.path[route.path.length - 1].lat},${route.path[route.path.length - 1].lng}`;
    
    const waypoints = route.restStops
        .map(stop => `${stop.location.lat},${stop.location.lng}`)
        .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    if (waypoints) {
        url += `&waypoints=${waypoints}`;
    }
    return url;
  };

  return (
    <div className="w-full md:w-[420px] shrink-0 md:h-full bg-black/80 text-white p-8 space-y-6 overflow-y-auto shadow-2xl z-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-50">香港智能步行路線</h1>
        <p className="text-gray-400 mt-1">規劃您的下一步旅程</p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border-l-4 border-red-500 text-red-200 p-4 rounded-lg" role="alert">
          <p className="font-bold">發生錯誤</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-5">
        <div>
          <label htmlFor="start" className="block text-sm font-medium text-gray-300 mb-1">起點</label>
          <input
            id="start"
            type="text"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            placeholder="例如：中環碼頭"
            className="w-full px-4 py-2 text-white bg-gray-700/50 border border-gray-500 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-medium text-gray-300 mb-1">終點</label>
          <input
            id="end"
            type="text"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            placeholder="例如：銅鑼灣維多利亞公園"
            className="w-full px-4 py-2 text-white bg-gray-700/50 border border-gray-500 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-300 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="rest-interval" className="block text-sm font-medium text-gray-300 mb-1">
            休息間隔: 每 <span className="font-bold text-blue-400">{restInterval.toFixed(1)}</span> 公里
          </label>
          <input
            id="rest-interval"
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={restInterval}
            onChange={(e) => setRestInterval(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !start || !end}
          className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-300 transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? '規劃中...' : '規劃路線'}
        </button>
      </form>

      {routes && routes.length > 0 && (
        <div className="border-t border-gray-700 pt-6 mt-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-100">建議路線</h2>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center"><div className="w-4 h-1.5 bg-cyan-500 rounded-full mr-2"></div><span>1</span></div>
                    <div className="flex items-center"><div className="w-4 h-1.5 bg-indigo-500 rounded-full mr-2"></div><span>2</span></div>
                </div>
            </div>

            {routes.map((route, index) => (
                <div key={index} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <h3 className={`font-bold text-lg ${index === 0 ? 'text-cyan-400' : 'text-indigo-400'}`}>路線 {index + 1}: {route.routeName}</h3>
                    <p className="text-sm text-gray-300 mb-4">總距離: {route.totalDistanceKm.toFixed(2)} 公里</p>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center">
                            <span className="bg-green-500 text-white text-xs font-bold mr-3 px-2.5 py-1 rounded-full">起點</span>
                        </div>
                        {route.restStops.map((stop, stopIndex) => (
                            <div key={stopIndex} className="pl-2">
                                <p className="text-gray-400 text-xs">↓ {stop.distanceFromPreviousKm.toFixed(2)} 公里</p>
                                <div className="flex items-center">
                                    <span className="bg-sky-500 text-white text-xs font-bold mr-3 px-2.5 py-1 rounded-full">休息</span>
                                    <span>{stop.name}</span>
                                </div>
                            </div>
                        ))}
                        <div className="pl-2">
                             <p className="text-gray-400 text-xs">↓ ...</p>
                             <div className="flex items-center">
                                <span className="bg-red-500 text-white text-xs font-bold mr-3 px-2.5 py-1 rounded-full">終點</span>
                            </div>
                        </div>
                    </div>

                    <a href={generateGoogleMapsUrl(route)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block w-full">
                        <button className="w-full bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300">
                            在 Google 地圖上檢視
                        </button>
                    </a>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default RoutePlannerUI;
