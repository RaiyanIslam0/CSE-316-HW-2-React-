import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import RemoveSong_Transaction from "./transactions/RemoveSong_Transaction.js";
import EditSong_Transaction from "./transactions/EditSong_Transaction.js";

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from "./components/DeleteSongModal.js";
import EditSongModal from "./components/EditSongModal.js";

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {
  constructor(props) {
    super(props);

    // THIS IS OUR TRANSACTION PROCESSING SYSTEM
    this.tps = new jsTPS();

    // THIS WILL TALK TO LOCAL STORAGE
    this.db = new DBManager();

    // GET THE SESSION DATA FROM OUR DATA MANAGER
    let loadedSessionData = this.db.queryGetSessionData();

    // SETUP THE INITIAL STATE
    this.state = {
      listKeyPairMarkedForDeletion: null,
      currentList: null,
      sessionData: loadedSessionData,
      index: -1,
      title: "",
      artist: "",
      youTubeId: "",

      canAddSong: false,
      canUndo: false,
      canRedo: false,
      canClose: false,

      canModal: false,
    };
  }
  sortKeyNamePairsByName = (keyNamePairs) => {
    keyNamePairs.sort((keyPair1, keyPair2) => {
      // GET THE LISTS
      return keyPair1.name.localeCompare(keyPair2.name);
    });
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
  createNewList = () => {
    // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
    let newKey = this.state.sessionData.nextKey;
    let newName = "Untitled" + newKey;

    // MAKE THE NEW LIST
    let newList = {
      key: newKey,
      name: newName,
      songs: [],
    };

    // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
    // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
    let newKeyNamePair = { key: newKey, name: newName };
    let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
    this.sortKeyNamePairsByName(updatedPairs);

    // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
    // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
    // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
    // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
    // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
    // SHOULD BE DONE VIA ITS CALLBACK
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey + 1,
          counter: prevState.sessionData.counter + 1,
          keyNamePairs: updatedPairs,
        },
        index: null,
      }),
      () => {
        // PUTTING THIS NEW LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationCreateList(newList);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
  deleteList = (key) => {
    // IF IT IS THE CURRENT LIST, CHANGE THAT
    let newCurrentList = null;
    if (this.state.currentList) {
      if (this.state.currentList.key !== key) {
        // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
        // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
        newCurrentList = this.state.currentList;
      }
    }

    let keyIndex = this.state.sessionData.keyNamePairs.findIndex(
      (keyNamePair) => {
        return keyNamePair.key === key;
      }
    );
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    if (keyIndex >= 0) newKeyNamePairs.splice(keyIndex, 1);
    this.tps.clearAllTransactions();

    // AND FROM OUR APP STATE
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        currentList: newCurrentList,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter - 1,
          keyNamePairs: newKeyNamePairs,
        },
        index: null,
      }),
      () => {
        // DELETING THE LIST FROM PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationDeleteList(key);

        // SO IS STORING OUR SESSION DATA
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  deleteMarkedList = () => {
    this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
    this.hideDeleteListModal();
  };
  // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
  deleteCurrentList = () => {
    if (this.state.currentList) {
      this.deleteList(this.state.currentList.key);
    }
  };
  renameList = (key, newName) => {
    let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
    // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
    for (let i = 0; i < newKeyNamePairs.length; i++) {
      let pair = newKeyNamePairs[i];
      if (pair.key === key) {
        pair.name = newName;
      }
    }
    this.sortKeyNamePairsByName(newKeyNamePairs);

    // WE MAY HAVE TO RENAME THE currentList
    let currentList = this.state.currentList;
    if (currentList.key === key) {
      currentList.name = newName;
    }

    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: null,
        sessionData: {
          nextKey: prevState.sessionData.nextKey,
          counter: prevState.sessionData.counter,
          keyNamePairs: newKeyNamePairs,
        },
        index: null,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        let list = this.db.queryGetList(key);
        list.name = newName;
        this.db.mutationUpdateList(list);
        this.db.mutationUpdateSessionData(this.state.sessionData);
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
  loadList = (key) => {
    let newCurrentList = this.db.queryGetList(key);
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: newCurrentList,
        sessionData: this.state.sessionData,
        index: null,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        this.tps.clearAllTransactions();
        this.updateToolBarButton();
      }
    );
  };
  // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
  closeCurrentList = () => {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: null,
        sessionData: this.state.sessionData,
        index: null,
      }),
      () => {
        // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
        // THE TRANSACTION STACK IS CLEARED
        this.tps.clearAllTransactions();
        this.updateToolBarButton();
      }
    );
  };
  setStateWithUpdatedList = (list) => {
    this.setState(
      (prevState) => ({
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        currentList: list,
        sessionData: this.state.sessionData,
        index: null,
      }),
      () => {
        // UPDATING THE LIST IN PERMANENT STORAGE
        // IS AN AFTER EFFECT
        this.db.mutationUpdateList(this.state.currentList);
        this.updateToolBarButton();
      }
    );
  };
  getPlaylistSize = () => {
    return this.state.currentList.songs.length;
  };
  // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
  // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
  moveSong(start, end) {
    let list = this.state.currentList;

    // WE NEED TO UPDATE THE STATE FOR THE APP
    start -= 1;
    end -= 1;
    if (start < end) {
      let temp = list.songs[start];
      for (let i = start; i < end; i++) {
        list.songs[i] = list.songs[i + 1];
      }
      list.songs[end] = temp;
    } else if (start > end) {
      let temp = list.songs[start];
      for (let i = start; i > end; i--) {
        list.songs[i] = list.songs[i - 1];
      }
      list.songs[end] = temp;
    }
    this.setStateWithUpdatedList(list);
  }
  // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
  addMoveSongTransaction = (start, end) => {
    let transaction = new MoveSong_Transaction(this, start, end);
    this.tps.addTransaction(transaction);
  };

  //This function adds a song in the current list

  addSong = () => {
    let list = this.state.currentList;
    let newSong = {
      title: "Untitled",
      artist: "Unknown",
      youTubeId: "dQw4w9WgXcQ",
    };
    list.songs.push(newSong);
    this.setStateWithUpdatedList(list);
  };

  addAddSongTransaction = () => {
    let transaction = new AddSong_Transaction(this);
    this.tps.addTransaction(transaction);
  };

  //remove song function
  removeSong = (index) => {
    let list = this.state.currentList;
    list.songs.splice(index, 1);
    this.setStateWithUpdatedList(list);
  };

  addRemoveSongTransaction = (index, title, artist, id) => {
    let transaction = new RemoveSong_Transaction(
      this,
      index,
      title,
      artist,
      id
    );
    this.tps.addTransaction(transaction);
    this.hideDeleteSongModal();
  };

  // EDIT SONG
  editSong = (indexE, title, artist, youTubeId) => {
    this.state.currentList.songs.splice(indexE, 1, {
      title: title,
      artist: artist,
      youTubeId: youTubeId,
    });

    this.setStateWithUpdatedList(this.state.currentList);
    this.hideEditSongModal();
  };

  addEditSongTransaction = () => {
    let transaction = new EditSong_Transaction(this, this.state.index);
    this.tps.addTransaction(transaction);
  };

  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
  undo = () => {
    if (this.tps.hasTransactionToUndo()) {
      this.tps.undoTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
      //this.updateToolBarButton();
    }
  };
  // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
  redo = () => {
    if (this.tps.hasTransactionToRedo()) {
      this.tps.doTransaction();

      // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
      this.db.mutationUpdateList(this.state.currentList);
      //this.updateToolBarButton();
    }
  };
  markListForDeletion = (keyPair) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: keyPair,
        sessionData: prevState.sessionData,
      }),
      () => {
        // PROMPT THE USER
        this.showDeleteListModal();
      }
    );
  };
  // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
  // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
  showDeleteListModal() {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.add("is-visible");
    this.setState({
      canModal: true,
    });
    //this.state(
    //  canModal: true,
    //)
  }
  // THIS FUNCTION IS FOR HIDING THE MODAL
  hideDeleteListModal() {
    let modal = document.getElementById("delete-list-modal");
    modal.classList.remove("is-visible");
  }
 

  //REMOVE SONG FUNCTION FOR MODAL
  showDeleteSongModal =() =>{
    let modal = document.getElementById("delete-song-modal");
    modal.classList.add("is-visible");
    this.setState({
      canModal: true,
    });
    //this.disableAll();
  }

  hideDeleteSongModal =()=> {
    let modal = document.getElementById("delete-song-modal");
    modal.classList.remove("is-visible");
    //this.updateToolBarButton();
  }

  pointDeletion = (index) => {
    let songName = this.state.currentList.songs[index].title;
    this.setState(
      (prevState) => ({
        index: index,
        title: songName,
        sessionData: prevState.sessionData,
      }),
      () => {
        // PROMPT THE USER
        this.showDeleteSongModal();
      }
    );
  };

  removeSongHelper = () => {
    let index = this.state.index;
    let songName = this.state.currentList.songs[index];
    this.addRemoveSongTransaction(
      index,
      songName.title,
      songName.artist,
      songName.youTubeId
    );
  };

  //EDIT SONG FUNCTIONS FOR MODAL

  showEditSongModal=(index) =>{
    let modal = document.getElementById("edit-song-modal");
    modal.classList.add("is-visible");
    //let t = document.getElementById("titleBox").value;
    //let a = document.getElementById("artistBox").value;
    //let y= document.getElementById("youtubeBox").value;
    document.getElementById("titleBox").value = this.state.currentList.songs[
      index
    ].title;
    document.getElementById("artistBox").value = this.state.currentList.songs[
      index
    ].artist;
    document.getElementById("youtubeBox").value = this.state.currentList.songs[
      index
    ].youTubeId;

    //this.disableAll();
  }

  hideEditSongModal=() =>{
    let modal = document.getElementById("edit-song-modal");
    modal.classList.remove("is-visible");
    //this.updateToolBarButton();
  }
 

  pointEdit = (indexE) => {
    this.setState(
      (prevState) => ({
        currentList: prevState.currentList,
        listKeyPairMarkedForDeletion: prevState.listKeyPairMarkedForDeletion,
        sessionData: prevState.sessionData,
        index: indexE - 1,
      }),
      () => {
        this.showEditSongModal(indexE - 1);
      }
    );
  };

  componentDidMount = () => {
    document.addEventListener("keydown", this.hkd);
  };

  hkd = (event) => {
    if (event.ctrlKey && event.key === "z") {
      this.undo();
    } else if (event.ctrlKey && event.key === "y") {
      this.redo();
    }
  };


  updateToolBarButton=() =>{
    if (this.state.canModal===true){
      this.disableAll();
    }
    else{
    let canAddSong = this.state.currentList !== null;
    let canUndo = this.tps.hasTransactionToUndo();
    let canRedo = this.tps.hasTransactionToRedo();
    let canClose = this.state.currentList !== null;
    this.setState({
      canAddSong: canAddSong,
      canUbdo: canUndo,
      canRedo: canRedo,
      canClose: canClose,
      canModal:false
    });}
  }

  disableButton(id) {
    let button = document.getElementById(id);
    button.classList.add("disabled");
    button.disabled = true;
  }


  disableAll(){
    this.disableButton("add-song-button");
    this.disableButton("undo-button");
    this.disableButton("redo-button");
    this.disableButton("close-button");

  }
