import { useEffect, useState } from 'react';

export const LOCAL_STORAGE_KEYS = {
  LOCAL_FORMS: 'formstr:forms',
  DRAFT_FORMS: 'formstr:draftForms',
  SUBMISSIONS: 'formstr:submissions',
  PROFILE: 'formstr:profile',
};

export function getItem<T>(key: string, { parseAsJson = true } = {}): T | null {
  let value = localStorage.getItem(key);
  if (value === null) {
    return value;
  }
  if (parseAsJson) {
    try {
      value = JSON.parse(value);
    } catch (e) {
      value = null;
      localStorage.removeItem(key);
    }
  }

  return value as T;
}

export const setItem = (key: string, value: any, { parseAsJson = true } = {}) => {
  let valueToBeStored = value;
  if (parseAsJson) {
    valueToBeStored = JSON.stringify(valueToBeStored);
  }
  try {
    localStorage.setItem(key, valueToBeStored);
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.log('Error in setItem: ', e);
  }
};

export const useLocalStorageItems = <T>(key: string, { parseAsJson = true } = {}): T | null => {
  const [item, updateItem] = useState(getItem<T>(key, { parseAsJson }));
  useEffect(() => {
    const listener = () => {
      updateItem(getItem<T>(key, { parseAsJson }));
    };
    window.addEventListener('storage', listener);
    return () => {
      window.removeEventListener('storage', listener);
    };
  }, []);
  return item;
};
