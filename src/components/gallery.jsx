"use client";

import { useState } from 'react';
import { RiFullscreenLine, RiCloseLine, RiArrowLeftLine, RiArrowRightLine } from 'react-icons/ri';

export default function ImageGallery({ images }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const maxThumbnails = 4; // Maximum thumbnails to show before using +X

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  // Function to handle thumbnail click when there are more than maxThumbnails
  const handleThumbnailClick = (index) => {
    if (index >= maxThumbnails - 1 && images.length > maxThumbnails) {
      // If clicking on the "+X" thumbnail, go to the first hidden image
      setCurrentImage(maxThumbnails - 1);
    } else {
      setCurrentImage(index);
    }
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex justify-end p-4">
          <button
            onClick={toggleFullscreen}
            className="text-white p-2 hover:bg-white/10 rounded-full"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="flex-1 relative flex items-center justify-center">
          <button
            onClick={prevImage}
            className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <RiArrowLeftLine size={24} />
          </button>

          <img
            src={images[currentImage].src}
            alt={images[currentImage].title}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />

          <button
            onClick={nextImage}
            className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <RiArrowRightLine size={24} />
          </button>
        </div>

        <div className="flex justify-center p-4 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full ${currentImage === index ? 'bg-white' : 'bg-white/50'
                }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 grid md:grid-cols-4 gap-5">
      {/* Main Image */}
      <div className="relative rounded-xl overflow-hidden h-[465px] col-span-3">
        <img
          src={images[currentImage].src}
          alt={images[currentImage].title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-full flex items-center text-sm"
        >
          <RiFullscreenLine className="mr-2" /> View all photos
        </button>
      </div>

      {/* Thumbnails */}
      <div className="grid md:grid-cols-1 grid-cols-4 gap-3">
        {images.slice(0, Math.min(images.length, maxThumbnails)).map((image, index) => {
          // If we're at the last thumbnail and there are more images than maxThumbnails
          if (index === maxThumbnails - 1 && images.length > maxThumbnails) {
            const remainingCount = images.length - maxThumbnails + 1;
            return (
              <div
                key="more-thumbnails"
                className="rounded-lg overflow-hidden h-24 border-2 cursor-pointer transition-all border-transparent bg-gray-200 flex items-center justify-center"
                onClick={() => handleThumbnailClick(index)}
              >
                <span className="text-xl font-semibold text-gray-700">+{remainingCount}</span>
              </div>
            );
          }

          return (
            <div
              key={image.id}
              className={`rounded-lg overflow-hidden h-24 border-2 cursor-pointer transition-all ${currentImage === index ? 'border-accent' : 'border-transparent'
                }`}
              onClick={() => setCurrentImage(index)}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
