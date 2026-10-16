import { useEffect, useState } from "react";
import { API, ROOM_TYPES } from "../hotel";

function RoomCards() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch(`${API}/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch(() => setRooms([]));
  }, []);

  return (
    <div className="row">
      {ROOM_TYPES.map((item) => {
        const list = rooms.filter((r) => r.type === item.type);
        const available = list.filter((r) => r.status === "Available").length;
        const price = list.length ? Math.min(...list.map((r) => r.price)) : 0;

        return (
          <div className="col-lg-4 col-md-6" key={item.type}>
            <div className="room-card">
              <img src={item.image} alt={`${item.type} room`} loading="lazy" />
              <div className="room-card-body">
                <h4>{item.type} Room</h4>
                <p className="room-price">
                  {price ? (
                    <>
                      Rs {price.toLocaleString()}
                      <span>/ night</span>
                    </>
                  ) : (
                    "Price on request"
                  )}
                </p>
                <ul className="room-info">
                  <li><span>Size</span>{item.size}</li>
                  <li><span>Capacity</span>{item.capacity}</li>
                  <li><span>Bed</span>{item.bed}</li>
                </ul>
                <p className={available ? "room-available" : "room-full"}>
                  {available
                    ? `${available} room${available > 1 ? "s" : ""} available`
                    : "Currently fully booked"}
                </p>
                <a href="#/contact" className="hms-btn">Book Now</a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default RoomCards;
