const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'moviesData.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started at 3000')
    })
  } catch (e) {
    console.log(`Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

app.get('/movies/', async (request, response) => {
  const allMoviesQuery = 'SELECT movie_name FROM movie ORDER BY movie_id;'
  const moviesArray = await db.all(allMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const query = `Insert into movie (director_id, movie_name, lead_actor)
   values (${directorId}, '${movieName}', '${leadActor}');`
  await db.run(query)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmovieQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`
  const movie = await db.get(getmovieQuery)
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  })
})

app.put('/movies/:movieId', async (request, response) => {
  const movieDetails = request.body
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = movieDetails
  const query = `Update movie set director_id = ${directorId}, movie_name = '${movieName}', lead_actor = '${leadActor}'
  where movie_id = ${movieId};`
  await db.run(query)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmovieQuery = `
    Delete
    FROM
      movie
    WHERE
      movie_id = ${movieId};`
  await db.get(getmovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const alldirectorQuery = 'SELECT * FROM director ORDER BY director_id;'
  const directorsArray = await db.all(alldirectorQuery)
  response.send(
    directorsArray.map(eachdirector => ({
      directorId: eachdirector.director_id,
      directorName: eachdirector.director_name,
    })),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const allmovieQuery = `Select movie_name from movie where director_id = ${directorId};`
  const moviesArray = await db.all(allmovieQuery)
  response.send(
    moviesArray.map(eachmovie => ({
      movieName: eachmovie.movie_name,
    })),
  )
})

module.exports = app
