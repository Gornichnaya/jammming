
let accessToken = '';
const clientID = '2b6dbcccc1be4908b19f4d1cc9f8ff8c';
const redirectURI = 'http://grbjammming.surge.sh';


const Spotify = {
  getAccessToken() {
    const urlToken = window.location.href.match(/access_token=([^&]*)/);
    const expiresIn = window.location.href.match(/expires_in=([^&]*)/);

    if(accessToken) {
      return accessToken;
    } else if(urlToken && expiresIn) {
        accessToken = urlToken[1];
        window.setTimeout(() => accessToken = '', expiresIn[1] *1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;
      } else {
        window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
      }
    },

   search(term) {
    const url = `https://api.spotify.com/v1/search?type=track&q=${term.replace(' ','%20')}`;
    this.getAccessToken();
    return fetch(url, {
    //  method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => response.json()).then(jsonResponse => {
      if(jsonResponse.tracks) {
        return jsonResponse.tracks.items.map( track => (
          {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        ));
      }
    });
  },

  savePlaylist(playlistName,trackURIs) {
    if(!playlistName || !trackURIs) {
      return;
    } else {
      this.getAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`
      }
      let userID = '';
      return fetch('https://api.spotify.com/v1/me',{
        headers: headers
      }).then(response => response.json()).then(jsonResponse => {
        userID = jsonResponse.id;
        return userID;
      }).then(uID => {
        let url = `https://api.spotify.com/v1/users/${uID}/playlists`;
        let headers2 = {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        };
        return fetch(url, {
          headers: headers2,
          method: 'POST',
          body: JSON.stringify({'name': playlistName})
        }).then(response2 => response2.json()).then(jsonResponse2 => {
          return jsonResponse2.id;
        }).then(playlistID => {
          let url2 = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
          return fetch(url2, {
            headers: headers2,
            method: 'POST',
            body: JSON.stringify({
              'uris': trackURIs
            })
          })
        })
      })
    }
  }
};

export default Spotify;
