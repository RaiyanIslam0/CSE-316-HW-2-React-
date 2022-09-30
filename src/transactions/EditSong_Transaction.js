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
  constructor(initApp, initIndex){
  
    super()
    this.app = initApp;
    this.index = initIndex;
    this.oldTitle = this.app.state.currentList.songs[this.index].title;
    this.oldArtist = this.app.state.currentList.songs[this.index].artist;
    this.oldYoutube = this.app.state.currentList.songs[this.index].youTubeId;

    this.title = document.getElementById("titleBox").value;
    this.artist = document.getElementById("artistBox").value;
    this.youTubeId = document.getElementById("youtubeBox").value;
  }

  doTransaction() {
    //console.log("trans: " + this.index);
    //console.log("trans: " + this.title);
    this.app.editSong(this.index, this.title, this.artist, this.youTubeId);
  }

  undoTransaction() {
    this.app.editSong(this.index,this.oldTitle,this.oldArtist,this.oldYoutube);
    this.app.setStateWithUpdatedList(this.app.state.currentList);
  }
}
