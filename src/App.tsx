import RankingList from './components/RankingList';
import './index.css'; // Imports global styles, including Tailwind setup

/**
 * The main application component.
 * This component acts as the primary container for the entire UniRank game.
 */
function App() {
  return (
    // Sets a clean background and full height for the application.
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      {/* Renders the core game component */}
      <RankingList />
    </div>
  )
}

export default App;