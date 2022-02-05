// Initialize and add the map
function initMap() {
    // The location of Singapore
    const location = { lat: 1.2960046, lng: 103.7740884 };
    // The map, centered at Singapore
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 15,
      center: location,
    });
    // The marker, positioned at Singapore
    const marker = new google.maps.Marker({
      position: location,
      map: map,
    });
  }