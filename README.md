# Timeline de lancamentos de IA

Aplicacao estatica para visualizar lancamentos de modelos de IA por categoria, empresa, familia, tipo e ano, com foco em datas e fontes de lancamento.

## Escopo da primeira base

A base principal fica em `data/models.json` e cobre LLMs, modelos de imagem, video, audio/transcricao e musica. A categoria padrao para registros sem `ai_category` e `LLMs`. Cada item tem:

- `release_date`: data ISO do anuncio, preview, API, GA ou release de pesos, conforme a fonte oficial.
- `release_stage`: diferencia anuncio, preview, API, GA, produto e open weights.
- `ai_category`: categoria ampla usada no menu de Tipo de IA. Valores atuais: `LLMs`, `Imagem`, `Video`, `Audio/Transcricao`, `Musica`.
- `model_type`: tags usadas nos filtros. Use `OpenSource` como rotulo amigavel quando o item for modelo aberto/open-weight, mantendo `open-weights` quando os pesos estiverem publicamente disponiveis.
- `description_pt`: descricao curta em portugues.
- `source` ou `sources`: titulo, URL, publicador e criterio usado para a data. Use `sources` quando um registro agrupa mais de um modelo ou variante.
- `confidence`: `alta`, `media` ou `baixa`.

O `metadata.updated_at` registra a data da ultima atualizacao geral da base. O objeto `metadata.last_correction` registra a ultima correcao visivel no site, com data e descricao curta.

Datas com `confidence: "media"` ou `confidence: "baixa"` devem ser priorizadas em uma auditoria manual antes de uso academico ou editorial. `baixa` indica que ainda falta uma fonte oficial publica completa ou que a data depende de observacao indireta.

## Publicacao

Este projeto e um site estatico. Para publicar, envie estes arquivos mantendo a mesma estrutura:

- `index.html`
- `app.js`
- `styles.css`
- `data/models.json`
- `_headers`, quando a hospedagem for Netlify ou Cloudflare Pages
- `vercel.json`, quando a hospedagem for Vercel

O arquivo `data/models.json` precisa continuar disponivel no caminho relativo `data/models.json`, porque a aplicacao carrega a base a partir dele.

### Cabecalhos de seguranca

O site define CSP, `X-Content-Type-Options: nosniff`, bloqueio de embed por `frame-ancestors 'none'` e `X-Frame-Options: DENY` nos arquivos de configuracao de hospedagem. O `index.html` tambem usa SRI nos assets externos do MapLibre carregados pelo jsDelivr.

Se a publicacao for feita em GitHub Pages puro, esses cabecalhos nao serao aplicados, porque GitHub Pages nao permite configurar headers HTTP por repositorio. Nesse caso, publique por Vercel, Netlify, Cloudflare Pages ou por um proxy/servidor que aplique os mesmos headers definidos em `_headers`.

## Atualizar a base

Adicione e corrija modelos editando `data/models.json`. O site nao tem interface publica de edicao; a base canonica fica sempre no fonte.

Ao adicionar na base canonica, mantenha o padrao:

```json
{
  "id": "empresa-familia-modelo",
  "company": "Empresa",
  "family": "Familia",
  "model": "Modelo",
  "release_date": "YYYY-MM-DD",
  "release_stage": "lancamento",
  "ai_category": "LLMs",
  "model_type": ["texto", "raciocinio"],
  "description_pt": "Descricao curta.",
  "sources": [
    {
      "title": "Titulo oficial",
      "url": "https://...",
      "publisher": "Empresa",
      "date_basis": "Post oficial publicado em ..."
    }
  ],
  "confidence": "alta"
}
```

## Politica de datas

A data exibida e sempre a data publicada pela fonte oficial. Quando um mesmo modelo tem varias datas relevantes, como anuncio, preview, API e disponibilidade geral, crie entradas separadas ou explique a diferenca em `release_stage` e `date_basis`.
