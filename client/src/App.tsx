import { Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Superstore
        </h1>
        <p className="mt-2 text-muted-foreground">
          Production scaffold ready. Build begins.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* Routes will be added per feature phase */}
    </Routes>
  );
}
