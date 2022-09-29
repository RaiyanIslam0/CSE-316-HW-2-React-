import React, { Component } from "react";

export default class EditSongModal extends Component {
  handleConfirm = (event) => {
    
    let t = document.getElementById("titleBox").value;
    let a = document.getElementById("artistBox").value;
    let y = document.getElementById("youtubeBox").value;
    console.log("handle: "+t);
    console.log("handle: " + a);

    this.props.editConfirmSongCallback(t, a, y);
  };
  render() {
    const {editConfirmSongCallback,hideEditSongModalCallback,songName,
    } = this.props;

    let name = "";
    return (
      <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
        <div class="modal-root" id="verify-delete-song-root">
          <div class="modal-north">Edit Song</div>
          <div class="modal-center">
            <div class="modal-center-content">
              <label class="preText">Title: </label>
              <input type="text" id="titleBox" class="textBox" />
              <br />
              <label class="preText">Artist: </label>
              <input type="text" id="artistBox" class="textBox" />
              <br />
              <label class="preText">YouTube ID:</label>
              <input type="text" id="youtubeBox" class="textBox" />
              <br />
            </div>
          </div>
          <div class="modal-south">
            <input
              type="button"
              id="delete-song-confirm-button"
              class="modal-button"
              onClick={this.handleConfirm}
              value="Confirm"
            />
            <input
              type="button"
              id="delete-song-cancel-button"
              class="modal-button"
              onClick={hideEditSongModalCallback}
              value="Cancel"
            />
          </div>
        </div>
      </div>
    );
  }
}
