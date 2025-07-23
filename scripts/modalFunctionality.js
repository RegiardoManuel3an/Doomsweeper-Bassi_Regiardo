function showModal(title, message, event) {
  document.getElementById('modalTitle').innerText = title;
  document.getElementById('modalMessage').innerText = message;
  document.getElementById('AlertModal').style.display = 'block';
  document.getElementById('restartButton').style.display = 'block';
    if (event == 'flags') {
        document.getElementById('restartButton').style.display = 'none';
    }
}

function closeModal() {
  document.getElementById('AlertModal').style.display = 'none';
}

function playAgain(){
  closeModal();
  document.querySelector('.DoomGuyIMG').click();
}