let express = require('express');
let path = require('path');
let movies = require('./lib/movies');
let app = express();

const PORT = process.env.PORT || 6969;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => res.render('index'));

app.get('/api/movies', async (req, res) => {
    let series = req.query.s;

    if(series !== undefined) {
        res.json((await movies.getMovies()).filter(m => m.type === 'series'))
    } else {
        res.json(await movies.getMovies())
    }
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));