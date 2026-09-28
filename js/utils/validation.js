const bbValidation = {
  isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");
  },

  isRequired(value) {
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  },

  minLength(value, len) {
    return (value || "").length >= len;
  },

  isCPF(value) {
    // Validação de formato (11 dígitos), não de dígito verificador —
    // suficiente para o front; validação forte fica a cargo do backend.
    const digits = (value || "").replace(/\D/g, "");
    return digits.length === 11;
  },

  passwordsMatch(a, b) {
    return a === b;
  },

  isPhone(value) {
    if (!value || typeof value !== "string" || !value.trim()) return true;
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  },

  formatPhone(value) {
    const digits = (value || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  },

  /**
   * Aplica um conjunto de regras a um objeto de dados e devolve
   * um mapa { campo: mensagem } apenas com os erros encontrados.
   *
   * rules: { campo: [{ test: fn, message: string }] }
   */
  runRules(data, rules) {
    const errors = {};
    for (const field of Object.keys(rules)) {
      for (const rule of rules[field]) {
        if (!rule.test(data[field], data)) {
          errors[field] = rule.message;
          break;
        }
      }
    }
    return errors;
  },
};
