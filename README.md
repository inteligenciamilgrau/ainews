# Timeline de lancamentos de IA

Aplicacao estatica para visualizar lancamentos de modelos e ferramentas de IA por categoria, empresa, familia, tipo e ano, com foco em datas e fontes de lancamento.

## Escopo da primeira base

A base principal fica em `data/models.json` e cobre modelos de IA e ferramentas. A categoria padrao para registros sem `ai_category` e `LLMs`, que tambem continua sendo o filtro inicial. Cada item tem:

- `release_date`: data ISO do anuncio, preview, API, GA ou release de pesos, conforme a fonte oficial.
- `release_stage`: diferencia anuncio, preview, API, GA, produto e open weights.
- `ai_category`: categoria ampla usada no menu de Tipo de IA. Valores atuais: `LLMs`, `Imagem`, `Video`, `Audio/Transcricao`, `Musica`, `Robotica/World models`, `Multimodal`, `Embeddings`, `Agentes`, `Decisao estruturada`, `Ferramentas`.
- `model_type`: tags usadas nos filtros. Use `OpenSource` como rotulo amigavel quando o item for modelo aberto/open-weight, mantendo `open-weights` quando os pesos estiverem publicamente disponiveis.
- `description_pt`: descricao curta em portugues.
- `source` ou `sources`: titulo, URL, publicador e criterio usado para a data. Use `sources` quando um registro agrupa mais de um modelo, variante ou ferramenta.
- `confidence`: `alta`, `media` ou `baixa`.

O `metadata.updated_at` registra a data da ultima atualizacao geral da base. O objeto `metadata.last_correction` registra a ultima correcao visivel no site, com data e descricao curta.

Datas com `confidence: "media"` ou `confidence: "baixa"` devem ser priorizadas em uma auditoria manual antes de uso academico ou editorial. `baixa` indica que ainda falta uma fonte oficial publica completa ou que a data depende de observacao indireta.

## Publicacao

Este projeto e um site estatico. Para publicar, envie estes arquivos mantendo a mesma estrutura:

- `index.html`
- `app.js`
- `styles.css`
- `data/models.json`

O arquivo `data/models.json` precisa continuar disponivel no caminho relativo `data/models.json`, porque a aplicacao carrega a base a partir dele.

## Atualizar a base

Adicione e corrija lancamentos editando `data/models.json`. O site nao tem interface publica de edicao; a base canonica fica sempre no fonte.

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

## Ferramentas anunciadas em eventos

Agrupe as ferramentas de um mesmo evento em um unico registro na categoria `Ferramentas`, como o conjunto de novidades do OpenAI DevDay. Use o campo `model` para o titulo do conjunto, descreva as ferramentas em `description_pt` e inclua as fontes oficiais em `sources`. Esse registro conta como um lancamento nas estatisticas e aparece ao selecionar `Ferramentas` ou `Todos`. Modelos de IA anunciados no mesmo evento continuam com registros proprios e suas categorias correspondentes.
