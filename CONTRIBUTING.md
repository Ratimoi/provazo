# Fluxo de branches

- **`main`** — protegida. Só recebe merge vindo da `dev`, via Pull Request (checagem automática em `.github/workflows/enforce-dev-to-main.yml`).
- **`dev`** — branch de integração. Todo trabalho novo entra aqui primeiro.
- **`feature/<nome>`**, **`fix/<nome>`** — branches de trabalho, criadas a partir da `dev`. Abrem PR de volta pra `dev`.

Fluxo de uma mudança:

```bash
git checkout dev
git pull
git checkout -b feature/nome-da-feature
# ...trabalho...
git push -u origin feature/nome-da-feature
# abrir PR: feature/nome-da-feature -> dev
```

Quando `dev` estiver estável, abrir PR `dev -> main`.

## Versões e atualizações OTA

- `version` (em `app.json`) aparece em Configurações > Sobre e sobe a cada entrega.
- `runtimeVersion` é uma string fixa: só muda quando o código **nativo** muda
  (módulo Expo novo, plugin, atualização do SDK). Um APK só recebe atualizações
  OTA da mesma `runtimeVersion`; por isso, ao mudar o valor, gere um APK novo
  (`eas build --profile preview`) e instale **antes** de mergear na `main`.
- Mudanças só de JS mantêm a `runtimeVersion` e chegam por OTA ao mergear na `main`.
