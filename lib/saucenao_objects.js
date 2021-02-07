"use strict";

// TODO: add dbmask stuff here

 const indexes = {
    "hmags": 0, // deprecated
    "hcg": 2, // deprecated
    "doujindb": 3, // deprecated
    "pixiv": [5,6], // this might be annoying to parse
    "seiga": 8,
    "danbooru": 9,
    "drawr": 10, // site closed
    "nijie": 11,
    "yandere": 12,
    "shutterstock": 15, // broken and disabled
    "fakku": 16, // broken
    "hmisc": [18,38],
    "2dmarket": 19,
    "medibang": 20, // broken
    "anime": 21,
    "hanime": 22, // not to be confused with hanime.tv
    "movies": 23,
    "shows": 24,
    "gelbooru": 25,
    "konachan": 26,
    "sankaku": 27, // broken
    "animepictures": 28,
    "e621": 29,
    "idolcomplex": 30, // somehow works even though it's actually a sankaku subdomain?
    "bcyillust": 31, // broken
    "bcycosplay": 32, // broken
    "portalgraphics": 33, // site closed
    "deviantart": 34, // broken
    "pawoo": 35, // broken
    "madokami": 36, // site down due to batato's death
    "mangadex": 37,
    "artstation": 39,
    "furaffinity": 40,
    "twitter": 41, // "better than nothing"
    "furrynetwork": 42,
    "ALL": 999 // unlikely to appear in search results, but we'll include it anyway
}

// we could just put these arrays into the indexes object, but eh...
const imageboards = [
    indexes['konachan'], indexes['idolcomplex'],
    indexes['danbooru'], indexes['gelbooru'],
    indexes['e621'], indexes['sankaku'], indexes['yandere']
];

const videos = [
    indexes['anime'], indexes['hanime'], indexes['shows'], indexes['movies']
];

// sites that use "member" field to identify artist/uploader
const communities = [
    ...indexes['pixiv'], indexes['drawr'], indexes['seiga'], indexes['nijie'],
    indexes['medibang'], indexes['bcyillust'], indexes['bcycosplay']
];

// sites that use "author" field to identify artist/uploader
const communities2 = [
    indexes['deviantart'], indexes['artstation'], indexes['furaffinity'],
    indexes['furrynetwork']
];

const domain_exclusions = [
    /*
    "tenor.com" // not listed on SauceNao but we don't want to search Discord auto-gifs
    "pximg.net", // Pixiv
    "wixmp.com", // DeviantArt
    //"twimg.com", // Twitter (not actually indexed on SauceNAO)
    "artstation.com," // ArtStation
    "nicoseiga.jp," // Nico Seiga (may or may not actually be the domain where images are stored)
    "byteimg.com" // bcy.net
    */
];


module.exports = { indexes, imageboards, videos, communities, communities2, domain_exclusions }
