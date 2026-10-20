# Tributo Claro - Calculadora de Transição Tributária

Calculadora web para comparar, de forma informativa, a carga tributária atual e a carga de um cenário novo. O usuário informa o valor da operação e duas alíquotas; o site calcula os valores em reais, a diferença, a variação percentual e a diferença em pontos percentuais.

O projeto é estático: não possui backend, banco de dados, Node.js, npm ou etapa de build. Todo o processamento acontece no navegador.

## Como usar

1. Abra o site no navegador.
2. Selecione o ano de referência para consultar a premissa exibida na lateral.
3. Informe o valor da operação.
4. Informe a carga tributária do cenário atual e do cenário novo.
5. Confira o resultado atualizado automaticamente.

O resultado apresenta:

- valor estimado de tributos no cenário atual;
- valor estimado de tributos no cenário novo;
- diferença financeira entre os cenários;
- variação percentual em relação ao cenário atual;
- diferença entre as alíquotas em pontos percentuais;
- barras visuais proporcionais às duas cargas.

### Importação de NF-e ou NFC-e

Também é possível selecionar um arquivo XML de NF-e ou NFC-e. O navegador lê o arquivo localmente e tenta preencher automaticamente:

- o valor total da operação, usando `vNF`;
- a carga atual, calculada a partir dos tributos encontrados no XML.

São lidos valores de ICMS, PIS, COFINS, ISS e IPI. Se esses valores não estiverem disponíveis, o site usa `vTotTrib` como alternativa. O arquivo não é enviado para servidor.

### Componentes do novo modelo

Em **Usar componentes do novo modelo**, informe CBS e IBS. O botão soma os dois percentuais e coloca o resultado no campo **Carga tributária (%)** do cenário novo.

### Limpar

O botão **Limpar** retorna os campos aos valores iniciais:

- valor da operação: `R$ 100.000,00`;
- carga atual: `18%`;
- carga nova: `17%`;
- CBS: `0,9%`;
- IBS: `0,1%`.

## Executar localmente

Como não há processo de compilação, basta abrir o `index.html` no navegador. Para testar de forma mais próxima de um ambiente publicado, use qualquer servidor HTTP estático, por exemplo a extensão Live Server do VS Code.

## Deploy na Vercel

1. Suba os arquivos para um repositório GitHub.
2. Na Vercel, importe o repositório.
3. Não informe Framework Preset.
4. Deixe o Build Command vazio.
5. Deixe o Output Directory vazio.
6. Faça o deploy.

A Vercel servirá o `index.html` diretamente. O arquivo `vercel.json` ativa URLs limpas e desativa a barra final nas rotas.

## Estrutura do projeto

- `index.html` - marcação da página, formulário, resultados e links de referência.
- `style.css` - identidade visual, layout, componentes e responsividade.
- `script.js` - cálculos, leitura de XML, atualização da tela e eventos.
- `vercel.json` - configuração mínima de publicação na Vercel.
- `exp.md` - explicação detalhada de como os códigos funcionam.

## Limitações

O cálculo é linear e usa apenas a base informada e os percentuais digitados. A ferramenta não modela créditos tributários, regimes específicos, benefícios fiscais, local de destino, regras completas de transição ou Imposto Seletivo por produto. O resultado não substitui apuração fiscal, escrituração contábil ou orientação profissional.

As premissas exibidas no site são referências informativas. Consulte a legislação vigente antes de tomar decisões.
