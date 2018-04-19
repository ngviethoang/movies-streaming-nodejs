let fs = require('fs');

let getFiles = (path, extensions = []) =>
    new Promise((resolve, reject) => {
        fs.readdir(path, (err, files) => {
            if (err)
                reject(err);

            if(extensions.length === 0)
                resolve(files);
            else {
                let results = [];
                files.forEach(async file => {
                    let exts = file.split('.');
                    // Dir
                    if(exts.length === 1) {
                        let dir_files = await getFiles(path + '/' + file, extensions);
                        if(dir_files.length > 0)
                            results.push({
                                type: 'dir',
                                files: dir_files
                            })
                    }

                    let ext = exts.pop();
                    if(ext === extensions[0]) //mp4
                        results.push({
                            type: 'video',
                            name: file
                        });
                    else if(ext === extensions[1]) //vtt
                        results.push({
                            type: 'subtitle',
                            name: file
                        })
                });
                resolve(results)
            }
        })
    });

const MOVIES_PATH = 'public/Movies/';

let getMovies = async () => {
    let result = [];
    //Get all movies
    let movies = await getFiles(MOVIES_PATH);

    //With a movie, get mp4 or sub-dir
    for(let movie of movies) {
        let files = await getFiles(MOVIES_PATH + movie, ['mp4', 'vtt']);

        let type, movieStrs, name, year;
        if(movie.startsWith("_")) {
            type = 'series';
            name = movie.replace(/[_]/, '')
        } else {
            type = 'movies';

            movieStrs = movie.split(/[()]/)
            name = movieStrs[0];
            year = movieStrs.length >= 2 ? movieStrs[1] : null;
            if(year !== null) name += ` (${year})`;
        }

        result.push({dir: movie, name, type, files})
    }
    return result.filter(movie => movie.files.length > 0);
};

module.exports = {
    getMovies
};