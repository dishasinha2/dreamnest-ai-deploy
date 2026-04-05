import { useEffect, useState } from "react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=2200&q=80",
    position: "center center"
  },
  {
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2200&q=80",
    position: "center center"
  },
  {
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=80",
    position: "center center"
  },
  {
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=2200&q=80",
    position: "center center"
  }
];

export default function InteriorBackdrop() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="interior-backdrop" aria-hidden="true">
      <div className="interior-backdrop-base" />
      {slides.map((slide, index) => (
        <div
          key={slide.image}
          className={`interior-backdrop-slide ${index === active ? "is-active" : ""}`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundPosition: slide.position
          }}
        />
      ))}
      <div className="interior-backdrop-overlay" />
      <div className="interior-backdrop-veil" />
      <div className="interior-backdrop-grain" />
    </div>
  );
}
