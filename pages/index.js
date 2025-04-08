import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Home() {
  const [player, setPlayer] = useState(null)
  const [guess, setGuess] = useState('')
  const [feedback, setFeedback] = useState([])
  const [guesses, setGuesses] = useState([])
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const fetchDailyPlayer = async () => {
      const today = new Date().toISOString().slice(0, 10)
      const { data: daily, error } = await supabase
        .from('daily_player')
        .select('player_id, player:players(*)')
        .eq('date', today)
        .single()

      if (daily?.player) {
        setPlayer(daily.player)
      }
    }

    fetchDailyPlayer()
  }, [])

  const handleGuess = () => {
    if (!player || guesses.includes(guess)) return
    const correct = [
      guess.toLowerCase() === player.name.toLowerCase() ? 'Name' : '',
      guess.toLowerCase() === player.position.toLowerCase() ? 'Position' : '',
      guess.toLowerCase() === player.division.toLowerCase() ? 'Division' : '',
      guess.toLowerCase() === player.team.toLowerCase() ? 'Team' : '',
      guess.toLowerCase() === (player.ethnicity || '').toLowerCase() ? 'Ethnicity' : '',
    ].filter(Boolean)

    setFeedback((prev) => [...prev, correct.join(', ') || '❌'])
    setGuesses((prev) => [...prev, guess])
    setGuess('')

    if (guess.toLowerCase() === player.name.toLowerCase() || guesses.length >= 9) {
      setGameOver(true)
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>I've Got a Guy ⚾</h1>
      {!gameOver ? (
        <div>
          <input
            placeholder='Enter your guess'
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
          />
          <button onClick={handleGuess}>Guess</button>
          <ul>
            {guesses.map((g, i) => (
              <li key={i}><strong>{g}</strong>: {feedback[i]}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>The Player Was:</h2>
          <img src={player?.image} alt={player?.name} width={100} height={100} />
          <p><strong>{player?.name}</strong> – {player?.team}</p>
          <p><em>{player?.fun_fact}</em></p>
        </div>
      )}
    </main>
  )
}
