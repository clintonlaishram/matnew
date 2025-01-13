import React, { useState } from 'react';

interface ProductMediaCarouselProps {
  mediaUrls: string[]; // Array of media URLs (images/videos)
}

const ProductMediaCarousel: React.FC<ProductMediaCarouselProps> = ({ mediaUrls }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Tracks currently visible media

  const handleNextMedia = () => {
    setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % mediaUrls.length); // Move to next media
  };

  const handlePrevMedia = () => {
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? mediaUrls.length - 1 : prevIndex - 1
    ); // Move to previous media
  };

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg mb-4">
      {mediaUrls.map((url, index) => {
        const isVisible = index === currentMediaIndex; // Show only the current media
        const isVideo = /\.(mp4|webm|ogg)$/i.test(url); // Check if the media is a video

        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {isVideo ? (
              <video
                src={url}
                controls
                muted
                loop
                className="w-full h-full object-cover rounded-lg"
              ></video>
            ) : (
              <img
                src={url}
                alt={`Media ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        );
      })}

      {/* Navigation Buttons */}
      {mediaUrls.length > 1 && (
        <>
          <button
            onClick={handlePrevMedia}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            ❮
          </button>
          <button
            onClick={handleNextMedia}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
          >
            ❯
          </button>
        </>
      )}
    </div>
  );
};

export default ProductMediaCarousel;
