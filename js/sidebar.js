let opened = false

function openSidebar() {
  if (opened) {
    document.querySelector('.left-sidebar').style.left = '-300px'
    opened = false
  } else {
    document.querySelector('.left-sidebar').style.left = '0'
    opened = true
  }
}