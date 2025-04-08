import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'
import styles from '../styles/globals.module.css'

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
    <>
      <Head>
        <title>I've Got a Guy</title>
      </Head>
      <main className={styles.container}>
        <h1 className={styles.title}>I've Got a Guy ⚾</h1>
        {!gameOver ? (
          <div className={styles.card}>
            <input
              className={styles.input}
              placeholder='Enter your guess'
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
            />
            <button className={styles.button} onClick={handleGuess}>
              Guess
            </button>
            <ul className={styles.guessList}>
              {guesses.map((g, i) => (
                <li key={i}>
                  <span className={styles.guessItem}>{g}</span>
                  <span className={styles.feedback}>
                    {feedback[i]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.result}>
            <h2>The Player Was:</h2>
            <img src={player?.image} alt={player?.name} className={styles.playerImg} />
            <p><strong>{player?.name}</strong> – {player?.team}</p>
            <p className={styles.funFact}><em>{player?.fun_fact}</em></p>
          </div>
        )}
      </main>
    </>
  )
}
