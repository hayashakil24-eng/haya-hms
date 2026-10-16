import PageBanner from "../components/PageBanner";
import RoomCards from "../components/RoomCards";

function Rooms() {
  return (
    <>
      <PageBanner title="Our Rooms" />
      <section className="section-space">
        <div className="container">
          <div className="section-title">
            <span>Rooms & Suites</span>
            <h2>Find Your Perfect Room</h2>
          </div>
          <p className="section-intro">
            Every room comes with free Wi-Fi, daily housekeeping and 24 hour room service. Prices
            and availability are updated live by our front desk.
          </p>
          <RoomCards />
        </div>
      </section>
    </>
  );
}

export default Rooms;
