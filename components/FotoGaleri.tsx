"use client";

import { useState } from "react";
import Image from "next/image";

interface FotoGaleriProps {
  fotografUrls: string[];
  fotografAlt?: string | null;
  baslik: string;
}

export default function FotoGaleri({ fotografUrls, fotografAlt, baslik }: FotoGaleriProps) {
  const [acikFoto, setAcikFoto] = useState<number | null>(null);

  if (fotografUrls.length === 0) return null;

  return (
    <>
      <div className="mb-6">
        {/* Ana fotoğraf */}
        <div
          className="relative w-full h-96 rounded-lg overflow-hidden mb-2 bg-gray-900 cursor-zoom-in"
          onClick={() => setAcikFoto(0)}
        >
          <Image
            src={fotografUrls[0]}
            alt={fotografAlt || baslik}
            fill
            className="object-cover"
            priority
          />
          {fotografAlt && (
            <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2">
              {fotografAlt}
            </p>
          )}
        </div>

        {/* Küçük fotoğraflar */}
        {fotografUrls.length > 1 && (
          <div className={`grid gap-2 ${fotografUrls.length === 2 ? "grid-cols-1" : "grid-cols-3"}`}>
            {fotografUrls.slice(1).map((url, i) => (
              <div
                key={i}
                className="relative h-64 rounded-lg overflow-hidden bg-gray-900 cursor-zoom-in"
                onClick={() => setAcikFoto(i + 1)}
              >
                <Image
                  src={url}
                  alt={`Fotoğraf ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {acikFoto !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setAcikFoto(null)}
        >
          {/* Kapat butonu */}
          <button
            className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300 z-10"
            onClick={() => setAcikFoto(null)}
          >
            ×
          </button>

          {/* Önceki */}
          {acikFoto > 0 && (
            <button
              className="absolute left-4 text-white text-4xl font-light hover:text-gray-300 z-10 px-4 py-2"
              onClick={(e) => { e.stopPropagation(); setAcikFoto(acikFoto - 1); }}
            >
              ‹
            </button>
          )}

          {/* Fotoğraf */}
          <div
            className="relative w-full h-full max-w-5xl max-h-screen p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={fotografUrls[acikFoto]}
              alt={`Fotoğraf ${acikFoto + 1}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Sonraki */}
          {acikFoto < fotografUrls.length - 1 && (
            <button
              className="absolute right-4 text-white text-4xl font-light hover:text-gray-300 z-10 px-4 py-2"
              onClick={(e) => { e.stopPropagation(); setAcikFoto(acikFoto + 1); }}
            >
              ›
            </button>
          )}

          {/* Sayaç */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {acikFoto + 1} / {fotografUrls.length}
          </div>
        </div>
      )}
    </>
  );
}
