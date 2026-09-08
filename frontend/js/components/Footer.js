function bbRenderFooter(targetSelector) {
  const el = document.querySelector(targetSelector);
  el.innerHTML = `
    <footer class="bb-footer">
      <div class="bb-container bb-footer__grid">
        <div>
          <div class="bb-footer__map">
            <span class="relative z-10 text-sm">🗺️ Mapa da ONG</span>
          </div>
          <p class="mt-3 leading-relaxed">
            <strong class="text-ink-100">Endereço:</strong> Rua dos Baptistas, 400 — Jardim São Paulo, SP-CEP<br>
            <strong class="text-ink-100">WhatsApp / Emergências:</strong> (11) 99999-0000<br>
            <strong class="text-ink-100">Email:</strong> contato@bestbuddy.org<br>
            <strong class="text-ink-100">Horário de funcionamento:</strong> Segunda a sexta, das 9h às 18h
          </p>
        </div>
        <div>
          <p class="text-ink-100"><strong>Encontrou algum problema ou tem uma sugestão de melhoria no nosso site?</strong></p>
          <p>Nossa ONG aceita qualquer doação para manter a plataforma no ar. Você pode ver nossas prestações de contas aqui.</p>
          <form class="bb-footer__form" data-role="contact-form">
            <div class="bb-field">
              <input class="bb-input" name="nome" placeholder="Nome" />
            </div>
            <div class="bb-field">
              <input class="bb-input" name="email" placeholder="Email" type="email" />
            </div>
            <div class="bb-field">
              <input class="bb-input" name="assunto" placeholder="Digite qual o problema" />
            </div>
            <button class="bb-btn bb-btn--primary" type="submit">Enviar</button>
          </form>
        </div>
      </div>
    </footer>
  `;

  el.querySelector('[data-role="contact-form"]')?.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Mensagem enviada! Nossa equipe entrará em contato em breve.");
    e.target.reset();
  });
}
