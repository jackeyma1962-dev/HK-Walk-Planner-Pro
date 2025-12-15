import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-400"></div>
        <p className="text-gray-50 text-lg font-semibold">正在為您規劃最佳路線...</p>
        <p className="text-sm text-gray-300">AI 正在思考中，這可能需要一點時間，請稍候。</p>
    </div>
  );
};

export default LoadingSpinner;
