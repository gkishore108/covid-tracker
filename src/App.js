import React, { useState, useEffect } from "react";
import "./App.css";
import {
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./components/InfoBox";
import Map from "./components/Map/Map";
import "leaflet/dist/leaflet.css";
import Table from "./components/Table/Table";
import LineGraph from "./components/Chart/LineGraph";
import { sortData } from "./util/sort";
import { prettyPrintStat } from "./util/mapCircle";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [caseType, setCaseType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            id: country.countryInfo._id,
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };

    getCountriesData();
  }, []);

  const setCountryHandler = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);
        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1> COVID 19 Tracker</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={setCountryHandler}
            >
              <MenuItem value="worldwide">Wordlwide</MenuItem>
              {countries.map((country, i) => {
                return (
                  <MenuItem key={i} value={country.value}>
                    {country.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>

        <div className="app__stats">
          <InfoBox
            isRed
            active={caseType === "cases"}
            onClick={(e) => {
              setCaseType("cases");
            }}
            title="Corona Virus cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={caseType === "recovered"}
            onClick={(e) => {
              setCaseType("recovered");
            }}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={caseType === "deaths"}
            onClick={(e) => {
              setCaseType("deaths");
            }}
            title="Deaths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>

        <Map
          caseType={caseType}
          countries={mapCountries}
          center={mapCenter}
          zoom={mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
            <h3>Live Cases by Country</h3>
            <Table countries={tableData} />
            <h3 className="app__graphTitle">Worldwide new {caseType}</h3>
            <LineGraph className="app__graph" caseType={caseType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
