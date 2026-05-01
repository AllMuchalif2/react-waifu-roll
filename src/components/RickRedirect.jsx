import { useEffect } from 'react';

export default function RickRedirect() {
  useEffect(() => {
    window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white font-black italic">
      ingin koin gratis??
    </div>
  );
}
