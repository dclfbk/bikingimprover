import { getInstance } from "./auth";

export const authGuard = (to, from, next) => {
  const authService = getInstance();

  const fn = () => {
    //If tou want to add the email verification then remove the comments from there
    // If the user is authenticated, continue with the route
    /*if (authService.isAuthenticated) {
      if(authService.user.email_verified){
        return next();
      }else{
        //rimanda a pagina di Login dicendo che deve cliccare su link mail
        authService.logout({
          returnTo: "http://localhost:8080"//window.location.origin
        })
      }
      //return next();
    }
    
    // Otherwise, log in
    if(authService.user.email_verified){
      authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
    }else{
      authService.logout({
        returnTo: window.location.origin
      })
    }*/

    //SENZA CONFERMA EMAIL FUNZIONA COSI,
    if (authService.isAuthenticated) {
      return next();
    }
    // Otherwise, log in
    authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
  };

  // If loading has already finished, check our auth state using `fn()`
  if (!authService.loading) {
    return fn();
  }

  // Watch for the loading property to change before we check isAuthenticated
  authService.$watch("loading", loading => {
    if (loading === false) {
      return fn();
    }
  });
};