/*
getModalbool =(boo)=>{
  this.setState(
    canModal: boo,
  )
}*/
  render() {
    let canAddSong = this.state.currentList !== null;
    let canUndo = this.tps.hasTransactionToUndo();
    let canRedo = this.tps.hasTransactionToRedo();
    let canClose = this.state.currentList !== null;
    let listAdd = this.state.currentList === null;
    return (
      <div id="root">
        <Banner />
        <SidebarHeading
          createNewListCallback={this.createNewList}
          listAdd={listAdd}
        />
        <SidebarList
          currentList={this.state.currentList}
          keyNamePairs={this.state.sessionData.keyNamePairs}
          deleteListCallback={this.markListForDeletion}
          loadListCallback={this.loadList}
          renameListCallback={this.renameList}
        />
        <EditToolbar
          canAddSong={canAddSong} //this.state.canAddSong}
          canUndo={canUndo} //this.state.canUndo}
          canRedo={canRedo} //this.state.canRedo}
          canClose={canClose} //this.state.canClose}
          undoCallback={this.undo}
          redoCallback={this.redo}
          closeCallback={this.closeCurrentList}
          //added line here
          addSongCallback={this.addAddSongTransaction}
        />
        <PlaylistCards
          currentList={this.state.currentList}
          moveSongCallback={this.addMoveSongTransaction}
          deleteSongCallback={this.pointDeletion}
          editSongCallback={this.pointEdit}
        />
        <Statusbar currentList={this.state.currentList} />
        <DeleteListModal
          listKeyPair={this.state.listKeyPairMarkedForDeletion}
          hideDeleteListModalCallback={this.hideDeleteListModal}
          deleteListCallback={this.deleteMarkedList}
        />
        <DeleteSongModal
          songName={this.state.title}
          removeSongCallback={this.removeSongHelper}
          hideDeleteSongModalCallback={this.hideDeleteSongModal}
        />
        <EditSongModal
          editConfirmSongCallback={this.addEditSongTransaction}
          hideEditSongModalCallback={this.hideEditSongModal}
        />
      </div>
    );
  }
}

export default App;
