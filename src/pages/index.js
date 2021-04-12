import React, { useRef, useState, useEffect } from "react";
import { databaseResult, debounceCall, setMap } from "../helper/services";

export default function MapView() {
  const [state, setstate] = useState({
    pickup: "",
    dropoff: ""
  })

  const [appState, setAppState] = useState({
    data: { addresses: [], isDatabase: false },
    currentType: "",
  });

  const timer = useRef(null);
  const debouncRequest = debounceCall(timer);

  const HandleSearchPress = async (event) => {
    event.preventDefault();
    const key = event.target.name;
    let value = event.target.value;
    setstate({ ...state, [key]: value });

    if (!value.length) return;
    let response = await debouncRequest(value);
    // console.log("thr response",response)
    setAppState({ data: response, currentType: key })

  };

  const handleClick = (value) => {
    let dropoffposition = state.dropoff.length && state.dropoff
    let pickUpposition = state.pickup.length && state.pickup

    setMap(dropoffposition, pickUpposition)

    if (!appState.data.isdatabase) {

      fetch('http://127.0.0.1:8090/api/addresses', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: value
        } ),
      })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });

      // databaseResult.push(value); //remove thjis line and make post request
    }

    if (appState.currentType === "pickup") {
      setstate({ ...state, pickup: value });
      setAppState({ ...appState, data: { addresses: [], isdatabase: null } })
      return;
    }

    setstate({ ...state, dropoff: value });
    setAppState({ ...appState, data: { addresses: [], isdatabase: null } })
  };

  useEffect(() => {
    setMap()
  }, [])

  return (
    <div>
      <form>

        <div className="options">
          <input
            onChange={HandleSearchPress}
            name="pickup"
            value={state.pickup}
            placeholder="pickup locaton"
          />
          <input
            onChange={HandleSearchPress}
            name="dropoff"
            value={state.dropoff}
            placeholder="dropoff locaton"
          />
        </div>
        <ul ul className="drop-down">
          {appState.data.addresses.map((searchResult, index) => (
            <li
              key={index}
              onClick={() => handleClick(searchResult)}
            >
              {searchResult}
            </li>
          ))}
        </ul>
      </form>

      <div id="map" style={{ width: '100vw', height: '80vh' }}></div>
    </div>
  );
}
