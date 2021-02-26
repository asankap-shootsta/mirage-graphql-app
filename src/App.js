import React, { useState, useEffect } from "react";
import { buildSchema, graphql } from "graphql";
import { GraphQLClient, gql } from "graphql-request";
import { createServer } from "miragejs";
import './App.css';

const urlPrefix = 'https://countries.trevorblades.com';

const fakeCountryList = [
  {
    name: "Avalon",
    code: "AV",
    __typename: "Country"
  },
  {
    name: "Buranda",
    code: "BUR",
    __typename: "Country"
  },
  {
    name: "Syldavia",
    code: "SYD",
    __typename: "Country"
  },
];

const graphqlSchema = buildSchema(`
  type Query {
    countries: [Country]
  }

  type Country {
    name: String
    code: String
  }
`);

createServer({
  routes() {
    this.urlPrefix = urlPrefix;
    // this.namespace = "/api";

    this.post(`/fake-countries`, (schema, request) => {
      const requestJson = JSON.parse(request.requestBody);
      const query = requestJson.query;
      const variables = requestJson.variables;
      const resolver = {
        countries() {
          return fakeCountryList;
        }
      };
      return graphql(graphqlSchema, query, resolver, null, variables).then(
        response => {
          return response;
        }
      );
    });

    this.passthrough()
  }
});

// GraphQL client of real server
const client = new GraphQLClient(`${urlPrefix}/countries`, {
  headers: {}
});

// GraphQL client of fake server
const fakeClient = new GraphQLClient(`${urlPrefix}/fake-countries`, {
  headers: {}
});

const COUNTRIES_QUERY = gql`
  {
    countries {
      name
      code
    }
  }
`;

function App() {
  const [countries, setCountries] = useState([]);
  const [fakeCountries, setFakeCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async (client, setter) => {
      try {
        const response = await client.request(COUNTRIES_QUERY, {});
        setter(response.countries);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCountries(client, setCountries); // Querying real countries
    fetchCountries(fakeClient, setFakeCountries); // Querying fake countries
  }, []);

  return (
    <>
      {/* Displaying real countries */}
      <div><strong>Real Countries</strong></div>
      <ul>
      {countries.map((country) => (
          <li key={country.code}>{country.name}</li>
        ))}
      </ul>

      {/* Displaying fake countries */}
      <div><strong>Fake Countries</strong></div>
      <ul>
      {fakeCountries.map((country) => (
          <li key={country.code}>{country.name}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
