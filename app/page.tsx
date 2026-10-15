const works = [
  { title: "Sol de tierra", type: "Estudio de color · 2026", style: "sun" },
  { title: "El silencio azul", type: "Composición abstracta · 2026", style: "blue" },
  { title: "Encuentro", type: "Formas y equilibrio · 2026", style: "shapes" },
];

export default function Home() {
  return (
    <div className="gallery">
      <header className="header">
        <a className="brand" href="#inicio" aria-label="Lienzo, inicio">lienzo<span>®</span></a>
        <nav aria-label="Navegación principal">
          <a href="#obras">Las obras</a>
          <a href="#nosotros">La galería</a>
          <a className="nav-visit" href="#visita">Visítanos ↗</a>
        </nav>
      </header>
      <main id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow"><span className="dot" /> UN ESPACIO PARA MIRAR DISTINTO</p>
            <h1>El arte empieza<br />con una <em>mirada.</em></h1>
            <p className="intro">Formas, colores e historias que merecen una pausa. Descubre nuestra pequeña colección de arte contemporáneo.</p>
            <a className="button" href="#obras">Explora la colección <span>↗</span></a>
            <p className="hero-note">Arte contemporáneo. Curiosidad sin límites.</p>
          </div>
          <figure className="hero-art">
            <div className="artwork sun" role="img" aria-label="Composición abstracta de un sol naranja sobre arcos terracota"><i /><b /></div>
            <figcaption><span>01 / SOL DE TIERRA</span><span>COLECCIÓN LIENZO</span></figcaption>
          </figure>
        </section>
        <section className="collection" id="obras">
          <div className="section-heading"><div><p className="eyebrow">UNA SELECCIÓN CON INTENCIÓN</p><h2>Tres obras. Infinitas miradas.</h2></div><span className="count">(01 — 03)</span></div>
          <div className="works">{works.map((work, index) => (
            <figure className="work" key={work.title}>
              <div className={`artwork ${work.style}`} role="img" aria-label={`Obra abstracta: ${work.title}`}><i /><b /></div>
              <figcaption><div><h3>{work.title}</h3><p>{work.type}</p></div><span>0{index + 1}</span></figcaption>
            </figure>
          ))}</div>
        </section>
        <section className="about" id="nosotros"><p className="eyebrow">LA GALERÍA</p><h2>Un lugar para el arte.<br /><em>Y para todos.</em></h2><p>Creemos que no necesitas entenderlo todo para sentir algo. Lienzo es una galería conceptual que celebra lo simple: detenerse, observar y encontrar tu propia conexión con cada obra.</p></section>
        <section className="visit" id="visita"><div><p className="eyebrow">SIGUE EXPLORANDO</p><h2>Tu próxima inspiración<br />está aquí.</h2><p>Esta galería digital siempre tiene las puertas abiertas.</p></div><a className="button" href="#obras">Volver a las obras <span>↗</span></a></section>
      </main>
      <footer><a className="brand" href="#inicio">lienzo<span>®</span></a><p>Una pequeña galería. Una nueva perspectiva.</p><span>© 2026 LIENZO</span></footer>
    </div>
  );
}
