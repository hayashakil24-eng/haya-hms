import PageBanner from "../components/PageBanner";

const reasons = [
  { icon: "fa-map-marker", title: "Prime Location", text: "Close to the city's business centres, markets and food streets." },
  { icon: "fa-bed", title: "Comfortable Rooms", text: "Clean, quiet rooms with quality bedding for a restful night." },
  { icon: "fa-smile-o", title: "Friendly Staff", text: "A caring team that treats every guest like family." },
];

function About() {
  return (
    <>
      <PageBanner title="About Us" />

      <section className="section-space section-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 about-text">
              <div className="section-title left">
                <span>Our Story</span>
                <h2>Hospitality Made Simple</h2>
              </div>
              <p>
                Haya HMS started with a simple idea: staying at a hotel should be stress free.
                From booking your room to checking out, we keep every step clear, quick and
                friendly.
              </p>
              <p>
                Our rooms are cared for every day, our prices are honest, and our front desk is
                open around the clock. We are proud to welcome travellers, families and business
                guests from all over the country.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="about-images">
                <img src="/img/about-1.webp" alt="Hotel lounge" loading="lazy" />
                <img src="/img/about-2.webp" alt="Hotel room" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container">
          <div className="section-title">
            <span>Why Choose Us</span>
            <h2>What Makes Us Different</h2>
          </div>
          <div className="row">
            {reasons.map((item) => (
              <div className="col-lg-4 col-md-6" key={item.title}>
                <div className="service-card">
                  <i className={`fa ${item.icon}`}></i>
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
