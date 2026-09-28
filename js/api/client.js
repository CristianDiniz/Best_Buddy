/**
 * Cliente HTTP fino sobre fetch, usado somente quando
 * BB_CONFIG.USE_MOCKS === false.
 */
class BBApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

/**
 * O DRF, quando a validação de um serializer falha, devolve um objeto
 * tipo { "password": ["Este campo é obrigatório."], "email": [...] }
 * (sem uma chave "detail"). Sem isso, o front mostrava sempre uma
 * mensagem genérica, escondendo o motivo real do erro.
 */
function bbExtractErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data === "object") {
    const parts = Object.entries(data).map(([field, msgs]) => {
      const text = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
      return field === "non_field_errors" ? text : `${field}: ${text}`;
    });
    if (parts.length) return parts.join(" | ");
  }
  return fallback;
}

const bbClient = {
  async request(path, { method = "GET", body, auth = true, _retry = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth && typeof bbStorage !== "undefined") {
      const token = bbStorage.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${window.BB_CONFIG.API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      throw new BBApiError("Não foi possível conectar ao servidor.", 0, null);
    }

    // Se receber 401 (token expirado/inválido) e tivermos um refresh token, tenta renovar automaticamente
    if (response.status === 401 && auth && !_retry && typeof bbStorage !== "undefined") {
      const refreshToken = bbStorage.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${window.BB_CONFIG.API_BASE_URL}/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            if (refreshData.access) {
              const currentSession = {
                access: refreshData.access,
                refresh: refreshData.refresh || refreshToken,
                user: bbStorage.getUser(),
              };
              bbStorage.setSession(currentSession);
              // Repete a requisição original com o novo token de acesso
              return this.request(path, { method, body, auth, _retry: true });
            }
          }
        } catch (_) {
          // falha no refresh
        }
      }

      // Se a sessão expirou completamente:
      bbStorage.clearSession();

      // Se for requisição GET (como listar animais públicos), tenta novamente sem auth
      if (method === "GET") {
        return this.request(path, { method, body, auth: false, _retry: true });
      }

      // Se for rota estritamente privada (ex: perfil), redireciona para login
      if (window.location.pathname.includes("/profile.html")) {
        window.location.href = `/pages/auth/login.html?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
    }

    let data = null;
    try {
      data = await response.json();
    } catch (_) {
      // corpo vazio, ok
    }

    if (!response.ok) {
      throw new BBApiError(
        bbExtractErrorMessage(data, "Ocorreu um erro ao processar sua solicitação."),
        response.status,
        data
      );
    }

    return data;
  },

  get(path, opts) {
    return this.request(path, { ...opts, method: "GET" });
  },
  post(path, body, opts) {
    return this.request(path, { ...opts, method: "POST", body });
  },
  patch(path, body, opts) {
    return this.request(path, { ...opts, method: "PATCH", body });
  },
  delete(path, opts) {
    return this.request(path, { ...opts, method: "DELETE" });
  },
};
