/**
 * OrganizerController
 *
 * @description :: Server-side logic for managing Organizers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var fs = require('fs.extra');
var chokidar = require('chokidar');
var id3 = require('id3js');
var moment = require('moment');
var pathLib = require('path');

var watcher = chokidar.watch('incoming_songs', {ignored: /[\/\\]\./});

watcher.on('add', addFileToExtract);

if (!fs.existsSync('incoming_songs')) {
  fs.mkdirSync('incoming_songs');
}

if (!fs.existsSync('assets/media')) {
  fs.mkdirSync('assets/media');
}

var files = [];
var extracting = false;
var endTimeout = 1000;

function addFileToExtract(path) {

  files.push(path);
  console.log(files);
  fs.stat(path, function (err, stat) {
    if (err){
      console.log(err);
    }
    setTimeout(checkEnd, endTimeout, path, stat);
  });

}

function checkEnd(path, prev) {
  fs.stat(path, function (err, stat) {
    if (stat !== undefined && stat.mtime.getTime() === prev.mtime.getTime()) {
      extract(path);
    } else {
      setTimeout(checkEnd, endTimeout, path, prev);
    }
  });
}

function extract(path) {
  if (extracting || files.length == 0)
    return;

  extracting = true;

  path = files.pop();

  console.log("Extracting : " + path);
  id3({file: path, type: id3.OPEN_LOCAL}, function (err, tags) {

    if (err) {
      console.log(err);
      return;
    }

    var album;
    if(path.split('.').pop() !== 'mp3') {
      album = "garbage";
    }else{
      album = tags.album;
      if (album === null) {
        album = "inconnu " + moment().format('DD-MM-YYYY');
      }
    }

    checkAlbum(album, path, tags);

    extracting = false;

    setTimeout(extract, 100);
  });
}

function checkAlbum(album, path, tags) {

  var targetDir = "assets/media/" + album;
  fs.stat(targetDir, function (err, stats) {
    if (err) {
      console.log("SEARCH ALBUM");
      console.log(err);

      createAlbum(targetDir, path, tags);

    } else {
      console.log(targetDir + " ALREADY EXIST");

      var fileName = pathLib.basename(path);
      var target = targetDir + "/" + fileName;
      copyFile(path, target, tags);
    }
  });
}

function createAlbum(targetDir, path, tags) {
  fs.mkdir(targetDir, function () {
    console.log("Album " + targetDir + " create");

    var fileName = pathLib.basename(path);
    var target = targetDir + "/" + fileName;
    copyFile(path, target, tags);

  });
}

function copyFile(path, target, tags) {
  fs.copy(path, target, {replace: false}, function (err) {
    if (err) {
      console.log("COPY FILE ERR");
      console.log(err);
    } else {
      console.log("FILE COPIED");
      if(target.split('.').pop() === 'mp3') {
        insertIntoDatabase(target, tags);
      }
      deleteFile(path);
    }
  });
}

function deleteFile(path) {
  fs.unlink(path, function (err) {
    if (err) {
      console.log("DELETE FILE ERR");
      console.log(err);
    }
  });
}

function insertIntoDatabase(target, tags){
  target = target.replace('assets/', '');
  Mp3.create({title: tags.title, album: tags.album, artist: tags.artist, year: tags.year, genre: tags.genre, path: target}).exec(function(err, created){
    if(err){
      console.log("INSERT DB ERR");
      console.log(err);
    }else{
      console.log("Music " + created.title + " created");
    }
  });
}
