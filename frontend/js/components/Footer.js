function bbRenderFooter(targetSelector) {
  const el = document.querySelector(targetSelector);
  el.innerHTML = `
    <footer class="bb-footer">
      <div class="bb-container bb-footer__grid">
        <div>
          <p class="text-ink-100 mb-3"><strong>ONGs de proteção animal perto de você</strong></p>
          <div id="bb-ong-map" class="bb-footer__map">
            <span class="relative z-10 text-sm px-4 text-center">📍 Buscando sua localização...</span>
          </div>
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

  bbRenderNearbyOngsMap("#bb-ong-map");
}
