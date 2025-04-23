import React, { PropsWithChildren } from "react";
import { To, useNavigate } from "react-router-dom";

export const HandleLegacyRoutes = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const navigateParams = React.useRef<To | null>(null);
  if (window.location.hash) {
    const hashValue = window.location.hash.replace("#", "");
    const [route, search] = hashValue.split("?");
    const searchParams = search ? `?${search}` : undefined;
    navigateParams.current = {
      pathname: route,
      search: searchParams,
      hash: "",
    };
  }
  React.useEffect(() => {
    // to maintain backward compatibility with older urls, we copy the hash to pathname and rerender the application
    // the search was coming as part of the pathname, so needed to split the search part
    if (navigateParams.current) {
      const params = navigateParams.current;
      navigateParams.current = null;
      navigate(params);
    }
  }, []);
  // Had to do this as routing was initiated before the use effect here was run. So inside the use effect,
  // the hash was not correctly detected and the app was redirecting to dashboard which is the default route.
  // Now we detect if the url contains hash, we stop rendering the rest of the app, correct the url and then
  // rerender the app. The user is now happy to see the app :)
  if (!navigateParams.current) {
    return children;
  }
  return null;
};
