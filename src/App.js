import { createContext, useContext, useMemo, useState } from 'react';

const GameContext = createContext();

function useGame() {
  return useContext(GameContext);
}

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`w-24 h-24 flex items-center justify-center border-2 ${
        highlight ? 'bg-yellow-400' : 'bg-white'
      } text-3xl font-bold transition-transform transform hover:scale-105 shadow-md rounded-lg`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board() {
  const { xIsNext, currentSquares, handlePlay, status } = useGame();
  function handleClick(i) {
    if (calculateWinner(currentSquares) || currentSquares[i]) {
      return;
    }
    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    handlePlay(nextSquares, i);
  }
  const winnerInfo = calculateWinner(currentSquares);
  return (
    <>
      <div className="text-2xl font-semibold mb-4 text-black">{status}</div>
      {Array(3).fill(null).map((_, indexRow) => (
        <div key={indexRow} className="flex">
          {Array(3).fill(null).map((_, indexCol) => {
            const index = indexRow * 3 + indexCol;
            const highlight = winnerInfo ? winnerInfo.line.includes(index) : false;
            return (
              <Square
                key={index}
                value={currentSquares[index]}
                onSquareClick={() => handleClick(index)}
                highlight={highlight}
              />
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), moveLocation: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, moveIndex) {
    const row = Math.floor(moveIndex / 3) + 1;
    const col = (moveIndex % 3) + 1;
    const moveLocation = `(${row}, ${col})`;
    const nextHistory = [
      ...history.slice(0, currentMove + 1),
      { squares: nextSquares, moveLocation },
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  const sortedMoves = useMemo(() => {
    const moves = history.map((step, move) => {
      const description = move
        ? `Go to move #${move} ${step.moveLocation ? 'at ' + step.moveLocation : ''}`
        : 'Go to game start';
      return (
        <li key={move}>
          {move === currentMove ? (
            <span className="text-gray-800 bg-purple-500 rounded py-2 px-4 transition mt-1 mb-1">You are at move #{move} {step.moveLocation ? 'at ' + step.moveLocation : ''}</span>
          ) : (
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition mt-1 mb-1"
              onClick={() => jumpTo(move)}
            >
              {description}
            </button>
          )}
        </li>
      );
    });
    return isAscending ? moves : [...moves].reverse();
  }, [history, currentMove, isAscending]);

  const status = useMemo(() => {
    const winnerInfo = calculateWinner(currentSquares);
    if (winnerInfo) {
      return 'Winner: ' + winnerInfo.winner;
    } else if (currentSquares.every((square) => square !== null)) {
      return 'Draw: No one wins';
    } else {
      return 'Next player: ' + (xIsNext ? 'X' : 'O');
    }
  }, [currentSquares, xIsNext]);

  return (
    <GameContext.Provider
      value={{ xIsNext, currentSquares, handlePlay, status, sortedMoves, toggleSortOrder, isAscending }}
    >
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="flex">
          <div className="mr-10">
            <Board />
          </div>
          <div className="w-full max-w-xs flex flex-col h-96"> {/* Set height to match the game board */}
            <button
              className="bg-gray-800 text-white py-2 px-4 mb-4 rounded-md hover:bg-gray-700 transition"
              onClick={toggleSortOrder}
            >
              {isAscending ? 'Sort Descending' : 'Sort Ascending'}
            </button>
            <ol className="space-y-2 max-h-full overflow-y-auto">{sortedMoves}</ol> {/* Matches the game board height */}
          </div>
        </div>
      </div>
    </GameContext.Provider>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}
