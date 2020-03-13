import React, { Component } from 'react';
import './css/App.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSearch, faSyncAlt } from '@fortawesome/free-solid-svg-icons';
 
library.add( faSearch, faSyncAlt );

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchWord: "",
      images: [],
      page: 1,
      maxPages: 0,
      showLoadMoreButton: false,
      loadMoreButtonClass: ""
    };

    this.searchFieldOnChange = this.searchFieldOnChange.bind(this);
    this.fetchNewPhotos = this.fetchNewPhotos.bind(this);
    this.searchOnFlickr = this.searchOnFlickr.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    
  }

  searchFieldOnChange(e) {
    console.log(e.currentTarget.value);
    this.setState({ searchWord: e.currentTarget.value });
  }

  fetchNewPhotos(){
    let nextPage = this.state.page + 1;

    if(nextPage > this.state.maxPages){
      this.setState({showLoadMoreButton: false})
      return;
    }
    this.setState({ page: nextPage, loadMoreButtonClass: "loading"});

    fetch(`https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=4fff7654f3221f341113983b351d4156&format=json&tags=${this.state.searchWord}&nojsoncallback=1&page=${this.state.page}`, {
        method: "GET"
      })
      .then(response => {
        if(!response.ok){ throw response.statusText; };

        return response.json();
      })
      .then(response => {
        let newImages = response.photos.photo.map((image) => {
          return {
            id: image.id,
            farmId: image.farm,
            serverId: image.server,
            secret: image.secret
          };    
        });
        this.setState({ images: [...this.state.images, ...newImages], loadMoreButtonClass: "" });
      })
      .catch(err => {
        console.log(err);   
      });
  }

  // New search.
  searchOnFlickr(e) {
    e.preventDefault();
    this.setState({ page: 1 });


    fetch(`https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=4fff7654f3221f341113983b351d4156&format=json&nojsoncallback=1&tags=${this.state.searchWord}`, {
      method: "GET"
    })
    .then(response => {
      if(!response.ok){ throw response.statusText; };
      return response.json();
    })
    .then(response => {
      let responseImages = response.photos.photo.map((image) => {
        return {
          id: image.id,
          farmId: image.farm,
          serverId: image.server,
          secret: image.secret
        };    
      });
      let showLoadMoreButton = parseInt(response.photos.total) ? true : false;
      this.setState({ images: responseImages, maxPages: response.photos.pages, showLoadMoreButton: showLoadMoreButton });
    })
    .catch(err => {
      console.log(err);   
    });
  }

  handleScroll(e){
    if((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      this.fetchNewPhotos();
    }
  }

  componentDidMount(){
    window.addEventListener('scroll', this.handleScroll);
  }

  render() {
    let photos;

    if(this.state.images.length !== 0) {
      photos = this.state.images.map((image, index) => {
        return (
          <img className="photo" key={index} src={"https://farm" + image.farmId + ".staticflickr.com/" + image.serverId + "/" + image.id + "_" + image.secret + ".jpg"} />
        );
      });
    }
    let loadMoreButton = null;
    if(this.state.showLoadMoreButton){
      loadMoreButton = (
        <div id="loadButton"  onClick={this.fetchNewPhotos}  >
          <FontAwesomeIcon icon="sync-alt" className={this.state.loadMoreButtonClass}/>
        </div> 
      );
    }
    return (
      <div id="App">
        <form id="searchBar">
          <input onChange={this.searchFieldOnChange} type="text" id="searchBox" placeholder="Search for a picture.." title="Type in a picture" value={this.state.searchWord}/>
          <input type="submit" onClick={this.searchOnFlickr} />
          <div id="searchButton" onClick={this.searchOnFlickr} >
            <FontAwesomeIcon icon="search" />
          </div>
        </form>

        <div id="photos">
          {photos}
        </div>  
        {loadMoreButton}
      </div>
    );
  }
}

export default App;
