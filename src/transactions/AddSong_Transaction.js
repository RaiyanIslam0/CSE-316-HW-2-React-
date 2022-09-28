import jsTPS_Transaction from "../common/jsTPS.js";
/**
 * AddSong_Transaction
 *
 * This class represents a transaction that works with adding a song. It will be managed by the transaction stack.
 *
 * @author McKilla Gorilla
 * @author ?
 */
export default class AddSong_Transaction extends jsTPS_Transaction {
  constructor(initApp) {
    super();
    this.app = initApp;
  }

  doTransaction() {
    this.app.addSong();
  }

  undoTransaction() {
    this.app.state.currentList.songs.pop();
    this.app.setStateWithUpdatedList(this.app.state.currentList);
    // this.app.view.refreshPlaylist(this.app.currentList);
    // this.app.saveLists();
    //splice(this.initIndex, 1);
  }
}
