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

    // Create an array of correct guesses
    const correctCategories = [
      guess.toLowerCase() === player.name.toLowerCase() ? 'Name' : '',
      guess.toLowerCase() === player.position.toLowerCase() ? 'Position' : '',
      guess.toLowerCase() === player.division.toLowerCase() ? 'Division' : '',
      guess.toLowerCase() === player.team.toLowerCase() ? 'Team' : '',
      guess.toLowerCase() === (player.ethnicity || '').toLowerCase() ? 'Ethnicity' : '',
    ].filter(Boolean)

    // If no correct categories, set 'incorrect'
    const feedbackMessage = correctCategories.length > 0 
      ? `Correct categories: ${correctCategories.join(', ')}` 
      : '❌ Incorrect'

    // Set the state for feedback and guesses
    setFeedback((prev) => [...prev, feedbackMessage])
    setGuesses((prev) => [...prev, guess])

    // Clear the guess input field
    setGuess('')

    // Check if the guess is correct or max guesses reached
    if (guess.toLowerCase() === player.name.toLowerCase() || guesses.length >= 9) {
      setGameOver(true)
    }
  }

  const getCellStyle = (category, guessValue) => {
    if (!guessValue) return {};
    return guessValue.toLowerCase() === category.toLowerCase()
      ? { backgroundColor: 'green' }
      : { backgroundColor: 'red' };
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

            <h3>Player Categories:</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Your Guess</th>
                  <th>Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Team</td>
                  <td style={getCellStyle(player?.team, guess)}> {guess} </td>
                  <td>{player?.team}</td>
                </tr>
                <tr>
                  <td>League</td>
                  <td style={getCellStyle(player?.league, guess)}> {guess} </td>
                  <td>{player?.league}</td>
                </tr>
                <tr>
                  <td>Division</td>
                  <td style={getCellStyle(player?.division, guess)}> {guess} </td>
                  <td>{player?.division}</td>
                </tr>
                <tr>
                  <td>Position</td>
                  <td style={getCellStyle(player?.position, guess)}> {guess} </td>
                  <td>{player?.position}</td>
                </tr>
                <tr>
                  <td>Ethnicity</td>
                  <td style={getCellStyle(player?.ethnicity, guess)}> {guess} </td>
                  <td>{player?.ethnicity}</td>
                </tr>
              </tbody>
            </table>

            <ul className={styles.guessList}>
              {guesses.map((g, i) => (
                <li key={i} className={styles.guessItem}>
                  <span>{g}</span>
                  <span className={styles.feedback}>{feedback[i]}</span>
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
