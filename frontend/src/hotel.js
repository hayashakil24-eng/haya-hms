export const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const HOTEL = {
  name: "Haya HMS",
  phone: "+92 300 1234567",
  whatsapp: "923001234567",
  email: "info@hayahms.com",
  address: "Karachi, Pakistan",
};

export const ROOM_TYPES = [
  {
    type: "Single",
    image: "/img/room-single.webp",
    size: "25 m²",
    capacity: "1 Person",
    bed: "Single Bed",
  },
  {
    type: "Double",
    image: "/img/room-double.webp",
    size: "35 m²",
    capacity: "2 Persons",
    bed: "Queen Bed",
  },
  {
    type: "Suite",
    image: "/img/room-suite.webp",
    size: "55 m²",
    capacity: "Up to 4 Persons",
    bed: "King Bed",
  },
];

export const SERVICES = [
  { icon: "fa-wifi", title: "Free Wi-Fi", text: "Fast and reliable internet in every room and lounge." },
  { icon: "fa-cutlery", title: "Restaurant", text: "Fresh local and continental dishes served all day." },
  { icon: "fa-car", title: "Free Parking", text: "Safe and secure parking space for every guest." },
  { icon: "fa-bell-o", title: "Room Service", text: "Our team is available around the clock for you." },
  { icon: "fa-plane", title: "Airport Pickup", text: "Comfortable pickup and drop service on request." },
  { icon: "fa-shopping-basket", title: "Laundry", text: "Same day laundry and ironing for a fresh stay." },
];
