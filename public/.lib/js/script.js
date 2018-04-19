$(document).ready(() => {
    const MOVIES_BASE_DIR = 'Movies/'

    // const BASE_URL = 'http://192.168.0.109:6969' //Cable
    const BASE_URL = 'http://192.168.0.118:6969' //WiFi

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
        el: '#listContainer',
        data: {
            movies: [],
            seriesList: [],
        },
        created() {
            $.getJSON(BASE_URL + '/api/movies', data => {
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
            })
        },
        methods: {
            showMovie(movie) {
                let video = movie.files.find(f => f.type === 'video')
                let videoPath = (video !== undefined) ? (MOVIES_BASE_DIR + movie.dir + '/' + video.name) : undefined

                let sub = movie.files.find(f => f.type === 'subtitle')
                let subtitlePath = (sub !== undefined) ? (MOVIES_BASE_DIR + movie.dir + '/' + sub.name) : undefined

                this.setPlayer(movie.name, videoPath, subtitlePath)
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
            }
        }
    })
})