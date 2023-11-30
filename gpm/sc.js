document.getElementById('githubUrl').addEventListener('change', function(event) {
  const repoUrl = event.target.value;

  // Use the repoUrl to fetch repository data using GitHub API
  fetch(`https://api.github.com/repos/${extractRepoInfo(repoUrl)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Autofill form fields with the retrieved data
      document.getElementById('name').value = data.name || '';
      document.getElementById('description').value = data.description || '';

      // Use the repository name for Google image search
      const repoName = data.name || '';

      // Fetch image files from the repository
      fetch(`https://api.github.com/repos/${extractRepoInfo(repoUrl)}/contents`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(imagesData => {
          // Filter for image files in the repository (you can adjust the logic for your requirements)
          const imageFiles = imagesData.filter(item => {
            return item.type === 'file' && (item.name.endsWith('.png') || item.name.endsWith('.jpg') || item.name.endsWith('.jpeg') || item.name.endsWith('.gif'));
          });

          // If multiple images found, create a popup to select an image
          if (imageFiles.length > 0) {
            createImageSelectionPopup(imageFiles, data.name, data.description);
          } else {
            console.error('No image found in the repository.');
          }
        })
        .catch(error => {
          console.error('Error fetching repository images:', error);
        });
      
      document.getElementById('githubUrl').value = repoUrl || ''; // Autofill GitHub URL field
    })
    .catch(error => {
      console.error('Error fetching repository data:', error);
    });
});

let selectedImageUrl = ''; // Store selected image URL globally

// Function to create a popup/modal for image selection
function createImageSelectionPopup(images, repoName, repoDescription) {
  const popup = window.open('', '_blank');
  if (popup) {
    let galleryHTML = `<html><head><title>Image Selection</title>`;
    galleryHTML += `<style>
      body { background-color: #333; color: #fff; font-family: Arial, sans-serif; padding: 20px; }
      img { max-width: 150px; margin: 5px; cursor: pointer; }
      .image-container { text-align: center; }
      .image-container img { max-width: 100%; }
      .image-info { margin-top: 10px; }
      .copy-button { cursor: pointer; background-color: #ffa500; color: #333; padding: 5px 10px; border: none; border-radius: 4px; }
      .copy-button:hover { background-color: #ffa500cc; }
    </style></head><body>`;
    galleryHTML += `<h3>${repoName}</h3><p>${repoDescription}</p><h4>Select an image:</h4>`;
    images.forEach((image, index) => {
      galleryHTML += `<div class="image-container"><img src="${image.download_url}" onclick="selectImage('${image.download_url}')"/></div>`;
    });
    galleryHTML += `<div class="image-info"><input type="text" id="imageLink" readonly style="width: 80%;" /><br><button class="copy-button" onclick="copyImageLink()">Copy Link</button></div>`;
    galleryHTML += `<script>
      function selectImage(imageUrl) {
        const imageLinkInput = document.getElementById('imageLink');
        imageLinkInput.value = imageUrl;
      }
      function copyImageLink() {
        const imageLinkInput = document.getElementById('imageLink');
        imageLinkInput.select();
        document.execCommand('copy');
        alert('Image link copied to clipboard!');
      }
    </script>`;
    galleryHTML += `</body></html>`;

    // Write the HTML to the popup window
    popup.document.write(galleryHTML);
  } else {
    console.error('Popup blocked. Please allow popups for this site to see the image selection.');
  }
}



// Function to handle image selection in the popup
function selectImage(imageUrl) {
  selectedImageUrl = imageUrl;
  document.getElementById('imageLink').value = selectedImageUrl || '';
}

// Function to copy image link to clipboard
function copyImageLink() {
  const imageLink = document.getElementById('imageLink');
  imageLink.select();
  document.execCommand('copy');
  alert('Image link copied to clipboard!');
}

// Function to extract username and repository name from GitHub URL
function extractRepoInfo(url) {
  const parts = url.split('/');
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}


