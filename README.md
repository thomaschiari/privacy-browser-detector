# Privacy Browser Detector
Extensão Firefox para detectar conexões de terceira parte e armazenamento local

## Descrição
Ferramenta a ser utilizada como extensão no navegador Firefox, que detecta a privacidade de sites e fornece uma pontuação de privacidade para cada um. A ferramenta possui como funcionalidades:

1. Detectar conexões a domínios de terceira parte
2. Detectar armazenamento de dados em storage local
3. Quantidade de cookies injetados no carregamento da página (de primeira e terceira parte)
4. Detecção de Canvas Fingerprint
5. Detecção de potenciais ameaças de sequestro de navegador

Ademais, também é fornecida uma pontuação de privacidade, de 0 a 100. Quanto menor a nota, maior a privacidade da aplicação e, portanto, melhor. A pontuação é definida com base nos seguintes critérios:

- 35% para domínios de terceira parte
- 25% para cookies de terceira parte
- 10% para uso de armazenamento local
- 10% para canvas fingerprinting
- 20% para detecção de ameaça de sequestro de navegador 

## Utilização
1. Clone o repositório em seu computador
2. No seu navegador Firefox, digite na barra de endereço `about:debugging`
3. Clique na opção "Este Firefox"
4. Clique em "Carregar Extensão Temporária"
5. Navegue até o diretório no qual clonou o repositório e selecione o arquivo `manifest.json`
6. A extensão será instalada para testes até o Firefox ser reiniciado
