const readlineSync = require('readline-sync');
const fs = require('fs');
const path = require('path');
const crawler = require('./crawler');

const MOVIES_PATH = 'public/Movies/';

const SUBSCENE_BASE_URL = 'https://subscene.com/';

const EXIT_ANSWER = 999;

//Search movies
let getMovies = async name => {
    let result = [];
    try {
        let url = SUBSCENE_BASE_URL + 'subtitles/title?q=' + name.trim().replace(/\s/g, '+') + '&l=';
        console.log(url);
        let $ = await crawler.getCheerio(url);
        if($ === null) return null;

        $('.search-result > ul li .title > a').each((i, ele) => {
            result.push({
                name: $(ele).text(),
                url: $(ele).attr('href')
            })
        })
    } catch (error) {
        if(error.stack) console.log(error.stack);
    }
    return result;
};

let getSubtitles = async movie => {
    let result = [];
    try {
        let url = SUBSCENE_BASE_URL + movie.url;
        console.log(url);
        let $ = await crawler.getCheerio(url);
        if($ === null) return null;

        $('.subtitles table tr td.a1 > a').each((i, ele) => {
            let lang = $(ele).find('span.l').text().trim();
            if(lang === 'English' || lang === 'Vietnamese') {
                result.push({
                    lang,
                    name: $(ele).find('span:last-child').text().trim(),
                    url: $(ele).attr('href'),
                    isPos: $(ele).find('span.l').hasClass('positive-icon')
                })
            }
        })
    } catch (error) {
        if(error.stack) console.log(error.stack);
    }
    return result;
};

let downloadSubtitle = async (subtitle, filePath) => {
    try {
        let url = SUBSCENE_BASE_URL + subtitle.url;
        console.log(url);
        let $ = await crawler.getCheerio(url);
        if($ === null) return null;

        let downloadUrl = $('#downloadButton').attr('href');
        let zipPath = filePath + '/' + subtitle.name + '.zip';

        await crawler.download(SUBSCENE_BASE_URL + downloadUrl, zipPath);
        console.log(zipPath);

        await crawler.extractZip(zipPath, filePath);

        fs.unlink(zipPath, () => {})
    } catch (error) {
        if(error.stack) console.log(error.stack)
    }
};

let executeFile = async file => {
    let answer = null;

    let filePath = path.join(MOVIES_PATH, file);
    let name = file.split(/[()]/)[0];

    console.log('Search movie: ' + name);
    let movies = await getMovies(name);
    movies.slice().reverse().forEach((movie, i) => {
        console.log((movies.length - i - 1) + '. ' + movie.name)
    });

    //Choose movie
    do {
        answer = parseInt(readlineSync.question('Choose: '));
        if(answer === EXIT_ANSWER) return
    } while (isNaN(answer) || answer < 0 || answer >= movies.length);

    let subtitles = await getSubtitles(movies[answer]);
    subtitles.forEach((sub, i) => {
        console.log(i + '. (' + sub.lang + ') ' + sub.name + (sub.isPos ? ' *' : ''))
    });

    //Choose subtitle
    do {
        answer = parseInt(readlineSync.question('Choose: '));
        if(answer === EXIT_ANSWER) return
    } while (isNaN(answer) || answer < 0 || answer >= subtitles.length);

    //Download subtitle
    await downloadSubtitle(subtitles[answer], filePath);
};

let main = async () => {
    let answer = null;

    let files = fs.readdirSync(MOVIES_PATH).filter(m => !m.startsWith('_'));

    console.log('Films: ');
    files.forEach((file, i) => {
        console.log(i + '. ' + file)
    });

    //Choose film
    do {
        answer = parseInt(readlineSync.question('Choose: '));
    } while (isNaN(answer) || answer < 0 || answer >= files.length);

    await executeFile(files[answer])
};

main();