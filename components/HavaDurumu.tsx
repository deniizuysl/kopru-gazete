import {
  SunIcon,
  CloudSunIcon,
  CloudIcon,
  RainIcon,
  SnowIcon,
  ThunderIcon,
  FogIcon,
} from "@/components/icons";

type HavaDurumuResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
};

function havaStil(kod: number) {
  if (kod === 0) return { Ikon: SunIcon, label: "Güneşli", renk: "text-amber-500" };
  if (kod <= 2) return { Ikon: CloudSunIcon, label: "Parçalı bulutlu", renk: "text-amber-500" };
  if (kod === 3) return { Ikon: CloudIcon, label: "Bulutlu", renk: "text-gray-500" };
  if (kod === 45 || kod === 48) return { Ikon: FogIcon, label: "Sisli", renk: "text-gray-500" };
  if (kod >= 51 && kod <= 67) return { Ikon: RainIcon, label: "Yağmurlu", renk: "text-[#4a6b7b]" };
  if (kod >= 71 && kod <= 77) return { Ikon: SnowIcon, label: "Karlı", renk: "text-sky-500" };
  if (kod >= 80 && kod <= 82) return { Ikon: RainIcon, label: "Sağanak", renk: "text-[#4a6b7b]" };
  if (kod >= 95) return { Ikon: ThunderIcon, label: "Gök gürültülü", renk: "text-[#c8a046]" };
  return { Ikon: CloudIcon, label: "—", renk: "text-gray-500" };
}

export default async function HavaDurumu() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=38.74&longitude=28.39&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul",
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return null;
    const data: HavaDurumuResponse = await res.json();
    const sicaklik = data.current?.temperature_2m;
    const kod = data.current?.weather_code;
    if (sicaklik === undefined || kod === undefined) return null;
    const { Ikon, label, renk } = havaStil(kod);
    return (
      <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm shadow-sm">
        <Ikon size={16} className={renk} />
        <span className="font-semibold text-[#2f4f4f]">{Math.round(sicaklik)}°C</span>
        <span className="hidden sm:inline text-gray-500 text-xs">
          {label} · Köprübaşı
        </span>
      </div>
    );
  } catch {
    return null;
  }
}
