function PageBanner({ title }) {
  return (
    <section className="page-banner">
      <div className="container">
        <h2>{title}</h2>
        <p>
          <a href="#/home">Home</a>
          <span>/</span>
          {title}
        </p>
      </div>
    </section>
  );
}

export default PageBanner;
