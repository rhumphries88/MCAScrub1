import React from 'react';
import { FileBarChart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-8 py-6 flex items-center">
        <FileBarChart className="h-8 w-8 mr-3 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Financial Document Analyzer</h1>
      </div>
    </header>
  );
};