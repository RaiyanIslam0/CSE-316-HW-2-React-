import jsTPS_Transaction from "../common/jsTPS.js";
/**
 * AddSong_Transaction
 *
 * This class represents a transaction that works with adding a song. It will be managed by the transaction stack.
 *
 * @author McKilla Gorilla
 * @author ?
 */
export default class RemoveSong_Transaction extends jsTPS_Transaction {
  constructor(initApp, initIndex) {
    //, initTitle, initArtist, initYoutube) {
    super();
    this.app = initApp;
    this.index = initIndex;
    this.song = this.app.currentList.songs[this.index];
    // this.title = initTitle;
    // this.artist = initArtist;
    // this.youTubeId = initYoutube;
  }

  doTransaction() {
    this.app.removeSong(this.index);
  }

  undoTransaction() {
    let songNameRemove = this.song; //this.model.currentList.songs[this.index];
    //let removeT=this.model.currentList.songs[this.index].title;
    //let removeA = this.model.currentList.songs[this.index].artist;
    // let removeY = this.model.currentList.songs[this.index].youTubeId;

    // removeT.value=songNameRemove.title;
    // removeA.value=songNameRemove.artist;
    // removeY.value=songNameRemove.youTubeId;

    this.model.currentList.songs.splice(this.index, 0, songNameRemove);
    this.model.view.refreshPlaylist(this.model.currentList);
    this.model.saveLists();

    //addSong(this.newIndex, this.oldIndex);
  }
}
