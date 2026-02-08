import { createContext, useContext, useEffect, useReducer } from "react";

const BASE_URL = "https://worldwisere.netlify.app/data/cities.json";
const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };
    case "error":
      return { ...state, isLoading: false, error: action.payload };
    case "cities/loading":
      return { ...state, cities: action.payload, isLoading: false };
    case "city/loading":
      return { ...state, currentCity: action.payload, isLoading: false };
    case "city/creating":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        isLoading: false,
      };
    case "city/deleting":
      return {
        ...state,
        cities: [...state.cities.filter((city) => city.id !== action.payload)],
        isLoading: false,
      };
    default:
      console.log("error");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });

      try {
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loading", payload: data });
      } catch (err) {
        dispatch({
          type: "error",
          payload: "Something went wrong with fetching cities.",
        });
      }
    }
    fetchCities();
  }, []);

  async function getCity(id) {
    if (Number(id) === currentCity.id) return;
    dispatch({ type: "loading" });

    try {
      if (id === undefined) return;
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();

      dispatch({ type: "city/loading", payload: data });
    } catch (err) {
      dispatch({
        type: "error",
        payload: "Something went wrong with fetching a city.",
      });
    }
  }

  async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(newCity),
      });
      const data = await res.json();

      dispatch({ type: "city/creating", payload: data });
    } catch (err) {
      dispatch({
        type: "error",
        payload: "Something went wrong with creating a city.",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });
      dispatch({ type: "city/deleting", payload: id });
    } catch (err) {
      dispatch({
        type: "error",
        payload: "Something went wrong with deleting a city.",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const cities = useContext(CitiesContext);
  return cities;
}

export { CitiesProvider, useCities };
