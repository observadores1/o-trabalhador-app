// Este código é um código opcional para registrar um service worker.
// register() não é chamado por padrão.

// Isso permite que o aplicativo carregue mais rápido em visitas subsequentes em produção e
// dá a ele capacidades offline. No entanto, também significa que os desenvolvedores (e usuários)
// só verão as atualizações implantadas em visitas subsequentes a uma página, depois que todas as
// abas abertas da página forem fechadas, pois os recursos previamente cacheados são
// atualizados em segundo plano.

// Para saber mais sobre os benefícios deste modelo e instruções sobre como
// optar por ele, leia https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] é o endereço IPv6 para localhost.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 são considerados localhost para IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]? )){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // O construtor de URL está disponível em todos os navegadores que suportam SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Nosso service worker não funcionará se PUBLIC_URL estiver em uma origem diferente
      // da qual nossa página é servida. Isso pode acontecer se um CDN for usado para
      // servir os assets; veja https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', ( ) => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Isso está rodando em localhost. Vamos verificar se um service worker ainda existe ou não.
        checkValidServiceWorker(swUrl, config);

        // Adiciona algum log adicional ao localhost, apontando os desenvolvedores para a
        // documentação do service worker/PWA.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
           );
        });
      } else {
        // Não é localhost. Apenas registra o service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Neste ponto, o conteúdo pré-cacheado atualizado foi buscado,
              // mas o service worker anterior ainda servirá o conteúdo mais antigo
              // até que todas as abas do cliente sejam fechadas.
              console.log(
                'New content is available and will be used when all ' +
                  'tabs for this page are closed. See https://cra.link/PWA.'
               );

              // Executa o callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Neste ponto, tudo foi pré-cacheado.
              // É o momento perfeito para exibir uma
              // mensagem "Conteúdo está cacheado para uso offline.".
              console.log('Content is cached for offline use.');

              // Executa o callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Verifica se o service worker pode ser encontrado. Se não puder, recarrega a página.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Garante que o service worker existe e que estamos realmente recebendo um arquivo JS.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Nenhum service worker encontrado. Provavelmente um app diferente. Recarrega a página.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker encontrado. Procede normalmente.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
