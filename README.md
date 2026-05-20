# 📸 Minimalist Webcam Photobooth

A sleek, minimalist webcam photobooth built with Vanilla JavaScript, HTML5 Canvas, and the Web-RTC API. This project was inspired by Wes Bos's [JavaScript30](https://javascript30.com/) challenge (Day 19) and enhanced with modern features.

## ✨ Features

- **Real-time Webcam Preview:** Low-latency video stream rendered directly to a canvas.
- **Dynamic Filters:** Apply various filters in real-time, including:
  - **Native CSS Filters:** Grayscale, Sepia, and Invert.
  - **Pixel Manipulation:** Red Effect and RGB Split.
  - **Complex Effects:** Cyber (scanlines + ghosting) and Solarize.
- **Photo Capture:** Instant photo capture with a classic shutter sound.
- **Polaroid Strip:** Captured photos are displayed in a playful, scattered Polaroid-style strip.
- **Management:** Delete individual photos or clear the entire strip with one click.
- **Bulk Download:** Download all captured photos at once in a single **ZIP file** using [JSZip](https://stuk.github.io/jszip/).

## 🚀 Getting Started

Since this is a client-side application using `getUserMedia`, it **requires a secure context (HTTPS or localhost)** to access the webcam.

### Option 1: Live Server (Recommended)
If you are using VS Code, use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
1. Open `index.html`.
2. Click "Go Live" in the bottom status bar.

### Option 2: Simple Python Server
If you have Python installed, run:
```bash
# Python 3.x
python -m http.server
```
Then visit `http://localhost:8000`.

## 🛠️ Built With

- **Vanilla JavaScript** - Core logic and pixel manipulation.
- **HTML5 Canvas** - Rendering and image processing.
- **CSS3** - Layout and Polaroid aesthetics.
- **JSZip** - Bundling images into a ZIP archive.

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
