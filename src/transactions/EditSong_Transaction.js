import jsTPS_Transaction from "../../common/jsTPS.js";
/**
 * AddSong_Transaction
 *
 * This class represents a transaction that works with adding a song. It will be managed by the transaction stack.
 *
 * @author McKilla Gorilla
 * @author ?
 */
export default class EditSong_Transaction extends jsTPS_Transaction {
  constructor(initModel, initIndex, initTitle, initArtist, initYoutube) {
    super();
    this.model = initModel;
    this.index = initIndex;
    this.song = this.model.currentList.songs[this.index];
    this.oldTitle = this.model.currentList.songs[this.index].title;
    this.oldArtist = this.model.currentList.songs[this.index].artist;
    this.oldYoutube = this.model.currentList.songs[this.index].youTubeId;
    this.title = initTitle;
    this.artist = initArtist;
    this.youTubeId = initYoutube;
  }

  doTransaction() {
    this.model.editSong(this.index, this.title, this.artist, this.youTubeId);
  }

  undoTransaction() {
    //let oldTitle = this.model.currentList.songs[this.index].title;
    //let oldArtist = this.model.currentList.songs[this.index].artist;
    //let oldYoutube = this.model.currentList.songs[this.index].youTubeId;
    this.model.editSong(
      this.index,
      this.oldTitle,
      this.oldArtist,
      this.oldYoutube
    );

    this.model.view.refreshPlaylist(this.model.currentList);
    this.model.saveLists();
  }
}
