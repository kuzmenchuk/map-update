import React from 'react';

import './data-table.styles.scss';

class DataTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: []
    };
  }

  componentDidMount() {
    this.setState({
      cars: this.props.carsData
    })
  }

  render() {
    return (
      <div className="data-table">
        <table>
          <thead>
            <tr className="table100-head">
              <th className="column1">Name</th>
              <th className="column2">Lat</th>
              <th className="column3">Lng</th>
            </tr>
          </thead>
          <tbody>
            {this.state.cars.map(car => {
              return (
                <tr key={car.id}>
                  <td className="column1">{car.name}</td>
                  <td className="column2">{car.lat.toFixed(10)}</td>
                  <td className="column3">{car.lng.toFixed(10)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DataTable;
