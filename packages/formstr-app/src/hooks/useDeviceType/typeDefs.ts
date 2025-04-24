import { DEVICE_TYPE } from '../../constants/index';

type DEVICE_TYPE_KEYS = keyof typeof DEVICE_TYPE;
type DEVICE_TYPE_VALUES = (typeof DEVICE_TYPE)[DEVICE_TYPE_KEYS];

export type IDeviceInfo = {
  [x in DEVICE_TYPE_VALUES]: string | boolean;
} & {
  deviceType: DEVICE_TYPE_VALUES;
};
