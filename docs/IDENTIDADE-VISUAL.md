# Identidade visual — Provazo

## Nome

**Provazo** — trocadilho de "prova" + "prazo". Comunica em uma palavra só do que o app trata (avaliações + datas/tempo), sem soar burocrático como "Agenda Acadêmica" ou genérico como "App de Estudos".

## Tagline

**"Provas, trabalhos e sua rotina, no tempo certo."**

Alternativa curta para espaços pequenos (splash screen, ícone com texto): **"No tempo certo."**

## Conceito

A marca gira em torno de duas ideias visuais que já existem no produto:
- A **tira/timeline horizontal** de 24h (o elemento central da aba Timeline).
- Os **blocos coloridos por tipo de compromisso**, que já funcionam como uma paleta funcional.

O logotipo reaproveita isso: uma barra horizontal arredondada com pontos coloridos marcados ao longo dela — é literalmente uma miniatura da tela principal do app.

## Paleta de cores

### Cor de marca (usada em botões primários, header, ícone do app)
| Nome | Hex | Uso |
|---|---|---|
| Ameixa Provazo | `#6B2545` | Cor primária da marca — ações principais, ícone do app, links |
| Ameixa escuro | `#421A32` | Estados pressed/hover, texto sobre fundo claro |
| Ameixa suave | `#F3E6ED` | Fundos leves (mesmo tom da "página" do ícone) |

### Cores semânticas (já definidas no plano técnico — mantidas 1:1 para não haver retrabalho)
| Tipo de compromisso | Nome | Hex |
|---|---|---|
| Aula | Azul | `#3B82F6` |
| Prova | Vermelho | `#EF4444` |
| Trabalho | Âmbar | `#F59E0B` |
| Evento pessoal | Roxo | `#8B5CF6` |
| Nota/média (uso auxiliar, ex: gráfico de médias) | Verde | `#10B981` |

### Neutros
| Nome | Hex | Uso |
|---|---|---|
| Grafite | `#18181B` | Texto principal (modo claro) |
| Cinza médio | `#71717A` | Texto secundário, legendas |
| Cinza claro | `#E4E4E7` | Bordas, divisores |
| Off-white | `#FAFAFA` | Fundo modo claro |
| Quase-preto | `#0F0E17` | Fundo modo escuro |

## Tipografia

- **Títulos / números / horários**: `Space Grotesk` (bold para títulos, medium para horários na timeline) — geométrica, boa legibilidade em números, dá um ar "técnico" que combina com o tema de organização e tempo.
- **Corpo / UI**: `Inter` — altíssima legibilidade em telas pequenas, padrão de fato em apps mobile modernos, ótimo suporte a acentuação em português.

Ambas são gratuitas (Google Fonts / Open Font License) e fáceis de embutir num app Expo via `expo-font` ou `@expo-google-fonts`.

## Logotipo

Wordmark **"provazo"** em minúsculas, `Space Grotesk Bold`, acompanhado por um ícone inline: uma barra horizontal arredondada com 4 pontos coloridos (azul, vermelho, âmbar, roxo) — a metáfora da timeline do app. Ver `logo.svg` nesta pasta.

**Ícone do app** (launcher/favicon, `icone-app.svg`): uma página sobre fundo ameixa (`#6B2545`), com linhas simulando texto escrito e o canto inferior direito dobrado (dourado, `#D9A441`) — a metáfora de uma prova ou trabalho anotado, com a página "virada" (o prazo passando). O ameixa do ícone é a cor de marca em todo o app: botões primários, header e links usam `#6B2545`.

## Tom de voz

Direto, sem jargão acadêmico-formal. Fala com o usuário como alguém organizando a própria rotina, não como um sistema institucional. Evita termos como "gerenciamento de avaliações" — prefere "suas provas e trabalhos".

Exemplos:
- Vazio na lista: *"Nenhuma prova ou trabalho por aqui ainda. Que tal adicionar o primeiro?"*
- Notificação: *"Cálculo 2 — prova em 1 dia."*
- Erro de peso inválido: *"O peso precisa ser maior que zero."*
