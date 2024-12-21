'use strict'

const input = document.getElementById('imageForm')
const profileImage = document.getElementById('profileImage')
const customImage = sessionStorage.getItem('imageProfile')

// Keep image updated even after refreshing
if (customImage)
    profileImage.src = customImage

function changeProfileImage() {
    input.click()
}

input.addEventListener('change', (event) => {
    const imgPath = event.target.files[0]
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        sessionStorage.setItem("imageProfile", reader.result)
        location.reload()
    }, false)
    if (imgPath) {
        reader.readAsDataURL(imgPath);
    }
})