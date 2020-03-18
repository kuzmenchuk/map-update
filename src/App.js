import React from 'react';
import './App.scss';
import DataTable from './components/data-table/data-table.component';
import { Map, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import socketIOClient from "socket.io-client";



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: null,
      zoom: 9,
      filteringCars: null,
      pinsOpacity: null,
      endpoint: "http://localhost:8080/",
      defaultQuery: 'cars'
    };
  }

  componentDidMount() {
    const { endpoint, defaultQuery } = this.state;
    fetch(endpoint + defaultQuery)
      .then(response => response.json())
      .catch(error => console.log('response.json()', error))
      .then(cars => this.setState({ cars: cars }))
      .catch(error => console.log('setState cars', error))
      .then(() => {
        if (this.state.cars && !this.state.filteringCars && !this.state.pinsOpacity) {
          let filterBoolean = [];
          let opacityBoolean = [];
          for (let i = 0; i < this.state.cars.length; i++) {
            filterBoolean[i] = { "id": i, visible: true };
            opacityBoolean[i] = { "id": i, onHover: false };
          }
          this.setState({
            pinsOpacity: opacityBoolean,
            filteringCars: filterBoolean
          })
        }
      })

    const socket = socketIOClient(endpoint);
    socket.on('carPositionChanged', car => {
      let stateCars = this.state.cars;
      stateCars[car.id] = car;
      this.setState({
        cars: stateCars
      })
    });
  }

  resetFilters = () => {
    let filterBoolean = [];
    for (let i = 0; i < this.state.cars.length; i++) {
      filterBoolean[i] = { "id": i, visible: true }
    }
    this.setState({
      filteringCars: filterBoolean
    })
  }

  filterFunc = (id) => {
    let prevFilter = this.state.filteringCars;
    prevFilter[id].visible = !prevFilter[id].visible;
    this.setState({
      filteringCars: prevFilter
    })
  }

  onHoverFunc = (id) => {
    let opacity = this.state.pinsOpacity;
    opacity[id].onHover = !opacity[id].onHover;
    this.setState({
      pinsOpacity: opacity
    })
  }


  render() {
    if (!this.state.filteringCars) {
      return (
        <div className='loading'><h2>Loading...</h2></div>
      )
    }
    const { cars } = this.state;
    // Average map window position
    let averageLat = 54.74135307395;
    let averageLng = 18.188884290577;
    let sumLat = 0;
    let sumLng = 0;
    for (let i = 0; i < cars.length; i++) {
      sumLat += cars[i].lat;
      sumLng += cars[i].lng;
    }
    averageLat = sumLat / cars.length;
    averageLng = sumLng / cars.length;
    const position = [averageLat, averageLng]
    // End

    let filteredByBtn = [];
    for (let i = 0; i < cars.length; i++) {
      if (this.state.filteringCars[i].visible) filteredByBtn.push(cars[i])
    }

    return (
      <div className="App">
        <div className="first-column">
          {/* Filter buttons starts */}
          <div className="filtering-pins">
            <h2>Filter</h2>
            <button className="reset-button" onClick={this.resetFilters}>RESET</button>
            {this.state.cars.map(filterBtn => {
              const id = filterBtn.id
              return (
                <button
                  key={id}
                  className={`filter-btn ${this.state.filteringCars[id].visible ? '' : 'active'}`}
                  onClick={() => this.filterFunc(id)}
                  onMouseEnter={() => this.onHoverFunc(id)}
                  onMouseLeave={() => this.onHoverFunc(id)}
                >{id}</button>
              )
            })}
          </div>
          {/* Filter buttons ends */}

          {/* Map starts */}
          <Map center={position} zoom={this.state.zoom} style={{ height: 85 + 'vh', width: 70 + 'vw' }}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Pins mapping */}
            {filteredByBtn.map(car => {
              return (
                <Marker key={car.id} opacity={this.state.pinsOpacity[car.id].onHover ? 1 : .5} position={[car.lat, car.lng]}>
                  <Popup>
                    Name: {car.name}
                  </Popup>
                  <Tooltip>
                    {car.name}
                  </Tooltip>
                </Marker>
              )
            })}

          </Map>

        </div>
        <div className="second-column">
          <DataTable carsData={this.state.cars} />
        </div>
      </div>

    );
  }
}

export default App;

