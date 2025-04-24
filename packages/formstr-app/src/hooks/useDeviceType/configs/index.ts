import { DEVICE_TYPE } from '../../../constants/index';
import { IDeviceInfo } from '../typeDefs';

export const initialState: IDeviceInfo = {
  [DEVICE_TYPE.MOBILE]: false,
  [DEVICE_TYPE.TABLET]: false,
  [DEVICE_TYPE.DESKTOP]: false,
  deviceType: DEVICE_TYPE.DESKTOP,
};

export const MEDIA_QUERY = {
  [DEVICE_TYPE.MOBILE]: {
    key: DEVICE_TYPE.MOBILE,
    mediaQuery: window.matchMedia('(max-width: 767px)'),
  },
  [DEVICE_TYPE.TABLET]: {
    key: DEVICE_TYPE.TABLET,
    mediaQuery: window.matchMedia('(min-width: 768px) and (max-width: 1024px)'),
  },
  [DEVICE_TYPE.DESKTOP]: {
    key: DEVICE_TYPE.DESKTOP,
    mediaQuery: window.matchMedia('(min-width: 1025px)'),
  },
};

export const MEDIA_QUERY_LIST = Object.values(MEDIA_QUERY);
