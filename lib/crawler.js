const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');
const unzip = require('unzip');

let getResponse = async url => {
    let res;
    try {
        res = await new Promise((resolve, reject) => {
            request(url, (error, response, html) => {
                if(error) {
                    reject(error)
                } else {
                    resolve(response)
                }
            })
        })
    } catch(error) {
        console.log(error);
        res = {error}
    }
    return res
};

let getCheerio = async url => {
    let res = await getResponse(url);
    if(res.error) {
        return null
    } else {
        return cheerio.load(res.body)
    }
};

let download = (url, path) =>
    new Promise((res, rej) => {
        request({uri: url})
            .pipe(fs.createWriteStream(path))
            .on('close', () => res())
    });

let extractZip = (zipPath, extractPath) =>
    new Promise((res, rej) => {
        fs.createReadStream(zipPath)
            .pipe(unzip.Extract({ path: extractPath }))
            .on('error', err => rej(err))
            .on('finish', () => res())
    });

module.exports = {
    getCheerio,
    download,
    extractZip
};