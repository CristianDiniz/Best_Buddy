/**
 * Mostra um mapa do Google com ONGs de proteção/adoção animal perto da
 * localização do usuário (pede permissão de geolocalização ao navegador).
 *
 * Requer uma chave de API do Google Maps com "Maps JavaScript API" e
 * "Places API" habilitadas, configurada em window.BB_CONFIG.GOOGLE_MAPS_API_KEY
 * (veja js/config.js). Sem a chave, mostra uma mensagem explicando o que falta
 * em vez de quebrar a página.
 */

let bbGoogleMapsLoadingPromise = null;

function bbLoadGoogleMapsScript() {
  if (window.google?.maps?.places) return Promise.resolve();
  if (bbGoogleMapsLoadingPromise) return bbGoogleMapsLoadingPromise;

  bbGoogleMapsLoadingPromise = new Promise((resolve, reject) => {
    const apiKey = window.BB_CONFIG?.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error("missing-api-key"));
      return;
    }

    window.__bbGoogleMapsReady = () => resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=__bbGoogleMapsReady`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("script-load-failed"));
    document.head.appendChild(script);
  });

  return bbGoogleMapsLoadingPromise;
}

function bbRenderNearbyOngsMap(targetSelector) {
  const el = document.querySelector(targetSelector);
  if (!el) return;

  const showMessage = (text) => {
    el.innerHTML = `<span class="relative z-10 text-sm px-4 text-center">${text}</span>`;
  };

  if (!window.BB_CONFIG?.GOOGLE_MAPS_API_KEY) {
    showMessage("🗺️ Configure GOOGLE_MAPS_API_KEY em js/config.js para exibir ONGs próximas.");
    return;
  }

  if (!navigator.geolocation) {
    showMessage("⚠️ Seu navegador não permite compartilhar localização.");
    return;
  }

  showMessage("📍 Buscando sua localização...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const center = { lat: position.coords.latitude, lng: position.coords.longitude };
      try {
        await bbLoadGoogleMapsScript();
        bbDrawNearbyOngsMap(el, center);
      } catch (err) {
        showMessage("⚠️ Não foi possível carregar o mapa. Verifique a chave do Google Maps em js/config.js.");
        console.error("Google Maps:", err);
      }
    },
    (error) => {
      console.warn("Geolocalização recusada ou indisponível:", error);
      showMessage("⚠️ Permita o acesso à localização para ver ONGs de adoção perto de você.");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function bbDrawNearbyOngsMap(el, center) {
  el.innerHTML = "";
  el.classList.remove("items-center", "justify-center", "flex-col", "gap-1");

  const mapEl = document.createElement("div");
  mapEl.style.width = "100%";
  mapEl.style.height = "100%";
  el.appendChild(mapEl);

  const map = new google.maps.Map(mapEl, {
    center,
    zoom: 13,
  });

  new google.maps.Marker({
    position: center,
    map,
    title: "Você está aqui",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#2f8ae0",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
  });

  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(
    {
      location: center,
      radius: 10000,
      keyword: "ONG proteção animal adoção de animais",
    },
    (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) return;

      const infoWindow = new google.maps.InfoWindow();
      results.slice(0, 15).forEach((place) => {
        if (!place.geometry?.location) return;
        const marker = new google.maps.Marker({
          position: place.geometry.location,
          map,
          title: place.name,
        });
        marker.addListener("click", () => {
          infoWindow.setContent(`
            <strong>${place.name}</strong><br/>
            ${place.vicinity || ""}
            ${place.rating ? `<br/>⭐ ${place.rating}` : ""}
          `);
          infoWindow.open(map, marker);
        });
      });
    }
  );
}
