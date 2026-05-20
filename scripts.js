/* Select DOM elements needed for the application */
const video = document.createElement('video'); // Off-screen video element to handle the stream
const canvas = document.querySelector('.photo'); // On-screen canvas to display processed video
const ctx = canvas.getContext('2d'); // 2D context for drawing on the canvas
const strip = document.querySelector('.strip'); // Container for captured photos
const snap = document.querySelector('.snap'); // Shutter sound audio element

/* Application State */
let activeFilter = 'none'; // Keeps track of which filter is currently selected

/**
 * Requests access to the user's webcam.
 */
async function getVideo() {
  try {
    // navigator.mediaDevices.getUserMedia returns a promise that resolves to the webcam stream
    const localMediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    
    // Set the video source to the local stream
    video.srcObject = localMediaStream;
    video.play();
  } catch (err) {
    console.error(`Webcam access denied:`, err);
    alert('Please allow webcam access to use the photobooth.');
  }
}

/**
 * Periodically draws the current video frame to the canvas and applies selected filters.
 */
function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  
  // Match canvas dimensions to the video feed
  canvas.width = width;
  canvas.height = height;

  // Set up an interval to redraw the canvas every ~16ms (roughly 60fps)
  return setInterval(() => {
    // 1. Reset canvas global state
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    
    // 2. Apply Native Browser Filters (Fastest)
    if (activeFilter === 'grayscale') ctx.filter = 'grayscale(100%)';
    if (activeFilter === 'sepia') ctx.filter = 'sepia(100%)';
    if (activeFilter === 'invert') ctx.filter = 'invert(100%)';

    // 3. Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, width, height);

    // 4. Apply Custom Pixel Manipulation Filters
    if (['redEffect', 'rgbSplit', 'cyber', 'solarize'].includes(activeFilter)) {
      // Pull the raw pixel data out of the canvas
      let pixels = ctx.getImageData(0, 0, width, height);
      
      // Pass pixels through the selected filter function
      if (activeFilter === 'redEffect') pixels = redEffect(pixels);
      if (activeFilter === 'rgbSplit') pixels = rgbSplit(pixels);
      if (activeFilter === 'cyber') pixels = cyberFilter(pixels);
      if (activeFilter === 'solarize') pixels = solarizeFilter(pixels);
      
      // Put the modified pixels back onto the canvas
      ctx.putImageData(pixels, 0, 0);

      // Special case: 'cyber' uses a ghosting effect (low transparency redraw)
      if (activeFilter === 'cyber') {
        ctx.globalAlpha = 0.1;
      }
    }
  }, 16);
}

/**
 * Switches the active filter and updates the UI button state.
 */
function changeFilter(filter, el) {
  activeFilter = filter;
  // Remove 'active' class from all buttons and add it to the clicked one
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  el.classList.add('active');
}

/* --- Pixel Manipulation Filter Functions --- */

// Boosts the red channel while reducing green and blue
function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // RED
    pixels.data[i + 1] = pixels.data[i + 1] - 50;  // GREEN
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // BLUE
  }
  return pixels;
}

// Shifts color channels horizontally to create a chromatic aberration effect
function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (i - 150 >= 0) pixels.data[i - 150] = pixels.data[i + 0]; // Red shift
    if (i + 500 < pixels.data.length) pixels.data[i + 500] = pixels.data[i + 1]; // Green shift
    if (i - 550 >= 0) pixels.data[i - 550] = pixels.data[i + 2]; // Blue shift
  }
  return pixels;
}

// Cyberpunk effect with color shifting and horizontal scanlines
function cyberFilter(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (i + 20 < pixels.data.length) pixels.data[i + 0] = pixels.data[i + 20];
    if (i - 20 >= 0) pixels.data[i + 2] = pixels.data[i - 20];
    pixels.data[i + 1] = pixels.data[i + 1] * 1.2;
    
    // Create scanline effect by darkening every 4th row
    const row = Math.floor(i / 4 / canvas.width);
    if (row % 4 === 0) {
       pixels.data[i + 0] *= 0.8;
       pixels.data[i + 1] *= 0.8;
       pixels.data[i + 2] *= 0.8;
    }
  }
  return pixels;
}

// Inverts colors based on a threshold to create a solarized look
function solarizeFilter(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] > 128 ? 255 - pixels.data[i + 0] : pixels.data[i + 0];
    pixels.data[i + 1] = pixels.data[i + 1] > 128 ? 255 - pixels.data[i + 1] : pixels.data[i + 1];
    pixels.data[i + 2] = pixels.data[i + 2] > 128 ? 255 - pixels.data[i + 2] : pixels.data[i + 2];
  }
  return pixels;
}

/**
 * Captures the current canvas frame as a JPEG and adds it to the photo strip.
 */
function takePhoto() {
  // Play the camera shutter sound
  snap.currentTime = 0;
  snap.play();

  // Export the canvas content as a base64 encoded JPEG
  const data = canvas.toDataURL('image/jpeg');
  
  // Create a container for the new photo
  const div = document.createElement('div');
  div.classList.add('strip-item');
  div.innerHTML = `
    <a href="${data}" download="shot" class="photo-link">
      <img src="${data}" alt="Photo" />
    </a>
    <div class="delete-photo" onclick="deletePhoto(this)">×</div>
  `;
  
  // Insert the new photo at the beginning of the strip
  strip.insertBefore(div, strip.firstChild);
}

/**
 * Removes a specific photo from the strip.
 */
function deletePhoto(el) {
  el.parentElement.remove();
}

/**
 * Clears all photos from the strip after confirmation.
 */
function clearStrip() {
  if (confirm('Are you sure you want to clear all photos?')) {
    strip.innerHTML = '';
  }
}

/**
 * Bundles all photos in the strip into a single ZIP file and starts the download.
 */
async function downloadZip() {
  const images = strip.querySelectorAll('.photo-link');
  if (images.length === 0) {
    alert('No photos to download!');
    return;
  }

  // Create a new JSZip instance
  const zip = new JSZip();
  const folder = zip.folder("photobooth-photos");

  // Loop through all images and add them to the ZIP
  images.forEach((link, index) => {
    // Extract only the base64 string part of the data URL
    const imageData = link.href.split(',')[1];
    folder.file(`shot-${index + 1}.jpg`, imageData, {base64: true});
  });

  // Generate the ZIP blob and trigger a download link
  const content = await zip.generateAsync({type: "blob"});
  const zipLink = document.createElement('a');
  zipLink.href = URL.createObjectURL(content);
  zipLink.download = "photobooth-shots.zip";
  zipLink.click();
}

/* Initialization */
getVideo();
// Once the video stream is ready, start painting it to the canvas
video.addEventListener('canplay', paintToCanvas);
