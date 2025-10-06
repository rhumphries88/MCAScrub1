import { DocumentAnalyzer } from './components/DocumentAnalyzer';
import { Header } from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 md:px-6 lg:px-8 max-w-7xl">
        <DocumentAnalyzer />
      </main>
    </div>
  );
}

export default App;