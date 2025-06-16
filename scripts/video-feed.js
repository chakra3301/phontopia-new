// Existing videoSources and HTML/JS setup remains unchanged

const videoSources = [
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid1.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid2.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid3.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid4.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid5.mp4',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid6.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid7.mp4',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid8.mp4',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid9.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid10.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid11.mov',
  'https://pub-47d44b4e2e4c43d7922bf3cc7715f8b0.r2.dev/vid12.mov'
];

const videoFeed = document.getElementById('video-feed');
const popupOverlay = document.querySelector('.video-popup-overlay');
const popupContent = document.querySelector('.video-popup-content');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target.querySelector('video');
    if (video) {
      if (entry.isIntersecting) {
        video.play().catch(err => console.warn('Autoplay failed:', err));
      } else {
        video.pause();
      }
    }
  });
}, { threshold: 0.7 });

popupOverlay.addEventListener('click', (e) => {
  if (e.target === popupOverlay) {
    const video = popupContent.querySelector('video');
    if (video) video.pause();
    popupOverlay.classList.remove('active');
    popupContent.innerHTML = '';
  }
});

function isMobile() {
  return window.innerWidth <= 480;
}

// Create swipe-only mobile carousel container
const mobileCarousel = document.createElement('div');
mobileCarousel.id = 'mobile-video-carousel';
mobileCarousel.style.display = 'none';
mobileCarousel.innerHTML = `
  <div class="carousel-video-container" id="carouselSwipeArea"></div>
`;
document.body.appendChild(mobileCarousel);

const carouselContainer = document.getElementById('carouselSwipeArea');
let currentVideoIndex = 0;

function renderCarouselVideo(index) {
  const video = document.createElement('video');
  video.src = videoSources[index];
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.controlsList = 'nodownload nofullscreen noremoteplayback';
  video.setAttribute('disablePictureInPicture', '');
  video.controls = false;

  const frame = document.createElement('img');
  frame.src = 'assets/videoframe.png';
  frame.alt = 'Video Frame';
  frame.className = 'video-frame-png';

  carouselContainer.innerHTML = '';
  carouselContainer.appendChild(video);
  carouselContainer.appendChild(frame);

  // Safe async play
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.warn('Autoplay error:', error.message);
    });
  }
}

// Swipe logic
let touchStartX = 0;
let touchEndX = 0;

carouselContainer.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

carouselContainer.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const swipeThreshold = 50;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) > swipeThreshold) {
    if (deltaX < 0) {
      currentVideoIndex = (currentVideoIndex + 1) % videoSources.length;
    } else {
      currentVideoIndex = (currentVideoIndex - 1 + videoSources.length) % videoSources.length;
    }
    renderCarouselVideo(currentVideoIndex);
  }
}

function toggleVideoLayout() {
  if (isMobile()) {
    videoFeed.style.display = 'none';
    mobileCarousel.style.display = 'flex';
    renderCarouselVideo(currentVideoIndex);
  } else {
    videoFeed.style.display = 'block';
    mobileCarousel.style.display = 'none';
  }
}

window.addEventListener('DOMContentLoaded', toggleVideoLayout);
window.addEventListener('resize', toggleVideoLayout);

// Desktop: render grid
videoSources.forEach((src, index) => {
  const wrapper = document.createElement('div');
  wrapper.classList.add('video-wrapper-dynamic');

  wrapper.innerHTML = `
    <div class="video-frame-custom">
      <video id="phonkVideo_${index}"
             src="${src}"
             muted
             loop
             playsinline
             autoplay
             controlslist="nodownload nofullscreen noremoteplayback"
             disablePictureInPicture>
      </video>
      <img src="assets/videoframe.png" alt="Video Frame" class="video-frame-png">
    </div>
  `;

  videoFeed.appendChild(wrapper);
  observer.observe(wrapper);

  const videoFrame = wrapper.querySelector('.video-frame-custom');
  videoFrame.addEventListener('click', () => {
    if (window.innerWidth > 600 && !isMobile()) {
      const video = wrapper.querySelector('video').cloneNode(true);
      const frame = wrapper.querySelector('.video-frame-png').cloneNode(true);
      popupContent.innerHTML = '';
      popupContent.appendChild(video);
      popupContent.appendChild(frame);
      popupOverlay.classList.add('active');
      video.play();
    }
  });
});