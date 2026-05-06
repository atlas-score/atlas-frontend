import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ExplorerPage } from './pages/ExplorerPage';
import { TheoryPage } from './pages/TheoryPage';

const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ExplorerPage />} />
        <Route path=":id" element={<TheoryPage />} />
        <Route
          path="about"
          element={
            <Suspense
              fallback={
                <div className="mx-auto max-w-3xl px-4 py-16 text-atlas-muted">
                  Loading…
                </div>
              }
            >
              <AboutPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
