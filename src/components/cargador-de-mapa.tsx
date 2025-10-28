'use client';

import dynamic from 'next/dynamic';

const MapaInteractivo = dynamic(
  () => import('@/components/mapa-interactivo'),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse" />,
  }
);

export default function CargadorDeMapa() {
  return <MapaInteractivo />;
}