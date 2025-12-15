export interface LatLng {
  lat: number;
  lng: number;
}

export interface RestStop {
  name: string;
  distanceFromPreviousKm: number;
  location: LatLng;
}

export interface Route {
  routeName: string;
  totalDistanceKm: number;
  path: LatLng[];
  restStops: RestStop[];
}
