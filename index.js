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
  var url = encodeURI('http://prod.v2.api.musicgraph.com/api/v2/artist/search?similar_to='
   + artistName + '&limit=100&fields=id,name&api_key=3ec87654df736909612bd3efd45a23f8');
  request.get(url,
    function(error, resp, data) {
      data = JSON.parse(data);
      for (var i in data.data) {
        var tArtist = data.data[i];
        artists.push(tArtist.name);
      }
      console.log(artists);
      cb( _.uniq(artists));

    })
}

function getShows(artistList, cb){
  var shows = [];
  var url = encodeURI('http://api.eventful.com/json/events/search?q=music&app_key=rwXzGxDHc5cLRtT2&keywords='
   + artistList);
  request.get(url, function(err, resp, data) {
      data = JSON.parse(data);
    if (typeof data !== 'undefined' && data.hasOwnProperty('events') && data.events !== null) {
      for (var i in data.events.event) {
        var ev = data.events.event[i];
        //console.log(ev);
        if ( ev !== null ){
          shows.push({
            city: ev.city_name,
            country: ev.country_name,
            latlon: [ ev.latitude, ev.longitude ],
            date: ev.start_time.substr(0, 10)
          });
        }
      }
    }
    cb(shows);
  })
}
