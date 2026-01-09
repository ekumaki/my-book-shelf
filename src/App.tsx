import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import ShelfView from './features/shelf/ShelfView';
import SearchView from './features/search/SearchView';
import KnowledgeView from './features/knowledge/KnowledgeView';
import SettingsView from './features/settings/SettingsView';
import BookDetailsView from './features/book-details/BookDetailsView';
import ShelfManagerView from './features/shelves/ShelfManagerView';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ShelfView />} />
            <Route path="search" element={<SearchView />} />
            <Route path="knowledge" element={<KnowledgeView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="book/:id" element={<BookDetailsView />} />
            <Route path="shelves" element={<ShelfManagerView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

