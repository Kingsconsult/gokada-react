export const getAddressApi = async (string) => {
  const places = new window.google.maps.places.AutocompleteService({
    componentRestrictions: { country: "NG" },
    fields: ["name"],
  });

  return new Promise((resolve, reject) => {
    places.getQueryPredictions({ input: string }, (prediction, status) => {
      if (status === "OK" && prediction.length) {
        const place = prediction.map((item) => {
          // console.log(item);
          return item.description;
        });
        resolve(place);
      }
      reject([]);
    });
  });
};

export const setMap = async (dropoffPosition = null, pickupPosition = null) => {
  const directionsService = new window.google.maps.DirectionsService();
  const directionsRenderer = new window.google.maps.DirectionsRenderer();
  const {
    coords: { latitude, longitude },
  } = await new Promise((resolve, reject) => {
    window.navigator.geolocation.getCurrentPosition((position) => {
      resolve(position);
    });
  });

  const position = { lat: latitude, lng: longitude };

  let dropofflatLng =
    dropoffPosition && (await getAddressGeocoding(dropoffPosition));
  let pickupLatLng =
    pickupPosition && (await getAddressGeocoding(pickupPosition));

  let map = new window.google.maps.Map(document.getElementById("map"), {
    center: position,
    zoom: 8,
  });

  directionsRenderer.setMap(map);

  if(dropoffPosition && pickupPosition){
        calculateAndDisplayRoute(
    directionsService,
    directionsRenderer,
    pickupPosition,
    dropoffPosition
  );
  }

  new window.google.maps.Marker({
    position: dropofflatLng ?? position,
    map,
    title: "",
  });

  new window.google.maps.Marker({
    position: pickupLatLng ?? position,
    map,
    title: "",
  });
};

//get address
const getAddressGeocoding = async (address) => {
  try {
    address = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=AIzaSyCGPY_hsHcarYRmtuyvZCTOyoRWGN7-JGA`;
    let addressUrl = new URL(address);
    let response = await fetch(addressUrl.href);
    let {
      results: [position],
    } = await response.json();
    let {
      geometry: { location },
    } = position;
    return location;
  } catch (error) {
    return null;
  }
};

export const databaseResult = [];

// debopunce api call
export const debounceCall = (timer) => {
  return function (string) {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    return new Promise((resolve, reject) => {
      timer.current = setTimeout(async () => {
        try {

          //let databaseResult = await fetch('url').json()
          let databaseResult = await fetch('https://kingsley-gokada.herokuapp.com/api/addresses')
          .then(response => response.json())
          .then(data => data);

          // console.log(databaseResult)  


          const oldAddres = await databaseResult.find((x) =>
            new RegExp(string, "gi").test(x)
          );
          if (oldAddres) resolve({ addresses: [oldAddres], isdatabase: true });

          let data = await getAddressApi(string);
          resolve({ addresses: data, isdatabase: false });
        } catch (error) {
          reject(error);
        }
      }, 500);
    });
  };
};

//calculate display route
function calculateAndDisplayRoute(
  directionsService,
  directionsRenderer,
  pickUpPosition,
  dropOffPosition
) {
  if (pickUpPosition && dropOffPosition) {
    directionsService.route(
      {
        origin: {
          query: pickUpPosition,
        },
        destination: {
          query: dropOffPosition,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
}
