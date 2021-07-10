import React, {useEffect, useState} from 'react';
import InfoBox from './InfoBox';
import FormControl from '@material-ui/core/FormControl';
import { MenuItem,Card,CardContent } from '@material-ui/core';
import Select from '@material-ui/core/Select';
import Map from './Map';
import numeral from "numeral";
import Table from './Table';
import './Table.css';
import { sortData,prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import "leaflet/dist/leaflet.css";
import './App.css';

function App() {

// https://disease.sh/v3/covid-19/countries
// State = How to write a variable in REACT <<<<<<
  const [countries,setCountries] = useState([]);
  const [country,setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState([20, 77]);
  const [mapZoom, setMapZoom ] = useState(3);


  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then((response) => response.json())
    .then((data) => {
      setCountryInfo(data);
    });
  },[]);

// USEEFFECT = Runs a piece of code based on a given condition Once. 
  useEffect(() => {

      const getCountriesData = async () => {
        await fetch ("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2
          }));

          const sortedData = sortData(data);

          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);

        });
      };

      getCountriesData();
  },[]); // Fire only once 

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
//  console.log('Y0000',countryCode);
    setCountry(countryCode);

    const url =
     countryCode === "worldwide"
    ? "https://disease.sh/v3/covid-19/all" 
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

     // console.log([data.countryInfo.lat,data.countryInfo.long])

      setMapCenter([data.countryInfo.lat, data.countryInfo.long])

      //setMapCenter(lat[data.countryInfo.lat,data.countryInfo.long]);
      setMapZoom(4);

    });

  };
  //console.log("COUNTRY INFO >>>",countryInfo);


  return (
    <div className="app">
      <div className ="app__left">
      <div className="app__header">
      <h1>COVID-19 TRACKER</h1>
      <FormControl className ="app__dropdown">
        <Select
        variant="outlined"
        onChange={onCountryChange}
        value={country}
        >
          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map((country) => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
            ))
          }

        </Select>

      </FormControl>

      </div>

      <div className="app__stats">
        <InfoBox
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
        <InfoBox
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
        <InfoBox
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>

      <Map
      countries={mapCountries}
      casesType={casesType}
      center = {mapCenter}
      zoom = {mapZoom}
      />



      </div>
     <Card className="app__right">
       <CardContent>
         <h3>Live Cases by Country</h3>
         <Table countries = {tableData} />
         <h3 className="app__graphtitle">Worldwide new {casesType}</h3>
         <LineGraph className="app__graph" casesType={casesType}/>

       </CardContent>
      </Card>

    </div>
  );
}

export default App;
