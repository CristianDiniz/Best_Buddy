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
