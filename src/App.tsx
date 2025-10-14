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
      <footer className="text-center text-sm text-gray-500 p-4">
        &copy; {new Date().getFullYear()} UniRankle. All rights reserved.
        <div>
          <a href="https://github.com/gseier" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Made by G Seier
          </a>{' '}
          |{' '}
          <a href="https://www.usnews.com/education/best-global-universities/rankings" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            U.S. News Data
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App;