import jsTPS_Transaction from "../common/jsTPS.js";
/**
 * AddSong_Transaction
 *
 * This class represents a transaction that works with adding a song. It will be managed by the transaction stack.
 *
 * @author McKilla Gorilla
 * @author ?
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initIndex, initTitle, initArtist, initYoutube) {
    super();
    this.app = initApp;
    console.log(this.app);
    this.index = initIndex;
    console.log("cons: " + this.index);
    this.song = this.app.state.currentList.songs[this.index];
    this.oldTitle = this.song.title;//app.state.currentList.songs[this.index].title;
    this.oldArtist = this.song.artist;//app.state.currentList.songs[this.index].artist;
    this.oldYoutube = this.song.youTubeId;//app.state.currentList.songs[this.index].youTubeId;
    this.title = initTitle;
    this.artist = initArtist;
    this.youTubeId = initYoutube;
  }

  doTransaction() {
    console.log("trans: " + this.index);
    console.log("trans: " + this.title);
    this.app.editSong(this.index, this.title, this.artist, this.youTubeId);
  }

  undoTransaction() {
    //let oldTitle = this.model.currentList.songs[this.index].title;
    //let oldArtist = this.model.currentList.songs[this.index].artist;
    //let oldYoutube = this.model.currentList.songs[this.index].youTubeId;
    this.app.editSong(this.index,this.oldTitle,this.oldArtist,this.oldYoutube);
    this.app.setStateWithUpdatedList(this.app.state.currentList);
  }
}
