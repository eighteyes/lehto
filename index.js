var to_json = require('xmljson').to_json;
var request = require('request');
var _ = require('lodash');
var connect = require('connect');
var express = require('express');

var app = express();

app.use(express.static(__dirname + '/app'));

app.get('/country/:country', function(req, res) {
  console.log('Country', req.param('country'));
  getArtists(req.param('country'), function(data) {
    res.send(data);
  })
});

app.get('/similiar/:artist', function(req, res) {
  console.log('Artist', req.param('artist'));
  getSimiliar(req.param('artist'), function(data) {
    res.send(data);
  })
});

app.get('/shows/:artists', function(req, res) {
  console.log('Shows for Artists', req.param('artists'));
  getShows(req.param('artists'), function(data) {
    res.send(data);
  });
});

app.listen(80);

//are there arguments
if (process.argv[2]) {
  var cmd = process.argv[2];
  if (cmd.indexOf('country') > -1) {
    getArtists(cmd.substr(8).toUpperCase());
  } else if (cmd.indexOf('artist') > -1) {
    getSimiliar(cmd.substr(7));
  } else if (cmd.indexOf('playing') > -1) {
    getShows(cmd.substr(8));
  }
}

function getArtists(countryCode, cb) {
  var artists = [];
  request.get('http://musicbrainz.org/ws/2/release/?limit=100&query=country:'
   + countryCode.toUpperCase(), function(error, resp, data) {
    to_json(data, function(err, xmldata) {
      var releases = xmldata.metadata['release-list'].release;
      for (var i in releases) {
        var artist, album = releases[i].title;
        if (releases[i]['artist-credit']['name-credit'].hasOwnProperty('artist')) {
          artist = releases[i]['artist-credit']['name-credit'].artist.name;
        } else {
          artist = releases[i]['artist-credit']['name-credit'][0].artist.name;
        }
        artists.push(artist);
      }
      cb( _.uniq(artists));
    });
  });
}


function getSimiliar(artistName, cb) {
  var artists = [];
  request.get('http://prod.v2.api.musicgraph.com/api/v2/artist/search?similar_to='
   + artistName + '&limit=100&fields=id,name&api_key=3ec87654df736909612bd3efd45a23f8',
    function(error, resp, data) {
      data = JSON.parse(data);
      for (var i in data.data) {
        var tArtist = data.data[i];
        artists.push(tArtist.name);
      }
      cb( _.uniq(artists));
    })
}

function getShows(artistList, cb){
  var shows = [];
  artistList = artistList.replace('||', '%7C%7C');
  request.get('http://api.eventful.com/json/events/search?q=music&app_key=rwXzGxDHc5cLRtT2&keywords='
   + artistList, function(err, resp, data) {
    data = JSON.parse(data);
    for (var i in data.events.event) {
      var ev = data.events.event[i];
      console.log(ev);
      shows.push({
        city: ev.city_name,
        country: ev.country_name
      });
    }
    cb(shows);
  })
}
