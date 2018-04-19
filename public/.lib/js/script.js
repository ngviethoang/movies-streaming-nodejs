$(document).ready(() => {
    const MOVIES_BASE_DIR = 'Movies/'

    let player = videojs('myVideo')
    player.seekButtons({
        forward: 10,
        back: 10
    });

    $('body').keypress(e => {
        switch (e.keyCode) {
            case 37: // left arrow
                $('#myVideo').find('.vjs-seek-button.skip-back').click()
                break;
            case 39: // right arrow
                $('#myVideo').find('.vjs-seek-button.skip-forward').click()
                break;
        }
    })

    new Vue({
        el: '#vue',
        data: {
            movies: [],
            tmpMovies: [], //store all movies while showing watched movies
            seriesList: [],
            history: null
        },
        created() {
            $.getJSON('api/movies', data => {
                for(let file of data) {
                    switch (file.type) {
                        case 'movies':
                            this.movies.push(file)
                            break;
                        case 'series':
                            this.seriesList.push(file)
                            break
                    }
                }
                this.history = JSON.parse(localStorage.getItem('history'))
                if(this.history !== null) {
                    this.movies = this.movies.map(m => {
                        m.watched = this.history.movies.includes(m.dir)
                        return m
                    })
                }
            })
        },
        methods: {
            showMovie(movie) {
                let video = movie.files.find(f => f.type === 'video')
                let videoPath = (video !== undefined) ? (MOVIES_BASE_DIR + movie.dir + '/' + video.name) : undefined

                let sub = movie.files.find(f => f.type === 'subtitle')
                let subtitlePath = (sub !== undefined) ? (MOVIES_BASE_DIR + movie.dir + '/' + sub.name) : undefined

                this.setPlayer(movie.name, videoPath, subtitlePath)

                //Save to history
                this.history = JSON.parse(localStorage.getItem('history'))
                if(this.history === null) {
                    this.history = {movies: [], series: []}
                }
                let mIndex = this.history.movies.findIndex(m => m === movie.dir)
                if(mIndex !== -1) {
                    this.history.movies.splice(mIndex, 1)
                }
                this.history.movies.unshift(movie.dir)
                localStorage.setItem('history', JSON.stringify(this.history))

                movie.watched = true
                this.$nextTick()
            },
            showMovieInSeries(series, file) {
                let videoPath = (file.name !== undefined) ? (MOVIES_BASE_DIR + series.dir + '/' + file.name) : undefined

                let subtitlePath = (file.sub !== undefined) ? (MOVIES_BASE_DIR + series.dir + '/' + file.sub) : undefined

                this.setPlayer(series.name + ': ' + file.name.replace('.mp4', ''), videoPath, subtitlePath)
            },
            setPlayer(videoName, videoPath, subtitlePath) {
                if(videoPath !== undefined) {
                    player.src(videoPath)

                    for(let track of player.textTracks_.tracks_)
                        player.removeRemoteTextTrack(track)

                    if(subtitlePath !== undefined) {
                        player.addRemoteTextTrack({
                            kind: 'captions',
                            language: 'Default',
                            label: 'Default',
                            src: subtitlePath
                        }, false)
                    }

                    player.load()

                    $('.videoInfo').find('h2 > span').html(videoName)
                }
            },
            showLatestMovie() {
                if(this.history.movies.length > 0) {
                    let movie = this.movies.find(m => m.dir === this.history.movies[0])
                    if(movie !== undefined) {
                        this.showMovie(movie)
                    }
                }
            },
            toggleWatchedMovies(e) {
                let btnStatus
                if(this.tmpMovies.length > 0) { //Show all movies
                    this.movies = this.tmpMovies
                    this.tmpMovies = []

                    btnStatus = 'Watched'
                } else {
                    this.tmpMovies = this.movies
                    this.movies = this.movies.filter(m => m.watched)

                    btnStatus = 'All'
                }
                if(e !== undefined)
                    $(e.target).find('span').html(btnStatus)
            },
            clearHistory() {
                if(this.tmpMovies.length > 0) {
                    this.movies = this.tmpMovies
                    this.tmpMovies = []
                }
                this.history = null
                localStorage.removeItem('history')

                this.movies.forEach(m => m.watched = false)
                this.$nextTick()
            }
        }
    })
})