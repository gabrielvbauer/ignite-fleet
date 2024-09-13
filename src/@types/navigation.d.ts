import { ArrivalParams } from "../screens/Arrival";

export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      home: undefined;
      departure: undefined;
      arrival: ArrivalParams
    }
  }
}