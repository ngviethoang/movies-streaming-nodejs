let fs = require('fs');
let path = require('path');
let srt2vtt = require('srt-to-vtt');

const MOVIES_PATH = 'public/Movies/';

//ONLY MOVIES dirs !!!

function readDir(startPath) {
    if (!fs.existsSync(startPath)) {
        console.log("No dir " + startPath);
        return
    }

    let files= fs.readdirSync(startPath);
    for(let file of files) {
        let fileName = path.join(startPath, file);

        //Ignore series
        if(fileName.split(startPath).slice(-1)[0].startsWith('_')) continue;

        let stat = fs.lstatSync(fileName);
        //Recurse dirs
        if (stat.isDirectory()) {
            readDir(fileName)
        }
        //Manage files
        else {
            //Delete ads files
            if(fileName.endsWith('.txt') || fileName.endsWith('.jpg')) {
                console.log('DELETE file ' + fileName);
                fs.unlink(fileName, null)
            }
            //Subtitle files
            else if(fileName.endsWith('.srt')) {
                console.log(fileName);

                fs.createReadStream(fileName)
                    .pipe(srt2vtt())
                    .pipe(fs.createWriteStream(fileName.split('.srt')[0] + '.vtt'))
            }
        }

    }
}

readDir(MOVIES_PATH);

